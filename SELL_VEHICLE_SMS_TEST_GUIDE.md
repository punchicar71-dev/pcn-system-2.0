# 🧪 QUICK TEST GUIDE - SELL VEHICLE SMS

## ⚡ 1-MINUTE TEST

### Prerequisites
- ✅ Next.js running on `http://localhost:3001`
- ✅ Your mobile phone ready
- ✅ `.env.local` has Text.lk credentials

### Test Steps

1. **Open Sell Vehicle Page**
   ```
   http://localhost:3001/sell-vehicle
   ```

2. **Fill Step 1: Customer Details**
   - Title: `Mr.`
   - First Name: `Test`
   - Last Name: `User`
   - Mobile Number: **YOUR ACTUAL PHONE NUMBER** (e.g., `0771234567`)
   - Fill other optional fields
   - Click "Next"

3. **Fill Step 2: Selling Details**
   - Search and select any vehicle
   - Enter Selling Amount: `2500000`
   - Payment Type: Select any
   - Click "Sell Vehicle"

4. **Wait for SMS**
   - You should receive SMS within 1-2 seconds
   - Check your phone

5. **Check Success**
   - You should see Confirmation page
   - Open browser DevTools (F12) → Console
   - Look for: `✅ SMS sent successfully to: [your-number]`

---

## 📱 EXPECTED SMS FORMAT

```
Dear Mr. Test,

Your vehicle WP-ABC-1234: Toyota Corolla 2022 has been successfully 
handed over to the Punchi Car Niwasa showroom for sale. 

Once a buyer inspects your vehicle, we will contact you to finalize the best offer.

For any inquiries, please contact: 0112 413 865 | 0117 275 275.

Thank you for trusting Punchi Car Niwasa.
```

---

## 🔍 DEBUGGING

### If SMS doesn't arrive:

**Step 1: Check Console Logs**
```
DevTools → Console Tab
Look for:
📱 Sending SMS confirmation to seller...
✅ SMS sent successfully to: [number]
```

**Step 2: If no log, check browser**
- Refresh page
- Check for errors
- Make sure JavaScript is enabled

**Step 3: Check Network Tab**
```
DevTools → Network Tab
- Look for POST request to /api/vehicles/send-sms
- Click it
- Check Response: should be { success: true, ... }
```

**Step 4: Verify Phone Number**
- Must start with `07X` (Mobile)
- Examples that work: `0771234567`, `0721234567`
- Examples that DON'T work: `0112413865` (Landline), `123456`

**Step 5: Test API Directly**
```bash
curl -X POST http://localhost:3001/api/vehicles/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "seller": {
      "title": "Mr.",
      "firstName": "John",
      "lastName": "Doe",
      "mobileNumber": "0771234567"
    },
    "vehicle": {
      "vehicleNumber": "WP-ABC-1234",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2022
    }
  }'
```

If this works and returns `{ "success": true, ... }`, the API is fine.

---

## ✅ WHAT SHOULD HAPPEN

### Sequence
1. Fill form → Click "Sell Vehicle"
2. See loading/processing
3. Receive SMS on phone
4. See Confirmation page
5. Check console: SMS sent message

### Console Output
```
📱 Sending SMS confirmation to seller...
✅ SMS sent successfully to: 94771234567
```

### SMS Should Contain
- ✅ Your name with correct title
- ✅ Vehicle details
- ✅ Vehicle number
- ✅ Company contact info

---

## ⚠️ COMMON ISSUES

| Issue | Solution |
|-------|----------|
| No SMS received | Check phone number format (07X) |
| SMS received but wrong name | Check if first/last name filled correctly |
| Page shows error | Check console for error message |
| API returns 400 | Phone number format invalid |
| API returns 500 | Check TEXTLK_API_TOKEN in .env.local |
| SMS sent but wrong message | Check vehicle details in form |

---

## 🟢 SUCCESS CRITERIA

After fix, you should see:

1. ✅ Sale created in database
2. ✅ Vehicle status changed to "Pending Sale"
3. ✅ Notification created for staff
4. ✅ **SMS sent to seller** ← THIS IS THE FIX
5. ✅ Confirmation page shown
6. ✅ Console shows success message

---

## 🚀 PRODUCTION TEST

Before deploying to production:

```bash
# 1. Test on staging environment
# 2. Send SMS with different phone formats:
#    - 0771234567 (local)
#    - 94771234567 (international)
#    - +94771234567 (with +)

# 3. Verify SMS arrives within 2 seconds
# 4. Check Text.lk dashboard for delivery status
# 5. Test with multiple sellers
# 6. Monitor error logs
```

---

## 📞 SUPPORT

If issues persist:

1. **Check `.env.local`**
   ```bash
   cat .env.local | grep TEXTLK
   ```
   Should output Text.lk credentials

2. **Restart Next.js**
   ```bash
   # Kill current process
   # Run: npm run dev
   ```

3. **Check Text.lk Status**
   - Visit https://app.text.lk/dashboard
   - Check account balance
   - Check API logs

4. **Enable Debug Logging**
   - Check browser DevTools
   - Check server logs for errors

---

## 📊 TEST REPORT TEMPLATE

```
Test Date: _______________
Tested By: ________________
Phone Used: _______________

Results:
- Sale created: ☐ YES ☐ NO
- Vehicle status updated: ☐ YES ☐ NO
- SMS received: ☐ YES ☐ NO
- SMS content correct: ☐ YES ☐ NO
- Arrival time: _______ seconds
- Issues found: _______________________

Status: ☐ PASS ☐ FAIL
```

---

**Ready to test? Go to http://localhost:3001/sell-vehicle and fill the form!**
