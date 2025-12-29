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
    // Text.lk API configuration from environment variables (required)
    const apiToken = process.env.TEXTLK_API_TOKEN
    const apiUrl = process.env.TEXTLK_API_URL || 'https://app.text.lk/api/v3/sms/send'
    const senderId = process.env.TEXTLK_SENDER_ID // Optional: Set this after getting approval
    
    if (!apiToken) {
      throw new Error('TEXTLK_API_TOKEN environment variable is not set. Please configure it in .env.local')
    }
    
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
 * 
 * ⚠️ SECURITY: All SMS content MUST be defined here on the server.
 * Never allow clients to pass arbitrary message content.
 */
export type SMSTemplateType = 
  | 'welcome'
  | 'password-reset'
  | 'phone-verification'
  | 'account-status'
  | 'account-deleted'
  | 'vehicle-acceptance'
  | 'vehicle-sold'
  | 'payment-reminder'
  | 'custom-notification';

interface WelcomeParams {
  firstName: string;
  username: string;
  email: string;
  password: string;
}

interface PasswordResetParams {
  firstName: string;
  otpCode: string;
}

interface PhoneVerificationParams {
  otpCode: string;
}

interface AccountStatusParams {
  firstName: string;
  status: string;
}

interface AccountDeletedParams {
  firstName: string;
}

interface VehicleAcceptanceParams {
  sellerTitle?: string;
  sellerFirstName: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  year: number;
}

interface VehicleSoldParams {
  sellerTitle?: string;
  sellerFirstName: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  year: number;
  sellingPrice: number;
}

interface PaymentReminderParams {
  firstName: string;
  amount: number;
  dueDate: string;
}

interface CustomNotificationParams {
  firstName: string;
  notificationType: 'info' | 'warning' | 'success';
  briefMessage: string; // Limited to 50 chars, sanitized
}

export type SMSTemplateParams = 
  | { type: 'welcome'; params: WelcomeParams }
  | { type: 'password-reset'; params: PasswordResetParams }
  | { type: 'phone-verification'; params: PhoneVerificationParams }
  | { type: 'account-status'; params: AccountStatusParams }
  | { type: 'account-deleted'; params: AccountDeletedParams }
  | { type: 'vehicle-acceptance'; params: VehicleAcceptanceParams }
  | { type: 'vehicle-sold'; params: VehicleSoldParams }
  | { type: 'payment-reminder'; params: PaymentReminderParams }
  | { type: 'custom-notification'; params: CustomNotificationParams };

/**
 * Sanitize user input to prevent SMS injection
 */
function sanitizeInput(input: string, maxLength: number = 100): string {
  return input
    .replace(/[\r\n]/g, ' ')  // Remove newlines
    .replace(/[^\w\s@.,\-()]/g, '') // Only allow safe characters
    .substring(0, maxLength)
    .trim();
}

/**
 * Build SMS message from template
 * All templates are defined server-side for security
 */
