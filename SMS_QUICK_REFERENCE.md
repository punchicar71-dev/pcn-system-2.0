# 📱 Quick SMS Integration Reference

## API Credentials
```
User ID: 2063
API Key: IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169
```

## Test SMS Service
```bash
# 1. Update phone number in test-sms-service.js
# 2. Run test:
cd dashboard
node test-sms-service.js
```

## Phone Number Formats
```
✅ Accepted:
- 0771234567
- 94771234567
- +94771234567

❌ Not Accepted:
- 771234567 (missing 0 or 94)
- 011234567 (landline)
- +1234567890 (non-Sri Lankan)
```

## Send SMS Programmatically
```typescript
import { sendSMS, formatPhoneNumber } from '@/lib/sms-service'

const result = await sendSMS({
  to: formatPhoneNumber('0771234567'),
  message: 'Your message here'
})
```

## API Endpoint
```bash
POST http://localhost:3000/api/sms
{
  "to": "0771234567",
  "message": "Test message"
}
```

## Files Modified/Created
```
✅ Created:
- dashboard/src/lib/sms-service.ts
- dashboard/src/app/api/sms/route.ts
- dashboard/test-sms-service.js
- SMS_INTEGRATION_GUIDE.md

✅ Modified:
- dashboard/.env.local
- dashboard/src/app/api/users/route.ts
- dashboard/src/app/(dashboard)/user-management/page.tsx
- dashboard/src/app/(dashboard)/user-management/components/AddUserModal.tsx
```

## Quick Troubleshooting
```
Problem: SMS not received
→ Check phone number format (94XXXXXXXXX)
→ Verify SMS credits at text.lk
→ Check console logs for errors

Problem: Invalid API key
→ Verify credentials in .env.local
→ Restart dev server after changing .env

Problem: Message too long
→ Keep under 160 characters
→ Or accept multiple SMS charges
```

## Next Steps
1. ✅ Test with your phone number
2. ✅ Verify SMS is received
3. ✅ Test user creation with SMS
4. ✅ Monitor SMS credits
5. ✅ Add to production when ready
