# Web Application Deployment Fix - Railway

## Issue Fixed
**Error**: `Error: supabaseUrl is required` during build process on Railway

## Root Cause
The Supabase client was being initialized during the build phase without environment variables being available, causing the build to fail when Next.js tried to collect page data.

## Changes Made

### 1. Updated Supabase Client (`web/src/lib/supabase.ts`)
- Changed from non-null assertions (`!`) to optional defaults
- Added warning message when env vars are missing
- Allows build to complete even without env vars (they're added at runtime)

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Client will not work properly.')
}
```

### 2. Updated All API Routes
Added runtime environment checks and dynamic route configuration to:
- `web/src/app/api/brands/route.ts`
- `web/src/app/api/vehicles/route.ts`
- `web/src/app/api/vehicles/[id]/route.ts`
- `web/src/app/api/countries/route.ts`

Each route now:
- Exports `dynamic = 'force-dynamic'` to prevent static optimization during build
- Checks for env vars at runtime before making Supabase calls
- Returns proper error responses if env vars are missing

### 3. Created Railway Configuration
Created `web/railway.json` for Railway-specific deployment settings.

## Required Environment Variables on Railway

You MUST set these environment variables in your Railway project:

### Web Service Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_api_service_url
NEXT_PUBLIC_APP_URL=your_web_service_url
NEXT_PUBLIC_COMPANY_NAME=Punchi Car Niwasa
NEXT_PUBLIC_COMPANY_EMAIL=sales@punchicar.lk
NEXT_PUBLIC_COMPANY_PHONE=0112 413 865
```

## Deployment Steps on Railway

### Step 1: Set Environment Variables
1. Go to your Railway project
2. Select the **Web** service
3. Click on **Variables** tab
4. Add all the environment variables listed above
5. Make sure to use your actual Supabase URL and anon key

### Step 2: Get Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Deploy
1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "fix: Handle missing Supabase env vars during build"
   git push origin main
   ```

2. Railway will automatically trigger a new deployment
3. Monitor the build logs to ensure it completes successfully

### Step 4: Verify Deployment
1. Once deployed, visit your web service URL
2. Check that the homepage loads correctly
3. Test API endpoints:
   - `/api/brands` - Should return brands
   - `/api/vehicles` - Should return vehicles
   - `/api/countries` - Should return countries

## Testing Locally

To test these changes locally:

```bash
# Navigate to web directory
cd "/Users/asankaherath/Projects/PCN System . 2.0 /web"

# Ensure .env.local exists with proper values
cat .env.local

# Install dependencies if needed
npm install

# Build the application
npm run build

# Start the production server
npm run start

# Visit http://localhost:3000
```

## Troubleshooting

### Build Still Failing?
1. **Check Railway Logs**: Look for the specific error message
2. **Verify Env Vars**: Ensure all `NEXT_PUBLIC_*` variables are set
3. **Check Supabase**: Verify your Supabase project is active and accessible

### Runtime Errors?
1. **503 Service Unavailable**: Env vars not set properly in Railway
2. **Check Console**: Browser console will show Supabase warnings
3. **API Errors**: Check Railway service logs for detailed error messages

### Database Connection Issues?
1. Verify Supabase project URL is correct
2. Check that anon key has proper permissions
3. Ensure RLS (Row Level Security) policies allow read access

## Files Modified

1. ✅ `web/src/lib/supabase.ts` - Safe env var handling
2. ✅ `web/src/app/api/brands/route.ts` - Runtime env check
3. ✅ `web/src/app/api/vehicles/route.ts` - Runtime env check
4. ✅ `web/src/app/api/vehicles/[id]/route.ts` - Runtime env check
5. ✅ `web/src/app/api/countries/route.ts` - Runtime env check
6. ✅ `web/railway.json` - Railway deployment config (NEW)

## Next Steps

1. ✅ Set all environment variables in Railway
2. ✅ Push changes to GitHub
3. ✅ Monitor Railway deployment
4. ✅ Test the deployed application
5. ✅ Update other services if needed (dashboard, api)

## Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Regular env vars are only available server-side
- Railway automatically rebuilds when you push to the connected branch
- Build logs show detailed information about what's happening during build

---

**Status**: ✅ Ready for deployment  
**Date**: December 14, 2025  
**Tested**: Locally ✅ | Railway: Pending deployment
