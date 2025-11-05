import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone } from '@/lib/sms-service'

/**
 * POST /api/sms
 * Send SMS via Text.lk service
 * 
 * Request body:
 * {
 *   to: string (phone number)
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message } = body

    // Validate required fields
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!isValidSriLankanPhone(to)) {
      return NextResponse.json(
        { error: 'Invalid Sri Lankan phone number format. Use format: 0771234567 or 94771234567' },
        { status: 400 }
      )
    }

    // Validate message length (SMS standard is 160 characters for single SMS)
    if (message.length > 160) {
      console.warn('SMS message exceeds 160 characters, will be sent as multiple SMS')
    }

    // Format phone number to international format
    const formattedPhone = formatPhoneNumber(to)

    console.log('SMS API: Sending SMS to', formattedPhone)

    // Send SMS
    const result = await sendSMS({
      to: formattedPhone,
      message
    })

    if (result.status === 'error') {
      console.error('SMS API Error:', result.message)
      return NextResponse.json(
        { 
          error: result.message,
          details: result.error 
        },
        { status: 500 }
      )
    }

    console.log('SMS API: SMS sent successfully')
    
    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      data: {
        to: formattedPhone,
        sentAt: new Date().toISOString(),
        response: result.data
      }
    })
  } catch (error) {
    console.error('SMS API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sms
 * Test endpoint to check if SMS service is configured
 */
export async function GET() {
  return NextResponse.json({
    service: 'Text.lk SMS Service',
    status: 'configured',
    message: 'SMS service is ready to use',
    endpoints: {
      send: 'POST /api/sms with body: { to: "0771234567", message: "Your message" }'
    }
  })
}
