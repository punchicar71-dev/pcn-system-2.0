# 🚀 Password Reset Flow - Quick Start Guide

## ⚡ 3-Step Setup (5 minutes)

### Step 1: Run Database Migration ⏱️ 1 min
1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the content from: `dashboard/migrations/2025_11_05_add_password_reset_otps.sql`
4. Paste and click **Run**

### Step 2: Add JWT Secret ⏱️ 1 min
```bash
cd dashboard
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### Step 3: Test It! ⏱️ 3 min
```bash
# Start dev server
npm run dev

# Open browser: http://localhost:3001
# Click "Forget Password?"
# Enter a mobile number from your users table
# Complete the flow!
```

---

## 📱 What to Test

1. ✅ Click **password eye icon** on login page
2. ✅ Click **"Forget Password?"** link
3. ✅ Enter mobile number → Click **"Send OTP"**
4. ✅ Check your phone for SMS
5. ✅ Enter 6-digit OTP → Click **"Continue"**
6. ✅ Enter new password twice → Click **"Update"**
7. ✅ See green checkmark animation
8. ✅ Click **"Back to Login"**
9. ✅ Login with new password

---

## 🎯 What Was Built

### UI Pages (5):
- ✅ Login page with password toggle
- ✅ Forgot password page
- ✅ OTP verification page (6 boxes)
- ✅ Change password page
- ✅ Success page with animation

### Backend (3 APIs):
- ✅ Send OTP via SMS
- ✅ Verify OTP code
- ✅ Reset password

### Database:
- ✅ `password_reset_otps` table

---

## 📚 Documentation Files

1. **PASSWORD_RESET_SUMMARY.md** ← Start here! Complete overview
2. **PASSWORD_RESET_FLOW_GUIDE.md** ← Detailed implementation guide
3. **PASSWORD_RESET_VISUAL_GUIDE.md** ← Visual flow diagrams
4. **PASSWORD_RESET_QUICK_START.md** ← This file

---

## 🔐 Environment Variables

Make sure these exist in `dashboard/.env.local`:

```bash
# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Text.lk SMS (should already exist)
TEXTLK_API_TOKEN=...
TEXTLK_API_URL=...

# JWT Secret (ADD THIS!)
JWT_SECRET=your-generated-secret
```

---

## ✅ Success Checklist

Before going live:
- [ ] Database migration ran successfully
- [ ] JWT_SECRET added to .env.local
- [ ] Can see password on login page (eye icon)
- [ ] Forget Password link works
- [ ] OTP SMS is received
- [ ] Can verify OTP
- [ ] Password updates successfully
- [ ] Success animation shows
- [ ] Can login with new password

---

## 🐛 Quick Troubleshooting

**OTP not received?**
→ Check Text.lk SMS credits and configuration

**"Invalid OTP" error?**
→ OTP expires in 15 minutes, request a new one

**"User not found" error?**
→ Make sure mobile number exists in users table

**Password not updating?**
→ Check Supabase service role key is correct

---

## 📊 Database Query to Check Users

```sql
-- Check which users have mobile numbers
SELECT 
  id, 
  first_name, 
  last_name, 
  mobile_number,
  email
FROM users 
WHERE mobile_number IS NOT NULL;
```

---

## 🎉 You're All Set!

The complete password reset flow is ready to use!

**Time to implement:** ✅ Complete  
**Time to setup:** ⏱️ 5 minutes  
**Time for user:** ⏱️ 2-3 minutes to reset password  

---

**Need Help?**
- Check console logs for detailed errors
- Review the comprehensive guides
- Test with a known mobile number from your users table

**Happy Testing! 🚀**
