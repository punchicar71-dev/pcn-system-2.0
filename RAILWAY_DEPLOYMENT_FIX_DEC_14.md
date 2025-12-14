# Railway Deployment Fix - December 14, 2025

## 🐛 Issues Identified

### 1. **Dashboard & Web Applications Failing to Respond**
   - **Symptom**: "Application failed to respond" error in Railway
   - **Root Cause**: Client-side code throwing errors during SSR/build phase when environment variables are missing
   - **Location**: `dashboard/src/lib/supabase-client.ts`

### 2. **Server Not Binding to Correct Network Interface**
   - **Symptom**: Applications start but Railway can't route traffic to them
   - **Root Cause**: Next.js standalone server needs explicit `HOSTNAME=0.0.0.0` to listen on all network interfaces
   - **Default Behavior**: Next.js binds to `localhost` which is not accessible from Railway's load balancer

## ✅ Fixes Applied

### 1. **Fixed Supabase Client Initialization** 
   **File**: `dashboard/src/lib/supabase-client.ts`
   
   **Changes**:
   - Removed `throw new Error()` that crashed during SSR/build
   - Added `typeof window === 'undefined'` check to differentiate SSR from browser
   - Use fallback empty strings instead of throwing errors
   - Only warn in console during SSR, only error in browser console
   
   **Impact**: Application can now build and start even if env vars are temporarily missing

### 2. **Added Production Start Commands**
   **Files Modified**:
   - `dashboard/package.json` → Added `start:prod` script
   - `web/package.json` → Added `start:prod` script
   
   **Changes**:
   ```json
   "start:prod": "HOSTNAME=0.0.0.0 node .next/standalone/[service]/server.js"
   ```
   
   **Impact**: Next.js server now listens on `0.0.0.0` (all interfaces) instead of `127.0.0.1`

### 3. **Created Railway Configuration Files**
   **Files Created**:
   - `dashboard/railway.json`
   - `web/railway.json` (updated)
   
   **Configuration**:
   ```json
   {
     "deploy": {
       "startCommand": "npm run start:prod --workspace=pcn-[service]"
     }
   }
   ```
   
   **Impact**: Railway now uses the correct startup command with proper hostname binding

## 📋 Required Environment Variables

### Dashboard Service
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_API_URL=https://pcn-api-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://pcn-dashboard-production.up.railway.app
```

### Web Service
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
NEXT_PUBLIC_API_URL=https://pcn-api-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://pcn-web-production.up.railway.app
NEXT_PUBLIC_COMPANY_NAME=Punchi Car Niwasa
NEXT_PUBLIC_COMPANY_EMAIL=sales@punchicar.lk
NEXT_PUBLIC_COMPANY_PHONE=0112 413 865
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_CLOUDFRONT_URL=your_cloudfront_url
JWT_SECRET=your_jwt_secret
TEXTLK_API_URL=https://app.text.lk/api/v3/sms/send
TEXTLK_API_TOKEN=your_token
TEXTLK_SENDER_ID=Punchi Car
```

### API Service
(Should already be working - no changes needed)

## 🚀 Deployment Steps

### Step 1: Verify Environment Variables in Railway

For each service (Dashboard, Web):

1. Go to Railway Dashboard
2. Select the service
3. Click "Variables" tab
4. Verify ALL required environment variables are set (see lists above)
5. **Important**: Make sure there are NO typos in variable names

### Step 2: Commit and Push Changes

```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0 "
git add .
git commit -m "fix: Railway deployment - handle missing env vars and bind to 0.0.0.0"
git push origin main
```

### Step 3: Monitor Deployment

1. Watch Railway dashboard for automatic deployment
2. Check build logs - should complete successfully
3. Check deploy logs - should show services starting

### Step 4: Verify Services

**API** (should already work):
```bash
curl https://pcn-api-production.up.railway.app
```

**Dashboard**:
```bash
curl https://pcn-dashboard-production.up.railway.app
```

**Web**:
```bash
curl https://pcn-web-production.up.railway.app
```

All should return HTML content, not error pages.

## 🔍 Troubleshooting

### Issue: Still seeing "Application failed to respond"

**Possible Causes**:
1. Environment variables not set in Railway
2. Incorrect environment variable names (check spelling!)
3. Code not deployed yet (check Railway deployment status)

**Solutions**:
1. Double-check ALL environment variables in Railway dashboard
2. Verify variable names match exactly (case-sensitive!)
3. Trigger manual redeploy in Railway if needed
4. Check Railway logs for specific errors

### Issue: Build succeeds but deployment fails

**Check**:
1. Railway logs for error messages
2. `npm run start:prod` command is being used
3. PORT environment variable is set by Railway (automatic)
4. HOSTNAME is set to 0.0.0.0 (in start:prod script)

### Issue: Database/Supabase connection errors

**Verify**:
1. Supabase URL is correct (no trailing slash)
2. Supabase anon key is valid
3. Supabase service role key is valid (for dashboard)
4. Supabase project is not paused

## 📊 Expected Behavior After Fix

### Build Phase
- ✅ All three services build successfully
- ✅ No "Missing Supabase environment variables" errors during build
- ✅ TypeScript compilation succeeds
- ✅ Next.js optimization completes

### Deploy Phase  
- ✅ Services start and show "ready" message
- ✅ Health checks pass
- ✅ Railway routes traffic successfully
- ✅ Applications respond to HTTP requests

### Runtime
- ✅ Homepage loads without errors
- ✅ API endpoints return data
- ✅ Database connections work
- ✅ Image uploads function (if S3 configured)

## 📝 Files Changed

1. `dashboard/src/lib/supabase-client.ts` - Fixed env var validation
2. `dashboard/package.json` - Added `start:prod` script
3. `dashboard/railway.json` - Created Railway config
4. `web/package.json` - Added `start:prod` script  
5. `web/railway.json` - Updated start command
6. `RAILWAY_DEPLOYMENT_FIX_DEC_14.md` - This document

## ⚠️ Important Notes

1. **Environment Variables**: The fixes allow apps to START without env vars, but they won't WORK properly without them. Always set all required variables in Railway.

2. **Hostname Binding**: `HOSTNAME=0.0.0.0` is crucial for Railway. Without it, Next.js binds to localhost and Railway can't reach it.

3. **Separate Start Commands**: We use `start:prod` for Railway deployment and keep `start` for local development.

4. **No Code Changes Required**: After this deployment, no code changes needed - just ensure env vars are set in Railway.

## 🎯 Success Criteria

All three checkmarks should be green in Railway:
- ✅ Build successful
- ✅ Deploy successful  
- ✅ Health check passing

And accessing the URLs should show the applications, not error pages.
