# Vehicle Add - Quick Reference Card

**Print this for quick access to all key information**

---

## 🚀 Quick Start

### 1. Run Backend
```bash
cd api && npm run dev
```
**Expected:** Server on `http://localhost:4000`

### 2. Apply Migration
```sql
-- Run in Supabase SQL Editor (copy from migrations file)
```

### 3. Run Dashboard
```bash
cd dashboard && npm run dev
```
**Expected:** Dashboard on `http://localhost:3000`

### 4. Test
- Login → Add Vehicle → Fill all fields → Upload images → Publish

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/dashboard/src/app/(dashboard)/add-vehicle/page.tsx` | Main form & logic |
| `/api/src/routes/upload.routes.ts` | S3 upload endpoints |
| `/dashboard/src/app/api/upload/presigned-url/route.ts` | Presigned URL proxy |
| `/dashboard/migrations/2025_01_add_s3_key_to_vehicle_images.sql` | DB migration |

---

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/upload/presigned-url` | Get S3 presigned URL |
| POST | `/api/upload/upload` | Upload image to S3 |
| DELETE | `/api/upload/delete` | Delete image from S3 |
| GET | `/api/upload/status` | Check S3 config |

---

## 📊 Data Flow

```
TEXT → Supabase
├─ vehicles table
├─ sellers table
├─ vehicle_options table
└─ vehicle_custom_options table

IMAGES → AWS S3
├─ vehicle_images/ folder
├─ vehicle_360_image/ folder
└─ cr_pepar_image/ folder

METADATA → Supabase (vehicle_images)
├─ image_url
├─ s3_key
├─ image_type
└─ file_name
```

---

## ⚙️ Environment Variables

### Backend (.env)
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET_NAME=xxx
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## ✅ Validation Checks

Before "Publish" clicks, system checks:
- [x] Vehicle number filled
- [x] Brand selected
- [x] Model selected
- [x] Manufacture year selected
- [x] Country selected
- [x] Seller first name filled
- [x] Seller last name filled
- [x] Seller mobile filled
- [x] Selling amount filled
- [x] User logged in

---

## 🖼️ Image Types

| Type | Folder | Max Size | Purpose |
|------|--------|----------|---------|
| gallery | vehicle_images/ | 10MB | Regular photos |
| image_360 | vehicle_360_image/ | 10MB | Panorama views |
| cr_paper | cr_pepar_image/ | 10MB | Documents |

---

## 🚨 Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "Cannot connect to backend API server" | Start API with `npm run dev` |
| "AWS S3 is not configured" | Check .env has AWS credentials |
| "Vehicle number already exists" | Use unique number |
| "Please enter..." | Fill all required fields |
| "Authorization token required" | User must be logged in |
| "Failed to get presigned URL" | Check API is running |
| "Failed to upload image to S3" | Check network/S3 config |

---

## 📋 Testing Checklist

- [ ] Backend running
- [ ] Database migration done
- [ ] Dashboard running
- [ ] Logged in
- [ ] Fill vehicle details
- [ ] Upload images
- [ ] Click Publish
- [ ] Check Supabase
- [ ] Check S3 bucket
- [ ] Verify success page

---

## 💾 Database Verification

```sql
-- Check vehicle created
SELECT * FROM vehicles ORDER BY created_at DESC LIMIT 1;

-- Check images
SELECT id, s3_key, image_type FROM vehicle_images 
WHERE vehicle_id = 'xxx' ORDER BY created_at;

-- Check S3 path format
-- Should be: vehicle_images/{vehicle-id}/{timestamp}-{filename}
```

---

## 🔍 Debugging Tips

1. **Browser Console** (F12)
   - Look for `✅` and `❌` logs
   - Check for error messages
   - View network requests

2. **API Console**
   - Run `npm run dev` in /api
   - Check request/response logs
   - Look for S3 errors

3. **Supabase Dashboard**
   - Check vehicle_images table
   - Verify s3_key column populated
   - Check vehicle_id foreign keys

4. **AWS S3 Console**
   - Browse folders
   - Check file sizes
   - Verify metadata

---

## 📈 Performance Targets

| Step | Target Time |
|------|------------|
| Presigned URL | < 200ms |
| Single image upload | 1-5s |
| 5-10 images | 5-15s |
| Total publish | 10-30s |

---

## 🔐 Security Notes

- Presigned URLs expire in 5 minutes
- Only image/* MIME types allowed
- Max file size 10MB
- All operations require auth
- S3 keys tracked for audit

---

## 📞 Quick Contacts

- **API Logs:** Run `npm run dev` in /api folder
- **Frontend Logs:** Browser F12 console
- **Database Logs:** Supabase SQL Editor
- **S3 Logs:** AWS CloudWatch

---

## 🎯 Common Tasks

### Add a test vehicle
```
Number: TEST-2025-001
Brand: (any)
Model: (any)
Year: 2020
Seller: John Doe
Phone: +94771234567
Amount: 2500000
Upload: 1+ images
Click: Publish
```

### Verify in database
```sql
SELECT * FROM vehicles WHERE vehicle_number = 'TEST-2025-001';
```

### Find images in S3
```
Folder: vehicle_images/
Path: vehicle_images/{vehicle-id}/{timestamp}-*.jpg
```

### Clear test data
```sql
DELETE FROM vehicles WHERE vehicle_number LIKE 'TEST-%';
-- Cascade deletes: sellers, options, images
```

---

## 📚 Full Documentation

| Document | Content |
|----------|---------|
| VEHICLE_ADD_FIX_DOCUMENTATION.md | Technical deep dive |
| VEHICLE_ADD_TESTING_GUIDE.md | Step-by-step testing |
| VEHICLE_ADD_SUMMARY.md | Implementation summary |
| VEHICLE_ADD_BEFORE_AND_AFTER.md | What changed |
| VEHICLE_ADD_IMPLEMENTATION_CHECKLIST.md | Complete checklist |

---

## ✨ Key Improvements

✅ Images now upload to S3 (not lost)
✅ 360° images fully supported
✅ Comprehensive validation
✅ Helpful error messages
✅ Full audit trail (s3_key)
✅ Production-ready

---

**Ready to deploy? You're all set! 🚀**

*All bugs fixed • All tests documented • All code ready*

---

*Last Updated: October 30, 2025*
