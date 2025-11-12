# 🚀 QUICK PROMPT FOR GIT COPILOT

## TASK
Implement SMS notification feature for "Sell Vehicle" functionality. When a seller successfully submits the sell vehicle form and the sale is recorded, automatically send a confirmation SMS to their mobile number.

## SMS TEMPLATE
```
Dear {Title} {FirstName},

We are pleased to inform you that your vehicle deal has been confirmed as discussed.

Vehicle Details:
• Vehicle: {Brand}, {Model}, {Year}
• Chassis/Registration No: {VehicleNumber}
• Confirmed Offer: Rs. {SellingPrice}

Thank you for choosing Punchi Car Niwasa.

For any queries, please contact us at:
0112 413 865 | 0117 275 275
```

## REQUIRED CHANGES

### 1. Add new SMS building function to `dashboard/src/lib/vehicle-sms-service.ts`
- Function name: `buildSellVehicleConfirmationSMSMessage(seller, vehicle, sellingPrice)`
- Format the SMS template with seller and vehicle data
- Return formatted message string

### 2. Add new SMS sending function to `dashboard/src/lib/vehicle-sms-service.ts`
- Function name: `sendSellVehicleConfirmationSMS(params)`
- Input: seller info (title, firstName, lastName, mobileNumber), vehicle info (vehicleNumber, brand, model, year), sellingPrice
- Call `/api/vehicles/send-sms` endpoint with type: 'sell-vehicle-confirmation'
- Return SMSNotificationResult object with success status
- Include proper validation and error handling

### 3. Update API route `dashboard/src/app/api/vehicles/send-sms/route.ts`
- Add handler for message type: 'sell-vehicle-confirmation'
- Extract seller, vehicle, sellingPrice, and message from request
- Send SMS via Text.lk using existing sendTextlkSMS function
- Return success/error response

### 4. Update main page `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx`
- In `handleSubmitSale()` function, after successful sale creation:
  - Call `sendSellVehicleConfirmationSMS()` with seller, vehicle, and price data
  - Don't block sale creation if SMS fails
  - Log success/error for debugging
  - Optionally track SMS status for UI feedback

### 5. Optional: Update Confirmation component
- Pass SMS status to Confirmation component
- Display SMS sent confirmation message to user
- Show phone number where SMS was sent

## DATA SOURCES IN FORM
- Seller Title: `customerData.title`
- Seller First Name: `customerData.firstName`
- Seller Last Name: `customerData.lastName`
- Seller Mobile: `customerData.mobileNumber`
- Vehicle Number: `sellingData.selectedVehicle.vehicle_number`
- Vehicle Brand: `sellingData.selectedVehicle.brand_name`
- Vehicle Model: `sellingData.selectedVehicle.model_name`
- Vehicle Year: `sellingData.selectedVehicle.manufacture_year`
- Selling Price: `sellingData.sellingAmount`

## KEY REQUIREMENTS
✅ SMS must be sent AFTER successful sale creation (non-blocking)
✅ Use existing Text.lk SMS service infrastructure
✅ Include validation for all required fields
✅ Format price with thousands separator
✅ Handle errors gracefully without blocking sale
✅ Log all SMS activities for debugging
✅ Match provided SMS template exactly
✅ Support all seller title variations (Mr., Mrs., Miss., Dr., etc.)

## EXISTING SMS SERVICE PATTERNS TO FOLLOW
- Reference: `sendVehicleAcceptanceSMS()` function in vehicle-sms-service.ts
- Reference: Existing vehicle SMS API handler in send-sms/route.ts
- Use same validation patterns and error handling
- Use same Text.lk API structure

## FILES TO MODIFY
1. `dashboard/src/lib/vehicle-sms-service.ts` - Add 2 new functions
2. `dashboard/src/app/api/vehicles/send-sms/route.ts` - Add new message type handler
3. `dashboard/src/app/(dashboard)/sell-vehicle/page.tsx` - Add SMS sending call
4. `dashboard/src/components/sell-vehicle/Confirmation.tsx` - Optional UI update

---

**This is the complete brief needed to implement this feature via GitHub Copilot.**
