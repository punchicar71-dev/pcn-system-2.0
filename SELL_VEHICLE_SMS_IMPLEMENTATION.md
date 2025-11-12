# 🚀 SELL VEHICLE SMS NOTIFICATION IMPLEMENTATION

## 📋 REQUIREMENT SUMMARY

**Feature**: Auto-send SMS confirmation to vehicle seller when "Sell Vehicle" form is submitted successfully

**Trigger**: After successful vehicle sale entry (when seller hits "Sell Vehicle" button and data is saved to `pending_vehicle_sales` table)

**Recipient**: Seller's mobile number

---

## 📝 SMS MESSAGE TEMPLATE

```
Dear {Seller Title} {Seller First Name},

We are pleased to inform you that your vehicle deal has been confirmed as discussed.

Vehicle Details:
• Vehicle: {Vehicle Brand}, {Vehicle Model}, {Vehicle Year}
• Chassis/Registration No: {Vehicle Number}
• Confirmed Offer: Rs. {Selling Price}

Thank you for choosing Punchi Car Niwasa.

For any queries, please contact us at:
0112 413 865 | 0117 275 275
```

### Variables to Extract:
- `Seller Title`: From `customerData.title` (e.g., "Mr.", "Mrs.", "Miss.", "Dr.")
- `Seller First Name`: From `customerData.firstName`
- `Vehicle Brand`: From `sellingData.selectedVehicle.brand_name`
- `Vehicle Model`: From `sellingData.selectedVehicle.model_name`
- `Vehicle Year`: From `sellingData.selectedVehicle.manufacture_year`
- `Vehicle Number`: From `sellingData.selectedVehicle.vehicle_number`
- `Selling Price`: From `sellingData.sellingAmount`
- `Seller Mobile`: From `customerData.mobileNumber`

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Create SMS Message Builder Function

**File**: `dashboard/src/lib/vehicle-sms-service.ts`

**New Function**: `buildSellVehicleConfirmationSMSMessage()`

**Purpose**: Format the SMS template with seller and vehicle data

```typescript
/**
 * Build SMS message for vehicle selling confirmation
 * Sent to seller when vehicle is successfully listed for sale
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
```

---

### Step 2: Create SMS Sending Function

**File**: `dashboard/src/lib/vehicle-sms-service.ts`

**New Function**: `sendSellVehicleConfirmationSMS()`

**Purpose**: Call the API endpoint to send SMS via Text.lk

```typescript
export interface SellVehicleConfirmationSMSParams {
  seller: SellerInfo;
  vehicle: VehicleInfo;
  sellingPrice: number;
}

/**
 * Send vehicle selling confirmation SMS to seller
 * 
 * Calls API route to send SMS (server-side request to access environment variables)
 * 
 * @param params - Contains seller, vehicle, and selling price information
 * @returns Result object with success status and message
 */
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

### Step 3: Update SMS API Route

**File**: `dashboard/src/app/api/vehicles/send-sms/route.ts`

**Changes**: Add handler for `sell-vehicle-confirmation` type

**Location**: In the main POST handler, add this new case:

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

### Step 4: Update Sell Vehicle Page Component

**File**: `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx`

**Location**: In the `handleSubmitSale()` function, after successful sale creation

**Add SMS sending code**:

```typescript
// After successful sale creation and vehicle status update
// Add SMS notification
try {
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
    console.log('✅ SMS sent to seller:', smsResult.phoneNumber);
    // Optional: Show success toast notification
  } else {
    console.warn('⚠️ SMS failed to send:', smsResult.error);
    // Optional: Show warning toast but don't block the sale process
  }
} catch (smsError) {
  console.error('⚠️ SMS error:', smsError);
  // Don't block the sale confirmation even if SMS fails
}
```

**Import statement** to add at the top:

```typescript
import { sendSellVehicleConfirmationSMS } from '@/lib/vehicle-sms-service';
```

---

### Step 5: Add Optional Toast Notification UI

**Enhancement**: Show user feedback when SMS is sent

**File**: `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx`

**Update Confirmation display** to show SMS status (optional):

```typescript
// In the state management
const [smsSentStatus, setSmsSentStatus] = useState<{
  sent: boolean;
  phoneNumber?: string;
  error?: string;
} | null>(null);

// In handleSubmitSale, update to set state
const smsResult = await sendSellVehicleConfirmationSMS(smsParams);

if (smsResult.success) {
  setSmsSentStatus({
    sent: true,
    phoneNumber: smsResult.phoneNumber,
  });
} else {
  setSmsSentStatus({
    sent: false,
    error: smsResult.error,
  });
}
```

**Pass to Confirmation component**:

```typescript
{currentStep === 3 && sellingData.selectedVehicle && (
  <Confirmation
    vehicleData={{...}}
    saleId={createdSaleId}
    smsSentStatus={smsSentStatus}
  />
)}
```

**Update Confirmation component** to display status:

```typescript
interface ConfirmationProps {
  vehicleData: {...};
  saleId: string;
  smsSentStatus?: {
    sent: boolean;
    phoneNumber?: string;
    error?: string;
  } | null;
}

