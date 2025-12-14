import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

// Lazy initialize Supabase Admin Client
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

interface ResetTokenPayload {
  userId: string
  authId: string
  mobileNumber: string
  otpId: string
  type: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    const supabaseAdmin = getSupabaseAdmin()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Verify token
    let decoded: ResetTokenPayload
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      ) as ResetTokenPayload
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Verify the OTP was verified
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('password_reset_otps')
      .select('verified')
      .eq('id', decoded.otpId)
      .eq('verified', true)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Get user's auth ID from users table
    let authId = decoded.authId
    
    // If authId is not in token (fallback), look it up from users table
    if (!authId && decoded.userId) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('auth_id')
        .eq('id', decoded.userId)
        .single()

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      authId = userData.auth_id
    }

    if (!authId) {
      return NextResponse.json(
        { error: 'Cannot determine user auth ID' },
        { status: 400 }
      )
    }

    // Update password using Supabase Admin API
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      authId,
      { password: newPassword }
    )

    if (passwordError) {
      console.error('Error updating password:', passwordError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Clean up used OTP
    await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .eq('id', decoded.otpId)

    console.log('Password reset successfully for user:', decoded.userId)

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Reset Password Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
