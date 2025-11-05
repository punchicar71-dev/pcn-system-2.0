# Text.lk SMS Service Integration Guide

## 🎯 Overview

This guide explains how the Text.lk SMS service has been integrated into the PCN System 2.0 application for sending SMS notifications to users.

## 📋 What's Been Implemented

### 1. SMS Service Library (`src/lib/sms-service.ts`)
- **sendSMS()**: Main function to send SMS via Text.lk API
- **formatPhoneNumber()**: Converts phone numbers to Sri Lankan international format (94XXXXXXXXX)
- **isValidSriLankanPhone()**: Validates Sri Lankan phone numbers
- **smsTemplates**: Pre-built message templates for different scenarios

### 2. SMS API Route (`src/app/api/sms/route.ts`)
- **POST /api/sms**: Endpoint to send SMS from the application
- **GET /api/sms**: Test endpoint to verify SMS service configuration
- Includes validation for phone numbers and message content

### 3. User Creation Integration (`src/app/api/users/route.ts`)
- Automatically sends welcome SMS when creating new users
- SMS includes login credentials (email and password)
- Non-blocking: User creation succeeds even if SMS fails

### 4. User Interface Updates
- Added SMS checkbox in Add User Modal
- Mobile number field is now required for SMS
- SMS checkbox is disabled if no mobile number is provided
- Clear user feedback about SMS status

## 🔧 Configuration

### Environment Variables (`.env.local`)

```bash
# Text.lk SMS Service Configuration
TEXTLK_USER_ID=2063
TEXTLK_API_KEY=IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169
TEXTLK_API_URL=https://www.text.lk/apicall/sendsms.php
```

## 📱 Phone Number Format

### Accepted Formats:
- `0771234567` (Local format - automatically converted)
- `94771234567` (International format)
- `+94771234567` (With country code)

### Valid Prefixes:
- All Sri Lankan mobile numbers starting with `07X`
- Examples: `070`, `071`, `072`, `075`, `076`, `077`, `078`

## 🚀 How to Use

### 1. Test SMS Service

First, test if SMS service is working:

```bash
# Update test-sms-service.js with your phone number
# Then run:
node dashboard/test-sms-service.js
```

### 2. Create User with SMS

1. Navigate to User Management page
2. Click "Add User" button
3. Fill in user details including Mobile Number
4. Check "Send login credentials via SMS" checkbox
5. Click "Add User"

### 3. Programmatic SMS Sending

```typescript
import { sendSMS, formatPhoneNumber } from '@/lib/sms-service'

// Send custom SMS
const result = await sendSMS({
  to: formatPhoneNumber('0771234567'),
  message: 'Your custom message here'
})

if (result.status === 'success') {
  console.log('SMS sent successfully!')
}
```

### 4. Using SMS Templates

```typescript
import { smsTemplates } from '@/lib/sms-service'

// Welcome message
const message = smsTemplates.welcome('John', 'john@email.com', 'password123')

// Password reset
const resetMsg = smsTemplates.passwordReset('John', 'ABC123')

// Account status update
const statusMsg = smsTemplates.accountStatus('John', 'Active')
```

## 🔍 API Endpoints

### Send SMS

```bash
POST /api/sms
Content-Type: application/json

{
  "to": "0771234567",
  "message": "Your message here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "data": {
    "to": "94771234567",
    "sentAt": "2025-01-15T10:30:00.000Z",
    "response": "OK"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid phone number format",
  "details": "Use format: 0771234567 or 94771234567"
}
```

### Check SMS Service Status

```bash
GET /api/sms
```

**Response:**
```json
{
  "service": "Text.lk SMS Service",
  "status": "configured",
  "message": "SMS service is ready to use"
}
```

## 📊 SMS Message Templates

### Welcome Message (User Creation)
```
Welcome [FirstName]! Your PCN System account is created. 
Email: [email] | Password: [password]. 
Please change password after first login.
```

### Password Reset
```
Hi [FirstName], your password reset code is: [code]. 
Valid for 15 minutes.
```

### Account Status Update
```
Hi [FirstName], your PCN System account status has been updated to: [status].
```

## ⚠️ Important Notes

### Message Length
- SMS standard: 160 characters per message
- Messages longer than 160 characters will be sent as multiple SMS
- Each SMS is charged separately

### Cost
- Each SMS sent will be charged according to your Text.lk plan
- Monitor your SMS credits regularly
- Consider SMS costs in your budget

### Error Handling
- SMS failures don't prevent user creation
- All SMS errors are logged to console
- Users receive feedback if SMS fails

### Security
- API credentials are stored in environment variables
- Never commit `.env.local` to version control
- Keep API keys secure and rotate them regularly

## 🐛 Troubleshooting

### SMS Not Received

1. **Check Phone Number Format**
   - Must be a valid Sri Lankan mobile number
   - Use format: `0771234567` or `94771234567`

2. **Verify API Credentials**
   ```bash
   # Check .env.local file
   cat dashboard/.env.local | grep TEXTLK
   ```

3. **Check SMS Credits**
   - Login to Text.lk account
   - Verify you have sufficient SMS credits

4. **Review Console Logs**
   ```bash
   # Check terminal where dev server is running
   # Look for SMS-related error messages
   ```

5. **Test API Directly**
   ```bash
   node dashboard/test-sms-service.js
   ```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid phone number format` | Wrong format | Use 94XXXXXXXXX format |
| `Insufficient credits` | No SMS balance | Add credits to Text.lk account |
| `Invalid API key` | Wrong credentials | Verify API key in .env.local |
| `Network error` | Connection issue | Check internet connection |

## 📝 Development Tips

### Testing Without Sending SMS
```typescript
// Disable SMS in development
const shouldSendSMS = process.env.NODE_ENV === 'production'

if (shouldSendSMS) {
  await sendSMS({ to, message })
}
```

### Logging SMS Activity
```typescript
// Add to your logging system
console.log('SMS Activity:', {
  to: formattedPhone,
  status: result.status,
  timestamp: new Date().toISOString()
})
```

### Rate Limiting
Consider implementing rate limiting to prevent SMS spam:
```typescript
// Example: Limit 5 SMS per user per hour
const canSendSMS = await checkRateLimit(userId, 5, 3600)
```

## 🔐 Security Best Practices

1. **Never log sensitive data**
   - Don't log full phone numbers in production
   - Mask API keys in logs

2. **Validate all inputs**
   - Always validate phone numbers
   - Sanitize message content

3. **Monitor usage**
   - Track SMS sending patterns
   - Set up alerts for unusual activity

4. **Rotate credentials**
   - Change API keys periodically
   - Update in .env.local when changed

## 📚 Additional Resources

- [Text.lk Official Website](https://www.text.lk)
- [Text.lk API Documentation](https://www.text.lk/apidocumentation)
- [Contact Text.lk Support](https://www.text.lk/contact)

## ✅ Integration Checklist

- [x] SMS service library created
- [x] API routes implemented
- [x] User creation integration
- [x] UI updates completed
- [x] Environment variables configured
- [x] Error handling implemented
- [x] Phone number validation added
- [ ] Test with real phone number
- [ ] Monitor SMS credits
- [ ] Set up error alerts

## 🎉 Success Criteria

Your SMS integration is working correctly when:

1. ✅ Test script sends SMS successfully
2. ✅ New users receive welcome SMS
3. ✅ Phone number validation works
4. ✅ Error messages are clear and helpful
5. ✅ SMS checkbox is functional in UI
6. ✅ Console logs show SMS activity

---

**Last Updated:** January 15, 2025  
**Integration Status:** ✅ Complete and Ready for Testing
