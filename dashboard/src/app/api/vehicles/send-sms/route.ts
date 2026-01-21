/**
 * API Route: Send Vehicle SMS Notifications
 * POST /api/vehicles/send-sms
 * 
 * ⚠️ PROTECTED ENDPOINT - Requires authentication
 * ⚠️ RATE LIMITED - 10 SMS per hour per user
 * 
 * This route handles sending SMS notifications for vehicle acceptance and confirmation.
 * It's needed because client-side code cannot access server-side environment variables.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/api-auth';
import { checkRateLimit, rateLimiters } from '@/lib/rate-limit';

interface SendSMSRequest {
  type?: 'vehicle-acceptance' | 'sell-vehicle-confirmation' | 'reserve-vehicle-confirmation';
  seller: {
    title?: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
  };
  vehicle: {
    vehicleNumber: string;
    brand: string;
    model: string;
    year: number;
  };
  sellingPrice?: number;
  message?: string;
}

interface TextLKResponse {
  status: string;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Format phone number to international format
 */
function formatPhoneNumber(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('94')) {
    cleaned = '94' + cleaned;
  }
  
  return cleaned;
}

/**
 * Validate Sri Lankan phone number
 */
function isValidSriLankanPhone(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return cleaned.startsWith('07');
  }
  
  if (cleaned.startsWith('94') && cleaned.length === 11) {
    return cleaned.substring(2).startsWith('7');
  }
  
  return false;
}

/**
 * Build seller name with title
 */
function buildSellerName(seller: SendSMSRequest['seller']): string {
  const titlePart = seller.title ? `${seller.title} ` : '';
  return `${titlePart}${seller.firstName} ${seller.lastName}`;
}

/**
 * Build SMS message for vehicle acceptance
 */
function buildVehicleAcceptanceSMSMessage(
  seller: SendSMSRequest['seller'],
  vehicle: SendSMSRequest['vehicle']
): string {
  const titlePart = seller.title ? `${seller.title} ` : '';
  const greeting = `Dear ${titlePart}${seller.firstName},`;
  
  return `${greeting}\n\nYour vehicle ${vehicle.vehicleNumber}: ${vehicle.brand}, ${vehicle.model}, ${vehicle.year} has been successfully handed over to the Punchi Car Niwasa showroom for sale. Once a buyer inspects your vehicle, we will contact you to finalize the best offer.\n\nFor any inquiries, please contact: 0112 413 865 | 0117 275 275.\n\nThank you for trusting Punchi Car Niwasa.`;
}

/**
 * Build SMS message for sell vehicle confirmation
 */
function buildSellVehicleConfirmationSMSMessage(
  seller: SendSMSRequest['seller'],
  vehicle: SendSMSRequest['vehicle'],
  sellingPrice: number
): string {
  const titlePart = seller.title ? `${seller.title} ` : '';
  const greeting = `Dear ${titlePart}${seller.firstName},`;
  const priceFormatted = sellingPrice.toLocaleString('en-LK');

  return `${greeting}\n\nWe are pleased to inform you that your vehicle deal has been confirmed as discussed.\n\nVehicle Details:\n• Vehicle: ${vehicle.brand}, ${vehicle.model}, ${vehicle.year}\n• Chassis/Registration No: ${vehicle.vehicleNumber}\n• Confirmed Offer: Rs. ${priceFormatted}\n\nThank you for choosing Punchi Car Niwasa.\n\nFor any queries, please contact us at:\n0112 413 865 | 0117 275 275`;
}

/**
 * Send SMS via Text.lk API
 */
async function sendSMSViaTextLK(
  to: string,
  message: string
): Promise<TextLKResponse> {
  try {
    const apiToken = process.env.TEXTLK_API_TOKEN;
    const apiUrl = process.env.TEXTLK_API_URL || 'https://app.text.lk/api/v3/sms/send';
    const senderId = process.env.TEXTLK_SENDER_ID;

    if (!apiToken) {
      console.error('❌ TEXTLK_API_TOKEN not configured in environment');
      return {
        status: 'error',
        message: 'SMS service not configured',
        error: 'API token missing - check TEXTLK_API_TOKEN in .env.local'
      };
    }

    if (!senderId) {
      console.warn('⚠️  TEXTLK_SENDER_ID not configured, using default');
    }

    console.log('📱 Sending SMS via Text.lk API');
    console.log('📍 API URL:', apiUrl);
    console.log('📍 To:', to);
    console.log('📍 Sender ID:', senderId || 'TextLK (default)');
    console.log('📧 Message length:', message.length);

    const requestBody = {
      recipient: to,
      sender_id: senderId || 'TextLK',
      type: 'plain',
      message: message
    };

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('📊 Text.lk Response Status:', response.status);
    console.log('📊 Text.lk Response Headers:', Object.fromEntries(response.headers));
    console.log('📊 Text.lk Response Body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('⚠️  Could not parse Text.lk response as JSON:', parseError);
      responseData = { raw: responseText };
    }

    // Check for success
    if (response.ok && responseData.status === 'success') {
      console.log('✅ SMS sent successfully via Text.lk');
      console.log('📊 SMS Details:', {
        id: responseData.data?.id,
        status: responseData.status,
        recipient: to
      });
      return {
        status: 'success',
        message: 'SMS sent successfully',
        data: responseData.data
      };
    } else {
      // Log detailed error info
      console.error('❌ Text.lk API error');
      console.error('📊 Response status:', response.status);
      console.error('📊 Response data:', responseData);
      
      // Check for specific error codes from Text.lk
      if (responseData.code) {
        console.error('📊 Error code:', responseData.code);
      }
      
      return {
        status: 'error',
        message: responseData.message || `SMS service returned status ${response.status}`,
        error: JSON.stringify(responseData)
      };
    }
  } catch (error) {
    console.error('❌ Text.lk SMS Service Exception:', error);
    console.error('📊 Exception details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to send SMS',
      error: String(error)
    };
  }
}

