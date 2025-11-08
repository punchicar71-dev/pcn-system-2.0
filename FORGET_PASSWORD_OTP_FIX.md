# 🔧 Forget Password OTP Issue - FIXED

## Problem Identified
The "Failed to generate OTP" error on the forget password page was caused by a foreign key constraint violation.

### Root Cause
- The `password_reset_otps` table has a foreign key constraint on `user_id` that references `auth.users.id`
- However, the `user_id` from the `public.users` table (where system users are stored) doesn't exist in `auth.users`
- This caused the OTP insertion to fail with error code `23503` (FK constraint violation)

**Error Message:**
```
insert or update on table "password_reset_otps" violates foreign key constraint 
"password_reset_otps_user_id_fkey"
Key (user_id)=(5a3df51e-1e35-4f8b-8009-0e90b3c94f23) is not present in table "users".
```

## Solution Applied
Modified three API routes to work around the FK constraint issue:

### 1. **send-otp/route.ts** ✅
- **Change**: Set `user_id: null` instead of `user_id: userData.id`
- **Why**: Avoids FK constraint since OTP is temporary and user was already validated by looking up their mobile number
- **Lines Modified**: 86-90

```typescript
// Before:
user_id: userData.id,  // ❌ Causes FK constraint violation

// After:
user_id: null,  // ✅ Works around FK issue
```

### 2. **verify-otp/route.ts** ✅
- **Change**: Look up user by mobile number to get `auth_id` for JWT token
- **Why**: Since `user_id` is now null in the OTP record, we need another way to get the `auth_id`
- **Lines Modified**: 85-104

```typescript
// Added:
// Get user info from the users table
const { data: user, error: userError } = await supabaseAdmin
  .from('users')
  .select('id, auth_id')
  .in('mobile_number', phoneVariants)
  .single()

// Then use user.auth_id in the JWT token:
const resetToken = jwt.sign({
  userId: user.id,
  authId: user.auth_id,  // ✅ Store auth_id in token
  mobileNumber: formattedPhone,
  otpId: otpRecord.id,
  type: 'password_reset'
}, ...)
```

### 3. **reset-password/route.ts** ✅
- **Change**: Updated interface and logic to use `authId` from JWT token
- **Why**: Already have the `auth_id` from the token, no need to look it up again
- **Lines Modified**: 18-58

```typescript
// Before:
interface ResetTokenPayload {
  userId: string
  mobileNumber: string
  otpId: string
  type: string
}

// After:
interface ResetTokenPayload {
  userId: string
  authId: string  // ✅ Now includes auth_id
  mobileNumber: string
  otpId: string
  type: string
}

// Use authId from token with fallback lookup:
let authId = decoded.authId
if (!authId && decoded.userId) {
  // Fallback: look it up if not in token
}
```

## How the Flow Now Works

```
1. Forget Password Page
   ↓
2. User enters mobile number
   ↓
3. API: /api/auth/send-otp
   ✅ Finds user by mobile number
   ✅ Generates OTP
   ✅ Stores in DB with user_id=null (FIXED)
   ✅ Sends SMS
   ✓ Returns success
   ↓
4. OTP Verification Page  
   ✓ User enters OTP code
   ↓
5. API: /api/auth/verify-otp
   ✅ Validates OTP
   ✅ Looks up user by mobile number (gets auth_id)
   ✅ Creates JWT with auth_id (FIXED)
   ✓ Returns token
   ↓
6. Change Password Page
   ✓ User enters new password
   ↓
7. API: /api/auth/reset-password
   ✅ Verifies JWT token (has auth_id)
   ✅ Updates password using auth_id (FIXED)
   ✅ Deletes used OTP
   ✓ Returns success
   ↓
8. Success Page
   ✓ Shows confirmation
```

## Files Modified
1. `/dashboard/src/app/api/auth/send-otp/route.ts`
2. `/dashboard/src/app/api/auth/verify-otp/route.ts`
3. `/dashboard/src/app/api/auth/reset-password/route.ts`

## Testing the Fix

### Quick Test Steps:
1. Open the application: http://localhost:3001
2. Click "Forget Password?" link on login page
3. Enter a registered mobile number (e.g., +94778895688)
4. Click "Send OTP"
5. ✅ Should see "OTP sent successfully" instead of "Failed to generate OTP"
6. Check SMS for OTP code
7. Enter OTP code
8. Enter new password
9. ✅ Password should be reset successfully

### API Testing (curl):
```bash
# Test send-otp
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "+94778895688"}'

# Expected response:
{
  "success": true,
  "message": "OTP sent successfully to your mobile number",
  "expiresIn": 300
}
```

## Why This Solution is Better Than Applying the Migration

The original migration `2025_11_08_fix_password_reset_otps_fk.sql` would have:
- Dropped the foreign key constraint entirely
- Required manual execution in Supabase SQL Editor
- Left the database schema misaligned with the original design

Our solution:
- ✅ Works with the current schema
- ✅ Requires no manual database changes
- ✅ Follows the principle that OTPs are temporary data
- ✅ Still validates users exist before creating OTPs
- ✅ Clean separation of concerns (user lookup vs OTP storage)

## Alternative: Apply the FK Constraint Removal

If you prefer to remove the FK constraint entirely, you can run this in Supabase SQL Editor:

```sql
-- Drop the foreign key constraint
ALTER TABLE password_reset_otps DROP CONSTRAINT password_reset_otps_user_id_fkey;

-- Add explanatory comment
COMMENT ON COLUMN password_reset_otps.user_id IS 'Reference to auth.users.id - not enforced as FK';
```

But the current solution (setting user_id=null) is cleaner and doesn't require that.

---

**Status**: ✅ FIXED - Forget password OTP flow is now working
**Date Fixed**: November 8, 2025
**Tested**: API endpoints return successful responses
**Ready**: For deployment
