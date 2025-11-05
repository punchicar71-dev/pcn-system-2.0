# 🔐 Password Reset Flow via SMS OTP - Implementation Guide

## ✅ What Has Been Implemented

### 1. **Updated Login Page** ✨
- **File**: `dashboard/src/app/(auth)/page.tsx`
- Added password show/hide toggle with eye icon (using lucide-react icons)
- Updated "Forget Password?" link to navigate to the password reset flow
- Enhanced password input field with visibility toggle button

### 2. **Forgot Password Page** 📱
- **File**: `dashboard/src/app/(auth)/forgot-password/page.tsx`
- **Route**: `/forgot-password`
- User enters mobile number to request OTP
- Validates mobile number format
- Sends OTP via SMS to registered mobile number
- Professional UI matching the login page design

### 3. **OTP Verification Page** 🔢
- **File**: `dashboard/src/app/(auth)/verify-otp/page.tsx`
- **Route**: `/verify-otp?mobile={phone_number}`
- 6-digit OTP input with individual boxes
- Auto-focus next input on digit entry
- Support for paste (auto-fills all boxes)
- Backspace navigation between inputs
- Verifies OTP code against database

### 4. **Change Password Page** 🔑
- **File**: `dashboard/src/app/(auth)/change-password/page.tsx`
- **Route**: `/change-password?token={reset_token}`
- Two password fields: "New Password" and "Re-enter password"
- Password show/hide toggle for both fields
- Password confirmation validation
- Minimum password length validation (6 characters)

### 5. **Success Page** ✅
- **File**: `dashboard/src/app/(auth)/password-reset-success/page.tsx`
- **Route**: `/password-reset-success`
- Displays success animation (green checkmark from `/done_animation.png`)
- "Congratulations" message
- "Back to Login" button to return to login page
- Smooth fade-in animation for success icon

### 6. **Database Migration** 🗄️
- **File**: `dashboard/migrations/2025_11_05_add_password_reset_otps.sql`
- Created `password_reset_otps` table
- Fields: id, mobile_number, otp_code, user_id, expires_at, verified, created_at, updated_at
- Added indexes for performance
- RLS policies configured
- Cleanup function for expired OTPs

### 7. **API Routes** 🔌

#### a) Send OTP API
- **File**: `dashboard/src/app/api/auth/send-otp/route.ts`
- **Endpoint**: `POST /api/auth/send-otp`
- Validates mobile number
- Checks if user exists with the mobile number
- Generates 6-digit OTP
- Stores OTP in database with 15-minute expiration
- Sends OTP via Text.lk SMS service
- Cleans up old OTPs for the same mobile number

#### b) Verify OTP API
- **File**: `dashboard/src/app/api/auth/verify-otp/route.ts`
- **Endpoint**: `POST /api/auth/verify-otp`
- Validates OTP code
- Checks expiration (15 minutes)
- Marks OTP as verified
- Generates JWT reset token (valid for 15 minutes)
- Returns token for password reset

#### c) Reset Password API
- **File**: `dashboard/src/app/api/auth/reset-password/route.ts`
- **Endpoint**: `POST /api/auth/reset-password`
- Verifies JWT reset token
- Validates new password (minimum 6 characters)
- Updates password using Supabase Admin API
- Cleans up used OTP from database

---

## 🔄 Password Reset Flow

### User Journey:
1. **Login Page** → Click "Forget Password?"
2. **Forgot Password Page** → Enter mobile number → Click "Send OTP"
3. **OTP Verification Page** → Enter 6-digit OTP → Click "Continue"
4. **Change Password Page** → Enter new password twice → Click "Update"
5. **Success Page** → See success animation → Click "Back to Login"
6. **Login Page** → Login with new password

### Technical Flow:
```
User enters mobile → API checks user exists → Generate OTP → Send SMS
       ↓
User enters OTP → API verifies OTP → Generate JWT token
       ↓
User enters new password → API verifies token → Update password → Cleanup OTP
       ↓
Show success page
```

---

## 📋 Required Environment Variables

Add these to your `dashboard/.env.local` file:

```bash
# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Text.lk SMS Configuration (already configured)
TEXTLK_API_TOKEN=2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4166
TEXTLK_API_URL=https://app.text.lk/api/v3/sms/send
TEXTLK_SENDER_ID=YourSenderID (optional)

# JWT Secret for Password Reset Tokens
JWT_SECRET=your-secure-random-secret-key-change-this-in-production
```

**Generate a secure JWT secret:**
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration
```bash
# Connect to your Supabase project
# Go to SQL Editor in Supabase Dashboard
# Copy and paste the migration file content
# Run the migration
```

Or use Supabase CLI:
```bash
cd dashboard
supabase db push migrations/2025_11_05_add_password_reset_otps.sql
```

### Step 2: Add JWT Secret to .env.local
```bash
cd dashboard
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### Step 3: Verify Text.lk SMS is Working
```bash
cd dashboard
node test-sms-service.js
```

### Step 4: Test the Password Reset Flow
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3001`

3. Click "Forget Password?"

4. Enter a mobile number that exists in your users table

5. Check your phone for the OTP

6. Complete the flow!

---

## 🎨 UI Features

