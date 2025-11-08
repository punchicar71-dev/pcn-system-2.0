# Password Reset Flow - Activation Complete ✅

## Overview
The forgot password and change password flow has been successfully activated for the Punchi Car Niwasa Management System.

## What Was Done

### 1. ✅ JWT Secret Configuration
- Added `JWT_SECRET` to `dashboard/.env.local` for secure token generation
- Secret: `pcn-secret-key-change-this-in-production-2025`

### 2. ✅ Database Migration
- Migration file exists: `dashboard/migrations/2025_11_05_add_password_reset_otps.sql`
- Creates `password_reset_otps` table with:
  - OTP code storage
  - 15-minute expiration
  - User ID reference
  - Verification status tracking

### 3. ✅ Password Reset Success Page
- Updated redirect from `/` to `/login` for better UX
- Animation image verified: `done_animation.png`

### 4. ✅ All Pages & API Routes Ready
The following components are fully implemented:

**Pages:**
- `/forgot-password` - Enter mobile number
- `/verify-otp` - Enter 6-digit OTP
- `/change-password` - Set new password
- `/password-reset-success` - Success confirmation

**API Routes:**
- `/api/auth/send-otp` - Sends OTP via Text.lk SMS
- `/api/auth/verify-otp` - Verifies OTP and generates reset token
- `/api/auth/reset-password` - Updates password using Supabase Auth

## Password Reset Flow

```
┌─────────────────┐
│  Login Page     │
│  /login         │
└────────┬────────┘
         │ Click "Forget Password?"
         ▼
┌─────────────────┐
│ Forgot Password │  1. User enters mobile number
│ /forgot-password│  2. System validates Sri Lankan format (+94)
└────────┬────────┘  3. Checks if user exists
         │           4. Generates 6-digit OTP
         │           5. Sends SMS via Text.lk
         ▼
┌─────────────────┐
│  Verify OTP     │  1. User enters 6-digit code
│  /verify-otp    │  2. System validates OTP
└────────┬────────┘  3. Checks expiration (15 min)
         │           4. Generates JWT reset token
         ▼
┌─────────────────┐
│ Change Password │  1. User enters new password
│ /change-password│  2. Confirms password match
└────────┬────────┘  3. Validates min 6 characters
         │           4. Updates via Supabase Admin API
         ▼
┌─────────────────┐
│    Success      │  1. Shows success message
│ /password-reset-│  2. Displays checkmark animation
│    success      │  3. "Back to Login" button
└────────┬────────┘     redirects to /login
         │
         ▼
┌─────────────────┐
│  Login Page     │  User can now login with
│  /login         │  new password
└─────────────────┘
```

## How to Apply Database Migration

If you haven't applied the migration yet, run this in Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the content from: `dashboard/migrations/2025_11_05_add_password_reset_otps.sql`
4. Click **Run**

Or use Supabase CLI:
```bash
cd dashboard
supabase db push
```

## Testing the Flow

### Prerequisites
1. ✅ Dashboard server running: `npm run dev` (port 3001)
2. ✅ User exists with mobile number in database
3. ✅ Text.lk SMS service configured (already set up)
4. ✅ JWT_SECRET added to .env.local

### Test Steps

1. **Start Dashboard:**
   ```bash
   cd dashboard
   npm run dev
   ```

2. **Navigate to Login:**
   - Open: http://localhost:3001/login

3. **Click "Forget Password?"**
   - Redirects to: http://localhost:3001/forgot-password

4. **Enter Mobile Number:**
   - Format: +94771234567
   - Click "Send OTP"
   - Check phone for SMS with 6-digit code

5. **Enter OTP:**
   - Automatically redirects to verify-otp page
   - Enter the 6-digit code received
   - Click "Continue"

6. **Set New Password:**
   - Enter new password (min 6 characters)
   - Confirm password
   - Click "Update"

7. **Success Screen:**
   - See congratulations message
   - Click "Back to Login"

8. **Login with New Password:**
   - Enter username/email
   - Enter new password
   - Click "Login"

## Security Features

### OTP Security
- ✅ 6-digit random code
- ✅ 15-minute expiration
- ✅ One-time use (deleted after password reset)
- ✅ Tied to specific mobile number
- ✅ Stored with user_id reference

