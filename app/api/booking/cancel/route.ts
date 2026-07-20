import { NextRequest, NextResponse } from 'next/server'
import { findAndCancelEvent } from '@/lib/google-calendar'
import { sendCancellationEmail } from '@/lib/booking-email'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return NextResponse.json(
      { error: 'INVALID_TOKEN', message: 'Invalid or missing cancellation token.' },
      { status: 400 }
    )
  }

  try {
    const result = await findAndCancelEvent(token)

    if (!result.found) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Booking not found or already cancelled.' },
        { status: 404 }
      )
    }

    // Send cancellation confirmation email
    if (result.event?.customerEmail) {
      sendCancellationEmail({
        name: result.event.customerName,
        email: result.event.customerEmail,
        eventSummary: result.event.summary,
        eventDate: result.event.start,
        locale: result.event.locale,
      }).catch((err) => {
        console.error('Failed to send cancellation email:', err)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Booking has been cancelled successfully.',
    })
  } catch (error) {
    console.error('Failed to cancel booking:', error)
    return NextResponse.json(
      { error: 'CALENDAR_API_ERROR', message: 'Unable to cancel booking. Please try again or contact us.' },
      { status: 502 }
    )
  }
}
