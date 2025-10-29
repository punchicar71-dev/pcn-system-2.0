# 🧪 Testing Checklist: Local Image Storage

## Pre-Testing Verification

- [x] Server running at http://localhost:3001
- [x] API endpoint `/api/upload` created
- [x] Upload directory exists: `public/uploads/vehicles/`
- [x] Git configuration set (images not committed)
- [x] Code changes applied to add-vehicle and edit-vehicle

---

## Test 1: Add New Vehicle with Images

### Steps:
1. [ ] Navigate to http://localhost:3001/add-vehicle
2. [ ] Fill in vehicle details (Step 1):
   - [ ] Vehicle Number: TEST-001
   - [ ] Select Brand
   - [ ] Select Model
   - [ ] Enter Year
   - [ ] Select Country

3. [ ] Upload images (Step 1 continued):
   - [ ] Upload 3-4 vehicle images (gallery)
   - [ ] Upload 1 CR paper/document
   - [ ] Verify preview shows uploaded files

4. [ ] Complete remaining steps (seller, options, selling details)

5. [ ] Click "Publish" button

### Expected Results:
- [ ] ✅ Success message appears
- [ ] ✅ No errors in browser console
- [ ] ✅ No errors in terminal

### Verification:
```bash
# Check if folder created
ls -la "public/uploads/vehicles/"

# Should see a folder with vehicle UUID
# Example: abc-123-def-456/

# Check images inside
ls -la "public/uploads/vehicles/[vehicle-id]/"

# Should see:
# - 3-4 .jpg files (gallery images)
# - documents/ folder with CR paper
```

- [ ] ✅ Vehicle folder exists
- [ ] ✅ Gallery images present
- [ ] ✅ Documents folder exists
- [ ] ✅ CR paper present in documents/

---

## Test 2: View Vehicle in Inventory

### Steps:
1. [ ] Navigate to http://localhost:3001/inventory
2. [ ] Find your test vehicle (TEST-001)
3. [ ] Click 👁️ (eye icon) to view details

### Expected Results:
- [ ] ✅ Modal opens with vehicle details
- [ ] ✅ Images display in carousel
- [ ] ✅ All uploaded images visible
- [ ] ✅ 360° viewer works (if applicable)
- [ ] ✅ "Download CR Paper" button visible

### Test Image Display:
4. [ ] Navigate through image carousel
5. [ ] Verify all images load correctly
6. [ ] Check for any broken image icons

### Test CR Paper Download:
7. [ ] Click "Download CR Paper" button
8. [ ] Verify document downloads

- [ ] ✅ All images display correctly
- [ ] ✅ No 404 errors in console
- [ ] ✅ CR paper downloads successfully

---

## Test 3: Edit Vehicle & Add More Images

### Steps:
1. [ ] In inventory page, click ✏️ (edit icon) on TEST-001
2. [ ] Edit modal opens
3. [ ] Upload 2 more vehicle images
4. [ ] Click "Save Changes"

### Expected Results:
- [ ] ✅ Success message appears
- [ ] ✅ No errors in console or terminal

### Verification:
```bash
# Check same vehicle folder
ls -la "public/uploads/vehicles/[vehicle-id]/"

# Should now see 5-6 images total
```

- [ ] ✅ New images added to same folder
- [ ] ✅ All images (old + new) display in inventory

---

## Test 4: Database Verification

### Steps:
1. [ ] Open Supabase dashboard
2. [ ] Navigate to Table Editor
3. [ ] Open `vehicle_images` table
4. [ ] Filter by your test vehicle

### Check:
- [ ] ✅ Records exist for all uploaded images
- [ ] ✅ `image_url` starts with `/uploads/vehicles/`
- [ ] ✅ `image_type` is either `gallery` or `cr_paper`
- [ ] ✅ `file_name`, `file_size` populated correctly

### SQL Query:
```sql
SELECT 
  vehicle_id,
  image_url,
  image_type,
  file_name,
  file_size,
  display_order
FROM vehicle_images
WHERE vehicle_id = 'your-vehicle-id'
ORDER BY display_order;
```

---

## Test 5: Search and Filter

### Steps:
1. [ ] In inventory page, use search box
2. [ ] Search for "TEST-001"
3. [ ] Verify vehicle appears in results
4. [ ] Click view, verify images still load

- [ ] ✅ Search works correctly
- [ ] ✅ Images load from search results

---

## Test 6: Multiple Vehicles

### Steps:
1. [ ] Add second test vehicle: TEST-002
2. [ ] Upload different images
3. [ ] Verify both vehicles have separate folders

### Verification:
```bash
ls -la "public/uploads/vehicles/"

# Should see:
# - [vehicle-id-1]/
# - [vehicle-id-2]/
```

- [ ] ✅ Each vehicle has own folder
- [ ] ✅ Images don't mix between vehicles
- [ ] ✅ Both vehicles display correctly in inventory

---

## Test 7: File System Checks

### Directory Structure:
```bash
# Check structure
tree -L 3 "public/uploads/vehicles/"
```

**Expected:**
```
vehicles/
├── [vehicle-id-1]/
│   ├── 1730123456-image1.jpg
│   ├── 1730123457-image2.jpg
│   └── documents/
│       └── 1730123458-cr.pdf
└── [vehicle-id-2]/
    └── 1730123500-image.jpg
```

