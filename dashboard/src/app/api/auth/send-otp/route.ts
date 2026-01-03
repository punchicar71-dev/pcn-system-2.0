import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailTemplates, isValidEmail } from '@/lib/email-service'
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
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Rate limiting: Check by email AND by IP
    const emailRateLimit = checkRateLimit(normalizedEmail, rateLimiters.otp)
    const ipRateLimit = checkRateLimit(getClientIP(request), rateLimiters.otp)
    
    if (!emailRateLimit.allowed) {
      console.warn(`Rate limit exceeded for email: ${normalizedEmail}`)
      return NextResponse.json(
        { 
          error: 'Too many OTP requests. Please wait before trying again.',
          retryAfter: emailRateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(emailRateLimit.retryAfter),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(emailRateLimit.resetInSeconds)
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

    console.log('Searching for user with email:', normalizedEmail)

    // Check if user exists with this email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, email')
      .ilike('email', normalizedEmail)
      .single()

    if (userError || !userData) {
      console.error('User lookup error:', userError)
      console.log('No user found with email:', normalizedEmail)
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      )
    }

    console.log('User found:', userData.id, 'with email:', userData.email)

    // Generate OTP
    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now

    // Clean up any existing OTPs for this email
    await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .ilike('email', normalizedEmail)

    // Store OTP in database (using email instead of mobile_number)
    const { error: otpError } = await supabaseAdmin
      .from('password_reset_otps')
      .insert({
        email: normalizedEmail,
        mobile_number: null, // Keep for backwards compatibility
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
      email: normalizedEmail,
      expires: expiresAt.toISOString()
    })

    // Send OTP via email using Resend
    const emailContent = emailTemplates.passwordResetOTP(userData.first_name, otpCode)
    
    const emailResult = await sendEmail({
      to: normalizedEmail,
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
        // The user can check the server console for the OTP
        console.log('='.repeat(50))
        console.log('🔐 DEV MODE - OTP CODE:', otpCode)
        console.log('📧 For email:', normalizedEmail)
        console.log('⏰ Expires at:', expiresAt.toISOString())
        console.log('='.repeat(50))
        
        // Return success so the user can proceed to OTP verification page
        return NextResponse.json({
          success: true,
          message: 'OTP generated successfully. Check server console for OTP code (dev mode).',
          expiresIn: 300,
          // Include OTP in response for development testing
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

    console.log('OTP sent successfully to:', normalizedEmail)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email address',
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
