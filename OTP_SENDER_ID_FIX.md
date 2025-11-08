# 🔧 OTP "Failed to generate OTP" Error - SOLUTION

## 🔴 Root Cause Identified

**Error Message**: `Failed to generate OTP`  
**Actual Problem**: `Sender ID "TextLK" is not authorized to send this message`

The Text.lk SMS API is **rejecting** messages because the Sender ID hasn't been approved by Text.lk.

### What is a Sender ID?
The Sender ID is the name/number that appears as the sender when someone receives your SMS. In Sri Lanka, all Sender IDs must be **pre-approved** by the SMS gateway provider (Text.lk) and telecom operators.

---

## ✅ SOLUTION: Request Approved Sender ID from Text.lk

### Option 1: Request a Custom Sender ID (Recommended)

#### Step 1: Login to Text.lk Dashboard
1. Go to: **https://app.text.lk**
2. Login with your credentials

#### Step 2: Request Sender ID Approval
1. Look for **"Sender IDs"**, **"Manage Sender IDs"**, or **"Settings"** section
2. Click **"Add New Sender ID"** or **"Request Sender ID"**
3. Enter your desired Sender ID

**Suggested Sender IDs:**
- `PCN-System` (recommended)
- `PCNLK`
- `PCNAutocare`
- `PCN`

**Naming Rules:**
- Max 11 characters for alphanumeric
- Can include hyphen (-)
- No spaces or special characters
- Should represent your business

#### Step 3: Wait for Approval
- **Time**: Usually 1-3 business days
- **Notification**: You'll receive email confirmation
- **Status**: Check Text.lk dashboard for approval status

#### Step 4: Once Approved, Configure the Sender ID

**A. Update Supabase Edge Function Secrets:**

```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"

# Set the approved Sender ID
supabase secrets set TEXTLK_SENDER_ID="PCN-System"

# Redeploy the function to pick up the new secret
supabase functions deploy send-sms-otp
```

**B. Update Local Environment File:**

Edit `dashboard/.env.local`:
```bash
# Uncomment and set your approved Sender ID
TEXTLK_SENDER_ID=PCN-System
```

**C. Restart Your Development Server:**
```bash
cd dashboard
npm run dev
```

---

### Option 2: Contact Text.lk Support for Instant Approval

If you need immediate testing, contact Text.lk support:

#### Contact Information:
- **Website**: https://www.text.lk/contact
- **Dashboard**: https://app.text.lk (look for support/help section)
- **Request**: "I need an approved Sender ID for testing my application"

#### What to Ask:
1. "Do you have any pre-approved Sender IDs I can use immediately for testing?"
2. "Can you expedite approval for my Sender ID 'PCN-System'?"
3. "What is the typical approval timeframe?"

---

### Option 3: Use Numeric Sender ID (If Supported)

Some SMS gateways allow using your own phone number as Sender ID without approval. Try asking Text.lk if this is supported.

---

## 🧪 How to Test After Approval

Once you have an approved Sender ID:

### Test 1: Direct API Test
```bash
curl -X POST 'https://app.text.lk/api/v3/sms/send' \
--header 'Authorization: Bearer 2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169' \
--header 'Content-Type: application/json' \
--data '{
  "recipient": "94710898944",
  "sender_id": "PCN-System",
  "type": "plain",
  "message": "Test from PCN System"
}'
```

**Expected Success Response:**
```json
{
  "status": "success",
  "data": {
    "message_id": "...",
    "status": "sent"
  }
}
```

### Test 2: Through Your Application
1. Start your dev server: `cd dashboard && npm run dev`
2. Open http://localhost:3001
3. Go to **User Management**
4. Click on a user with a phone number
5. Click **"Send OTP"** button
6. Check the phone for the OTP SMS

---

## 📊 Current Status Summary

| Component | Status |
|-----------|--------|
| Text.lk API Connection | ✅ Working |
| API Authentication | ✅ Working |
| Database Table (phone_verification_otps) | ✅ Created |
| Edge Function (send-sms-otp) | ✅ Deployed |
| **Sender ID** | ❌ **NOT APPROVED** ← **THIS IS THE ISSUE** |
| Phone Number Format | ✅ Correct |
| OTP Generation | ✅ Working |

**The ONLY missing piece is the approved Sender ID from Text.lk.**

---

## 🎯 Immediate Action Required

### Priority 1: Request Sender ID (Do This Now)
1. Login to https://app.text.lk
2. Navigate to Sender ID section
3. Request "PCN-System" or similar
4. Submit request

### Priority 2: While Waiting for Approval
Contact Text.lk support and explain:
- You have a working integration
- You need to test OTP functionality
- Ask if they can expedite or provide a test Sender ID

### Priority 3: Once Approved
Run these commands:
```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"

# Set approved Sender ID
supabase secrets set TEXTLK_SENDER_ID="YOUR-APPROVED-ID"

# Redeploy function
supabase functions deploy send-sms-otp

# Test immediately
curl -X POST 'https://wnorajpknqegnnmeotjf.supabase.co/functions/v1/send-sms-otp' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indub3JhanBrbnFlZ25ubWVvdGpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3MjgwOSwiZXhwIjoyMDc2OTQ4ODA5fQ.yvBzcHfL1zTTj37vaF6oU2cPa3mFO6wL0CKn4-94Aho' \
--header 'Content-Type: application/json' \
--data '{"mobileNumber":"94710898944","purpose":"verification"}'
```

---

## 🔍 Verification Steps

After setting the approved Sender ID, verify everything works:

### 1. Check Function Logs
```bash
cd dashboard
supabase functions list  # Should show send-sms-otp as ACTIVE
```

### 2. Check Environment Secrets
```bash
supabase secrets list  # Should show TEXTLK_SENDER_ID
```

### 3. Test in Browser Console
Open your app and check browser console - it should no longer show "Failed to generate OTP"

---

## 📞 Text.lk Support Resources

### If You Need Help:
1. **Dashboard**: https://app.text.lk - Look for support/tickets section
2. **Documentation**: Check for Sender ID approval process
3. **Account Manager**: If you have one, contact them directly

### Information to Provide:
- Account Email: [Your Text.lk account email]
- API Token: 2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169
- Requested Sender ID: PCN-System (or your preference)
- Use Case: Phone number verification and OTP authentication
- Urgency: Required for application testing

---

## ✅ Success Criteria

Once this is fixed, you should see:

1. **In User Management**:
   - Click "Send OTP" → Success message appears
   - No more "Failed to generate OTP" error

2. **On User's Phone**:
   - SMS received within seconds
   - Sender shows: "PCN-System" (or your approved ID)
   - Message: "Your PCN System phone verification code is: 123456. Valid for 15 minutes."

3. **In Browser Console**:
   - `OTP sent successfully to: 94XXXXXXXXX`
   - No errors

4. **In Database**:
   - Check `phone_verification_otps` table
   - New row with the OTP code

---

## 📝 Summary

**Problem**: Sender ID "TextLK" not authorized  
**Solution**: Request approved Sender ID from Text.lk  
**Timeline**: 1-3 business days  
**Action**: Login to app.text.lk and request Sender ID NOW  

**Everything else is working perfectly!** 🎉 You just need the approved Sender ID.

---

**Created**: November 8, 2025  
**Status**: Waiting for Sender ID Approval  
**Next Update**: After Sender ID is approved
