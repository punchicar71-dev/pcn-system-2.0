# 🔍 SMS Not Working - Quick Diagnostic Steps

## Step 1: Check Browser Console

1. Open the Sell Vehicle page: `http://localhost:3000/sell-vehicle`
2. Open Browser DevTools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Fill the form and click "Sell Vehicle"
5. Look for these logs:
   ```
   📱 Sending SMS confirmation to seller...
   ✅ SMS sent successfully to: 94XXXXXXXXX
   ```
   OR
   ```
   ⚠️ SMS failed to send: [error message]
   ```

## Step 2: Check Network Tab

1. In DevTools, go to Network tab
2. Fill form and submit
3. Look for request to `/api/vehicles/send-sms`
4. Click on it and check:
   - **Request Payload**: Should have seller, vehicle, sellingPrice, type
   - **Response**: Should show success or error message

## Step 3: Test API Directly

### Open browser console and paste this:

```javascript
fetch('/api/vehicles/send-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'sell-vehicle-confirmation',
    seller: {
      firstName: 'Test',
      lastName: 'User',
      mobileNumber: '0771234567'  // ⚠️ Change to your number
    },
    vehicle: {
      vehicleNumber: 'TEST-123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020
    },
    sellingPrice: 3500000
  })
}).then(r => r.json()).then(console.log)
```

## Step 4: Check Server Logs

Look for these logs in the terminal where dashboard is running:

✅ **Success logs:**
```
📨 SMS API: Received POST request
📨 Message type: sell-vehicle-confirmation
✅ SMS API: Phone number formatted: 94XXXXXXXXX
📝 SMS API: Building sell vehicle confirmation message
✅ SMS API: SMS message built
📱 SMS API: Calling Text.lk API...
✅ SMS sent successfully via Text.lk
```

❌ **Error logs to look for:**
```
❌ SMS API: Invalid request - missing seller or vehicle data
❌ SMS API: Invalid phone format
❌ TEXTLK_API_TOKEN not configured
❌ Text.lk API error
```

## Common Issues & Solutions

### Issue 1: "Mobile number is required"
**Solution**: Check that `customerData.mobileNumber` has a value

### Issue 2: "Selling price must be greater than 0"
**Solution**: Check that `sellingData.sellingAmount` is filled

### Issue 3: "TEXTLK_API_TOKEN not configured"
**Solution**: 
```bash
cd dashboard
grep TEXTLK .env.local
```
Should show:
```
TEXTLK_API_TOKEN=2063|...
TEXTLK_SENDER_ID=Punchi Car
```

### Issue 4: Text.lk API returns error
**Possible causes:**
- Sender ID not approved
- API token expired
- Insufficient credits
- Invalid phone number format

## Quick Test Commands

### Test 1: Check if API route exists
```bash
curl http://localhost:3000/api/vehicles/send-sms
```

### Test 2: Send test SMS
```bash
curl -X POST http://localhost:3000/api/vehicles/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sell-vehicle-confirmation",
    "seller": {"firstName":"Test","lastName":"User","mobileNumber":"0771234567"},
    "vehicle": {"vehicleNumber":"TEST-123","brand":"Toyota","model":"Corolla","year":2020},
    "sellingPrice": 3500000
  }'
```

## What to Report

If SMS still not working, please provide:

1. **Browser Console Output** (screenshot or copy-paste)
2. **Network Tab Response** (for /api/vehicles/send-sms)
3. **Server Terminal Logs** (last 20 lines)
4. **Which page**: Add Vehicle or Sell Vehicle?
5. **Error message** if any

---

**Next Steps After Diagnosing:**
- If validation error → Fix data being sent
- If API error → Check Text.lk account
- If no logs → Dashboard needs restart
- If "404" → API route not deployed