/**
 * POST /api/vehicles/send-sms
 * Send SMS notification for vehicle acceptance or sell confirmation
 * 
 * ⚠️ PROTECTED - Requires authenticated user
 * ⚠️ RATE LIMITED - 10 SMS per hour per user
 */
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    console.log('📨 SMS API: Received POST request from user:', user.email);
    
    // Rate limiting: Check SMS quota per user
    const rateLimit = checkRateLimit(user.id, rateLimiters.sms);
    if (!rateLimit.allowed) {
      console.warn(`📨 SMS rate limit exceeded for user: ${user.email}`);
      return NextResponse.json(
        { 
          success: false,
          message: 'SMS quota exceeded. Please wait before sending more messages.',
          retryAfter: rateLimit.retryAfter,
          remaining: 0
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetInSeconds)
          }
        }
      );
    }
    
    const body: SendSMSRequest = await request.json();
    console.log('📨 SMS API: Request body received');
    console.log('📨 Message type:', body.type || 'vehicle-acceptance (default)');
    console.log('📨 Seller info present:', !!body.seller);
    console.log('📨 Vehicle info present:', !!body.vehicle);

    // Validate request body
    if (!body.seller || !body.vehicle) {
      console.error('❌ SMS API: Invalid request - missing seller or vehicle data');
      return NextResponse.json(
        {
          success: false,
          message: 'Missing seller or vehicle data',
          error: 'Invalid request body'
        },
        { status: 400 }
      );
    }

    const { seller, vehicle, sellingPrice, type = 'vehicle-acceptance' } = body;

    // Validate seller data
    if (!seller.firstName || !seller.lastName) {
      console.error('❌ SMS API: Invalid request - missing seller name');
      console.error('📊 Seller data:', seller);
      return NextResponse.json(
        {
          success: false,
          message: 'Seller first name and last name are required',
          error: 'Missing seller name'
        },
        { status: 400 }
      );
    }

    if (!seller.mobileNumber) {
      console.error('❌ SMS API: Invalid request - missing mobile number');
      return NextResponse.json(
        {
          success: false,
          message: 'Seller mobile number is required',
          error: 'Mobile number missing'
        },
        { status: 400 }
      );
    }

    if (!isValidSriLankanPhone(seller.mobileNumber)) {
      console.error('❌ SMS API: Invalid phone format:', seller.mobileNumber);
      return NextResponse.json(
        {
          success: false,
          message: `Invalid mobile number format: ${seller.mobileNumber}`,
          error: 'Phone number must be in valid Sri Lankan format'
        },
        { status: 400 }
      );
    }

    // Validate vehicle data
    if (!vehicle.vehicleNumber || !vehicle.brand || !vehicle.model || !vehicle.year) {
      console.error('❌ SMS API: Invalid request - incomplete vehicle information');
      console.error('📊 Vehicle data:', vehicle);
      return NextResponse.json(
        {
          success: false,
          message: 'Vehicle details (number, brand, model, year) are required',
          error: 'Incomplete vehicle information'
        },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(seller.mobileNumber);
    console.log('✅ SMS API: Phone number formatted:', formattedPhone);

    // Build SMS message based on type
    let message: string;
    
    if (type === 'sell-vehicle-confirmation' || type === 'reserve-vehicle-confirmation') {
      if (!sellingPrice || sellingPrice <= 0) {
        console.error('❌ SMS API: Invalid selling price for reserve-vehicle-confirmation');
        return NextResponse.json(
          {
            success: false,
            message: 'Selling price is required for reserve-vehicle-confirmation',
            error: 'Invalid selling price'
          },
          { status: 400 }
        );
      }
      message = buildSellVehicleConfirmationSMSMessage(seller, vehicle, sellingPrice);
      console.log('📝 SMS API: Building reserve vehicle confirmation message');
    } else {
      message = buildVehicleAcceptanceSMSMessage(seller, vehicle);
      console.log('📝 SMS API: Building vehicle acceptance message');
    }

    console.log('✅ SMS API: SMS message built');
    console.log('📧 SMS Message preview (length:', message.length, ')');
    console.log(message);

    // Send SMS
    console.log('📱 SMS API: Calling Text.lk API...');
    const smsResult = await sendSMSViaTextLK(formattedPhone, message);

    if (smsResult.status === 'success') {
      console.log('✅ SMS API: SMS sent successfully');
      return NextResponse.json({
        success: true,
        message: `SMS notification sent to ${seller.firstName} ${seller.lastName}`,
        phoneNumber: formattedPhone,
        vehicleNumber: vehicle.vehicleNumber
      });
    } else {
      console.error('❌ SMS API: SMS delivery failed');
      console.error('📊 SMS Result:', smsResult);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to send SMS: ${smsResult.message}`,
          phoneNumber: formattedPhone,
          vehicleNumber: vehicle.vehicleNumber,
          error: smsResult.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ SMS API: Exception occurred:', error);
    console.error('📊 Exception details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});
