/**
 * Text.lk SMS Service Integration
 * API Documentation: https://www.text.lk/apidocumentation
 */

interface SMSParams {
  to: string // Phone number in format: 94771234567
  message: string
}

interface TextLKResponse {
  status: string
  message: string
  data?: any
  error?: string
}

/**
 * Send SMS using Text.lk API
 */
export async function sendSMS({ to, message }: SMSParams): Promise<TextLKResponse> {
  try {
    // Text.lk API configuration from environment or fallback to defaults
    const apiToken = process.env.TEXTLK_API_TOKEN || '2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169'
    const apiUrl = process.env.TEXTLK_API_URL || 'https://app.text.lk/api/v3/sms/send'
    const senderId = process.env.TEXTLK_SENDER_ID // Optional: Set this after getting approval
    
    console.log('Sending SMS to:', to)
    console.log('Message:', message)
    if (senderId) {
      console.log('Using Sender ID:', senderId)
    } else {
      console.warn('⚠️  No Sender ID configured. Please set TEXTLK_SENDER_ID in .env.local after approval.')
    }

    // Build request body according to Text.lk API v3 specification
    const requestBody: any = {
      recipient: to,
      sender_id: senderId || 'TextLK', // Required: Use default if not configured
      type: 'plain', // Required: 'plain' for regular text messages
      message: message
    }

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

    // Check for success based on Text.lk API response format
    if (response.ok && responseData.status === 'success') {
      return {
        status: 'success',
        message: 'SMS sent successfully',
        data: responseData.data
      }
    } else {
      return {
        status: 'error',
        message: responseData.message || 'Failed to send SMS',
        error: responseText
      }
    }
  } catch (error) {
    console.error('SMS Service Error:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to send SMS',
      error: String(error)
    }
  }
}

/**
 * Format phone number to Sri Lankan international format
 * Examples:
 * - 0771234567 -> 94771234567
 * - 771234567 -> 94771234567
 * - +94771234567 -> 94771234567
 * - 94771234567 -> 94771234567
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '')
  
  // If starts with 0, replace with 94
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.substring(1)
  }
  
  // If doesn't start with 94, add it
  if (!cleaned.startsWith('94')) {
    cleaned = '94' + cleaned
  }
  
  return cleaned
}

/**
 * Validate Sri Lankan phone number
 * Valid formats:
 * - Mobile: 07X XXXX XXX (9 digits after 0)
 * - International: +94 7X XXXX XXX
 */
export function isValidSriLankanPhone(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // Check if it starts with 0 and has 10 digits
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return cleaned.startsWith('07')
  }
  
  // Check if it starts with 94 and has 11 digits
  if (cleaned.startsWith('94') && cleaned.length === 11) {
    return cleaned.substring(2).startsWith('7')
  }
  
  return false
}

/**
 * SMS Templates for different scenarios
 */
export const smsTemplates = {
  welcome: (firstName: string, username: string, email: string, password: string) => 
    `Hi ${firstName},\n\nYour Punchi Car Niwasa Management System account has been successfully created.\nHere are your login details:\n\nUsername: ${username}\nEmail: ${email}\nPassword: ${password}\n\nPlease keep this information confidential and do not share it with anyone.\n\nThank you,\nPunchi Car Niwasa Team`,
  
  passwordReset: (firstName: string, otpCode: string) =>
    `Punchi Car Niwasa - Password Reset\nYour OTP code is ${otpCode}.\nPlease use this code to reset your password.\nThis code will expire in 5 minutes.\n\n– Punchi Car Niwasa Support`,
  
  accountStatus: (firstName: string, status: string) =>
    `Hi ${firstName}, your PCN System account status has been updated to: ${status}.`,
    
  accountDeleted: (firstName: string) =>
    `Hi ${firstName}, your PCN System account has been deleted. Contact admin for more info.`,
    
  loginNotification: (firstName: string, time: string) =>
    `Hi ${firstName}, a new login to your PCN System account was detected at ${time}.`
}