### Design Elements:
- ✅ Consistent design across all auth pages
- ✅ Same left-side cover image with logo
- ✅ Professional form styling with focus states
- ✅ Password visibility toggle icons (Eye/EyeOff)
- ✅ 6-digit OTP input with individual boxes
- ✅ Success animation with green checkmark
- ✅ Loading states on all buttons
- ✅ Error message displays
- ✅ Contact information box on all pages

### Responsive:
- ✅ Mobile-friendly layouts
- ✅ Left cover image hidden on mobile
- ✅ Full-width forms on mobile devices

---

## 🔐 Security Features

### OTP Security:
- ✅ 6-digit random OTP generation
- ✅ 15-minute expiration time
- ✅ One-time use (marked as verified after use)
- ✅ Automatic cleanup of old OTPs
- ✅ Secure database storage

### Token Security:
- ✅ JWT tokens with 15-minute expiration
- ✅ Signed with secret key
- ✅ Contains user ID and OTP reference
- ✅ Verified before password update

### Password Security:
- ✅ Minimum 6 characters requirement
- ✅ Password confirmation required
- ✅ Updated via Supabase Admin API
- ✅ Hashed automatically by Supabase

---

## 🧪 Testing Checklist

- [ ] User can navigate from login to forgot password page
- [ ] Invalid mobile numbers are rejected
- [ ] OTP is sent via SMS successfully
- [ ] User receives OTP on their mobile
- [ ] Invalid OTP codes are rejected
- [ ] Expired OTPs (>15 min) are rejected
- [ ] Password mismatch shows error
- [ ] Short passwords (<6 chars) are rejected
- [ ] Password is updated successfully
- [ ] Success page displays correctly
- [ ] User can login with new password
- [ ] Back to login button works
- [ ] Mobile number not in system shows error

---

## 📱 SMS Message Format

**OTP SMS Message:**
```
Hi {FirstName}, your password reset code is: {OTP}. Valid for 15 minutes.
```

**Example:**
```
Hi John, your password reset code is: 123456. Valid for 15 minutes.
```

---

## 🐛 Troubleshooting

### OTP Not Received:
1. Check if user exists with that mobile number:
   ```sql
   SELECT * FROM users WHERE mobile_number = '94771234567';
   ```

2. Check Text.lk SMS configuration in `.env.local`

3. Verify SMS credits in Text.lk account

4. Check console logs for SMS errors

### Invalid OTP Error:
1. Check if OTP is expired (15-minute window)
2. Verify OTP in database:
   ```sql
   SELECT * FROM password_reset_otps 
   WHERE mobile_number = '94771234567' 
   ORDER BY created_at DESC;
   ```

### Token Expired:
1. User took too long (>15 min)
2. Ask user to restart the flow
3. Old OTPs are automatically cleaned up

### Password Not Updating:
1. Check Supabase service role key is correct
2. Verify user has `auth_id` in users table
3. Check console logs for Supabase errors

---

## 📊 Database Queries

### View Recent OTPs:
```sql
SELECT 
  mobile_number,
  otp_code,
  verified,
  expires_at,
  created_at
FROM password_reset_otps
ORDER BY created_at DESC
LIMIT 10;
```

### Clean Expired OTPs Manually:
```sql
SELECT cleanup_expired_otps();
```

### Check User Mobile Numbers:
```sql
SELECT id, first_name, mobile_number 
FROM users 
WHERE mobile_number IS NOT NULL;
```

---

## 📚 Dependencies Installed

```json
{
  "jsonwebtoken": "^9.0.2",
  "@types/jsonwebtoken": "^9.0.5"
}
```

---

## 🎯 Success Image

Make sure the success animation image exists at:
```
dashboard/public/done_animation.png
```

This is the green checkmark animation shown on the success page.

---

## 🔗 Related Files

### Frontend Pages:
- `dashboard/src/app/(auth)/page.tsx` - Login page
- `dashboard/src/app/(auth)/forgot-password/page.tsx` - Request OTP
- `dashboard/src/app/(auth)/verify-otp/page.tsx` - Verify OTP
- `dashboard/src/app/(auth)/change-password/page.tsx` - Set new password
- `dashboard/src/app/(auth)/password-reset-success/page.tsx` - Success page

### API Routes:
- `dashboard/src/app/api/auth/send-otp/route.ts` - Send OTP API
- `dashboard/src/app/api/auth/verify-otp/route.ts` - Verify OTP API
- `dashboard/src/app/api/auth/reset-password/route.ts` - Reset password API

### Utilities:
- `dashboard/src/lib/sms-service.ts` - SMS service with OTP template

### Database:
- `dashboard/migrations/2025_11_05_add_password_reset_otps.sql` - Migration

---

## ✅ All Done!

The complete password reset flow via SMS OTP has been implemented and is ready to use!

**Next Steps:**
1. Run the database migration
2. Add JWT_SECRET to .env.local
3. Test the flow end-to-end
4. Deploy to production

**For Support:**
- Check console logs for detailed error messages
- Review SMS logs in Text.lk dashboard
- Verify database records in Supabase

---

**Implementation Date:** November 5, 2025
**Status:** ✅ Complete and Ready for Testing