export function buildSMSFromTemplate(template: SMSTemplateParams): string {
  const COMPANY_NAME = 'Punchi Car Niwasa';
  const CONTACT_NUMBERS = '0112 413 865 | 0117 275 275';
  
  switch (template.type) {
    case 'welcome': {
      const { firstName, username, email, password } = template.params;
      return `Hi ${sanitizeInput(firstName, 30)},\n\nYour ${COMPANY_NAME} Management System account has been successfully created.\n\nUsername: ${sanitizeInput(username, 50)}\nEmail: ${sanitizeInput(email, 50)}\nPassword: ${sanitizeInput(password, 30)}\n\nPlease keep this information confidential.\n\n– ${COMPANY_NAME} Team`;
    }
    
    case 'password-reset': {
      const { firstName, otpCode } = template.params;
      // OTP must be exactly 6 digits
      const sanitizedOTP = otpCode.replace(/\D/g, '').substring(0, 6);
      if (sanitizedOTP.length !== 6) {
        throw new Error('Invalid OTP code format');
      }
      return `${COMPANY_NAME} - Password Reset\n\nDear ${sanitizeInput(firstName, 30)},\n\nYour OTP code is: ${sanitizedOTP}\n\nThis code expires in 5 minutes. Do not share it with anyone.\n\n– ${COMPANY_NAME} Support`;
    }
    
    case 'phone-verification': {
      const { otpCode } = template.params;
      const sanitizedOTP = otpCode.replace(/\D/g, '').substring(0, 6);
      if (sanitizedOTP.length !== 6) {
        throw new Error('Invalid OTP code format');
      }
      return `${COMPANY_NAME}\n\nYour verification code is: ${sanitizedOTP}\n\nThis code expires in 5 minutes.\n\n– ${COMPANY_NAME}`;
    }
    
    case 'account-status': {
      const { firstName, status } = template.params;
      const allowedStatuses = ['Active', 'Inactive', 'Suspended', 'Pending'];
      const sanitizedStatus = allowedStatuses.includes(status) ? status : 'Updated';
      return `Hi ${sanitizeInput(firstName, 30)},\n\nYour ${COMPANY_NAME} account status has been changed to: ${sanitizedStatus}.\n\nContact us at ${CONTACT_NUMBERS} for questions.\n\n– ${COMPANY_NAME}`;
    }
    
    case 'account-deleted': {
      const { firstName } = template.params;
      return `Hi ${sanitizeInput(firstName, 30)},\n\nYour ${COMPANY_NAME} account has been deleted.\n\nIf this was not requested by you, please contact us immediately at ${CONTACT_NUMBERS}.\n\n– ${COMPANY_NAME}`;
    }
    
    case 'vehicle-acceptance': {
      const { sellerTitle, sellerFirstName, vehicleNumber, brand, model, year } = template.params;
      const titlePart = sellerTitle ? `${sanitizeInput(sellerTitle, 10)} ` : '';
      return `Dear ${titlePart}${sanitizeInput(sellerFirstName, 30)},\n\nYour vehicle ${sanitizeInput(vehicleNumber, 15)}: ${sanitizeInput(brand, 20)}, ${sanitizeInput(model, 20)}, ${year} has been successfully handed over to ${COMPANY_NAME} showroom for sale.\n\nWe will contact you once a buyer inspects your vehicle.\n\nContact: ${CONTACT_NUMBERS}\n\n– ${COMPANY_NAME}`;
    }
    
    case 'vehicle-sold': {
      const { sellerTitle, sellerFirstName, vehicleNumber, brand, model, year, sellingPrice } = template.params;
      const titlePart = sellerTitle ? `${sanitizeInput(sellerTitle, 10)} ` : '';
      const priceFormatted = Number(sellingPrice).toLocaleString('en-LK');
      return `Dear ${titlePart}${sanitizeInput(sellerFirstName, 30)},\n\nYour vehicle deal has been confirmed!\n\n• Vehicle: ${sanitizeInput(brand, 20)}, ${sanitizeInput(model, 20)}, ${year}\n• Reg No: ${sanitizeInput(vehicleNumber, 15)}\n• Amount: Rs. ${priceFormatted}\n\nContact: ${CONTACT_NUMBERS}\n\n– ${COMPANY_NAME}`;
    }
    
    case 'payment-reminder': {
      const { firstName, amount, dueDate } = template.params;
      const amountFormatted = Number(amount).toLocaleString('en-LK');
      return `Hi ${sanitizeInput(firstName, 30)},\n\nReminder: Payment of Rs. ${amountFormatted} is due on ${sanitizeInput(dueDate, 15)}.\n\nContact: ${CONTACT_NUMBERS}\n\n– ${COMPANY_NAME}`;
    }
    
    case 'custom-notification': {
      const { firstName, notificationType, briefMessage } = template.params;
      const typeEmoji = notificationType === 'success' ? '✓' : notificationType === 'warning' ? '!' : 'ℹ';
      // Strictly limit custom messages
      const sanitizedMessage = sanitizeInput(briefMessage, 50);
      return `${COMPANY_NAME} [${typeEmoji}]\n\nHi ${sanitizeInput(firstName, 30)},\n\n${sanitizedMessage}\n\nContact: ${CONTACT_NUMBERS}`;
    }
    
    default:
      throw new Error('Unknown SMS template type');
  }
}

/**
 * Legacy templates for backward compatibility
 * @deprecated Use buildSMSFromTemplate() instead
 */
export const smsTemplates = {
  welcome: (firstName: string, username: string, email: string, password: string) => 
    buildSMSFromTemplate({ type: 'welcome', params: { firstName, username, email, password } }),
  
  passwordReset: (firstName: string, otpCode: string) =>
    buildSMSFromTemplate({ type: 'password-reset', params: { firstName, otpCode } }),
  
  accountStatus: (firstName: string, status: string) =>
    buildSMSFromTemplate({ type: 'account-status', params: { firstName, status } }),
    
  accountDeleted: (firstName: string) =>
    buildSMSFromTemplate({ type: 'account-deleted', params: { firstName } }),
    
  loginNotification: (firstName: string, time: string) =>
    `Hi ${firstName}, a new login to your PCN System account was detected at ${time}.`
}
