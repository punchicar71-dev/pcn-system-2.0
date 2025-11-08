# 🚨 URGENT: Text.lk Account Setup Required

## Current Status

✅ **API Working**: Connection to Text.lk is successful  
❌ **Credits Expired**: Balance expired on Nov 5, 2025  
❌ **No Sender ID**: No approved Sender ID found in your account  

**Account Details:**
- Email: punchicar71@gmail.com
- Balance: Rs 8 (EXPIRED)
- Last Access: Nov 5, 2025

---

## ⚡ IMMEDIATE ACTIONS (Do This NOW)

### Action 1: Recharge Your Text.lk Account (5 minutes)

1. **Login**: https://app.text.lk
   - Email: punchicar71@gmail.com
   - Password: [Your password]

2. **Add Credits**:
   - Click "Recharge" or "Add Credits"
   - Recommended: Rs 500-1000 for testing
   - Each SMS costs approximately Rs 1-2

3. **Verify Balance**:
   ```bash
   curl -X GET 'https://app.text.lk/api/http/balance' \
   -H 'Content-Type: application/json' \
   -H 'Accept: application/json' \
   -d '{"api_token":"2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169"}' | jq .
   ```

### Action 2: Request Sender ID Approval (10 minutes)

1. **Still on app.text.lk**, look for:
   - "Sender IDs" menu
   - "Manage Sender Names"
   - "Settings" → "Sender IDs"

2. **Request These Sender IDs** (request multiple to increase chances):
   - `PunchiCar` (matches your account name)
   - `PCN-System`
   - `PCNLK`

3. **Fill Request Form**:
   - Purpose: "Phone verification and OTP for vehicle management system"
   - Type: Alphanumeric
   - Expected Volume: "50-100 messages per day"

4. **Submit and Wait**:
   - Approval Time: 1-3 business days
   - You'll receive email notification

### Action 3: Test Approved Sender ID (2 minutes)

Once you receive approval email:

```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"

# Run the test script
./test-textlk-sender-id.sh

# When prompted, enter your approved Sender ID (e.g., PunchiCar)
```

If test succeeds ✅, proceed to Action 4.

### Action 4: Configure System (5 minutes)

```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"

# Set the approved Sender ID in Supabase
supabase secrets set TEXTLK_SENDER_ID="YourApprovedSenderID"

# Redeploy the Edge Function
supabase functions deploy send-sms-otp

# Update local environment
echo 'TEXTLK_SENDER_ID=YourApprovedSenderID' >> .env.local

# Restart dev server
npm run dev
```

### Action 5: Verify in Application (2 minutes)

1. Open http://localhost:3001
2. Go to User Management
3. Click on user "Asanka Herath" (94710898944)
4. Click "Send OTP"
5. Check phone for SMS! 📱

---

## 🎯 Alternative: Expedite Request

If you need immediate testing:

### Contact Text.lk Support

**Option 1: Live Chat**
- Login to app.text.lk
- Look for chat bubble in bottom-right corner
- Message: "Hi, I need an approved Sender ID urgently for OTP functionality. Can you help expedite approval for 'PunchiCar' or provide a test Sender ID?"

**Option 2: Email Support**
- Check app.text.lk for support email
- Subject: "Urgent: Sender ID Approval Request"
- Body: "I'm integrating Text.lk for OTP verification. Can you approve 'PunchiCar' as my Sender ID or provide a test Sender ID? My API token: 2063|IdM..."

**Option 3: Phone Support**
- Check app.text.lk website for phone number
- Call and explain you need Sender ID for testing

---

## 📊 Why This is Blocking You

```
Your Application Flow:
┌─────────────────────┐
│ User clicks         │
│ "Send OTP"          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Generate OTP        │ ✅ Working
│ Store in DB         │ ✅ Working
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Call Text.lk API    │ ✅ Working
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Check Sender ID     │ ❌ NOT APPROVED ← YOU ARE HERE
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Send SMS            │ ⏳ Waiting
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User receives OTP   │ ⏳ Waiting
└─────────────────────┘
```

**Everything works except** the Sender ID authorization!

---

## 💡 Quick Test: Try Common Sender IDs

While waiting for approval, you can try some potentially pre-approved IDs:

```bash
# Try these common Sender IDs (one at a time)
./test-textlk-sender-id.sh
# Try: SMS-LK
# Try: INFO
# Try: NOTIFY
# Try: TEXT-LK
```

⚠️ **Note**: Most likely none will work, but worth a quick try.

---

## 📱 Expected SMS Format

Once working, users will receive:

```
From: PunchiCar (or your approved ID)

Your PCN System phone verification code is: 123456. Valid for 15 minutes.
```

---

## ✅ Success Checklist

- [ ] Text.lk account recharged (balance > Rs 100)
- [ ] Sender ID requested in Text.lk dashboard
- [ ] Received approval email from Text.lk
- [ ] Tested sender ID with ./test-textlk-sender-id.sh
- [ ] Test passed - SMS received on phone
- [ ] Configured Supabase secret: TEXTLK_SENDER_ID
- [ ] Redeployed Edge Function
- [ ] Updated .env.local
- [ ] Tested in application
- [ ] User receives OTP SMS successfully

---

## 🆘 If Still Having Issues

After completing all steps, if it still doesn't work:

1. **Check Supabase Logs**:
   ```bash
   # Check recent function invocations
   supabase functions list
   ```

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for errors when clicking "Send OTP"

3. **Manual Test**:
   ```bash
   curl -X POST 'https://wnorajpknqegnnmeotjf.supabase.co/functions/v1/send-sms-otp' \
   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indub3JhanBrbnFlZ25ubWVvdGpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3MjgwOSwiZXhwIjoyMDc2OTQ4ODA5fQ.yvBzcHfL1zTTj37vaF6oU2cPa3mFO6wL0CKn4-94Aho' \
   --header 'Content-Type: application/json' \
   --data '{"mobileNumber":"94710898944","purpose":"verification"}'
   ```

4. **Review Documentation**:
   - OTP_SENDER_ID_FIX.md
   - TEXTLK_SENDER_ID_SETUP.md

---

## 📞 Support Contacts

**Text.lk Support**:
- Website: https://www.text.lk
- Dashboard: https://app.text.lk
- Account: punchicar71@gmail.com

**Your Project**:
- Dashboard: http://localhost:3001
- User Management: http://localhost:3001/user-management
- Test User: Asanka Herath (94710898944)

---

**Status**: ⏳ Waiting for Sender ID Approval  
**Created**: November 8, 2025  
**Priority**: 🔴 HIGH - Blocking OTP functionality  
**Next Step**: Login to app.text.lk and request Sender ID NOW!
