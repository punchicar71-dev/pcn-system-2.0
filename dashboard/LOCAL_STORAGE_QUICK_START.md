# 🎯 Quick Start: Local Image Storage

## What Was Changed?

✅ **Images now save locally** instead of Supabase Storage  
✅ **Location:** `dashboard/public/uploads/vehicles/`  
✅ **API Route:** `/api/upload` handles all uploads  

---

## 🚀 How to Use

### 1. Add a New Vehicle with Images

1. Navigate to **Add Vehicle** page
2. Fill in vehicle details
3. Upload vehicle images (gallery photos)
4. Upload CR paper/documents
5. Click **Publish**

**What happens:**
- Images upload to `public/uploads/vehicles/[vehicle-id]/`
- CR papers go to `documents/` subfolder
- URLs saved to database automatically

### 2. View Vehicle Images

1. Go to **Inventory** page
2. Click the 👁️ (eye) icon on any vehicle
3. View images in the modal
4. Download CR papers using the button

### 3. Edit Vehicle & Add More Images

1. Click ✏️ (edit) icon on a vehicle
2. Upload additional images
3. Images are added to the same vehicle folder

---

## 📁 Directory Structure

```
dashboard/
└── public/
    └── uploads/
        └── vehicles/
            └── [vehicle-id]/
                ├── 1730123456-front-view.jpg
                ├── 1730123457-side-view.jpg
                └── documents/
                    └── 1730123458-cr-paper.pdf
```

---

## 🔍 Testing

### Test 1: Upload Works
```bash
# Start dev server
cd dashboard
npm run dev

# Add vehicle with images
# Check folder created:
ls -la public/uploads/vehicles/
```

### Test 2: Images Display
1. Add vehicle with 3-4 images
2. View in inventory modal
3. Verify all images show
4. Test 360° viewer if applicable

### Test 3: Download CR Paper
1. Add vehicle with CR paper
2. Open vehicle details
3. Click "Download CR Paper"
4. Verify file downloads

---

## 🛠️ Technical Details

### Upload API
**Endpoint:** `POST /api/upload`

**Request:**
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('vehicleId', vehicleId)
formData.append('imageType', 'gallery') // or 'cr_paper'

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
```

**Response:**
```json
{
  "success": true,
  "url": "/uploads/vehicles/abc-123/1730123456-image.jpg",
  "fileName": "image.jpg",
  "fileSize": 245678,
  "storagePath": "/uploads/vehicles/abc-123/1730123456-image.jpg"
}
```

### Files Modified
- ✅ `src/app/api/upload/route.ts` - NEW upload API
- ✅ `src/app/(dashboard)/add-vehicle/page.tsx` - Updated upload logic
- ✅ `src/components/inventory/EditVehicleModal.tsx` - Updated upload logic
- ✅ `next.config.js` - Added local image support

---

## ⚠️ Important Notes

### Git & Version Control
- Images are **NOT committed** to git
- Only folder structure is tracked
- See `public/uploads/.gitignore`

### Backup
```bash
# Backup all uploaded images
tar -czf vehicle-images-backup.tar.gz public/uploads/vehicles/

# Restore from backup
tar -xzf vehicle-images-backup.tar.gz
```

### Storage Space
```bash
# Check space used
du -sh public/uploads/vehicles/

# List largest vehicle folders
du -h public/uploads/vehicles/ | sort -rh | head -10
```

---

## 🐛 Troubleshooting

### Problem: Images not uploading
**Solution:**
```bash
# Check directory exists and has permissions
mkdir -p public/uploads/vehicles
chmod -R 755 public/uploads
```

### Problem: Images not displaying
**Check:**
1. Image URL in database starts with `/uploads/`
2. File exists: `ls public/uploads/vehicles/[vehicle-id]/`
3. Browser console for 404 errors

### Problem: "Upload failed" error
**Check:**
1. Terminal logs for error details
2. Disk space: `df -h`
3. File permissions

---

## 🎨 Image Types

| Type | Code | Location | Used For |
|------|------|----------|----------|
| Gallery | `gallery` | `/vehicles/[id]/` | Vehicle photos, 360° |
| CR Paper | `cr_paper` | `/vehicles/[id]/documents/` | Registration docs |

---

## 📊 Database

Images metadata stored in `vehicle_images` table:

```sql
SELECT 
  vehicle_id,
  image_url,
  image_type,
  file_name,
  file_size
FROM vehicle_images
WHERE vehicle_id = 'your-vehicle-id';
```

---

## 🚀 Production Considerations

### Current Setup (Local Storage)
✅ Perfect for: Development, Testing, Small deployments  
❌ Not suitable for: Multi-server, Vercel/Netlify

### For Production
Consider:
- AWS S3 / Cloudflare R2
- DigitalOcean Spaces
- Google Cloud Storage

See `LOCAL_STORAGE_GUIDE.md` for migration details.

---

## ✨ Summary

| Before | After |
|--------|-------|
| Supabase Storage | Local filesystem |
| Cloud URLs | `/uploads/...` paths |
| External dependency | Self-contained |

**Ready to test!** Add a vehicle and upload some images. 🎉

---

**Need help?** Check `LOCAL_STORAGE_GUIDE.md` for detailed documentation.
