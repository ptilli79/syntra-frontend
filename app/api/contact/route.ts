import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail, sendCustomerAcknowledgment, type ContactFormData } from '@/lib/email'

export async function POST(request: NextRequest) {
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