- [ ] ✅ Correct structure
- [ ] ✅ Files have timestamps
- [ ] ✅ Documents in separate folder

### Permissions:
```bash
ls -la "public/uploads/"
```

- [ ] ✅ Directories readable (755)
- [ ] ✅ Files readable (644)

---

## Test 8: API Endpoints

### Test Upload API:
```bash
# Replace with actual values
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/test-image.jpg" \
  -F "vehicleId=test-123" \
  -F "imageType=gallery"
```

**Expected Response:**
```json
{
  "success": true,
  "url": "/uploads/vehicles/test-123/...",
  "fileName": "test-image.jpg",
  "fileSize": 123456,
  "storagePath": "/uploads/vehicles/test-123/..."
}
```

- [ ] ✅ API responds with 200
- [ ] ✅ Returns expected JSON
- [ ] ✅ File created on disk

### Test Cleanup API:
```bash
curl -X DELETE http://localhost:3001/api/upload/cleanup \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"test-123"}'
```

- [ ] ✅ API responds with success
- [ ] ✅ Directory removed from disk

---

## Test 9: Error Handling

### Test Missing File:
1. [ ] Try submitting form without images
2. [ ] Verify appropriate error message

### Test Large Files:
1. [ ] Try uploading very large image (>10MB)
2. [ ] Verify it uploads or shows size warning

### Test Invalid Files:
1. [ ] Try uploading non-image file as gallery image
2. [ ] Verify appropriate handling

- [ ] ✅ Errors handled gracefully
- [ ] ✅ User-friendly error messages

---

## Test 10: Performance

### Upload Speed:
1. [ ] Upload 5 images simultaneously
2. [ ] Note time taken

- [ ] ✅ Uploads complete in reasonable time (<30 seconds)
- [ ] ✅ No timeouts or crashes

### Display Speed:
1. [ ] Open vehicle with multiple images
2. [ ] Images load quickly

- [ ] ✅ Images load in <2 seconds
- [ ] ✅ Carousel smooth and responsive

---

## Test 11: Browser Compatibility

### Test in Different Browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on Mac)

**For each browser:**
- [ ] Upload works
- [ ] Images display
- [ ] Download CR paper works

---

## Test 12: Git Integration

### Verify Git Ignores Images:
```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"
git status
```

**Expected:**
- [ ] ✅ `public/uploads/vehicles/` NOT listed in changes
- [ ] ✅ Only `.gitkeep` tracked
- [ ] ✅ Uploaded images not tracked

```bash
git add .
git status
```

- [ ] ✅ Still no images in staging area

---

## Test 13: Edge Cases

### Test Empty Vehicle ID:
- [ ] What happens if vehicleId is missing?
- [ ] ✅ Returns 400 error

### Test Special Characters in Filename:
- [ ] Upload file with spaces and special chars
- [ ] ✅ Filename sanitized correctly

### Test Duplicate Uploads:
- [ ] Upload same file twice
- [ ] ✅ Both saved with different timestamps

---

## Post-Testing Cleanup

### Remove Test Data:
```bash
# Delete test vehicle folders
rm -rf "public/uploads/vehicles/[test-vehicle-id]/"
```

### Database Cleanup:
```sql
-- Delete test vehicles
DELETE FROM vehicle_images WHERE vehicle_id IN (SELECT id FROM vehicles WHERE vehicle_number LIKE 'TEST-%');
DELETE FROM vehicles WHERE vehicle_number LIKE 'TEST-%';
```

---

## Final Verification Checklist

- [ ] ✅ All tests passed
- [ ] ✅ No errors in browser console
- [ ] ✅ No errors in terminal
- [ ] ✅ Images display correctly
- [ ] ✅ CR papers downloadable
- [ ] ✅ Database records accurate
- [ ] ✅ File system organized correctly
- [ ] ✅ Git ignoring images
- [ ] ✅ Performance acceptable
- [ ] ✅ Error handling works

---

## Issues Found

### Issue 1:
**Description:**
**Steps to Reproduce:**
**Expected:**
**Actual:**
**Status:** [ ] Fixed / [ ] Investigating / [ ] Won't Fix

### Issue 2:
**Description:**
**Status:** [ ] Fixed / [ ] Investigating / [ ] Won't Fix

---

## Test Results Summary

**Date Tested:** __________  
**Tester:** __________  
**Environment:** macOS, Chrome, localhost:3001  

**Overall Status:** [ ] ✅ PASS / [ ] ❌ FAIL / [ ] ⚠️ ISSUES FOUND

**Total Tests:** 13  
**Passed:** ___  
**Failed:** ___  
**Skipped:** ___  

### Notes:


---

## Sign-Off

**Feature:** Local Image Storage  
**Status:** [ ] Ready for Production / [ ] Needs Work  
**Tested By:** __________  
**Date:** __________  

---

## Next Steps After Testing

1. [ ] Fix any issues found
2. [ ] Update documentation if needed
3. [ ] Plan production deployment
4. [ ] Set up backup strategy
5. [ ] Monitor disk space usage

---

**🎯 Happy Testing!**

Go through each test systematically. Mark checkboxes as you complete them. Report any issues found.

**Start here:** Test 1 - Add New Vehicle with Images

Good luck! 🚀
