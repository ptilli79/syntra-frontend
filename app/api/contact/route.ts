import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail, type ContactFormData } from '@/lib/email'

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
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send contact email:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email us directly.' },
      { status: 500 }
    )
  }
}
