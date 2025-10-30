# Login Information & Troubleshooting

## Root Admin Credentials

**Email:** `punchicar71@gmail.com`  
**Username:** `punchcarrootadmin2025`  
**Password:** `punchcarrootadmin2025`

You can login with either the email or username.

---

## Login URLs

- **Dashboard Login:** http://localhost:3001/login
- **Clear Cache Page:** http://localhost:3001/clear-cookies

---

## Troubleshooting Authentication Issues

### Issue: "Invalid Refresh Token: Already Used" Error

This error occurs when there are conflicting session tokens in your browser. Here's how to fix it:

#### Solution 1: Clear Cache via Browser (Quick Fix)
1. Visit: http://localhost:3001/clear-cookies
2. Wait for automatic redirect
3. Try logging in again

#### Solution 2: Manual Browser Cache Clear
1. Open DevTools (F12 or Cmd+Option+I on Mac)
2. Go to Application/Storage tab
3. Clear:
   - Local Storage
   - Session Storage
   - Cookies (especially `sb-access-token` and `sb-refresh-token`)
4. Refresh the page
5. Try logging in again

#### Solution 3: Recreate Admin User
If the above solutions don't work, recreate the admin user:

```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"
node scripts/create-root-admin.js
```

### Issue: Cannot Login with Correct Credentials

**Possible Causes:**
1. **Stale session tokens** - Use clear cache page
2. **Database connection issue** - Check Supabase URL and keys in `.env.local`
3. **User not confirmed** - The script auto-confirms, but you can verify in Supabase dashboard

**Steps to Resolve:**
1. Clear browser cache using the clear-cookies page
2. Verify environment variables in `dashboard/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://wnorajpknqegnnmeotjf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Check the terminal logs for specific error messages
4. Try logging in with the email instead of username (or vice versa)

### Issue: Redirect Loop or Continuous Redirects

This happens when session state is inconsistent.

**Fix:**
1. Visit http://localhost:3001/clear-cookies
2. Let it complete the clearing process
3. Go directly to http://localhost:3001/login
4. Login with credentials

---

## Testing Login Flow

### Test Steps:
1. **Clear any existing session:**
   ```
   Visit: http://localhost:3001/clear-cookies
   ```

2. **Navigate to login:**
   ```
   Visit: http://localhost:3001/login
   ```

3. **Enter credentials:**
   - Email/Username: `punchicar71@gmail.com` OR `punchcarrootadmin2025`
   - Password: `punchcarrootadmin2025`

4. **Check console logs:**
   - Open Browser DevTools (F12)
   - Look for:
     - "Login attempt with: ..."
     - "Login successful! Session: ..."
     - "Session set on server successfully!"
     - "Redirecting to dashboard..."

5. **Expected result:**
   - Redirect to http://localhost:3001/dashboard
   - See dashboard content

---

## Recent Fixes Applied

### 1. Updated Supabase Client Configuration
- Added proper auth persistence settings
- Enabled auto token refresh
- Configured localStorage for session storage

**File:** `dashboard/src/lib/supabase-client.ts`

### 2. Enhanced Error Handling
- Better error messages for common issues
- Added "Clear Cache & Retry" button when session errors occur

**File:** `dashboard/src/app/login/page.tsx`

### 3. Session Management
- Proper session clearing before new login attempts
- Server-side session validation in middleware

---

## Database Check

To verify the admin user exists in the database:

```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"
node scripts/create-root-admin.js
```

This will either create or update the admin user and confirm it's ready to use.

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Invalid Refresh Token: Already Used" | Stale session tokens | Clear cache page |
| "Invalid email/username or password" | Wrong credentials OR user lookup failed | Verify credentials, check database |
| "Session expired" | Token has expired | Clear cache and login again |
| "Network error" | Cannot connect to Supabase | Check internet, verify Supabase URL |
| "Failed to complete login" | Server-side session set failed | Check API logs, verify env variables |

---

## Still Having Issues?

1. **Check server logs** in the terminal where you ran `npm run dev`
2. **Check browser console** (F12 → Console tab)
3. **Verify Supabase is accessible** by visiting your Supabase dashboard
4. **Ensure all services are running:**
   - Dashboard: http://localhost:3001
   - Web: http://localhost:3000
   - API: http://localhost:4000

---

## Quick Command Reference

```bash
# Start all services
cd "/Users/asankaherath/Projects/PCN System . 2.0"
npm run dev

# Recreate admin user
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"
node scripts/create-root-admin.js

# Clear browser cache (visit in browser)
http://localhost:3001/clear-cookies
```
