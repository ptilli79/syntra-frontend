import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/google-calendar'
import { BOOKING_CONFIG } from '@/lib/booking-config'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const rl = await checkRateLimit('bookingSlots', getClientIp(request))
  if (!rl.success) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  const dateParam = request.nextUrl.searchParams.get('date')

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json(
      { error: 'INVALID_DATE', message: 'Date parameter must be in YYYY-MM-DD format.' },
      { status: 400 }
    )
  }

  // Validate date is within the scheduling window
  const now = new Date()
  const requestedDate = new Date(dateParam + 'T12:00:00Z')
  const minDate = new Date(now.getTime() + BOOKING_CONFIG.minNoticeHours * 60 * 60 * 1000)
  const maxDate = new Date(now.getTime() + BOOKING_CONFIG.maxAdvanceDays * 24 * 60 * 60 * 1000)

  if (requestedDate > maxDate) {
    return NextResponse.json(
      { error: 'DATE_OUT_OF_RANGE', message: `Date must be within ${BOOKING_CONFIG.maxAdvanceDays} days from today.` },
      { status: 400 }
    )
  }

  if (requestedDate < new Date(now.toISOString().split('T')[0] + 'T00:00:00Z')) {
    return NextResponse.json(
      { error: 'DATE_OUT_OF_RANGE', message: 'Cannot book in the past.' },
      { status: 400 }
    )
  }

  try {
    const slots = await getAvailableSlots(dateParam)
    return NextResponse.json({
      date: dateParam,
      timezone: BOOKING_CONFIG.timezone,
      slots,
    })
  } catch (error) {
    console.error('Failed to fetch available slots:', error)
    return NextResponse.json(
      { error: 'CALENDAR_API_ERROR', message: 'Unable to fetch availability. Please try again.' },
      { status: 502 }
    )
  }
}
