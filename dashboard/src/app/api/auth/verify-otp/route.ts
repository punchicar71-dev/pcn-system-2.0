import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { formatPhoneNumber } from '@/lib/sms-service'

// Lazy initialization of Supabase Admin Client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const body = await request.json()
    const { email, mobileNumber, otp, method = 'email' } = body

    if (!otp) {
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      )
    }

    if (method === 'email' && !email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (method === 'mobile' && !mobileNumber) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      )
    }

    const identifier = method === 'email' ? email.toLowerCase().trim() : formatPhoneNumber(mobileNumber)

    console.log(`Verifying OTP for ${method}:`, identifier)

    // Find OTP record by email or mobile number
    let otpRecord = null
    let otpError = null

    if (method === 'email') {
      const result = await supabaseAdmin
        .from('password_reset_otps')
        .select('*')
        .ilike('email', identifier)
        .eq('otp_code', otp)
        .eq('verified', false)
        .single()
      otpRecord = result.data
      otpError = result.error
    } else {
      const result = await supabaseAdmin
        .from('password_reset_otps')
        .select('*')
        .eq('mobile_number', identifier)
        .eq('otp_code', otp)
        .eq('verified', false)
        .single()
      otpRecord = result.data
      otpError = result.error
    }

    if (otpError || !otpRecord) {
      console.error('OTP lookup error:', otpError)
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    const now = new Date()
    const expiresAt = new Date(otpRecord.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'OTP code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark OTP as verified
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_otps')
      .update({ verified: true, updated_at: new Date().toISOString() })
      .eq('id', otpRecord.id)

    if (updateError) {
      console.error('Error updating OTP status:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify OTP' },
        { status: 500 }
      )
    }

    // Get user info from the users table - use email from OTP record if available
    const userEmail = otpRecord.email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, auth_id')
      .ilike('email', userEmail)
      .single()

    if (userError || !user) {
      console.error('Could not find user for password reset:', userError)
      return NextResponse.json(
        { error: 'User not found for password reset' },
        { status: 404 }
      )
    }

    const resetToken = jwt.sign(
      { 
        userId: user.id,
        authId: user.auth_id,
        email: userEmail,
        otpId: otpRecord.id,
        type: 'password_reset'
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '15m' }
    )

    console.log(`OTP verified successfully for ${method}:`, identifier)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      token: resetToken
    })

  } catch (error) {
    console.error('Verify OTP Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
