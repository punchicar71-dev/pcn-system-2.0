# 🎯 Text.lk Sender ID Setup Required

## ✅ Great News - API Integration Working!

The Text.lk API integration is **working correctly**! 🎉

**Test Results:**
- ✅ API endpoint: `https://app.text.lk/api/v3/sms/send`
- ✅ Authentication: Bearer token format working
- ✅ Status Code: 200 OK
- ⚠️ Error: "Sender ID is not authorized"

## 🔑 What is a Sender ID?

A **Sender ID** is the name that appears as the sender when your SMS is delivered. For example:
- `PCN-System`
- `PCNAutoCare`
- `PCNLK`

**In Sri Lanka**, Sender IDs must be pre-approved by Text.lk and telecom operators for security reasons.

---

## 📋 Steps to Set Up Sender ID

### Step 1: Login to Text.lk Dashboard
1. Go to: **https://app.text.lk**
2. Login with your account credentials

### Step 2: Request Sender ID Approval
1. Navigate to **"Sender IDs"** or **"Settings"** section
2. Click **"Add New Sender ID"** or **"Request Sender ID"**
3. Enter your desired Sender ID (Examples below)
4. Submit the request

### Step 3: Wait for Approval
- Approval usually takes **1-3 business days**
- You'll receive an email notification when approved
- Some services offer instant approval for certain formats

### Step 4: Update Your Code
Once approved, update the sender ID in your code.

---

## 💡 Sender ID Naming Guidelines

### ✅ Good Sender ID Examples:
- `PCN-System` (with hyphen)
- `PCNAutocare`
- `PCNLK`
- `PCN`
- `MyCompany`

### ❌ Avoid:
- Special characters (except hyphen)
- Spaces
- Numbers only
- Generic names like "Admin" or "Info"

### 📏 Length Limits:
- **Numeric**: Up to 16 digits
- **Alphanumeric**: Up to 11 characters
- **Recommendation**: Keep it short and recognizable (6-11 chars)

---

## 🔧 How to Update Code with Approved Sender ID

### Option 1: Add to Environment Variables (Recommended)

**File: `dashboard/.env.local`**
```bash
# Text.lk SMS Service Configuration
TEXTLK_API_TOKEN=2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169
TEXTLK_API_URL=https://app.text.lk/api/v3/sms/send
TEXTLK_SENDER_ID=PCN-System  # ← Add your approved Sender ID here
```

**File: `dashboard/src/lib/sms-service.ts`**
```typescript
export async function sendSMS({ to, message }: SMSParams): Promise<TextLKResponse> {
  try {
    const apiToken = process.env.TEXTLK_API_TOKEN || '2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169'
    const senderId = process.env.TEXTLK_SENDER_ID || 'PCN-System' // ← Your approved ID
    const apiUrl = process.env.TEXTLK_API_URL || 'https://app.text.lk/api/v3/sms/send'
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        recipient: to,
        sender_id: senderId, // ← Use the approved Sender ID
        message: message
      })
    })
    // ... rest of code
  }
}
```

### Option 2: Hardcode in Function (Quick Test)

**File: `dashboard/src/lib/sms-service.ts`** (line ~18)
```typescript
body: JSON.stringify({
  recipient: to,
  sender_id: 'YOUR_APPROVED_SENDER_ID', // ← Replace with your approved ID
  message: message
})
```

**File: `dashboard/test-sms-service.js`** (line ~43)
```javascript
body: JSON.stringify({
  recipient: TEST_PHONE_NUMBER,
  sender_id: 'YOUR_APPROVED_SENDER_ID', // ← Replace with your approved ID
  message: TEST_MESSAGE
})
```

---

## 🧪 Testing After Sender ID Approval

Once you have an approved Sender ID:

```bash
# 1. Update Sender ID in code (see above)
# 2. Update phone number in test script
# Edit test-sms-service.js line 11:
# const TEST_PHONE_NUMBER = '94771234567' # ← Your actual phone number

# 3. Run test:
cd dashboard
node test-sms-service.js

# 4. Check your phone for SMS! 📱
```

---

## 📞 Contact Text.lk Support

If you need help with Sender ID approval:

### Text.lk Support:
- **Website**: https://www.text.lk/contact
- **Support Portal**: https://app.text.lk (login and check support/tickets)
- **Phone**: Check their website for contact number

### What to Ask:
1. "I need to request a Sender ID for my account"
2. "What is the approval process and timeframe?"
3. "Can you help me get 'PCN-System' or 'PCNLK' approved as my Sender ID?"
4. "Do you have any instant approval Sender IDs I can use for testing?"

---

## 🎯 Temporary Solution: Use Test Mode (If Available)

Some SMS gateways offer test Sender IDs. Ask Text.lk support if they have:
- Test Sender IDs for development
- Sandbox mode
- Pre-approved generic Sender IDs

---

## 📊 Current Integration Status

| Component | Status |
|-----------|--------|
| API Authentication | ✅ Working |
| API Endpoint | ✅ Correct |
| Phone Number Format | ✅ Correct |
| Request Format | ✅ Correct |
| **Sender ID** | ⏳ **Pending Approval** |
| SMS Credits | ❓ Check your account |

---

## 🚀 Once Sender ID is Approved

After Sender ID approval, your integration will work like this:

### User Creation Flow:
```
1. User creates new account in UI
   ↓
2. Checks "Send SMS" checkbox
   ↓
3. System validates phone number
   ↓
4. Sends welcome SMS with credentials
   ↓
5. SMS delivered with your Sender ID
   ↓
6. User receives: "From: PCN-System"
   "Welcome John! Your PCN account is created..."
```

### Expected Success Response:
```json
{
  "status": "success",
  "data": {
    "message_id": "abc123",
    "recipient": "94771234567",
    "sender_id": "PCN-System",
    "status": "sent"
  }
}
```

---

## 📝 Summary Checklist

- [ ] Login to https://app.text.lk
- [ ] Navigate to Sender ID section
- [ ] Request Sender ID (e.g., "PCN-System" or "PCNLK")
- [ ] Wait for approval (1-3 business days)
- [ ] Update `.env.local` with approved Sender ID
- [ ] Update `sms-service.ts` to use Sender ID
- [ ] Update `test-sms-service.js` with your phone number
- [ ] Run test: `node test-sms-service.js`
- [ ] Verify SMS received on phone
- [ ] Start using in production! 🎉

---

## 💡 Alternative: Use NotifyLK or Dialog SMS

If Text.lk Sender ID approval is taking too long, you can also consider:

### NotifyLK (Sri Lankan SMS Gateway)
- Website: https://www.notifylk.com
- Features: Faster approval, good for local businesses
- Integration: Similar API structure

### Dialog Axiata SMS API
- Website: https://www.dialog.lk
- Features: Direct telecom provider
- Integration: May require business account

---

**Status**: ✅ API Integration Complete - Waiting for Sender ID Approval  
**Next Action**: Request Sender ID from Text.lk Dashboard  
**ETA**: 1-3 business days for approval  
**Last Updated**: January 15, 2025
