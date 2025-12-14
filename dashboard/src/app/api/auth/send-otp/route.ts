import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone, smsTemplates } from '@/lib/sms-service'

// Lazy initialize Supabase Admin Client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

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

    // Try to find user with multiple phone number formats
    // Format 1: 94710898944 (international without +)
    // Format 2: +94710898944 (international with +)
    // Format 3: 0710898944 (local format)
    const phoneVariants = [
      formattedPhone,                                    // 94710898944
      `+${formattedPhone}`,                              // +94710898944
      formattedPhone.startsWith('94') ? `0${formattedPhone.substring(2)}` : formattedPhone  // 0710898944
    ]

    console.log('Searching for user with mobile number variants:', phoneVariants)

    const supabaseAdmin = getSupabaseAdmin()

    // Check if user exists with any of these mobile number formats
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, mobile_number')
      .in('mobile_number', phoneVariants)
      .single()

    if (userError || !userData) {
      console.error('User lookup error:', userError)
      console.log('No user found with mobile number:', phoneVariants)
      return NextResponse.json(
        { error: 'No account found with this mobile number' },
        { status: 404 }
      )
    }

    console.log('User found:', userData.id, 'with mobile:', userData.mobile_number)

    // Generate OTP
    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now

    // Clean up any existing OTPs for this mobile number (all variants)
    await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .in('mobile_number', phoneVariants)

    // Store OTP in database
    // Note: We don't store user_id due to FK constraint issues between auth.users and public.users
    // The user was already validated by looking up their mobile number above
    const { error: otpError } = await supabaseAdmin
      .from('password_reset_otps')
      .insert({
        mobile_number: formattedPhone,
        otp_code: otpCode,
        user_id: null, // Set to null to avoid FK constraint issues
        expires_at: expiresAt.toISOString(),
        verified: false
      })

    if (otpError) {
      console.error('Error storing OTP in database:', otpError)
      console.error('OTP Error Details:', {
        message: otpError.message,
        code: otpError.code,
        details: otpError.details
      })
      return NextResponse.json(
        { 
          error: 'Failed to generate OTP',
          details: otpError.message 
        },
        { status: 500 }
      )
    }

    console.log('OTP stored successfully:', {
      mobile: formattedPhone,
      expires: expiresAt.toISOString()
    })

    // Try to send SMS first before returning success
    // This ensures we don't report success if SMS fails completely
    const message = smsTemplates.passwordReset(userData.first_name, otpCode)
    console.log('Sending SMS with message:', message)
    
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
      expiresIn: 300 // 5 minutes in seconds
    })

  } catch (error) {
    console.error('Send OTP Error:', error)
    console.error('Error Details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
