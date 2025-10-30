# Quick Start - Vehicle Add Testing

## Prerequisites ✅
- Node.js 18+
- Backend API running
- Dashboard running
- Supabase configured
- AWS S3 bucket configured

---

## 1️⃣ Backend Setup (API)

```bash
# Navigate to API folder
cd api

# Install dependencies
npm install

# Ensure .env file has AWS credentials:
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=xxx
# AWS_SECRET_ACCESS_KEY=xxx
# AWS_S3_BUCKET_NAME=xxx

# Start development server
npm run dev
```

**Expected Output:**
```
🚀 PCN API Server running on port 4000
📍 Environment: development
```

---

## 2️⃣ Database Migration

Open Supabase SQL Editor and run:

```sql
-- Add S3 Key support
ALTER TABLE IF EXISTS vehicle_images
ADD COLUMN IF NOT EXISTS s3_key VARCHAR(500);

-- Update constraints
ALTER TABLE IF EXISTS vehicle_images
DROP CONSTRAINT IF EXISTS check_image_type;

ALTER TABLE IF EXISTS vehicle_images
ADD CONSTRAINT check_image_type 
CHECK (image_type IN ('gallery', 'cr_paper', 'document', 'image_360'));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_images_s3_key ON vehicle_images(s3_key);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_image_type ON vehicle_images(image_type);
```

---

## 3️⃣ Frontend Setup (Dashboard)

```bash
# Navigate to dashboard folder
cd dashboard

# Install dependencies
npm install

# Ensure .env.local has:
# NEXT_PUBLIC_SUPABASE_URL=xxx
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
# NEXT_PUBLIC_API_URL=http://localhost:4000

# Start development server
npm run dev
```

**Expected Output:**
```
> next dev
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

---

## 4️⃣ Test Vehicle Add

### Step-by-Step Test

1. **Open Dashboard**
   - Go to http://localhost:3000
   - Login with your credentials

2. **Navigate to Add Vehicle**
   - Click "Add Vehicle" or go to `/add-vehicle`

3. **Fill Step 1 - Vehicle Details**
   - Vehicle Number: `TEST-2025-001`
   - Brand: Select any brand
   - Model: Select any model
   - Manufacture Year: 2020
   - Country: Select country
   - Body Type: SUV
   - Fuel Type: Petrol
   - Transmission: Automatic
   - Engine Capacity: 2000cc
   - Exterior Color: White
   - **Upload Images:**
     - At least 1 gallery image (JPG, PNG)
     - Optional: 360° images
     - Optional: CR images

4. **Fill Step 2 - Seller Details**
   - First Name: John
   - Last Name: Doe
   - Mobile: +94771234567
   - Other fields optional

5. **Fill Step 3 - Vehicle Options**
   - Select some standard options (AC, Power steering, etc.)
   - Add custom options if needed

6. **Fill Step 4 - Selling Details**
   - Selling Amount: 2500000
   - Mileage: 50000
   - Entry Type: PCN Import
   - Entry Date: Today
   - Status: active

7. **Fill Step 5 - Special Notes**
   - Tag Notes: Test vehicle
   - Special Note Print: Optional

8. **Step 6 - Review Summary**
   - Review all entered data
   - Verify images show correctly
   - Click **"Publish Vehicle"**

9. **Step 7 - Success**
   - Should show confirmation
   - Vehicle ID displayed

---

## 5️⃣ Verify in Supabase

```sql
-- Check vehicle created
SELECT * FROM vehicles WHERE vehicle_number = 'TEST-2025-001';

-- Check seller created
SELECT * FROM sellers WHERE first_name = 'John';

-- Check images stored
SELECT id, image_url, image_type, s3_key FROM vehicle_images 
WHERE vehicle_id = 'your-vehicle-id';

-- Check options
SELECT * FROM vehicle_options WHERE vehicle_id = 'your-vehicle-id';
```

---

## 6️⃣ Verify in AWS S3

Check your S3 bucket for:
```
✅ vehicle_images/
   └─ <vehicle-id>/
      ├─ timestamp-image1.jpg
      ├─ timestamp-image2.jpg
      └─ ...

✅ vehicle_360_image/
   └─ <vehicle-id>/
      ├─ timestamp-360-1.jpg
      └─ ...

✅ cr_pepar_image/
   └─ <vehicle-id>/
      ├─ timestamp-cr.jpg
      └─ ...
```

---

## 7️⃣ Browser Console Logs

Open Developer Tools (F12) and check console for:

```javascript
// Expected success logs
"Starting vehicle insertion..."
"✅ Vehicle created successfully: uuid"
"✅ Seller created successfully"
"✅ Options inserted successfully"
"🖼️  Starting image uploads to AWS S3..."
"✅ All images uploaded successfully"
"✅✅ Vehicle published successfully!"
```

---

## Troubleshooting

### Issue: "Cannot connect to backend API server"
```bash
# Check if API is running
curl http://localhost:4000/health
# Should return: {"status":"OK","message":"PCN API is running"}
```

### Issue: "AWS S3 is not configured"
```bash
# Check environment variables in API
cd api
cat .env | grep AWS
# Ensure all AWS_* variables are set
```

### Issue: Images not uploading
```bash
# Check browser console for specific error
# Common issues:
# 1. Token expired - user needs to re-login
# 2. S3 presigned URL failed - check API logs
# 3. S3 bucket policy incorrect - check AWS permissions
```

### Issue: Database error "vehicle_images table not found"
```sql
-- Run complete migration
-- Check if table exists:
SELECT * FROM information_schema.tables 
WHERE table_name = 'vehicle_images';
```

### Issue: "Image type not allowed"
```
Make sure uploading actual image files (JPG, PNG, GIF, WebP)
Not: PDF, DOC, TXT, etc.
```

---

## Database Schema Check

Run this query to verify tables are correct:

```sql
-- Check vehicle table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicles';

-- Check sellers table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sellers';

-- Check vehicle_images table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicle_images';
```

---

## Performance Metrics

Expected timings:
- Text data insertion: **100-500ms**
- Single image upload to S3: **1-5 seconds** (depends on size)
- Multiple images (parallel): **5-15 seconds**
- Total vehicle publishing: **10-30 seconds**

---

## Common Test Data

### Quick Copy-Paste Values

**Vehicle Details:**
- Vehicle Number: `TESTCAR-20250130`
- Engine Capacity: `2000cc`
- Exterior Color: `White`

**Seller Details:**
- First Name: `Test`
- Last Name: `Seller`
- Mobile: `+94771234567`

**Selling Details:**
- Amount: `2500000`
- Mileage: `50000`

---

## Success Criteria ✅

Your vehicle has been successfully added when:

1. ✅ Database shows vehicle record
2. ✅ Database shows seller record  
3. ✅ Database shows image records with s3_key
4. ✅ S3 bucket has images in correct folders
5. ✅ All images have correct metadata
6. ✅ Dashboard shows success page
7. ✅ Browser console shows all success logs

---

## Next Steps

After successful test:

1. **Test editing** vehicle details
2. **Test deleting** vehicle and images
3. **Test filtering** by vehicle in inventory
4. **Test image display** in vehicle detail view
5. **Test multiple vehicles** with different image counts

---

**Ready to test? Let's go! 🚀**
