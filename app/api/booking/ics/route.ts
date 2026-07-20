import { NextRequest, NextResponse } from 'next/server'
import { getBookingByCancelToken } from '@/lib/google-calendar'
import { generateICS } from '@/lib/ics-generator'

// Serves a standalone .ics download so non-Google calendar apps (Outlook,
// Apple Calendar, etc.) have a direct link instead of relying on the email
// attachment, which some clients don't surface clearly.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return NextResponse.json(
      { error: 'INVALID_TOKEN', message: 'Invalid or missing token.' },
      { status: 400 }
    )
  }

  try {
    const result = await getBookingByCancelToken(token)

    if (!result.found || !result.event) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Booking not found.' },
        { status: 404 }
      )
    }

    const { company, start, end, meetLink, customerEmail, customerName, locale } = result.event
    const isEs = locale === 'es'

    const icsContent = generateICS({
      uid: token,
      summary: `Strategy Session - ${company} + Syntra`,
      description: isEs
        ? `Sesion de estrategia con Syntra Systems`
        : `Strategy session with Syntra Systems`,
      start: new Date(start),
      end: new Date(end),
      meetLink,
      organizerEmail: 'hello@syntra.build',
      organizerName: 'Syntra Systems',
      attendeeEmail: customerEmail,
      attendeeName: customerName,
    })

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        // Serve inline (not as an attachment) so tapping the link on macOS/iOS
        // opens the event straight in Apple Calendar with an "Add event" prompt
        // instead of downloading the raw .ics file.
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="syntra-session.ics"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Failed to generate ICS download:', error)
    return NextResponse.json(
      { error: 'CALENDAR_API_ERROR', message: 'Unable to generate calendar file.' },
      { status: 502 }
    )
  }
}
