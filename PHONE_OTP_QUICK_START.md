# Phone Verification OTP - Quick Start Guide

## 🎯 Current Status

✅ **OTP Generation Working**  
✅ **Database Storage Working**  
✅ **API Endpoints Working**  
⚠️ **SMS Delivery Blocked** (Sender ID not approved)  

---

## 🚀 Quick Test (5 minutes)

### 1. Generate OTP

```bash
curl -X POST http://localhost:3001/api/users/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "d6327330-6d2d-4c15-bbb8-507ab9898545",
    "mobileNumber": "+94710898944"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "OTP generated but SMS delivery may have failed",
  "expiresIn": 900
}
```

### 2. Check Database

```sql
-- In Supabase SQL Editor:
SELECT * FROM password_reset_otps 
WHERE mobile_number = '94710898944' 
ORDER BY created_at DESC 
LIMIT 1;
```

**You should see**:
- OTP code (6 digits)
- Mobile number (94710898944)
- Expiration time (15 minutes from now)
- verified = false

### 3. Verify OTP

```bash
# Use the OTP code you saw in the database
curl -X POST http://localhost:3001/api/users/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "d6327330-6d2d-4c15-bbb8-507ab9898545",
    "mobileNumber": "+94710898944",
    "otpCode": "133557"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Phone number verified successfully"
}
```

### 4. Confirm User Updated

```sql
-- In Supabase SQL Editor:
SELECT id, phone_verified, phone_verified_at FROM users 
WHERE id = 'd6327330-6d2d-4c15-bbb8-507ab9898545';
```

**You should see**:
- phone_verified = true
- phone_verified_at = current timestamp

---

## ✅ Checklist for Production

- [ ] SMS Sender ID approved by Text.lk
- [ ] `TEXTLK_SENDER_ID=PCN-System` in `.env.local`
- [ ] Test with real phone number
- [ ] Verify SMS arrives in <10 seconds
- [ ] Test expired OTP rejection
- [ ] Test wrong code rejection
- [ ] Test duplicate request handling
- [ ] Monitor database for OTP growth
- [ ] Document user-facing flow
- [ ] Deploy to staging
- [ ] Deploy to production

---

## 📋 Key Files

| File | Purpose |
|------|---------|
| `/api/users/send-phone-otp/route.ts` | Generate and send OTP |
| `/api/users/verify-phone-otp/route.ts` | Verify OTP and update user |
| `UserDetailsModal.tsx` | UI integration |
| `sms-service.ts` | SMS sending logic |
| `password_reset_otps` (table) | OTP storage |

---

## 🐛 Troubleshooting

### OTP Not Generated?
1. Check server logs: `npm run dev`
2. Check phone number format (should be +94XXXXXXXXX)
3. Check `password_reset_otps` table has permission to insert

### OTP Generated But SMS Not Sent?
1. **Current Issue**: Sender ID "TextLK" not authorized
2. **Solution**: Apply for Sender ID approval on Text.lk portal
3. **Temporary**: SMS gracefully fails, OTP still generated

### Verification Fails?
1. Check OTP hasn't expired (15 minutes)
2. Check code is correct (6 digits)
3. Check database has the OTP record

### User Not Found?
1. Verify userId exists in `users` table
2. Verify user has valid `auth_id` in `auth.users`
3. System auto-looks up auth_id if not provided

---

## 📞 SMS Configuration

### Get Sender ID Approved

1. Log into Text.lk portal: https://app.text.lk
2. Go to Sender IDs
3. Request new Sender ID: "PCN-System"
4. Wait for approval (usually 24-48 hours)
5. Update `.env.local`:
   ```
   TEXTLK_SENDER_ID=PCN-System
   ```
6. Restart server: `npm run dev`

### Verify Sender ID Working

```bash
# After approval, send test SMS:
curl -X POST http://localhost:3001/api/users/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "mobileNumber": "+94XXXXXXXXX"
  }'

# Check phone for SMS from "PCN System" or your sender ID
```

---

## 🔒 Security Notes

✅ **What's Secure**:
- 6-digit random OTP (1 in 1M chance)
- 15-minute expiration
- Phone number verification
- One-time use (marked verified after use)
- Admin-controlled (requires authentication)

⚠️ **What's Not Yet**:
- SMS delivery confirmation (relies on Text.lk)
- Rate limiting on OTP requests (consider adding)
- Brute force protection (consider adding)

---

## 📊 Database Queries

### View All Active OTPs

```sql
SELECT mobile_number, otp_code, expires_at, verified 
FROM password_reset_otps 
WHERE verified = false 
AND expires_at > NOW();
```

### View Used OTPs

```sql
SELECT mobile_number, otp_code, verified_at 
FROM password_reset_otps 
WHERE verified = true 
ORDER BY verified_at DESC 
LIMIT 10;
```

### Cleanup Expired OTPs

```sql
DELETE FROM password_reset_otps 
WHERE expires_at < NOW() - INTERVAL '1 day';
```

---

## 🎓 How It Works

```
1. User clicks "Send Verification Code"
   ↓
2. Frontend sends POST /api/users/send-phone-otp
   ↓
3. Backend generates 6-digit random number
   ↓
4. Backend stores in password_reset_otps table
   ↓
5. Backend sends SMS via Text.lk API
   ↓
6. Frontend shows success message
   ↓
7. User enters 6-digit code from SMS
   ↓
8. Frontend sends POST /api/users/verify-phone-otp
   ↓
9. Backend validates code and expiration
   ↓
10. Backend marks OTP as used (verified=true)
    ↓
11. Backend updates user (phone_verified=true)
    ↓
12. Frontend shows success and closes modal
```

---

## 📝 Logs to Watch

### Successful OTP Generation
```
Generating phone verification OTP
User ID (from users table): d6327330-...
Auth ID (from auth.users): 265610f2-...
Mobile number: 94710898944
Storing OTP for phone: 94710898944
OTP stored successfully in database
Sending SMS...
POST /api/users/send-phone-otp 200
```

### Successful OTP Verification
```
Verifying phone OTP
Mobile number: 94710898944
OTP code: 133557
Looking up OTP for phone: 94710898944
OTP found in database
OTP not expired
OTP verified successfully
User phone_verified status updated
POST /api/users/verify-phone-otp 200
```

---

## 🚦 Status Indicators

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ | Working | No action needed |
| ⚠️ | Warning | Needs configuration |
| ❌ | Failed | Needs debugging |
| ⏳ | Testing | Run tests |

**Current**: ✅ OTP Gen + ⚠️ SMS Config + ⏳ Full Testing

---

Questions? Check `PHONE_OTP_SIMPLIFIED.md` for full technical details.
