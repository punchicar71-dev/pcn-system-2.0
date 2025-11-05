import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone, smsTemplates } from '@/lib/sms-service'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobileNumber } = body

    if (!mobileNumber) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      )
    }

    // Validate phone number
    if (!isValidSriLankanPhone(mobileNumber)) {
      return NextResponse.json(
        { error: 'Invalid mobile number format' },
        { status: 400 }
      )
    }

    const formattedPhone = formatPhoneNumber(mobileNumber)

    // Check if user exists with this mobile number
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, mobile_number')
      .eq('mobile_number', formattedPhone)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'No account found with this mobile number' },
        { status: 404 }
      )
    }

    // Generate OTP
    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Clean up any existing OTPs for this mobile number
    await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .eq('mobile_number', formattedPhone)

    // Store OTP in database
    const { error: otpError } = await supabaseAdmin
      .from('password_reset_otps')
      .insert({
        mobile_number: formattedPhone,
        otp_code: otpCode,
        user_id: userData.id,
        expires_at: expiresAt.toISOString(),
        verified: false
      })

    if (otpError) {
      console.error('Error storing OTP:', otpError)
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      )
    }

    // Send OTP via SMS
    const message = smsTemplates.passwordReset(userData.first_name, otpCode)
    const smsResult = await sendSMS({
      to: formattedPhone,
      message
    })

    if (smsResult.status === 'error') {
      console.error('Failed to send OTP SMS:', smsResult.message)
      // Don't fail the request if SMS fails, OTP is still in database
      return NextResponse.json({
        success: true,
        message: 'OTP generated but SMS delivery may have failed. Please try again or contact support.'
      })
    }

    console.log('OTP sent successfully to:', formattedPhone)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
      expiresIn: 900 // 15 minutes in seconds
    })

  } catch (error) {
    console.error('Send OTP Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
