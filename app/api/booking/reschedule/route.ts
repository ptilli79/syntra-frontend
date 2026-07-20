import { NextRequest, NextResponse, after } from 'next/server'
import { rescheduleBookingEvent, isSlotAvailable } from '@/lib/google-calendar'
import { sendRescheduleConfirmation } from '@/lib/booking-email'
import {
  BOOKING_CONFIG,
  formatBookingDate,
  formatBookingTimeRange,
  isValidTimeZone,
} from '@/lib/booking-config'

export async function POST(request: NextRequest) {
  let body: {
    cancelToken?: string
    slotStart?: string
    slotEnd?: string
    locale?: 'en' | 'es'
    timezone?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Invalid request body.' },
      { status: 400 }
    )
  }

  const { cancelToken, slotStart, slotEnd, locale, timezone } = body
  const localeCode: 'en' | 'es' = locale === 'es' ? 'es' : 'en'

  // Validate token format
  if (
    !cancelToken ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cancelToken)
  ) {
    return NextResponse.json(
      { error: 'INVALID_TOKEN', message: 'Invalid or missing booking token.' },
      { status: 400 }
    )
  }

  // Validate required slot fields
  if (!slotStart || !slotEnd) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'slotStart and slotEnd are required.' },
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

  // Verify the new slot is still available (race condition guard)
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

  // Move the existing booking to the new slot
  try {
    const result = await rescheduleBookingEvent({
      cancelToken,
      start: slotStart,
      end: slotEnd,
    })

    if (!result.found) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Booking not found or already cancelled.' },
        { status: 404 }
      )
    }

    const userTz = isValidTimeZone(timezone) ? timezone : BOOKING_CONFIG.timezone
    const displayDate = formatBookingDate(startDate, localeCode, userTz)
    const displayTime = formatBookingTimeRange(slotStart, slotEnd, localeCode, userTz)

    // Send branded reschedule confirmation email (non-blocking)
    if (result.customerEmail) {
      // Format the previous date/time for the crossed-out display
      const previousDisplayDate = result.previousStart
        ? formatBookingDate(new Date(result.previousStart), localeCode, userTz)
        : undefined
      const previousDisplayTime = result.previousStart && result.previousEnd
        ? formatBookingTimeRange(result.previousStart, result.previousEnd, localeCode, userTz)
        : undefined

      after(async () => {
        try {
          await sendRescheduleConfirmation({
            name: result.customerName || '',
            email: result.customerEmail,
            company: result.company || '',
            date: slotStart,
            displayDate,
            displayTime,
            duration: `${BOOKING_CONFIG.slotDurationMinutes} minutes`,
            meetLink: result.meetLink || '',
            cancelToken,
            locale: result.locale || localeCode,
            previousDisplayDate,
            previousDisplayTime,
          })
        } catch (err) {
          console.error('Failed to send reschedule confirmation:', err)
        }
      })
    }

    return NextResponse.json({
      eventId: result.eventId,
      meetLink: result.meetLink,
      date: slotStart,
      displayDate,
      displayTime,
      cancelToken,
    })
  } catch (error) {
    console.error('Failed to reschedule booking:', error)
    return NextResponse.json(
      { error: 'CALENDAR_API_ERROR', message: 'Unable to reschedule booking. Please try again or contact us.' },
      { status: 502 }
    )
  }
}
