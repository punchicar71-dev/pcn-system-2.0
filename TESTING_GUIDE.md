# 🚀 Quick Test Guide - S3 Image Upload Functionality

## ✅ System Status

### Servers Running:
- ✅ **API Server:** http://localhost:4000 - Running
- ✅ **Dashboard:** http://localhost:3001 - Running  
- ✅ **S3 Bucket:** pcn-vehicle-images-punchicar71 - Connected

## 🧪 How to Test Upload Functionality

### Step 1: Access the Dashboard
1. Open your browser and navigate to: **http://localhost:3001**
2. Login with your credentials

### Step 2: Navigate to Add Vehicle
1. Click on "Add Vehicle" in the sidebar
2. You'll be on Step 1 of the vehicle form

### Step 3: Test Each Upload Type

#### Test 1: Vehicle Gallery Images (vehicle_images/)
1. Scroll to the "Vehicle Images" section
2. Click "Choose File" or drag & drop images
3. Upload 1-3 vehicle images
4. ✅ **Expected:** Files upload to `vehicle_images/{vehicleId}/` folder

#### Test 2: 360 Images (vehicle_360_image/)
1. Scroll to the "360 Images" section  
2. Click "Choose File" or drag & drop 360 images
3. Upload 360-degree images
4. ✅ **Expected:** Files upload to `vehicle_360_image/{vehicleId}/` folder

#### Test 3: CR/Paper Documents (cr_pepar_image/)
1. Scroll to the "CR/Paper Documents" section
2. Click "Choose File" or drag & drop documents
3. Upload registration documents or papers
4. ✅ **Expected:** Files upload to `cr_pepar_image/{vehicleId}/` folder

### Step 4: Verify Uploads in S3

#### Option A: AWS Console
1. Go to https://s3.console.aws.amazon.com/
2. Open bucket: `pcn-vehicle-images-punchicar71`
3. Check folders:
   - `cr_pepar_image/` - Should contain uploaded documents
   - `vehicle_360_image/` - Should contain 360 images
   - `vehicle_images/` - Should contain gallery images

#### Option B: API Endpoint
```bash
# Check S3 status
curl http://localhost:4000/api/upload/status

# List vehicle images (requires auth token)
curl http://localhost:4000/api/upload/list/YOUR_VEHICLE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 What to Look For

### ✅ Success Indicators:
- Upload progress bar appears
- Success message shown after upload
- Images preview correctly in the form
- Files appear in correct S3 folders
- File names have timestamp prefix

### ❌ Common Issues:
- **Error: "AWS S3 is not configured"**
  - Check API server is running
  - Verify `.env` file exists in `/api` folder
  
- **Upload fails silently**
  - Check browser console for errors
  - Verify you're logged in
  - Check network tab for API calls

- **Images in wrong folder**
  - This should not happen with the updated code
  - If it does, check the `imageType` parameter being sent

## 📊 Expected Folder Structure After Testing

```
pcn-vehicle-images-punchicar71/
├── cr_pepar_image/
│   └── YOUR_VEHICLE_ID/
│       └── 1761825XXXXX-document.pdf
├── vehicle_360_image/
│   └── YOUR_VEHICLE_ID/
│       └── 1761825XXXXX-360-image.jpg
└── vehicle_images/
    └── YOUR_VEHICLE_ID/
        ├── 1761825XXXXX-front.jpg
        ├── 1761825XXXXX-side.jpg
        └── 1761825XXXXX-back.jpg
```

## 🔧 Troubleshooting Commands

### Check if API is responding:
```bash
curl http://localhost:4000/api/upload/status
```

Expected response:
```json
{
  "s3Configured": true,
  "message": "AWS S3 is properly configured"
}
```

### Restart API Server (if needed):
```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/api"
npm run dev
```

### Restart Dashboard (if needed):
```bash
cd "/Users/asankaherath/Projects/PCN System . 2.0/dashboard"
npm run dev
```

## 📝 Test Checklist

- [ ] API server running on port 4000
- [ ] Dashboard running on port 3001
- [ ] Successfully logged into dashboard
- [ ] Can access "Add Vehicle" page
- [ ] Upload vehicle gallery image → Verify in `vehicle_images/`
- [ ] Upload 360 image → Verify in `vehicle_360_image/`
- [ ] Upload CR/Paper document → Verify in `cr_pepar_image/`
- [ ] Images preview correctly in the form
- [ ] Can delete uploaded images
- [ ] Files have correct naming format (timestamp-filename)

## 🎉 Success Criteria

Your upload functionality is working correctly if:
1. ✅ All three upload types work
2. ✅ Files go to correct S3 folders
3. ✅ Images display correctly after upload
4. ✅ No errors in browser console
5. ✅ No errors in API server logs

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Check the API server terminal for backend errors
3. Verify S3 bucket permissions in AWS Console
4. Review `/Users/asankaherath/Projects/PCN System . 2.0/S3_FOLDER_CONFIGURATION.md`

---

**Your system is ready for testing! Start with Step 1 above.** 🚀
