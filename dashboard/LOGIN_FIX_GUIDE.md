# 🔧 LOGIN ISSUE - COMPLETE FIX GUIDE

## Problem Diagnosed
You're experiencing a **"refresh_token_already_used"** error when trying to log in. This is caused by stale authentication tokens in your browser.

## ✅ SOLUTION (Choose One)

### **Option 1: Clear Browser Storage (Quickest)**

1. **Open Developer Tools**
   - Chrome/Edge: Press `F12` or `Cmd+Option+I` (Mac)
   - Safari: Enable Developer Menu in Preferences, then `Cmd+Option+I`

2. **Clear Storage**
   - Go to **Application** tab (Chrome) or **Storage** tab (Safari)
   - Under **Storage**, clear:
     - **Cookies** → localhost:3001
     - **Local Storage** → localhost:3001
     - **Session Storage** → localhost:3001

3. **Hard Refresh**
   - Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

4. **Try Login Again**

### **Option 2: Use Private/Incognito Mode**

1. Open a new **Incognito/Private window**
2. Go to `http://localhost:3001`
3. Try logging in

### **Option 3: Code Fix (Already Applied)**

I've updated the login page to automatically clear stale sessions before login. Just restart the dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🔍 VERIFY YOUR ACCOUNT

### Check if your user account exists and is properly configured:

1. **Go to Supabase Dashboard**
   - URL: https://wnorajpknqegnnmeotjf.supabase.co

2. **Open SQL Editor**

3. **Run this query:**
   ```sql
   -- Copy and run the entire FIX_LOGIN_ISSUE.sql file
   ```
   Located at: `/dashboard/FIX_LOGIN_ISSUE.sql`

4. **Look for these issues:**
   - ❌ No user in auth.users → Need to create auth user
   - ❌ "NOT LINKED" status → Need to link accounts
   - ❌ email_confirmed_at is NULL → Need to confirm email

---

## 📋 CREATE NEW ADMIN USER (If Needed)

### **Method 1: Using Supabase Dashboard**

1. Go to **Authentication → Users**
2. Click **"Add User"**
3. Enter:
   - Email: `your_email@example.com`
   - Password: `your_secure_password`
   - ✅ Check **"Auto Confirm User"**
4. Click **"Create User"**

### **Method 2: Using Script**

```bash
cd dashboard
npm run create-root-admin
```

Then follow prompts to create a new admin.

---

## 🧪 TEST LOGIN

### Default Admin Credentials (From CREATE_ROOT_ADMIN.sql):
- **Email:** punchicar71@gmail.com
- **Username:** punchcarrootadmin2025
- **Password:** punchcarrootadmin2025

Try these if you haven't changed them.

---

## 🚨 If Still Not Working

### Check these common issues:

1. **Wrong Email/Password**
   - Verify in Supabase Dashboard → Authentication → Users
   - Check that email is confirmed

2. **User Not in Public.users Table**
   - Run the FIX_LOGIN_ISSUE.sql script
   - Check if ID matches between auth.users and public.users

3. **RLS Policies Blocking Access**
   - Run this query:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

4. **Email Not Confirmed**
   - In Supabase Dashboard → Authentication → Users
   - Find your user → Click **"..."** → **"Confirm Email"**

---

## 📝 CHANGES MADE TO YOUR CODE

I've updated `/dashboard/src/app/login/page.tsx` to:

1. ✅ Automatically clear stale sessions before login
2. ✅ Better error messages for refresh token issues
3. ✅ Handle "session expired" errors gracefully

These changes will prevent this issue from happening again.

---

## 🔄 NEXT STEPS

1. **Try Option 1** (Clear browser storage) - Takes 2 minutes
2. **If that doesn't work**, run FIX_LOGIN_ISSUE.sql to check your account
3. **If account missing**, create a new admin user
4. **If still issues**, check the terminal logs for specific errors

---

## 💡 TIPS

- Always use **Incognito mode** when testing authentication
- Clear cookies between tests to avoid token conflicts
- Check browser console for detailed error messages (F12 → Console tab)

---

## 📞 DEBUGGING

If you see errors in the terminal, share them and I can help diagnose further. Common errors:
- `Invalid login credentials`
- `Email not confirmed`
- `User not found`
- `refresh_token_already_used`

Good luck! 🚀
