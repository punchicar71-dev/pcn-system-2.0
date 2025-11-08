# 🔧 Fix OTP Send Failure - Step by Step

## 🔴 Problem
The "Failed to send OTP" error occurs because the Supabase Edge Function hasn't been deployed and environment secrets aren't configured.

## ✅ Solution: Deploy Edge Function & Configure Secrets

### Step 1: Install Supabase CLI

```bash
# Install Supabase CLI
brew install supabase/tap/supabase
```

### Step 2: Login to Supabase

```bash
# Login to your Supabase account
supabase login
```

This will open a browser window to authenticate.

### Step 3: Link Your Project

```bash
cd dashboard
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your PROJECT_REF:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
4. Copy the project reference ID

### Step 4: Set Environment Secrets

```bash
# Set the Text.lk API credentials
supabase secrets set TEXTLK_API_TOKEN="2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169"
supabase secrets set TEXTLK_API_URL="https://app.text.lk/api/v3/sms/send"
supabase secrets set TEXTLK_SENDER_ID="TextLK"

# Set Supabase credentials (get from your .env.local file)
supabase secrets set SUPABASE_URL="$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)"
supabase secrets set SUPABASE_ANON_KEY="$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)"
```

### Step 5: Deploy the Edge Function

```bash
# Deploy the send-sms-otp function
supabase functions deploy send-sms-otp
```

### Step 6: Verify Deployment

```bash
# Check function status
supabase functions list

# Check function logs
supabase functions logs send-sms-otp
```

### Step 7: Test the OTP Feature

1. Open your dashboard at http://localhost:3001
2. Go to **User Management**
3. Click **"View Details"** on a user with a mobile number
4. Click **"Send Verification Code"**
5. Check if SMS is sent successfully

---

## 🔍 Troubleshooting

### If you get "User not found for API token" error:

**The Text.lk API credentials may need verification:**

1. **Login to Text.lk:**
   - Go to https://app.text.lk
   - Login with your account

2. **Verify API Access:**
   - Navigate to API/Developer Settings
   - Check if API access is enabled
   - Verify you have SMS credits

3. **Get Correct API Token:**
   - Copy your API token from the dashboard
   - Update the secret:
   ```bash
   supabase secrets set TEXTLK_API_TOKEN="YOUR_NEW_TOKEN"
   ```

4. **Contact Text.lk Support:**
   - Email: support@text.lk (or check their website)
   - Ask for: "API documentation and credentials verification"

### If Edge Function deployment fails:

**Check you're logged in:**
```bash
supabase status
```

**Re-authenticate if needed:**
```bash
supabase logout
supabase login
```

### If OTP still doesn't send:

**Check the function logs for detailed errors:**
```bash
supabase functions logs send-sms-otp --tail
```

Then test again in the UI and watch the logs in real-time.

---

## 📋 Quick Command Reference

```bash
# Install CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link project
cd dashboard
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set TEXTLK_API_TOKEN="2063|IdMDgC2QbCWqQvghUd1vFVToO5hcvius5M2jT8aL49de4169"
supabase secrets set TEXTLK_API_URL="https://app.text.lk/api/v3/sms/send"

# Deploy function
supabase functions deploy send-sms-otp

# Check logs
supabase functions logs send-sms-otp --tail
```

---

## ✅ Verification Checklist

- [ ] Supabase CLI installed
- [ ] Logged into Supabase
- [ ] Project linked
- [ ] Secrets configured (TEXTLK_API_TOKEN, TEXTLK_API_URL)
- [ ] Edge function deployed
- [ ] Function appears in `supabase functions list`
- [ ] Test OTP send in UI
- [ ] SMS received on mobile

---

## 🎯 Expected Result

After completing these steps:
1. Click "Send Verification Code" in User Details modal
2. You should see: "OTP code sent to your mobile number. Please check your SMS."
3. SMS should arrive within seconds with a 6-digit code
4. Enter the code and click "Verify Code"
5. Phone number should be marked as verified ✅

---

## 📞 Need Help?

**Text.lk Support:**
- Website: https://www.text.lk
- Check their documentation for API setup

**Supabase Support:**
- Docs: https://supabase.com/docs/guides/functions
- Community: https://github.com/supabase/supabase/discussions

**Common Issues:**
1. **API Token Invalid** → Verify credentials with Text.lk
2. **Function not found** → Make sure deployment succeeded
3. **No SMS received** → Check Text.lk account has credits
4. **Permission denied** → Check Supabase project permissions
