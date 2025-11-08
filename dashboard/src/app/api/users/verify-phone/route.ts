import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/users/verify-phone
 * Verify OTP code and mark phone number as verified
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
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body = await request.json()
    const { userId, mobileNumber, otpCode } = body

    // Validate required fields
    if (!userId || !mobileNumber || !otpCode) {
      return NextResponse.json(
        { error: 'User ID, mobile number, and OTP code are required' },
        { status: 400 }
      )
    }

    // Format phone number
    let formattedPhone = mobileNumber.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '94' + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('94')) {
      formattedPhone = '94' + formattedPhone
    }

    console.log('Verifying OTP for:', formattedPhone)

    // Find matching OTP that hasn't expired or been verified yet
    const { data: otpRecords, error: fetchError } = await supabaseAdmin
      .from('phone_verification_otps')
      .select('*')
      .eq('mobile_number', formattedPhone)
      .eq('otp_code', otpCode)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('Error fetching OTP:', fetchError)
      return NextResponse.json(
        { error: 'Failed to verify OTP' },
        { status: 500 }
      )
    }

    if (!otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    const otpRecord = otpRecords[0]

    // Mark OTP as verified
    const { error: updateOtpError } = await supabaseAdmin
      .from('phone_verification_otps')
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id)

    if (updateOtpError) {
      console.error('Error updating OTP:', updateOtpError)
      return NextResponse.json(
        { error: 'Failed to verify OTP' },
        { status: 500 }
      )
    }

    // Update user's phone_verified status
    const { error: updateUserError } = await supabaseAdmin
      .from('users')
      .update({
        phone_verified: true,
        phone_verified_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateUserError) {
      console.error('Error updating user:', updateUserError)
      return NextResponse.json(
        { error: 'Failed to update user verification status' },
        { status: 500 }
      )
    }

    console.log('Phone verified successfully for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully'
    })

  } catch (error) {
    console.error('Verify phone API error:', error)
    return NextResponse.json(
      { error: 'An error occurred verifying phone number' },
      { status: 500 }
    )
  }
}
