# Railway Deployment Checklist - Web Application

## ✅ Pre-Deployment (Completed)

- [x] Fixed Supabase client initialization to handle missing env vars
- [x] Added runtime checks to all API routes
- [x] Added `dynamic = 'force-dynamic'` to prevent static optimization issues
- [x] Created Railway configuration file
- [x] Tested build locally - ✅ SUCCESS
- [x] No TypeScript errors in modified files
- [x] Created comprehensive deployment documentation

## 📋 Railway Deployment Steps

### 1. Set Environment Variables in Railway

Go to your Railway project → Web service → Variables tab and add:

```env
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
NEXT_PUBLIC_API_URL=<your_railway_api_url>
NEXT_PUBLIC_APP_URL=<your_railway_web_url>
NEXT_PUBLIC_COMPANY_NAME=Punchi Car Niwasa
NEXT_PUBLIC_COMPANY_EMAIL=sales@punchicar.lk
NEXT_PUBLIC_COMPANY_PHONE=0112 413 865
```

### 2. Get Supabase Credentials

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Deploy to Railway

```bash
# Commit and push changes
git add .
git commit -m "fix: Handle missing Supabase env vars during Railway build"
git push origin main
```

Railway will automatically:
- Detect the changes
- Start a new build
- Deploy when build completes

### 4. Monitor Deployment

1. Watch the build logs in Railway dashboard
2. Look for successful build completion
3. Check deployment status

### 5. Verify Deployment

Once deployed, test these endpoints:

- Homepage: `https://your-web-url.railway.app/`
- Brands API: `https://your-web-url.railway.app/api/brands`
- Vehicles API: `https://your-web-url.railway.app/api/vehicles`
- Countries API: `https://your-web-url.railway.app/api/countries`
- Vehicle Details: `https://your-web-url.railway.app/vehicles`

## 🔍 What Changed

### Files Modified:
1. `web/src/lib/supabase.ts` - Safe env var handling with fallbacks
2. `web/src/app/api/brands/route.ts` - Runtime env check + dynamic export
3. `web/src/app/api/vehicles/route.ts` - Dynamic export
4. `web/src/app/api/vehicles/[id]/route.ts` - Runtime env check + dynamic export
5. `web/src/app/api/countries/route.ts` - Runtime env check + dynamic export

### Files Created:
1. `web/railway.json` - Railway-specific configuration
2. `WEB_DEPLOYMENT_FIX.md` - Detailed fix documentation
3. `RAILWAY_DEPLOYMENT_CHECKLIST.md` - This checklist

## 🐛 Troubleshooting

### Build Fails with Same Error?
- Verify all `NEXT_PUBLIC_*` variables are set in Railway
- Check Railway logs for specific error
- Ensure you pushed the latest changes

### 503 Service Unavailable at Runtime?
- Environment variables not set in Railway
- Check Railway Variables tab
- Redeploy after adding variables

### Database Connection Errors?
- Verify Supabase URL is correct
- Check Supabase project is active
- Confirm anon key has read permissions

## 📊 Expected Build Output

```
✓ Compiled successfully
✓ Generating static pages (11/11)
✓ Finalizing page optimization
```

You should see API routes marked as `ƒ (Dynamic)`:
- ƒ /api/brands
- ƒ /api/countries  
- ƒ /api/vehicles
- ƒ /api/vehicles/[id]

## 🚀 Next Steps After Deployment

1. Test all pages and features
2. Check browser console for any warnings
3. Verify vehicle listings load correctly
4. Test search and filter functionality
5. Confirm brand logos display properly

## 📝 Notes

- Local build tested: ✅ SUCCESS
- No TypeScript errors: ✅ VERIFIED
- All API routes updated: ✅ COMPLETE
- Documentation created: ✅ DONE

---

**Ready to Deploy**: ✅ YES  
**Date**: December 14, 2025  
**Status**: All fixes applied and tested
