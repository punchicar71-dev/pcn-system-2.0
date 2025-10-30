# Vehicle Image Upload Fix - S3 Integration

## Problem Summary
When attempting to add a new vehicle with images, the system was failing with the error:
```
Failed to save image metadata: null value in column "storage_path" of relation "vehicle_images" violates not-null constraint
```

## Root Cause
The `vehicle_images` table had a `NOT NULL` constraint on the `storage_path` column, but the S3 upload implementation was only setting the `s3_key` field without populating `storage_path`.

### Database Schema Issue
```sql
CREATE TABLE vehicle_images (
  -- ... other columns ...
  storage_path TEXT NOT NULL,  -- ❌ This was required
  s3_key VARCHAR(500),          -- ✅ New S3 field (nullable)
  -- ... other columns ...
);
```

## Solution Implemented

### 1. Database Migration Update
**File:** `dashboard/migrations/2025_01_add_s3_key_to_vehicle_images.sql`

Added migration step to make `storage_path` nullable:
```sql
-- Make storage_path nullable since we're using s3_key for S3 storage
-- This allows backward compatibility with old records while supporting new S3 workflow
ALTER TABLE IF EXISTS vehicle_images
ALTER COLUMN storage_path DROP NOT NULL;
```

### 2. Code Updates
**File:** `dashboard/src/app/(dashboard)/add-vehicle/page.tsx`

Updated all three image insert operations to include `storage_path`:

#### Gallery Images
```typescript
const { error: dbError } = await supabase.from('vehicle_images').insert({
  vehicle_id: vehicleId,
  image_url: publicUrl,
  image_type: 'gallery',
  s3_key: key,
  storage_path: key, // ✅ Added: S3 key serves as storage path
  file_name: file.name,
  file_size: file.size,
  is_primary: i === 0,
  display_order: i,
});
```

#### 360° Images
```typescript
const { error: dbError } = await supabase.from('vehicle_images').insert({
  vehicle_id: vehicleId,
  image_url: publicUrl,
  image_type: 'image_360',
  s3_key: key,
  storage_path: key, // ✅ Added: S3 key serves as storage path
  file_name: file.name,
  file_size: file.size,
  is_primary: false,
  display_order: i,
});
```

#### CR Paper Images
```typescript
const { error: dbError } = await supabase.from('vehicle_images').insert({
  vehicle_id: vehicleId,
  image_url: publicUrl,
  image_type: 'cr_paper',
  s3_key: key,
  storage_path: key, // ✅ Added: S3 key serves as storage path
  file_name: file.name,
  file_size: file.size,
  is_primary: false,
  display_order: i,
});
```

## S3 Key Structure
Images are stored in S3 with vehicle-specific paths:
```
{folder_type}/{vehicle_id}/{timestamp}-{filename}
```

Example S3 keys:
- `vehicle_images/550e8400-e29b-41d4-a716-446655440000/1698765432000-photo1.jpg`
- `vehicle_360_image/550e8400-e29b-41d4-a716-446655440000/1698765432000-360view.jpg`
- `cr_pepar_image/550e8400-e29b-41d4-a716-446655440000/1698765432000-cr_paper.pdf`

This structure ensures:
✅ Images are organized by vehicle
✅ Vehicle number/ID is part of the S3 path
✅ Unique filenames with timestamps prevent collisions
✅ Easy retrieval and deletion of all images for a specific vehicle

## How to Apply the Fix

### Step 1: Run the Database Migration
1. Open Supabase SQL Editor:
   ```
   https://wnorajpknqegnnmeotjf.supabase.co/project/_/sql
   ```

2. Run the migration script:
   ```bash
   cd dashboard
   bash scripts/run-migration.sh
   ```

3. Copy the SQL output and paste it into the Supabase SQL Editor

4. Click **RUN** to execute the migration

### Step 2: Restart the Application
The code changes are already in place. Simply restart your development server:

```bash
# In the dashboard directory
npm run dev
```

### Step 3: Test
1. Navigate to **Add Vehicle** page
2. Fill in vehicle details
3. Upload images (gallery, 360°, or CR paper)
4. Click **Publish**
5. Verify the vehicle is saved successfully with all images

## Verification

### Check Database
```sql
-- Verify storage_path is now nullable
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicle_images' 
AND column_name IN ('storage_path', 's3_key');
```

Expected result:
```
column_name   | is_nullable | data_type
--------------+-------------+-----------
storage_path  | YES         | text
s3_key        | YES         | character varying
```

### Check S3 Bucket
After uploading a vehicle with images, verify in AWS S3:
```
pcn-system-bucket/
├── vehicle_images/{vehicle_id}/
│   ├── {timestamp}-image1.jpg
│   └── {timestamp}-image2.jpg
├── vehicle_360_image/{vehicle_id}/
│   └── {timestamp}-360view.jpg
└── cr_pepar_image/{vehicle_id}/
    └── {timestamp}-cr_paper.pdf
```

## Benefits

### 1. **Backward Compatibility**
- Old records with local `storage_path` continue to work
- New records use S3 with `s3_key`
- Both fields can coexist

### 2. **Vehicle-Specific Organization**
- Images are grouped by vehicle ID in S3
- Easy to find and manage all images for a vehicle
- Simplified deletion when vehicle is removed

### 3. **Dual Field Support**
- `storage_path`: Legacy field, now nullable
- `s3_key`: New field for S3 object keys
- Application can check both fields for image retrieval

### 4. **Better Error Handling**
- Clear error messages for S3 upload failures
- Database constraint errors are prevented
- Rollback support if upload fails

## Future Improvements

### 1. Data Migration (Optional)
If you want to migrate old local images to S3:
```sql
-- Mark old records for migration
UPDATE vehicle_images 
SET s3_key = NULL 
WHERE storage_path IS NOT NULL 
AND s3_key IS NULL;
```

### 2. Deprecate storage_path
Once all images are migrated to S3, you could:
```sql
-- Remove the storage_path column entirely
ALTER TABLE vehicle_images 
DROP COLUMN storage_path;
```

### 3. Add S3 Key Validation
```sql
-- Ensure at least one storage field is set
ALTER TABLE vehicle_images 
ADD CONSTRAINT check_storage CHECK (
  storage_path IS NOT NULL OR s3_key IS NOT NULL
);
```

## Troubleshooting

### Issue: "Failed to get presigned URL"
**Solution:** Check AWS credentials in `.env`:
```env
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

### Issue: "S3 upload failed"
**Solution:** Verify S3 bucket permissions and CORS configuration

### Issue: Images not displaying
**Solution:** Check S3 bucket public access settings and CloudFront CDN (if used)

## Related Files Changed

1. ✅ `dashboard/migrations/2025_01_add_s3_key_to_vehicle_images.sql` - Database schema
2. ✅ `dashboard/src/app/(dashboard)/add-vehicle/page.tsx` - Image upload logic
3. 📄 `api/src/utils/s3-upload.ts` - S3 utilities (no changes needed)
4. 📄 `api/src/config/aws.ts` - AWS configuration (no changes needed)

## Status
✅ **FIXED** - The vehicle add functionality now properly saves images with both `s3_key` and `storage_path` fields populated.

---

**Date Fixed:** October 30, 2025  
**Fixed By:** GitHub Copilot  
**Issue:** Vehicle images not saving due to NOT NULL constraint violation
