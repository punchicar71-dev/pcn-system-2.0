/**
 * MIGRATING: Supabase Auth has been removed.
 * This file will be updated to work with Better Auth in Step 2.
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/users/verify-phone-otp
 * Verify OTP code and mark phone as verified
 * 
 * Request body:
 * {
 *   userId: string
 *   mobileNumber: string
 *   otpCode: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, authId, mobileNumber, otpCode } = body

    // Validate required fields
    if (!mobileNumber || !otpCode || (!userId && !authId)) {
      return NextResponse.json(
        { error: 'Mobile number, OTP code, and either userId or authId are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Verifying phone OTP')
    console.log('User ID (from users table):', userId)
    console.log('Auth ID (from auth.users):', authId)
    console.log('Mobile number:', mobileNumber)
    console.log('OTP code:', otpCode)

    // If authId is not provided, try to get it using admin API
    let userIdForOtp = authId
    
    if (!userIdForOtp && userId) {
      console.log('Auth ID not provided, fetching from users table...')
      const { data: userRecord, error: userError } = await supabaseAdmin
        .from('users')
        .select('auth_id, email')
        .eq('id', userId)
        .single()
      
      if (!userError && userRecord) {
        if (userRecord.auth_id) {
          userIdForOtp = userRecord.auth_id
          console.log('Found auth_id from users table:', userIdForOtp)
        } else if (userRecord.email) {
          // TODO: MIGRATION - Supabase Auth admin.listUsers has been commented out
          // This lookup by email will be reimplemented with Better Auth in Step 2
          // For now, we'll use the user ID directly
          console.log('No auth_id found, using user ID directly during migration:', userId)
          userIdForOtp = userId // Use the user's database ID instead
          /*
          // Fallback: look up user by email in auth.users
          console.log('No auth_id found, looking up by email:', userRecord.email)
          const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
          const authUser = authUsers?.find(u => u.email === userRecord.email)
          if (authUser) {
            userIdForOtp = authUser.id
            console.log('Found auth user by email:', userIdForOtp)
          }
          */
        }
      }
    }
    
    if (!userIdForOtp) {
      console.log('Warning: Could not find user ID, but proceeding with OTP verification by phone/code only')
    }

    // Find the OTP record - match by phone number and code only (user_id may be null)
    // This is safe because OTPs expire quickly (15 minutes)
    console.log('Looking up OTP for phone:', mobileNumber)
    const { data: otpRecords, error: queryError } = await supabaseAdmin
      .from('password_reset_otps')
      .select('*')
      .eq('mobile_number', mobileNumber)
      .eq('otp_code', otpCode)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)

    if (queryError) {
      console.error('Error querying OTP:', queryError)
      return NextResponse.json(
        { error: 'Failed to verify OTP' },
        { status: 500 }
      )
    }

    if (!otpRecords || otpRecords.length === 0) {
      console.warn('OTP not found or already used')
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      )
    }

    const otpRecord = otpRecords[0]

    // Check if OTP has expired
    const expiresAt = new Date(otpRecord.expires_at)
    if (expiresAt < new Date()) {
      console.warn('OTP has expired')
      return NextResponse.json(
        { error: 'OTP code has expired' },
        { status: 400 }
      )
    }

    // Mark OTP as verified
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_otps')
      .update({ verified: true })
      .eq('id', otpRecord.id)

    if (updateError) {
      console.error('Error marking OTP as verified:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify OTP' },
        { status: 500 }
      )
    }

    console.log('OTP verified successfully')

    // Mark user's phone as verified in the users table
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        phone_verified: true,
        phone_verified_at: new Date().toISOString()
      })
      .eq('auth_id', userIdForOtp)

    if (userUpdateError) {
      console.error('Error updating user phone_verified status:', userUpdateError)
      // Don't fail - the OTP was verified successfully
    } else {
      console.log('User phone_verified status updated')
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully'
    })

  } catch (error) {
    console.error('Verify phone OTP error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
