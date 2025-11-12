# 🚀 VEHICLE SMS FIX - QUICK START GUIDE

## What Was Fixed?

✅ **Sell Vehicle SMS** - Now sends correct message with selling price  
✅ **Vehicle Accepting SMS** - Properly configured with message type

---

## 🧪 How to Test

### Test 1: Sell Vehicle Confirmation SMS
1. Go to **Sell Vehicle** page
2. Fill in **Customer Details**:
   - Title: Mr./Mrs./Ms.
   - First Name: John
   - Last Name: Doe
   - Mobile: 0771234567
   - Other fields as needed

3. Fill in **Selling Info**:
   - Select a vehicle
   - Enter Selling Amount: 1500000
   - Other fields as needed

4. Click **"Sell Vehicle"** button
5. Check if SMS arrives with:
   ```
   Dear Mr. John,

   We are pleased to inform you that your vehicle deal has been confirmed as discussed.

   Vehicle Details:
   • Vehicle: Toyota, Corolla, 2020
   • Chassis/Registration No: ABC-1234
   • Confirmed Offer: Rs. 1,500,000

   Thank you for choosing Punchi Car Niwasa.

   For any queries, please contact us at:
   0112 413 865 | 0117 275 275
   ```

### Test 2: Vehicle Accepting SMS
1. Go to **Add Vehicle** page (if exists)
2. Fill in vehicle details
3. Click **"Publish Vehicle"**
4. Check if SMS arrives with:
   ```
   Dear Mr. (Seller Name),

   Your vehicle ABC-1234: Toyota, Corolla, 2020 has been successfully 
   handed over to the Punchi Car Niwasa showroom for sale. Once a buyer 
   inspects your vehicle, we will contact you to finalize the best offer.

   For any inquiries, please contact: 0112 413 865 | 0117 275 275.

   Thank you for trusting Punchi Car Niwasa.
   ```

---

## 📊 What Was Changed

| File | Change | What |
|------|--------|------|
| `vehicle-sms-service.ts` | Added | `sendSellVehicleConfirmationSMS()` function |
| `vehicle-sms-service.ts` | Added | `buildSellVehicleConfirmationSMSMessage()` function |
| `send-sms/route.ts` | Added | Handler for `sell-vehicle-confirmation` type |
| `send-sms/route.ts` | Added | `buildSellVehicleConfirmationSMSMessage()` function |
| `sell-vehicle/page.tsx` | Changed | Import + SMS call for confirmation |

---

## 🔍 How to Verify in Browser Console

1. Open **Developer Tools** (F12)
2. Go to **Console** tab
3. Submit the Sell Vehicle form
4. Look for these logs:
   ```
   📱 Calling SMS API endpoint for sell vehicle confirmation...
   📨 SMS API: Received POST request
   📨 Message type: sell-vehicle-confirmation
   📱 SMS API: Calling Text.lk API...
   ✅ SMS API: SMS sent successfully
   ✅ SMS sent successfully to: (phone number)
   ```

---

## ⚡ Quick Troubleshooting

### SMS Not Sending
- Check browser console for errors
- Check `.env.local` has `TEXTLK_API_TOKEN` set
- Verify phone number is in format: 0771234567 or 94771234567
- Check Text.lk account is active and has balance

### Wrong SMS Template
- For Sell Vehicle: Should show "deal has been confirmed"
- For Vehicle Accepting: Should show "handed over to showroom"

### Price Not Showing in SMS
- Verify selling amount is entered in form
- Check console log shows correct price
- Price should be formatted with commas (e.g., 1,500,000)

---

## 📞 Support

If SMS is not working:
1. Check error logs in browser console
2. Verify environment variables in `.env.local`
3. Check Text.lk account status
4. Verify phone number format
5. Check network connection
