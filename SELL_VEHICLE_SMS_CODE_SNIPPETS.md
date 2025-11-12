# 📝 SELL VEHICLE SMS - READY-TO-USE CODE SNIPPETS

Copy and paste these code snippets directly into the appropriate files.

---

## 1️⃣ ADD TO: `dashboard/src/lib/vehicle-sms-service.ts`

Add these two functions at the end of the file (before or after existing functions):

```typescript
/**
 * Build SMS message for vehicle selling confirmation
 * Sent to seller when vehicle is successfully listed for sale
 * 
 * Template:
 * Dear (Seller Title, Seller First name),
 * We are pleased to inform you that your vehicle deal has been confirmed as discussed.
 * Vehicle Details:
 * • Vehicle: (Vehicle Brand, Model, Year)
 * • Chassis/Registration No: (Vehicle Number)
 * • Confirmed Offer: (Selling Price)
 * Thank you for choosing Punchi Car Niwasa.
 * For any queries, please contact us at: 0112 413 865 | 0117 275 275
 */
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

/**
 * Send vehicle selling confirmation SMS to seller
 * 
 * Calls API route to send SMS (server-side request to access environment variables)
 * Triggered after successful vehicle sale creation
 * 
 * @param params - Contains seller, vehicle, and selling price information
 * @returns Result object with success status and message
 * 
 * @example
 * const result = await sendSellVehicleConfirmationSMS({
 *   seller: {
 *     title: 'Mr.',
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     mobileNumber: '0771234567'
 *   },
 *   vehicle: {
 *     vehicleNumber: 'WP-ABC-1234',
 *     brand: 'Toyota',
 *     model: 'Corolla',
 *     year: 2022
 *   },
 *   sellingPrice: 2500000
 * });
 */
export interface SellVehicleConfirmationSMSParams {
  seller: SellerInfo;
  vehicle: VehicleInfo;
  sellingPrice: number;
}

export async function sendSellVehicleConfirmationSMS(
  params: SellVehicleConfirmationSMSParams
): Promise<SMSNotificationResult> {
  try {
    const { seller, vehicle, sellingPrice } = params;

    // Validate seller information
    if (!seller.firstName || !seller.lastName) {
      const errorMsg = 'Missing seller name information';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Seller first name and last name are required',
        error: errorMsg
      };
    }

    // Validate mobile number
    if (!seller.mobileNumber) {
      const errorMsg = 'Seller mobile number is missing';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Seller mobile number is required',
        error: errorMsg
      };
    }

    // Validate vehicle information
    if (!vehicle.vehicleNumber || !vehicle.brand || !vehicle.model) {
      const errorMsg = 'Missing vehicle information';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Vehicle details are incomplete',
        error: errorMsg
      };
    }

    // Validate selling price
    if (!sellingPrice || sellingPrice <= 0) {
      const errorMsg = 'Invalid selling price';
      console.error('❌ SMS validation error:', errorMsg);
      return {
        success: false,
        message: 'Selling price must be greater than 0',
        error: errorMsg
      };
    }

    // Build SMS message
    const message = buildSellVehicleConfirmationSMSMessage(seller, vehicle, sellingPrice);

    // Call API endpoint to send SMS
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
      console.error('❌ SMS API Error:', result.error || 'Unknown error');
      return {
        success: false,
        message: result.message || 'Failed to send SMS',
        phoneNumber: seller.mobileNumber,
        vehicleNumber: vehicle.vehicleNumber,
        error: result.error
      };
    }

    console.log('✅ SMS sent successfully:', {
      phoneNumber: seller.mobileNumber,
      vehicleNumber: vehicle.vehicleNumber,
    });

    return {
      success: true,
      message: result.message || 'SMS sent successfully',
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
```

---

## 2️⃣ UPDATE: `dashboard/src/app/api/vehicles/send-sms/route.ts`

Find the POST handler and add this code block in the main message type switch/if-else:

```typescript
// Handle sell-vehicle-confirmation SMS
if (messageType === 'sell-vehicle-confirmation') {
  const { seller, vehicle, sellingPrice, message } = body;

  if (!message) {
    console.error('❌ SMS API: Missing message for sell-vehicle-confirmation');
    return NextResponse.json(
      {
        success: false,
        message: 'Missing SMS message content',
      },
      { status: 400 }
    );
  }

  try {
    const smsResponse = await sendTextlkSMS({
      to: seller.mobileNumber,
      message: message,
    });

    if (smsResponse.success) {
      console.log('✅ Sell vehicle confirmation SMS sent:', {
        to: seller.mobileNumber,
        vehicle: vehicle.vehicleNumber,
        price: sellingPrice,
      });

      return NextResponse.json({
        success: true,
        message: 'Sell vehicle confirmation SMS sent successfully',
        response: smsResponse,
      });
    } else {
      console.error('❌ Text.lk API Error for sell-vehicle-confirmation:', smsResponse.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send SMS via Text.lk',
          error: smsResponse.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ SMS sending error:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        message: 'Error sending SMS',
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
```

