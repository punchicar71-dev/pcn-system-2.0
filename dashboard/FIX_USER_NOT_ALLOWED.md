# 🚨 FIX: "User not allowed" Error

## Problem
Getting error: **"Failed to create auth user: User not allowed"**

This happens because Supabase has email confirmation enabled and/or signup restrictions.

---

## ✅ QUICK FIX (2 minutes)

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project: **wnorajpknqegnnmeotjf**
3. Navigate to: **Authentication** → **Providers** → **Email**

### Step 2: Enable Email Provider Settings

Make sure these settings are configured:

1. **Enable Email provider**: ✅ ON
2. **Confirm email**: ⬜ OFF (or enable auto-confirm)
3. **Secure email change**: ✅ ON (optional)

### Step 3: Configure Auth Settings

1. Go to: **Authentication** → **Settings**
2. Scroll to **User Signups**
3. Make sure: **Enable email signups** is ✅ ON

### Step 4: Disable Email Confirmation (Recommended for Internal System)

1. Go to: **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Find: **Enable email confirmations**
4. Set to: ⬜ OFF (since this is an internal system)

**OR** if you want confirmations enabled:

Keep it ON, but our code already has `email_confirm: true` which auto-confirms.

---

## 🔄 Alternative: Use Different Auth Method

If the above doesn't work, we can modify the code to use a different approach:

### Option A: Create user without requiring confirmation

The code already tries this with `email_confirm: true`, but if it's still blocked, check:

1. **Site URL** is set correctly:
   - Go to: **Authentication** → **URL Configuration**
   - Site URL: `http://localhost:3001`
   - Add to Redirect URLs: `http://localhost:3001/**`

### Option B: Check Rate Limiting

Supabase may be rate limiting:
1. Go to: **Authentication** → **Rate Limits**
2. Check if you've hit limits
3. Wait a few minutes and try again

---

## 🧪 Test After Fixing

1. After changing settings in Supabase
2. Wait 30 seconds for changes to propagate
3. Try creating a user again
4. Should work!

---

## 📊 Common Causes

| Issue | Solution |
|-------|----------|
| Email confirmation required | Disable in Auth → Settings |
| Email provider disabled | Enable in Auth → Providers → Email |
| Site URL not set | Add `http://localhost:3001` |
| Rate limiting | Wait and retry |
| Wrong permissions | Using service role key (already fixed in code) |

---

## ✅ Verify Settings

Your correct settings should be:

```
Authentication → Providers → Email
├─ Enable Email provider: ✅ ON
├─ Confirm email: ⬜ OFF (for internal system)
└─ Autoconfirm email: ✅ ON (optional)

Authentication → Settings
├─ Enable email signups: ✅ ON
├─ Enable email confirmations: ⬜ OFF
└─ Site URL: http://localhost:3001
```

---

## 🚀 After Fix

Once you've updated Supabase settings:

1. Refresh your browser
2. Try creating a user again
3. Should work! ✅

The error will disappear and users will be created successfully.