### Token Security
- ✅ JWT with 15-minute expiration
- ✅ Signed with JWT_SECRET
- ✅ Contains user_id, mobile_number, and otpId
- ✅ Verified before password update

### Password Security
- ✅ Minimum 6 characters
- ✅ Updated via Supabase Admin API
- ✅ Hashed by Supabase Auth
- ✅ Old OTPs cleaned up after use

## Automatic Cleanup

The system includes a function to clean up expired OTPs:

```sql
-- Run this periodically (manual or via cron job)
SELECT cleanup_expired_otps();
```

## Environment Variables Used

```bash
# From dashboard/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://wnorajpknqegnnmeotjf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
TEXTLK_API_TOKEN=2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169
TEXTLK_API_URL=https://app.text.lk/api/v3/sms/send
JWT_SECRET=pcn-secret-key-change-this-in-production-2025
```

## SMS Message Template

When a user requests a password reset, they receive:

```
Hello [FirstName],

Your password reset OTP code is: [123456]

This code will expire in 15 minutes.

- Punchi Car Team
```

## Troubleshooting

### "Mobile number not found"
- Ensure the user exists in the `users` table
- Verify mobile number format: +94771234567
- Check `mobile_number` column matches exactly

### "Invalid or expired OTP"
- OTP expires after 15 minutes
- Request a new OTP
- Ensure you're entering all 6 digits

### "Failed to send SMS"
- Check Text.lk API token is valid
- Verify mobile number is Sri Lankan (+94)
- Check API balance at Text.lk dashboard

### "Invalid reset token"
- Token expires after 15 minutes
- Restart the flow from forgot-password
- Check JWT_SECRET is set in .env.local

### Password not updating
- Ensure SUPABASE_SERVICE_ROLE_KEY is correct
- Check user's auth_id exists in auth.users table
- Verify password meets requirements (min 6 chars)

## File Structure

```
dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── forgot-password/page.tsx      # Step 1: Enter mobile
│   │   │   ├── verify-otp/page.tsx            # Step 2: Enter OTP
│   │   │   ├── change-password/page.tsx       # Step 3: New password
│   │   │   └── password-reset-success/page.tsx # Step 4: Success
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── send-otp/route.ts          # Send SMS OTP
│   │   │       ├── verify-otp/route.ts        # Verify OTP
│   │   │       └── reset-password/route.ts    # Update password
│   │   └── login/page.tsx                     # Login with reset link
│   └── lib/
│       └── sms-service.ts                     # SMS helper functions
├── migrations/
│   └── 2025_11_05_add_password_reset_otps.sql # Database migration
├── public/
│   ├── done_animation.png                     # Success checkmark
│   ├── login_cover.png                        # Background image
│   └── logo.png                               # App logo
└── .env.local                                 # Environment variables
```

## Next Steps

1. **Apply Database Migration** (if not done):
   - Run the SQL migration in Supabase Dashboard
   - Verify `password_reset_otps` table exists

2. **Test the Flow**:
   - Follow the test steps above
   - Use a real Sri Lankan mobile number
   - Verify SMS delivery

3. **Production Considerations**:
   - Change JWT_SECRET to a strong random string
   - Set up periodic cleanup of expired OTPs
   - Monitor SMS usage and costs
   - Consider rate limiting on OTP requests
   - Add CAPTCHA to prevent abuse

4. **Optional Enhancements**:
   - Add rate limiting (max 3 OTP requests per 15 minutes)
   - SMS delivery status tracking
   - Email fallback option
   - Password strength indicator
   - Remember device feature

## Support

For questions or issues:
- **Email:** admin@punchicar.com
- **Call:** 0112 413 865

## Related Documentation

- [PASSWORD_RESET_SUMMARY.md](./PASSWORD_RESET_SUMMARY.md) - Complete overview
- [PASSWORD_RESET_FLOW_GUIDE.md](./PASSWORD_RESET_FLOW_GUIDE.md) - Implementation guide
- [PASSWORD_RESET_VISUAL_GUIDE.md](./PASSWORD_RESET_VISUAL_GUIDE.md) - Visual diagrams
- [SMS_INTEGRATION_GUIDE.md](./SMS_INTEGRATION_GUIDE.md) - SMS setup details

---

**Status:** ✅ ACTIVATED AND READY
**Date:** November 8, 2025
**Version:** 2.0
