# 📱 Phone Verification - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Run Database Migration
```bash
cd dashboard
psql $DATABASE_URL -f migrations/2025_11_08_add_phone_verification_otps.sql
```

### 2. Deploy Edge Function
```bash
supabase functions deploy send-sms-otp
supabase secrets set TEXTLK_API_TOKEN="2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169"
```

### 3. Test in UI
1. Go to User Management
2. Click "View Details" on user with mobile number
3. Click "Send Verification Code"
4. Enter OTP from SMS
5. Click "Verify Code"

---

## 📡 API Endpoints

### Send OTP
```bash
POST /api/users/send-phone-otp
{
  "userId": "uuid",
  "mobileNumber": "0771234567",
  "purpose": "verification"
}
```

### Verify OTP
```bash
POST /api/users/verify-phone
{
  "userId": "uuid",
  "mobileNumber": "0771234567",
  "otpCode": "123456"
}
```

---

## 🗄️ Database Queries

### Check Verification Status
```sql
SELECT first_name, last_name, mobile_number, phone_verified 
FROM users 
WHERE phone_verified = true;
```

### View Recent OTPs
```sql
SELECT * FROM phone_verification_otps 
ORDER BY created_at DESC 
LIMIT 10;
```

### Clean Expired OTPs
```sql
DELETE FROM phone_verification_otps 
WHERE expires_at < NOW();
```

---

## 🎨 UI Location

**Path:** User Management → View Details → Mobile Number Verification Section

**Features:**
- ✅ Send OTP button
- ✅ 6-digit OTP input
- ✅ Resend OTP option
- ✅ Verification status badge
- ✅ Real-time validation

---

## 📱 Phone Formats

```
✅ 0771234567
✅ 94771234567
✅ +94771234567

❌ 771234567 (missing prefix)
❌ 0112345678 (landline)
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| OTP not received | Check Text.lk credits & phone format |
| Invalid OTP | Check if expired (15 min) |
| Edge function error | Run `supabase functions logs send-sms-otp` |
| Migration failed | Check if tables already exist |

---

## 📂 Key Files

```
✅ Created:
- dashboard/supabase/functions/send-sms-otp/index.ts
- dashboard/src/app/api/users/send-phone-otp/route.ts
- dashboard/src/app/api/users/verify-phone/route.ts
- dashboard/migrations/2025_11_08_add_phone_verification_otps.sql

✏️ Modified:
- dashboard/src/app/(dashboard)/user-management/components/UserDetailsModal.tsx
```

---

## 🎯 Features

- 📱 SMS OTP verification via Text.lk
- ⏱️ 15-minute OTP expiry
- 🔒 One-time use OTPs
- 🇱🇰 Sri Lankan phone number validation
- 🎨 Beautiful verification UI
- 🔐 Supabase Edge Function integration
- ✅ Phone verified status tracking

---

## 💰 Cost

- **Per SMS:** ~LKR 1-2
- **Free Tier:** Check Text.lk account
- **Monitor:** https://www.text.lk (dashboard)

---

## ✅ Checklist

- [ ] Migration executed
- [ ] Edge function deployed
- [ ] Secrets configured
- [ ] Tested with real phone
- [ ] Verification works
- [ ] Text.lk credits available

---

**Status:** ✅ READY TO USE  
**Date:** November 8, 2025

See full guide: `PHONE_VERIFICATION_COMPLETE_GUIDE.md`
