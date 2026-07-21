import { NextRequest, NextResponse } from 'next/server'
import { hasActiveBooking } from '@/lib/google-calendar'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: this endpoint reveals whether an email has a booking, so cap it
  // tightly to prevent email enumeration / harvesting.
  const rl = await checkRateLimit('checkEmail', getClientIp(request))
  if (!rl.success) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  let body: { email?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Invalid request body.' },
      { status: 400 }
    )
  }

  const { email } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'INVALID_EMAIL', message: 'A valid email address is required.' },
      { status: 400 }
    )
  }

  try {
    const exists = await hasActiveBooking(email)
    return NextResponse.json({ hasActiveBooking: exists })
  } catch (error) {
    console.error('Failed to check active bookings:', error)
    // Non-blocking: if the check fails allow the user to proceed
    return NextResponse.json({ hasActiveBooking: false })
  }
}