---

## 3️⃣ UPDATE: `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx`

### Step A: Add import at the top of the file
```typescript
import { sendSellVehicleConfirmationSMS } from '@/lib/vehicle-sms-service';
```

### Step B: Find the `handleSubmitSale` function and add this code after the notification creation (after the try-catch for notifications)

```typescript
// Send SMS confirmation to seller
try {
  console.log('📱 Sending SMS confirmation to seller...');
  
  const smsParams = {
    seller: {
      title: customerData.title,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      mobileNumber: customerData.mobileNumber,
    },
    vehicle: {
      vehicleNumber: sellingData.selectedVehicle.vehicle_number,
      brand: sellingData.selectedVehicle.brand_name,
      model: sellingData.selectedVehicle.model_name,
      year: sellingData.selectedVehicle.manufacture_year,
    },
    sellingPrice: parseFloat(sellingData.sellingAmount),
  };

  const smsResult = await sendSellVehicleConfirmationSMS(smsParams);

  if (smsResult.success) {
    console.log('✅ Sell vehicle confirmation SMS sent to:', smsResult.phoneNumber);
  } else {
    console.warn('⚠️ SMS failed to send:', smsResult.error);
    // Don't block the sale confirmation - SMS failure is not critical
  }
} catch (smsError) {
  console.error('⚠️ SMS error occurred:', smsError);
  // Don't block the sale confirmation - continue with the flow
}

// Success - move to confirmation step
setCompletedSteps([1, 2]);
setCurrentStep(3);
```

---

## 4️⃣ OPTIONAL - UPDATE: `dashboard/src/components/sell-vehicle/Confirmation.tsx`

Add this interface prop and display SMS status message:

### Step A: Update interface at top
```typescript
interface ConfirmationProps {
  vehicleData: {
    brand: string;
    model: string;
    year: number;
    vehicleNumber: string;
  };
  saleId: string;
  smsSentStatus?: {
    sent: boolean;
    phoneNumber?: string;
    error?: string;
  } | null;
}
```

### Step B: Update component signature
```typescript
export default function Confirmation({ 
  vehicleData, 
  saleId,
  smsSentStatus
}: ConfirmationProps) {
```

### Step C: Add SMS status display after vehicle details section
```tsx
{/* SMS Status Notification */}
{smsSentStatus && (
  <div className={`p-4 rounded-lg mb-4 border ${
    smsSentStatus.sent 
      ? 'bg-green-50 border-green-300' 
      : 'bg-yellow-50 border-yellow-300'
  }`}>
    {smsSentStatus.sent ? (
      <>
        <p className="text-green-800 font-medium text-sm">
          ✅ Confirmation SMS sent successfully
        </p>
        <p className="text-green-700 text-xs mt-1">
          to {smsSentStatus.phoneNumber}
        </p>
      </>
    ) : (
      <>
        <p className="text-yellow-800 font-medium text-sm">
          ⚠️ SMS notification could not be sent
        </p>
        <p className="text-yellow-700 text-xs mt-1">
          {smsSentStatus.error || 'Please contact support if needed'}
        </p>
      </>
    )}
  </div>
)}
```

### Step D: In the sell-vehicle/page.tsx, update the Confirmation component call:
```typescript
{currentStep === 3 && sellingData.selectedVehicle && (
  <Confirmation
    vehicleData={{
      brand: sellingData.selectedVehicle.brand_name,
      model: sellingData.selectedVehicle.model_name,
      year: sellingData.selectedVehicle.manufacture_year,
      vehicleNumber: sellingData.selectedVehicle.vehicle_number,
    }}
    saleId={createdSaleId}
    smsSentStatus={smsSentStatus}
  />
)}
```

---

## ✅ VERIFICATION STEPS

After implementing, verify:

1. ✅ File `dashboard/src/lib/vehicle-sms-service.ts` has both new functions
2. ✅ File `dashboard/src/app/api/vehicles/send-sms/route.ts` handles 'sell-vehicle-confirmation'
3. ✅ File `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx` calls SMS function
4. ✅ SMS is sent after clicking "Sell Vehicle" button
5. ✅ Seller receives SMS with correct information
6. ✅ Sale creation is NOT blocked if SMS fails
7. ✅ Console shows success/error logs for SMS

---

## 🧪 TEST SMS BEFORE IMPLEMENTATION

Run test in terminal to ensure SMS service is working:

```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"
node test-sms-service.js
```

Update the test file with your phone number first, then check if you receive the test SMS.

---

**Ready to implement! Copy these snippets and paste into the files mentioned above.**
