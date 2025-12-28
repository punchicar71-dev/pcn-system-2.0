import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    console.log('Verifying OTP for email:', normalizedEmail)

    // Find OTP record by email
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('password_reset_otps')
      .select('*')
      .ilike('email', normalizedEmail)
      .eq('otp_code', otp)
      .eq('verified', false)
      .single()

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

    // Get user info from the users table by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, auth_id')
      .ilike('email', normalizedEmail)
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
        email: normalizedEmail,
        otpId: otpRecord.id,
        type: 'password_reset'
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '15m' }
    )

    console.log('OTP verified successfully for:', normalizedEmail)

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
