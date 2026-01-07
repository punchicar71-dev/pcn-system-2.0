# Railway Deployment Guide - PCN System

## Architecture Overview

The PCN System is a **monorepo** with 3 separate services:
1. **API Service** (`/api`) - Backend API with S3 image uploads
2. **Dashboard Service** (`/dashboard`) - Admin management interface
3. **Web Service** (`/web`) - Public customer-facing website

## Problem You Were Experiencing

❌ **Issue**: Dashboard deployed on Railway showed "AWS S3 Not Configured"

🔍 **Root Cause**: 
- You deployed only the **Dashboard service** on Railway
- The Dashboard needs to connect to the **API service** for S3 uploads
- The **API service was NOT deployed** on Railway, so S3 config didn't work

## Solution: Deploy All 3 Services on Railway

### Step 1: Create API Service on Railway

1. Go to your Railway project: https://railway.app/dashboard
2. Click **"+ New"** → **"GitHub Repo"**
3. Select your repository: `punchicar71-dev/pcn-system-2.0`
4. Railway will detect the repo - Click **"Add Service"**
5. Name it: **`pcn-api`** or **`API`**

### Step 2: Configure API Service

1. Click on the **API service** you just created
2. Go to **Settings** tab
3. Set **Root Directory**: `/api`
4. Set **Build Command**: `npm ci && npm run build --workspace=pcn-api`
5. Set **Start Command**: `npm run start --workspace=pcn-api`

### Step 3: Add Environment Variables to API Service

Click **Variables** tab and add these:

#### Required AWS S3 Variables:
```
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key-here
AWS_S3_BUCKET_NAME=your-s3-bucket-name-here
AWS_CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net
```

> ⚠️ **Important**: Replace the placeholder values with your actual AWS credentials from your AWS Console.

#### Required Supabase Variables:
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
```

#### Required API Variables:
```
PORT=4000
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=*
```

#### Optional SMS Variables (if using):
```
TEXTLK_API_TOKEN=your-textlk-token
TEXTLK_SENDER_ID=your-sender-id
```

### Step 4: Get API Service URL

After the API service deploys:
1. Click on the **API service**
2. Go to **Settings** tab
3. Scroll to **Networking** section
4. Click **Generate Domain** if not already generated
5. Copy the URL (e.g., `https://pcn-api-production.up.railway.app`)

### Step 5: Update Dashboard Service

1. Click on your **Dashboard service**
2. Go to **Variables** tab
3. Add/Update this variable:

```
NEXT_PUBLIC_API_URL=https://pcn-api-production.up.railway.app
API_SERVER_URL=https://pcn-api-production.up.railway.app
```

**Important**: Replace `pcn-api-production.up.railway.app` with your actual API service URL from Step 4.

### Step 6: Deploy Web Service (Optional)

If you want to deploy the public website:

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Name it: **`pcn-web`**
4. Set **Root Directory**: `/web`
5. Set **Build Command**: `npm ci && npm run build --workspace=pcn-web`
6. Set **Start Command**: `npm run start --workspace=pcn-web`
7. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://pcn-api-production.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Final Railway Project Structure

Your Railway project should have **3 services**:

```
📦 PCN System (Railway Project)
├── 🔵 API Service
│   ├── Root: /api
│   ├── Port: 4000
│   ├── Domain: https://pcn-api-production.up.railway.app
│   └── Env: AWS_*, SUPABASE_*, JWT_SECRET, etc.
│
├── 🟢 Dashboard Service  
│   ├── Root: /dashboard
│   ├── Port: 3000
│   ├── Domain: https://app.punchicar.lk
│   └── Env: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_*
│
└── 🟡 Web Service (Optional)
    ├── Root: /web
    ├── Port: 3001
    ├── Domain: https://www.punchicar.lk
    └── Env: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_*
```

## Testing the Deployment

### 1. Test API Service
```bash
curl https://your-api-domain.railway.app/api/upload/status
```

Expected response:
```json
{
  "s3Configured": true,
  "message": "AWS S3 is properly configured"
}
```

### 2. Test Dashboard
1. Open your dashboard URL
2. Go to **Inventory**
3. Click on a vehicle
4. Click **Upload Images** button
5. The "AWS S3 Not Configured" error should be **GONE** ✅

### 3. Test Image Upload
1. Try uploading a vehicle image
2. It should upload successfully to S3
3. Image should appear in the gallery

## Troubleshooting

### Issue: Dashboard still shows "AWS S3 Not Configured"

**Solutions**:
1. ✅ Verify API service is deployed and running
2. ✅ Check `NEXT_PUBLIC_API_URL` in Dashboard service points to API service
3. ✅ Check API service has all AWS_* environment variables
4. ✅ Redeploy Dashboard service after updating `NEXT_PUBLIC_API_URL`

### Issue: CORS Error

**Solutions**:
1. Add `CORS_ORIGIN=*` to API service environment variables
2. Or add your dashboard domain: `CORS_ORIGIN=https://app.punchicar.lk`

### Issue: "Cannot connect to API server"

**Solutions**:
1. Verify API service is running (check Railway logs)
2. Verify API service has a public domain generated
3. Check `NEXT_PUBLIC_API_URL` matches the API domain exactly
4. Check API service PORT is set to 4000

## Environment Variables Checklist

### ✅ API Service Must Have:
- [ ] AWS_REGION
- [ ] AWS_ACCESS_KEY_ID  
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_S3_BUCKET_NAME
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_KEY
- [ ] JWT_SECRET
- [ ] PORT=4000
- [ ] CORS_ORIGIN

### ✅ Dashboard Service Must Have:
- [ ] NEXT_PUBLIC_API_URL (pointing to API service)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] (Optional) API_SERVER_URL

### ✅ Web Service Must Have:
- [ ] NEXT_PUBLIC_API_URL (pointing to API service)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

## Quick Deployment Commands

If you prefer using Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy API
cd api
railway up --service pcn-api

# Deploy Dashboard  
cd ../dashboard
railway up --service pcn-dashboard

# Deploy Web
cd ../web
railway up --service pcn-web
```

## Important Notes

1. **API Must Be Deployed First** - Dashboard and Web depend on it
2. **Update API URL** - Always update `NEXT_PUBLIC_API_URL` after deploying API
3. **Redeploy After Env Changes** - Railway auto-redeploys, but verify it completes
4. **Check Logs** - Use Railway logs to debug issues
5. **Domain Names** - Use Railway's generated domains or connect your custom domains

## Support

If you still face issues:
1. Check Railway deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test API endpoint directly with curl/Postman
