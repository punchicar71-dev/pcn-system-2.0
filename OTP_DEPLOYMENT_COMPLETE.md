# ✅ OTP Send Feature - Deployment Complete

## 🎉 Successfully Completed Steps

### ✅ 1. Supabase CLI Installed
```bash
✓ Installed Supabase CLI v2.54.11
✓ Location: /opt/homebrew/Cellar/supabase/2.54.11
```

### ✅ 2. Authenticated with Supabase
```bash
✓ Logged into Supabase successfully
✓ Session active
```

### ✅ 3. Project Linked
```bash
✓ Project Reference: wnorajpknqegnnmeotjf
✓ Project URL: https://wnorajpknqegnnmeotjf.supabase.co
✓ Successfully linked to remote database
```

### ✅ 4. Environment Secrets Configured
All required secrets have been set:

| Secret Name | Status | Description |
|------------|--------|-------------|
| ✅ TEXTLK_API_TOKEN | Set | Text.lk API authentication token |
| ✅ TEXTLK_API_URL | Set | Text.lk API endpoint URL |
| ✅ TEXTLK_SENDER_ID | Set | SMS sender ID (TextLK) |
| ✅ SUPABASE_URL | Auto | Automatically provided by Supabase |
| ✅ SUPABASE_ANON_KEY | Auto | Automatically provided by Supabase |
| ✅ SUPABASE_SERVICE_ROLE_KEY | Auto | Automatically provided by Supabase |

### ✅ 5. Edge Function Deployed
```bash
✓ Function Name: send-sms-otp
✓ Status: ACTIVE
✓ Version: 1
✓ Deployment Time: 2025-11-08 03:41:03 UTC
✓ Function ID: 5c9cd9a0-d879-4ae3-8fda-024ae4d24906
```

**Dashboard URL:**
https://supabase.com/dashboard/project/wnorajpknqegnnmeotjf/functions

---

## 🧪 Testing the OTP Feature

### Step 1: Ensure Database Table Exists

The `phone_verification_otps` table needs to be created. Run this migration:

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard/project/wnorajpknqegnnmeotjf/editor
2. Open SQL Editor
3. Copy the contents of: `dashboard/migrations/2025_11_08_add_phone_verification_otps.sql`
4. Paste and run the SQL

**Option B: Via SQL Editor URL**

1. Navigate to: https://supabase.com/dashboard/project/wnorajpknqegnnmeotjf/sql/new
2. Paste the migration SQL
3. Click "Run"

### Step 2: Test in User Management UI

1. **Open Dashboard:**
   ```bash
   # Make sure your dashboard is running
   cd dashboard
   npm run dev
   ```

2. **Go to User Management:**
   - Navigate to: http://localhost:3001/user-management

3. **Test OTP Send:**
   - Click "View Details" on any user with a mobile number
   - Look for the "Mobile Number Verification" section
   - Click "Send Verification Code" button
   - You should see: "OTP code sent to your mobile number. Please check your SMS."

4. **Verify OTP:**
   - Check your mobile phone for the SMS
   - Enter the 6-digit code
   - Click "Verify Code"
   - Phone should be marked as verified ✓

---

## 🔍 Troubleshooting

### Check Function Logs

To see real-time logs from the edge function:

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/wnorajpknqegnnmeotjf/functions
2. Click on "send-sms-otp"
3. View the "Invocations" and "Logs" tabs

### Common Issues

#### 1. "Failed to send OTP" Error

**Possible Causes:**
- Database table doesn't exist → Run migration
- Text.lk API credentials invalid → Check with Text.lk
- No SMS credits → Add credits to Text.lk account

**Solution:**
- Run the migration SQL (see Step 1 above)
- Verify Text.lk account at: https://app.text.lk

#### 2. "Invalid phone number format" Error

**Cause:** Phone number not in correct Sri Lankan format

**Solution:** Use format:
- `0771234567` (local)
- `94771234567` (international)
- `+94771234567` (international with +)

#### 3. SMS Not Received

**Check:**
1. Text.lk account has SMS credits
2. Phone number is a valid Sri Lankan mobile number (starts with 07)
3. Check Text.lk dashboard for delivery status
4. Check spam/junk messages

#### 4. "Table phone_verification_otps does not exist"

**Solution:** Run the migration SQL in Supabase Dashboard SQL Editor

---

## 📊 Monitor Function Performance

### View Function Metrics:
https://supabase.com/dashboard/project/wnorajpknqegnnmeotjf/functions/send-sms-otp/metrics

This shows:
- Total invocations
- Success rate
- Average execution time
- Error rate

### View Function Logs:
https://supabase.com/dashboard/project/wnorajpknqegnnmeotjf/functions/send-sms-otp/logs

This shows:
- Request details
- Response details
- Error messages
- Execution time

---

## 🔄 Next Steps

### 1. Run Database Migration

**Go to SQL Editor:**
https://supabase.com/dashboard/project/wnorajpknqegnnmeotjf/sql/new

**Run this SQL:**
```sql
-- Copy contents from: dashboard/migrations/2025_11_08_add_phone_verification_otps.sql
```

### 2. Verify Text.lk Account

1. Login to https://app.text.lk
2. Check API credentials are active
3. Verify SMS credits available
4. Check sender ID approval status

### 3. Test the Feature

1. Start dashboard: `cd dashboard && npm run dev`
2. Go to User Management
3. Test OTP send and verify flow

### 4. Monitor for Issues

- Watch function logs during testing
- Check SMS delivery in Text.lk dashboard
- Verify database records are being created

---

## 📋 Quick Reference Commands

```bash
# Check function status
cd dashboard
supabase functions list

# View secrets (shows hashes only for security)
supabase secrets list

# Redeploy function if needed
supabase functions deploy send-sms-otp

# Check Supabase status
supabase status
```

---

## ✅ Deployment Verification Checklist

- [x] Supabase CLI installed
- [x] Authenticated with Supabase
- [x] Project linked (wnorajpknqegnnmeotjf)
- [x] Environment secrets configured
- [x] Edge function deployed successfully
- [x] Function status: ACTIVE
- [ ] Database migration run (phone_verification_otps table)
- [ ] Text.lk account verified and has credits
- [ ] OTP send tested in UI
- [ ] SMS received successfully
- [ ] OTP verification tested

---

## 🎯 Success Criteria

When everything is working correctly:

1. ✅ Click "Send Verification Code" → Success message appears
2. ✅ SMS arrives on mobile within 10-30 seconds
3. ✅ SMS contains 6-digit code
4. ✅ Enter code and click "Verify Code" → Success
5. ✅ User's phone shows as verified in UI
6. ✅ No errors in function logs or console

---

## 📞 Support Resources

**Text.lk:**
- Dashboard: https://app.text.lk
- Support: Check their website for contact details

**Supabase:**
- Dashboard: https://supabase.com/dashboard/project/wnorajpknqegnnmeotjf
- Docs: https://supabase.com/docs/guides/functions
- Community: https://github.com/supabase/supabase/discussions

---

## 🎉 Summary

The OTP sending infrastructure is now **fully deployed and configured**. The only remaining step is to:

1. **Run the database migration** to create the `phone_verification_otps` table
2. **Test the feature** in the User Management UI

After these steps, users will be able to verify their phone numbers via SMS OTP!
