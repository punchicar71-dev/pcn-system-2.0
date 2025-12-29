import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone, buildSMSFromTemplate, SMSTemplateParams } from '@/lib/sms-service'
import { withAuth, AuthenticatedUser } from '@/lib/api-auth'
import { checkRateLimit, rateLimiters } from '@/lib/rate-limit'

/**
 * POST /api/sms
 * Send SMS via Text.lk service using server-side templates
 * 
 * ⚠️ PROTECTED ENDPOINT - Requires authentication
 * ⚠️ RATE LIMITED - 10 SMS per hour per user
 * ⚠️ TEMPLATE-BASED - Users cannot send arbitrary messages
 * 
 * Request body:
 * {
 *   to: string (phone number)
 *   template: SMSTemplateType (e.g., 'password-reset', 'vehicle-acceptance')
 *   params: object (template-specific parameters)
 * }
 * 
 * Example for password reset:
 * {
 *   to: "0771234567",
 *   template: "password-reset",
 *   params: { firstName: "John", otpCode: "123456" }
 * }
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    console.log('SMS API: Authenticated request from user:', user.email)
    
    // Rate limiting: Check SMS quota per user
    const rateLimit = checkRateLimit(user.id, rateLimiters.sms)
    if (!rateLimit.allowed) {
      console.warn(`SMS rate limit exceeded for user: ${user.email}`)
      return NextResponse.json(
        { 
          error: 'SMS quota exceeded. Please wait before sending more messages.',
          retryAfter: rateLimit.retryAfter,
          remaining: 0
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetInSeconds)
          }
        }
      )
    }
    
    const body = await request.json()
    const { to, template, params } = body

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    if (!template || !params) {
      return NextResponse.json(
        { error: 'Template type and params are required. Arbitrary messages are not allowed.' },
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

    // Build message from server-side template
    let message: string
    try {
      const templateData: SMSTemplateParams = { type: template, params } as SMSTemplateParams
      message = buildSMSFromTemplate(templateData)
    } catch (templateError) {
      console.error('SMS Template Error:', templateError)
      return NextResponse.json(
        { 
          error: 'Invalid template or parameters',
          details: templateError instanceof Error ? templateError.message : 'Unknown template error'
        },
        { status: 400 }
      )
    }

    // Format phone number to international format
    const formattedPhone = formatPhoneNumber(to)

    console.log('SMS API: Sending templated SMS to', formattedPhone)
    console.log('SMS API: Template type:', template)

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
        template: template,
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
})

/**
 * GET /api/sms
 * Returns available SMS templates and usage information
 */
export async function GET() {
  return NextResponse.json({
    service: 'Text.lk SMS Service',
    status: 'configured',
    message: 'SMS service is ready to use',
    security: 'Template-based messaging only. Arbitrary messages are not allowed.',
    availableTemplates: [
      {
        type: 'welcome',
        description: 'New user welcome message with credentials',
        params: ['firstName', 'username', 'email', 'password']
      },
      {
        type: 'password-reset',
        description: 'Password reset OTP',
        params: ['firstName', 'otpCode']
      },
      {
        type: 'phone-verification',
        description: 'Phone number verification OTP',
        params: ['otpCode']
      },
      {
        type: 'account-status',
        description: 'Account status change notification',
        params: ['firstName', 'status']
      },
      {
        type: 'account-deleted',
        description: 'Account deletion notification',
        params: ['firstName']
      },
      {
        type: 'vehicle-acceptance',
        description: 'Vehicle accepted for sale notification',
        params: ['sellerTitle?', 'sellerFirstName', 'vehicleNumber', 'brand', 'model', 'year']
      },
      {
        type: 'vehicle-sold',
        description: 'Vehicle sold confirmation',
        params: ['sellerTitle?', 'sellerFirstName', 'vehicleNumber', 'brand', 'model', 'year', 'sellingPrice']
      },
      {
        type: 'payment-reminder',
        description: 'Payment reminder notification',
        params: ['firstName', 'amount', 'dueDate']
      },
      {
        type: 'custom-notification',
        description: 'Brief custom notification (50 char limit)',
        params: ['firstName', 'notificationType', 'briefMessage']
      }
    ],
    example: {
      endpoint: 'POST /api/sms',
      body: {
        to: '0771234567',
        template: 'password-reset',
        params: { firstName: 'John', otpCode: '123456' }
      }
    }
  })
}
