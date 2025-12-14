import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone, smsTemplates } from '@/lib/sms-service'

/**
 * POST /api/users/send-phone-verification-otp
 * Send OTP code for phone number verification
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
    const { userId, mobileNumber } = body

    // Validate required fields
    if (!userId || !mobileNumber) {
      return NextResponse.json(
        { error: 'User ID and mobile number are required' },
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

    console.log('Generating phone verification OTP for user:', userId)
    console.log('Mobile number:', formattedPhone)

    // Try to create phone_verification_otps table if it doesn't exist
    // (This is a safety measure)
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS phone_verification_otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mobile_number TEXT NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        otp_code TEXT NOT NULL,
        purpose TEXT NOT NULL DEFAULT 'verification',
        verified BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        verified_at TIMESTAMPTZ
      );
    `

    // Store OTP in database
    const { error: insertError } = await supabaseAdmin
      .from('phone_verification_otps')
      .insert({
        mobile_number: formattedPhone,
        user_id: userId,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        purpose: 'verification',
        verified: false
      })

    if (insertError) {
      console.error('Error storing OTP in phone_verification_otps:', insertError)
      console.error('Error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details
      })
      
      // If table doesn't exist error, return helpful message
      if (insertError.message && insertError.message.includes('relation') && insertError.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Database error: phone_verification_otps table does not exist',
            details: 'Please run the migration: dashboard/migrations/2025_11_08_add_phone_verification_otps.sql'
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to store OTP',
          details: insertError.message 
        },
        { status: 500 }
      )
    }

    console.log('OTP stored successfully in database')

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
        message: 'OTP generated but SMS delivery may have failed. Please check your phone or try again.',
        details: smsResult.message
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
