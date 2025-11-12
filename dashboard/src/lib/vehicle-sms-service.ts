/**
 * Vehicle SMS Notification Service
 */

export interface SellerInfo {
  title?: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export interface VehicleInfo {
  vehicleNumber: string;
  brand: string;
  model: string;
  year: number;
}

export interface VehicleAcceptanceSMSParams {
  seller: SellerInfo;
  vehicle: VehicleInfo;
}

export interface SellVehicleConfirmationSMSParams {
  seller: SellerInfo;
  vehicle: VehicleInfo;
  sellingPrice: number;
}

export interface SMSNotificationResult {
  success: boolean;
  message: string;
  phoneNumber?: string;
  vehicleNumber?: string;
  error?: string;
}

export function buildVehicleAcceptanceSMSMessage(seller: SellerInfo, vehicle: VehicleInfo): string {
  const titlePart = seller.title ? `${seller.title} ` : '';
  const greeting = `Dear ${titlePart}${seller.firstName},`;
  
  return `${greeting}\n\nYour vehicle ${vehicle.vehicleNumber}: ${vehicle.brand}, ${vehicle.model}, ${vehicle.year} has been successfully handed over to the Punchi Car Niwasa showroom for sale. Once a buyer inspects your vehicle, we will contact you to finalize the best offer.\n\nFor any inquiries, please contact: 0112 413 865 | 0117 275 275.\n\nThank you for trusting Punchi Car Niwasa.`;
}

export function buildSellVehicleConfirmationSMSMessage(
  seller: SellerInfo,
  vehicle: VehicleInfo,
  sellingPrice: number
): string {
  const titlePart = seller.title ? `${seller.title} ` : '';
  const greeting = `Dear ${titlePart}${seller.firstName},`;
  const priceFormatted = sellingPrice.toLocaleString('en-LK');

  return `${greeting}\n\nWe are pleased to inform you that your vehicle deal has been confirmed as discussed.\n\nVehicle Details:\n• Vehicle: ${vehicle.brand}, ${vehicle.model}, ${vehicle.year}\n• Chassis/Registration No: ${vehicle.vehicleNumber}\n• Confirmed Offer: Rs. ${priceFormatted}\n\nThank you for choosing Punchi Car Niwasa.\n\nFor any queries, please contact us at:\n0112 413 865 | 0117 275 275`;
}

export async function sendVehicleAcceptanceSMS(
  params: VehicleAcceptanceSMSParams
): Promise<SMSNotificationResult> {
  try {
    const { seller, vehicle } = params;

    if (!seller.firstName || !seller.lastName) {
      const errorMsg = 'Missing seller name information';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Seller first name and last name are required',
        error: errorMsg
      };
    }

    if (!seller.mobileNumber) {
      const errorMsg = 'Mobile number is missing';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Mobile number is required',
        error: errorMsg
      };
    }

    if (!vehicle.vehicleNumber || !vehicle.brand || !vehicle.model) {
      const errorMsg = 'Missing vehicle information';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Vehicle information is incomplete',
        error: errorMsg
      };
    }

    const message = buildVehicleAcceptanceSMSMessage(seller, vehicle);

    console.log('📱 Calling SMS API endpoint...');
    const response = await fetch('/api/vehicles/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'vehicle-acceptance',
        seller,
        vehicle,
        message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ SMS API returned error:', result);
      return {
        success: false,
        message: result.message || 'Failed to send SMS',
        phoneNumber: seller.mobileNumber,
        vehicleNumber: vehicle.vehicleNumber,
        error: result.error || 'Unknown error'
      };
    }

    console.log('✅ SMS sent successfully to:', seller.mobileNumber);
    return {
      success: true,
      message: 'SMS sent successfully',
      phoneNumber: seller.mobileNumber,
      vehicleNumber: vehicle.vehicleNumber,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ SMS sending error:', errorMsg);
    return {
      success: false,
      message: 'An error occurred while sending SMS',
      error: errorMsg
    };
  }
}

export async function sendSellVehicleConfirmationSMS(
  params: SellVehicleConfirmationSMSParams
): Promise<SMSNotificationResult> {
  try {
    const { seller, vehicle, sellingPrice } = params;

    if (!seller.firstName || !seller.lastName) {
      const errorMsg = 'Missing seller name information';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Seller first name and last name are required',
        error: errorMsg
      };
    }

    if (!seller.mobileNumber) {
      const errorMsg = 'Mobile number is missing';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Mobile number is required',
        error: errorMsg
      };
    }

    if (!vehicle.vehicleNumber || !vehicle.brand || !vehicle.model) {
      const errorMsg = 'Missing vehicle information';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Vehicle information is incomplete',
        error: errorMsg
      };
    }

    if (!sellingPrice || sellingPrice <= 0) {
      const errorMsg = 'Invalid selling price';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Selling price must be greater than 0',
        error: errorMsg
      };
    }

    const message = buildSellVehicleConfirmationSMSMessage(seller, vehicle, sellingPrice);

    console.log('📱 Calling SMS API endpoint for sell vehicle confirmation...');
    const response = await fetch('/api/vehicles/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'sell-vehicle-confirmation',
        seller,
        vehicle,
        sellingPrice,
        message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ SMS API returned error:', result);
      return {
        success: false,
        message: result.message || 'Failed to send SMS',
        phoneNumber: seller.mobileNumber,
        vehicleNumber: vehicle.vehicleNumber,
        error: result.error || 'Unknown error'
      };
    }

    console.log('✅ Sell vehicle confirmation SMS sent successfully to:', seller.mobileNumber);
    return {
      success: true,
      message: 'SMS sent successfully',
      phoneNumber: seller.mobileNumber,
      vehicleNumber: vehicle.vehicleNumber,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ SMS sending error:', errorMsg);
    return {
      success: false,
      message: 'An error occurred while sending SMS',
      error: errorMsg
    };
  }
}

export async function sendVehicleAcceptanceSMSWithErrorHandling(
  params: VehicleAcceptanceSMSParams,
  onError?: (error: string) => void
): Promise<SMSNotificationResult> {
  try {
    const result = await sendVehicleAcceptanceSMS(params);

    if (!result.success) {
      const errorMsg = result.error || result.message;
      console.warn('⚠️  SMS notification warning:', errorMsg);
      
      if (onError) {
        onError(errorMsg);
      }
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Error in sendVehicleAcceptanceSMSWithErrorHandling:', error);
    
    if (onError) {
      onError(errorMessage);
    }

    return {
      success: false,
      message: `Error sending SMS: ${errorMessage}`,
      error: errorMessage
    };
  }
}
