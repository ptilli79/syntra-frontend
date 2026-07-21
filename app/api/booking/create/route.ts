import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { createBookingEvent, isSlotAvailable, hasActiveBooking } from '@/lib/google-calendar'
import { sendBookingConfirmation, sendBookingNotification } from '@/lib/booking-email'
import type { ContactFormData, PricingTier } from '@/lib/email'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { verifyRecaptcha } from '@/lib/recaptcha-verify'
import {
  BOOKING_CONFIG,
  formatBookingDate,
  formatBookingTimeRange,
  isValidTimeZone,
  type BookingCreatePayload,
} from '@/lib/booking-config'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  // Rate limit: cap bookings per IP to stop calendar-spam / quota exhaustion.
  const rl = await checkRateLimit('bookingCreate', ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Too many booking attempts. Please wait and try again.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  // Bot protection for the booking form submission.
  const recaptcha = await verifyRecaptcha(
    request.headers.get('x-recaptcha-token'),
    'booking_create',
    ip
  )
  if (!recaptcha.success) {
    return NextResponse.json(
      { error: 'RECAPTCHA_FAILED', message: 'Verification failed. Please refresh the page and try again.' },
      { status: 403 }
    )
  }

  let body: BookingCreatePayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Invalid request body.' },
      { status: 400 }
    )
  }

  const { slotStart, slotEnd, name, email, company, message, tier, locale, timezone, contactDetails } = body

  // Validate required fields
  if (!slotStart || !slotEnd || !name || !email || !company) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'All fields (slotStart, slotEnd, name, email, company) are required.' },
      { status: 400 }
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'INVALID_EMAIL', message: 'Invalid email address.' },
      { status: 400 }
    )
  }

  // Validate slot times are valid ISO strings
  const startDate = new Date(slotStart)
  const endDate = new Date(slotEnd)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: 'INVALID_SLOT', message: 'Invalid slot time format.' },
      { status: 400 }
    )
  }

  // Prevent duplicate bookings for the same email
  try {
    const alreadyBooked = await hasActiveBooking(email)
    if (alreadyBooked) {
      return NextResponse.json(
        { error: 'DUPLICATE_BOOKING', message: 'You already have an active session scheduled. Please reschedule or cancel your existing booking first.' },
        { status: 409 }
      )
    }
  } catch (error) {
    console.error('Failed to check existing bookings:', error)
    // Non-blocking: if the check fails, allow the booking to proceed
  }

  // Verify the slot is still available (race condition guard)
  try {
    const available = await isSlotAvailable(slotStart, slotEnd)
    if (!available) {
      return NextResponse.json(
        { error: 'SLOT_TAKEN', message: 'This time slot was just booked by someone else. Please select another time.' },
        { status: 409 }
      )
    }
  } catch (error) {
    console.error('Failed to verify slot availability:', error)
    return NextResponse.json(
      { error: 'CALENDAR_API_ERROR', message: 'Unable to verify availability. Please try again.' },
      { status: 502 }
    )
  }

  // Generate cancel token
  const cancelToken = crypto.randomUUID()

  // Create the Google Calendar event
  try {
    const result = await createBookingEvent({
      start: slotStart,
      end: slotEnd,
      name,
      email,
      company,
      message: message || '',
      tier: tier || 'strategy-session',
      cancelToken,
      locale: locale || 'en',
    })

    // Format display strings. The customer sees their own zone; the internal
    // team sees Eastern (their operating zone) plus the client's local time.
    const localeCode: 'en' | 'es' = (locale || 'en') === 'es' ? 'es' : 'en'
    const userTz = isValidTimeZone(timezone) ? timezone : BOOKING_CONFIG.timezone

    // Customer-facing (visitor's time zone)
    const displayDate = formatBookingDate(startDate, localeCode, userTz)
    const displayTime = formatBookingTimeRange(slotStart, slotEnd, localeCode, userTz)

    // Internal / Eastern time
    const etDisplayDate = formatBookingDate(startDate, localeCode, BOOKING_CONFIG.timezone)
    const etDisplayTime = formatBookingTimeRange(slotStart, slotEnd, localeCode, BOOKING_CONFIG.timezone)

    // Rebuild the full demo-form submission so the internal notification can
    // carry the same PDF the "Send details" flow produces.
    const resolvedTier = (tier || 'strategy-session') as PricingTier
    const contactData: ContactFormData | undefined = contactDetails
      ? {
          name,
          email,
          company,
          message: message || '',
          tier: resolvedTier,
          tierTitle: contactDetails.tierTitle || resolvedTier,
          industry: contactDetails.industry,
          teamSize: contactDetails.teamSize,
          mainChallenge: contactDetails.mainChallenge,
          coreOperations: contactDetails.coreOperations,
          proCapabilities: contactDetails.proCapabilities,
          monthlyVolume: contactDetails.monthlyVolume,
          deployment: contactDetails.deployment,
          budgetRange: contactDetails.budgetRange,
          currentTools: contactDetails.currentTools,
          currentToolsOther: contactDetails.currentToolsOther,
          timeline: contactDetails.timeline,
          locale: localeCode,
        }
      : undefined

    // Send emails in background (don't block response)
    const emailPromises = [
      sendBookingConfirmation({
        name,
        email,
        company,
        date: slotStart,
        displayDate,
        displayTime,
        duration: `${BOOKING_CONFIG.slotDurationMinutes} minutes`,
        meetLink: result.meetLink,
        cancelToken,
        locale: locale || 'en',
      }),
      sendBookingNotification({
        name,
        email,
        company,
        message: message || '',
        tier: tier || 'strategy-session',
        displayDate: etDisplayDate,
        displayTime: etDisplayTime,
        clientTimezone: userTz,
        clientDisplayTime: displayTime,
        meetLink: result.meetLink,
        eventLink: result.htmlLink,
        locale: locale || 'en',
        contactData,
      }),
    ]

    // Send emails after the response using Next.js after() — keeps the
    // serverless function alive on Vercel until the work completes.
    after(async () => {
      const results = await Promise.allSettled(emailPromises)
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(`Booking email ${i} failed:`, result.reason)
        }
      })
    })

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      meetLink: result.meetLink,
      date: slotStart,
      displayDate,
      displayTime,
      cancelToken,
    })
  } catch (error) {
    console.error('Failed to create booking event:', error)
    return NextResponse.json(
      { error: 'CALENDAR_API_ERROR', message: 'Unable to create booking. Please try again.' },
      { status: 502 }
    )
  }
}