export default function Confirmation({ vehicleData, saleId, smsSentStatus }: ConfirmationProps) {
  return (
    // ... existing JSX ...
    {smsSentStatus && (
      <div className={`p-4 rounded-lg mb-4 ${smsSentStatus.sent ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
        {smsSentStatus.sent ? (
          <>
            <p className="text-green-800 font-medium">✅ Confirmation SMS sent</p>
            <p className="text-green-700 text-sm">to {smsSentStatus.phoneNumber}</p>
          </>
        ) : (
          <>
            <p className="text-yellow-800 font-medium">⚠️ SMS notification failed</p>
            <p className="text-yellow-700 text-sm">{smsSentStatus.error}</p>
          </>
        )}
      </div>
    )}
  );
}
```

---

## ✅ TESTING CHECKLIST

### Pre-Implementation
- [ ] SMS service credentials (TEXTLK_USER_ID, TEXTLK_API_KEY) are configured in `.env.local`
- [ ] Text.lk API is accessible and working
- [ ] Test phone number for SMS is valid

### Post-Implementation
- [ ] SMS function `buildSellVehicleConfirmationSMSMessage()` formats message correctly
- [ ] SMS sending function `sendSellVehicleConfirmationSMS()` validates all required fields
- [ ] API route handles `sell-vehicle-confirmation` message type
- [ ] Seller receives SMS immediately after submitting sell vehicle form
- [ ] SMS contains all required information (seller name, vehicle details, price)
- [ ] SMS is sent even if seller mobile number is in different formats
- [ ] Error handling works gracefully (SMS failure doesn't block sale creation)
- [ ] Toast notifications display SMS status correctly

### Manual Testing Steps
1. Navigate to Sell Vehicle page
2. Fill in seller details with a test mobile number
3. Select vehicle and enter selling price
4. Click "Sell Vehicle" button
5. Verify:
   - Sale record is created successfully
   - SMS is sent to the provided mobile number
   - Confirmation page shows SMS status
   - Seller receives SMS with correct information

---

## 🔄 FLOW DIAGRAM

```
User fills Sell Vehicle Form
        ↓
    Click "Sell Vehicle" Button
        ↓
    handleSubmitSale() triggered
        ↓
    Save to pending_vehicle_sales table
        ↓
    Update vehicle status to "Pending Sale"
        ↓
    Create notification
        ↓
    🚀 SEND SMS TO SELLER ← NEW FEATURE
        ↓
    Success? Show Confirmation Page
        ↓
    Display SMS Status to User (optional)
```

---

## 📱 ERROR HANDLING

| Error | Cause | Resolution |
|-------|-------|-----------|
| Missing seller name | `firstName` or `lastName` empty | Validate in form before submit |
| Invalid mobile number | Number format issue | Use existing phone format validator |
| Missing vehicle info | Vehicle data incomplete | Validate vehicle selection |
| Text.lk API error | API rate limit or credentials | Check API status and credentials |
| Network error | Connection timeout | Retry logic implemented in API route |

---

## 🔗 RELATED FILES

- `dashboard/src/lib/vehicle-sms-service.ts` - SMS service functions
- `dashboard/src/app/api/vehicles/send-sms/route.ts` - SMS API endpoint
- `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx` - Main sell vehicle component
- `dashboard/src/components/sell-vehicle/Confirmation.tsx` - Confirmation UI
- `SMS_INTEGRATION_GUIDE.md` - General SMS integration documentation

---

## 🎯 SUCCESS CRITERIA

✅ SMS is automatically sent when "Sell Vehicle" button is clicked and sale is confirmed  
✅ SMS contains all required seller and vehicle information  
✅ SMS format matches the provided template  
✅ Message is received within 1-2 seconds  
✅ Sale creation is not blocked if SMS fails  
✅ Seller receives exactly one SMS per vehicle listing  
✅ SMS includes company contact details  

---

## 📞 CONTACT NUMBERS IN SMS

- **Primary**: 0112 413 865
- **Secondary**: 0117 275 275

---

**Status**: 📋 Ready for Implementation  
**Priority**: 🔴 HIGH - Seller Notification Feature  
**Estimated Time**: 30-45 minutes  
**Complexity**: MEDIUM

---

## 💡 NOTES

- SMS sending is non-blocking: sale creation succeeds even if SMS fails
- All SMS messages use Text.lk gateway via existing SMS service
- Phone number format validation uses existing `formatPhoneNumber()` function
- Error logs will help debug any SMS delivery issues
- Consider adding SMS retry logic for production robustness
