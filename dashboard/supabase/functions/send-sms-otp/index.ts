// Supabase Edge Function: send-sms-otp
// Handles sending OTP codes via Text.lk SMS service for phone verification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OTPRequest {
  mobileNumber: string
  userId?: string
  purpose?: 'verification' | 'login' | 'password-reset'
}

interface TextLKResponse {
  status: string
  message?: string
  data?: any
}

/**
 * Generate a random 6-digit OTP code
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Format phone number to international format (94XXXXXXXXX)
 */
function formatPhoneNumber(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/\D/g, '')
  
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.substring(1)
  }
  
  if (!cleaned.startsWith('94')) {
    cleaned = '94' + cleaned
  }
  
  return cleaned
}

/**
 * Validate Sri Lankan phone number
 */
function isValidSriLankanPhone(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return cleaned.startsWith('07')
  }
  
  if (cleaned.startsWith('94') && cleaned.length === 11) {
    return cleaned.substring(2).startsWith('7')
  }
  
  return false
}

/**
 * Send SMS via Text.lk API
 */
async function sendSMS(to: string, message: string): Promise<TextLKResponse> {
  const apiToken = Deno.env.get('TEXTLK_API_TOKEN')
  const apiUrl = Deno.env.get('TEXTLK_API_URL') || 'https://app.text.lk/api/v3/sms/send'
  const senderId = Deno.env.get('TEXTLK_SENDER_ID')

  if (!apiToken) {
    throw new Error('TEXTLK_API_TOKEN not configured')
  }

  if (!senderId) {
    throw new Error('TEXTLK_SENDER_ID not configured. Please set an approved Sender ID from Text.lk')
  }

  const requestBody = {
    recipient: to,
    sender_id: senderId,
    type: 'plain',
    message: message
  }

  console.log('Sending SMS to:', to)

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  const responseText = await response.text()
  console.log('Text.lk Response Status:', response.status)
  console.log('Text.lk Response:', responseText)

  let responseData
  try {
    responseData = JSON.parse(responseText)
  } catch {
    responseData = { raw: responseText }
  }

  if (!response.ok || responseData.status !== 'success') {
    throw new Error(responseData.message || 'Failed to send SMS')
  }

  return responseData
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { mobileNumber, userId, purpose = 'verification' }: OTPRequest = await req.json()

    // Validate mobile number
    if (!mobileNumber || !isValidSriLankanPhone(mobileNumber)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Sri Lankan phone number format. Use format: 0771234567 or 94771234567' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(mobileNumber)

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Store OTP in database
    const { error: insertError } = await supabaseClient
      .from('phone_verification_otps')
      .insert({
        mobile_number: formattedPhone,
        user_id: userId || null,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        purpose: purpose,
        verified: false
      })

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Create SMS message based on purpose
    let smsMessage = ''
    switch (purpose) {
      case 'verification':
        smsMessage = `Your PCN System phone verification code is: ${otp}. Valid for 15 minutes.`
        break
      case 'login':
        smsMessage = `Your PCN System login code is: ${otp}. Valid for 15 minutes.`
        break
      case 'password-reset':
        smsMessage = `Punchi Car Niwasa - Password Reset\nYour OTP code is ${otp}.\nPlease use this code to reset your password.\nThis code will expire in 5 minutes.\n\n– Punchi Car Niwasa Support`
        break
      default:
        smsMessage = `Your PCN System verification code is: ${otp}. Valid for 15 minutes.`
    }

    // Send SMS
    try {
      await sendSMS(formattedPhone, smsMessage)

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'OTP sent successfully',
          expiresAt: expiresAt.toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (smsError) {
      console.error('Error sending SMS:', smsError)
      
      // Delete the OTP record if SMS failed
      await supabaseClient
        .from('phone_verification_otps')
        .delete()
        .eq('mobile_number', formattedPhone)
        .eq('otp_code', otp)

      return new Response(
        JSON.stringify({ 
          error: 'Failed to send SMS',
          details: smsError instanceof Error ? smsError.message : 'Unknown error'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }
  } catch (error) {
    console.error('Error in send-sms-otp function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
