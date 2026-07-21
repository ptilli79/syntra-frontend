import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail, sendCustomerAcknowledgment, type ContactFormData } from '@/lib/email'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { verifyRecaptcha } from '@/lib/recaptcha-verify'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  // Rate limit: cap contact submissions per IP to stop inbox / relay flooding.
  const rl = await checkRateLimit('contact', ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  // Bot protection: reject low-score / missing reCAPTCHA tokens. This closes the
  // "open email relay" vector where a bot submits the form to send mail.
  const recaptcha = await verifyRecaptcha(
    request.headers.get('x-recaptcha-token'),
    'contact',
    ip
  )
  if (!recaptcha.success) {
    return NextResponse.json(
      { error: 'Verification failed. Please refresh the page and try again.' },
      { status: 403 }
    )
  }

  try {
    const data: ContactFormData = await request.json()
    
    // Basic validation
    if (!data.name || !data.email || !data.tier) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and tier are required' },
        { status: 400 }
      )
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    await sendContactEmail(data)

    // On the "send details only" path there's no booking confirmation, so send
    // the customer a courtesy acknowledgment. Don't fail the request if it errors.
    if (data.acknowledge) {
      try {
        await sendCustomerAcknowledgment(data)
      } catch (ackError) {
        console.error('Failed to send customer acknowledgment:', ackError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send contact email:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email us directly.' },
      { status: 500 }
    )
  }
}
