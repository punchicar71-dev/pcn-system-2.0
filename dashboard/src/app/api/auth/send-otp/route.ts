import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailTemplates, isValidEmail } from '@/lib/email-service'
import { sendSMS, formatPhoneNumber, isValidSriLankanPhone } from '@/lib/sms-service'
import { checkRateLimit, rateLimiters, getClientIP } from '@/lib/rate-limit'

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

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const body = await request.json()
    const { email, mobileNumber, method = 'email' } = body

    // Validate based on method
    if (method === 'email') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email address is required' },
          { status: 400 }
        )
      }

      if (!isValidEmail(email)) {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        )
      }
    } else if (method === 'mobile') {
      if (!mobileNumber) {
        return NextResponse.json(
          { error: 'Mobile number is required' },
          { status: 400 }
        )
      }

      if (!isValidSriLankanPhone(mobileNumber)) {
        return NextResponse.json(
          { error: 'Invalid Sri Lankan mobile number format' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid method. Use "email" or "mobile"' },
        { status: 400 }
      )
    }

    const identifier = method === 'email' ? email.toLowerCase().trim() : formatPhoneNumber(mobileNumber)

    // Rate limiting: Check by identifier AND by IP
    const identifierRateLimit = checkRateLimit(identifier, rateLimiters.otp)
    const ipRateLimit = checkRateLimit(getClientIP(request), rateLimiters.otp)
    
    if (!identifierRateLimit.allowed) {
      console.warn(`Rate limit exceeded for ${method}: ${identifier}`)
      return NextResponse.json(
        { 
          error: 'Too many OTP requests. Please wait before trying again.',
          retryAfter: identifierRateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(identifierRateLimit.retryAfter),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(identifierRateLimit.resetInSeconds)
          }
        }
      )
    }
    
    if (!ipRateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${getClientIP(request)}`)
      return NextResponse.json(
        { 
          error: 'Too many requests from this location. Please wait before trying again.',
          retryAfter: ipRateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(ipRateLimit.retryAfter),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(ipRateLimit.resetInSeconds)
          }
        }
      )
    }

    console.log(`Searching for user with ${method}:`, identifier)

    // Check if user exists with this email or mobile number
    let userData = null
    let userError = null

    if (method === 'email') {
      const result = await supabaseAdmin
        .from('users')
        .select('id, first_name, email, mobile_number')
        .ilike('email', identifier)
        .single()
      userData = result.data
      userError = result.error
    } else {
      // Try multiple mobile number formats
      const cleaned = mobileNumber.replace(/\D/g, '')
      let mobileFormats: string[] = []
      
      if (cleaned.startsWith('0')) {
        mobileFormats = [cleaned, '94' + cleaned.substring(1), '+94' + cleaned.substring(1)]
      } else if (cleaned.startsWith('94')) {
        mobileFormats = [cleaned, '0' + cleaned.substring(2), '+' + cleaned]
      } else {
        mobileFormats = [cleaned]
      }

      for (const format of mobileFormats) {
        const result = await supabaseAdmin
          .from('users')
          .select('id, first_name, email, mobile_number')
          .eq('mobile_number', format)
          .single()
        
        if (result.data && !result.error) {
          userData = result.data
          userError = null
          break
        }
        userError = result.error
      }
    }

    if (userError || !userData) {
      console.error('User lookup error:', userError)
      console.log(`No user found with ${method}:`, identifier)
      return NextResponse.json(
        { error: `No account found with this ${method === 'email' ? 'email address' : 'mobile number'}` },
        { status: 404 }
      )
    }

    console.log('User found:', userData.id, 'with email:', userData.email)

    // Generate OTP
    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now

    // Clean up any existing OTPs for this user (by email or mobile)
    if (method === 'email') {
      await supabaseAdmin
        .from('password_reset_otps')
        .delete()
        .ilike('email', identifier)
    } else {
      await supabaseAdmin
        .from('password_reset_otps')
        .delete()
        .eq('mobile_number', identifier)
    }

    // Store OTP in database
    const { error: otpError } = await supabaseAdmin
      .from('password_reset_otps')
      .insert({
        email: method === 'email' ? identifier : userData.email, // Always store email for reference
        mobile_number: method === 'mobile' ? identifier : null,
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
      method,
      identifier,
      expires: expiresAt.toISOString()
    })

    // Send OTP via the selected method
    if (method === 'email') {
      // Send OTP via email using Resend
      const emailContent = emailTemplates.passwordResetOTP(userData.first_name, otpCode)
      
      const emailResult = await sendEmail({
        to: identifier,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })

      if (emailResult.status === 'error') {
        console.error('Failed to send OTP email:', emailResult.message)
        console.error('Email error details:', emailResult.error)
        
        // Check if it's a Resend domain verification issue
        const isDomainError = emailResult.message?.includes('verify a domain') || 
                              emailResult.message?.includes('testing emails') ||
                              emailResult.message?.includes('can only send')
        
        if (isDomainError) {
          // In development/testing mode, still return success with OTP stored
          console.log('='.repeat(50))
          console.log('🔐 DEV MODE - OTP CODE:', otpCode)
          console.log('📧 For email:', identifier)
          console.log('⏰ Expires at:', expiresAt.toISOString())
          console.log('='.repeat(50))
          
          return NextResponse.json({
            success: true,
            message: 'OTP generated successfully. Check server console for OTP code (dev mode).',
            expiresIn: 300,
            devMode: true,
            devOtp: otpCode
          })
        }
        
        return NextResponse.json({
          success: false,
          error: 'Failed to send OTP email. Please try again.',
          details: emailResult.message
        }, { status: 500 })
      }

      console.log('OTP sent successfully via email to:', identifier)
    } else {
      // Send OTP via SMS
      const smsMessage = `Your PCN System password reset code is: ${otpCode}. Valid for 5 minutes. Do not share this code.`
      
      const smsResult = await sendSMS({
        to: identifier,
        message: smsMessage
      })

      if (smsResult.status === 'error') {
        console.error('Failed to send OTP SMS:', smsResult.message)
        
        // In development mode, still return success with OTP stored
        console.log('='.repeat(50))
        console.log('🔐 DEV MODE - OTP CODE:', otpCode)
        console.log('📱 For mobile:', identifier)
        console.log('⏰ Expires at:', expiresAt.toISOString())
        console.log('='.repeat(50))
        
        return NextResponse.json({
          success: true,
          message: 'OTP generated but SMS delivery may have failed. Check server console for OTP code (dev mode).',
          expiresIn: 300,
          devMode: true,
          devOtp: otpCode
        })
      }

      console.log('OTP sent successfully via SMS to:', identifier)
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to your ${method === 'email' ? 'email address' : 'mobile number'}`,
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
