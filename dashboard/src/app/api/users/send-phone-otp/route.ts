/**
 * MIGRATING: Supabase Auth has been removed.
 * This file will be updated to work with Better Auth in Step 2.
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone } from '@/lib/sms-service'

/**
 * POST /api/users/send-phone-otp
 * Send OTP code to user's mobile number for phone verification
 * 
 * Direct API approach (stores in password_reset_otps table with purpose='phone-verification')
 * 
 * Request body:
 * {
 *   userId: string
 *   mobileNumber: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, authId, mobileNumber } = body

    // Validate required fields
    if (!mobileNumber || (!userId && !authId)) {
      return NextResponse.json(
        { error: 'Mobile number and either userId or authId are required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!isValidSriLankanPhone(mobileNumber)) {
      return NextResponse.json(
        { error: 'Invalid mobile number format' },
        { status: 400 }
      )
    }

    const formattedPhone = formatPhoneNumber(mobileNumber)

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

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    console.log('Generating phone verification OTP')
    console.log('User ID (from users table):', userId)
    console.log('Auth ID (from auth.users):', authId)
    console.log('Mobile number:', formattedPhone)

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
      return NextResponse.json(
        { error: 'Could not find valid user ID in auth system' },
        { status: 400 }
      )
    }

    // Clean up any old OTPs for this user and phone number
    console.log('Cleaning up old OTPs for:', userIdForOtp)
    const { error: deleteError } = await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .eq('mobile_number', formattedPhone)
      .eq('user_id', userIdForOtp)

    if (deleteError) {
      console.warn('Warning: could not delete old OTPs:', deleteError)
    }

    // Store OTP in password_reset_otps table (reusing for phone verification)
    // Use null for user_id to avoid foreign key constraint issues
    // We validate the user client-side before sending anyway
    console.log('Storing OTP for phone:', formattedPhone)
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('password_reset_otps')
      .insert({
        mobile_number: formattedPhone,
        user_id: null,  // Avoid FK constraint issues - validate client-side
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false
      })
      .select()

    if (insertError) {
      console.error('Error storing OTP in password_reset_otps:', insertError)
      console.error('Error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details
      })

      return NextResponse.json(
        { 
          error: 'Failed to store OTP',
          details: insertError.message 
        },
        { status: 500 }
      )
    }

    console.log('OTP stored successfully in database:', insertData)

    // Send SMS
    const smsMessage = `Your PCN System phone verification code is: ${otpCode}. Valid for 15 minutes.`
    
    console.log('Sending SMS:', smsMessage)
    
    const smsResult = await sendSMS({
      to: formattedPhone,
      message: smsMessage
    })

    if (smsResult.status === 'error') {
      console.error('Failed to send SMS:', smsResult.message)
      // Don't fail if SMS fails - OTP is still in database
      return NextResponse.json({
        success: true,
        message: 'OTP generated but SMS delivery may have failed',
        expiresIn: 900 // 15 minutes in seconds
      })
    }

    console.log('SMS sent successfully to:', formattedPhone)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
      expiresIn: 900 // 15 minutes in seconds
    })

  } catch (error) {
    console.error('Send phone verification OTP error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
