/**
 * Reset Password API Route
 * 
 * MIGRATING: Supabase Auth password update has been removed.
 * This route now updates the password_hash in the users table.
 * Better Auth will handle proper password hashing in Step 2.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import * as crypto from 'crypto'

// Lazy initialization of Supabase Admin Client (for database operations only)
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

// Simple password hashing (temporary until Better Auth is integrated)
// TODO: Replace with Better Auth password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

interface ResetTokenPayload {
  userId: string
  authId: string
  email?: string
  mobileNumber?: string
  otpId: string
  type: string
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const body = await request.json()
    const { token, newPassword } = body

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

    // Get user ID from token
    const userId = decoded.userId

    if (!userId) {
      return NextResponse.json(
        { error: 'Cannot determine user ID' },
        { status: 400 }
      )
    }

    // Update password in users table
    // NOTE: Using simple hash temporarily. Better Auth will handle this properly.
    const passwordHash = hashPassword(newPassword)
    
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating password:', updateError)
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

    console.log('Password reset successfully for user:', userId)

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
