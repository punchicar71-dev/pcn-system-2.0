# 🧪 Testing S3 Image Deletion Fix

## Quick Testing Guide

### ✅ Step 1: Prepare for Testing

1. **Open Browser Console** (F12 or Cmd+Option+I on Mac)
2. **Navigate to Dashboard**: http://localhost:3001
3. **Go to Inventory Page**: Click on "Inventory" in the sidebar
4. **Keep Terminal Open**: Monitor the API server logs

### ✅ Step 2: Test Vehicle Deletion

#### 2.1 Select a Vehicle with Images
1. Find a vehicle that has images uploaded
2. Click the **Delete** button (trash icon)
3. Confirm the deletion

#### 2.2 Monitor the Logs

**Browser Console** should show:
```
🗑️ Starting vehicle deletion process for: <vehicle-id>
📸 Found X images to delete from S3: [...]
🌐 Calling S3 deletion API...
✅ S3 deletion result: {...}
✅ Successfully deleted X images from S3
🗄️ Deleting vehicle from database...
✅ Vehicle deleted from database successfully
```

**API Server Terminal** should show:
```
🗑️ [DELETE Vehicle Images] Request received for vehicle: <vehicle-id>
📋 [DELETE Vehicle Images] Deleting X images
🔑 [DELETE Vehicle Images] S3 Keys: [...]
🗑️ Deleting X objects from S3 bucket: pcn-vehicle-images-punchicar71
📋 Keys to delete: [...]
🔄 Processing batch 1 (X keys)...
✅ Successfully deleted X objects from S3
  ✓ Deleted: vehicle_images/<vehicle-id>/...
  ✓ Deleted: vehicle_images/<vehicle-id>/...
📊 Deletion Summary: X deleted, 0 errors
✅ Successfully deleted X images from S3
```

### ✅ Step 3: Verify S3 Deletion

#### Option A: Using AWS Console
1. Log in to AWS Console
2. Go to S3 service
3. Open bucket: `pcn-vehicle-images-punchicar71`
4. Search for the vehicle ID in the bucket
5. **Verify**: Images should be GONE

#### Option B: Using AWS CLI
```bash
# List all files for a specific vehicle
aws s3 ls s3://pcn-vehicle-images-punchicar71/ --recursive | grep "<vehicle-id>"

# Should return empty result
```

### ✅ Step 4: Test Different Scenarios

#### Scenario 1: Vehicle with Multiple Images
- Upload 5+ images to a vehicle
- Delete the vehicle
- **Expected**: All images deleted from S3

#### Scenario 2: Vehicle with No Images
- Create a vehicle without uploading images
- Delete the vehicle
- **Expected**: Log shows "No S3 images to delete"

#### Scenario 3: Vehicle with 360° Images
- Upload 360° images
- Delete the vehicle
- **Expected**: 360° images deleted from `vehicle_360_image/` folder

#### Scenario 4: Vehicle with CR/Paper Documents
- Upload CR/Paper documents
- Delete the vehicle
- **Expected**: Documents deleted from `cr_pepar_image/` folder

### ✅ Step 5: Check for Errors

#### If S3 Deletion Fails

**Browser Alert** will show:
```
⚠️ Vehicle deleted from database, but some images may remain in S3. 
Please check S3 console.
```

**Common Causes:**
1. **AWS Credentials Invalid**: Check `.env` file in `api/` folder
2. **Network Issue**: Check internet connection
3. **S3 Permissions**: Verify IAM user has `DeleteObject` permission
4. **S3 Keys Missing**: Images uploaded without S3 keys

**To Fix:**
```bash
# 1. Check API .env file
cd api && cat .env | grep AWS_

# 2. Test S3 connection (if you have test script)
node test-s3-connection.js

# 3. Verify IAM permissions in AWS Console
```

### ✅ Step 6: Performance Testing

#### Test Bulk Deletion
1. Create multiple vehicles (5-10)
2. Upload 3-5 images each
3. Delete all vehicles one by one
4. Monitor deletion time
5. **Expected**: <2 seconds per vehicle

#### Test Large Image Count
1. Upload 20+ images to one vehicle
2. Delete the vehicle
3. **Expected**: Batch processing handles it efficiently

### 📊 Expected Results Summary

| Test Case | Database | S3 Storage | User Alert | Console Logs |
|-----------|----------|------------|------------|--------------|
| Normal deletion | ✅ Deleted | ✅ Deleted | Success | Detailed logs |
| No images | ✅ Deleted | N/A | Success | "No images to delete" |
| S3 fails | ✅ Deleted | ❌ Not deleted | Warning | Error details |
| No auth token | ❌ Not deleted | ❌ Not deleted | Error | Auth error |

### 🚨 Known Issues to Watch For

1. **Empty S3 Keys**: If `s3_key` column is NULL, those images won't be deleted
2. **Old Images**: Images uploaded before S3 migration won't have keys
3. **Network Timeout**: Very large batches might timeout (>1000 images)
4. **Permission Errors**: IAM user needs proper S3 permissions

### 🔧 Troubleshooting Commands

```bash
# Check if API is running
curl http://localhost:4000/api/health

# Check AWS credentials
cd api && node -e "console.log(require('dotenv').config().parsed)"

# List recent uploads in S3
aws s3 ls s3://pcn-vehicle-images-punchicar71/vehicle_images/ --recursive --human-readable

# Count total files in S3 bucket
aws s3 ls s3://pcn-vehicle-images-punchicar71/ --recursive | wc -l

# Check S3 bucket size
aws s3 ls s3://pcn-vehicle-images-punchicar71/ --recursive --summarize
```

### ✅ Acceptance Criteria

**Fix is successful if:**

1. ✅ Vehicle deletion removes ALL images from S3
2. ✅ Detailed logs appear in console and terminal
3. ✅ User gets clear success/failure feedback
4. ✅ Database records are deleted
5. ✅ S3 bucket shows no orphaned images
6. ✅ No errors in browser console
7. ✅ No errors in API terminal

### 📝 Test Report Template

```
Test Date: _____________
Tester: _____________
Environment: Development / Production

Test Results:
[ ] Vehicle with images - PASS / FAIL
[ ] Vehicle without images - PASS / FAIL
[ ] Multiple vehicles - PASS / FAIL
[ ] 360° images - PASS / FAIL
[ ] CR/Paper documents - PASS / FAIL
[ ] Error handling - PASS / FAIL
[ ] Performance (<2s) - PASS / FAIL

Issues Found:
1. ___________________________
2. ___________________________

Notes:
_______________________________
_______________________________
```

---

**Need Help?**
- Check `S3_DELETE_BUG_FIX.md` for detailed fix documentation
- Review browser console for error details
- Check API terminal for S3 deletion logs
- Verify AWS credentials in `api/.env`
