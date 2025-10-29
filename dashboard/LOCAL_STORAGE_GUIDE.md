# Local Image Storage Implementation

## Overview
This system now uses **local file storage** instead of Supabase Storage for vehicle images. All images are stored in the `public/uploads/vehicles/` directory.

## Directory Structure

```
dashboard/
├── public/
│   └── uploads/
│       └── vehicles/
│           ├── .gitkeep
│           └── [vehicle-id]/
│               ├── [timestamp]-[image-file].jpg    # Gallery images
│               └── documents/
│                   └── [timestamp]-[cr-paper].pdf  # CR papers & documents
```

## How It Works

### 1. Upload API Route
**Location:** `src/app/api/upload/route.ts`

This API endpoint handles file uploads:
- Accepts `FormData` with file, vehicleId, and imageType
- Saves files to `public/uploads/vehicles/[vehicleId]/`
- CR papers go to `documents/` subdirectory
- Returns the public URL path

**Example Request:**
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('vehicleId', '123-abc-456')
formData.append('imageType', 'gallery') // or 'cr_paper'

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

const result = await response.json()
// result.url: '/uploads/vehicles/123-abc-456/1234567890-image.jpg'
```

### 2. Image Upload Process

**Add Vehicle Page** (`add-vehicle/page.tsx`):
- User selects images in the form
- On submit, images are uploaded via `/api/upload` endpoint
- Image URLs are saved to `vehicle_images` table in database
- Images are organized by vehicle ID

**Edit Vehicle Modal** (`EditVehicleModal.tsx`):
- Same process for adding new images to existing vehicles
- Old images remain in database until explicitly deleted

### 3. Image Display

Images are served directly from the public directory:
```html
<img src="/uploads/vehicles/[vehicle-id]/[timestamp]-image.jpg" />
```

Next.js automatically serves files from the `public` directory.

## Database Schema

The `vehicle_images` table stores metadata:
```sql
CREATE TABLE vehicle_images (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  image_url TEXT,           -- Public URL path
  image_type TEXT,          -- 'gallery' or 'cr_paper'
  storage_path TEXT,        -- Same as image_url for local storage
  file_name TEXT,
  file_size INTEGER,
  is_primary BOOLEAN,
  display_order INTEGER
);
```

## Image Types

### Gallery Images
- **Type:** `gallery`
- **Location:** `/uploads/vehicles/[vehicle-id]/[filename]`
- **Used for:** Vehicle photos, 360° views
- **Display:** Shown in image carousel and 360° viewer

### CR Paper & Documents
- **Type:** `cr_paper`
- **Location:** `/uploads/vehicles/[vehicle-id]/documents/[filename]`
- **Used for:** Registration papers, documents
- **Display:** Download buttons in vehicle details modal

## Benefits of Local Storage

✅ **No External Dependencies:** No need for Supabase Storage bucket
✅ **Faster Development:** Easier to test and debug locally
✅ **Cost:** No storage fees
✅ **Simple Backup:** Just backup the `uploads` folder
✅ **Direct Access:** Files served directly by Next.js

## Considerations

⚠️ **Not for Production at Scale:** 
- No CDN benefits
- Server storage limitations
- Not distributed across multiple servers

⚠️ **Backup Required:**
- Include `public/uploads/` in your backup strategy
- Images are NOT in git (see `.gitignore`)

⚠️ **Deployment:**
- Ensure deployment platform supports persistent storage
- Vercel/Netlify: Not suitable (ephemeral storage)
- VPS/Dedicated Server: Perfect
- Consider cloud storage for production

## Git Configuration

The `.gitignore` file prevents uploaded images from being committed:
```
public/uploads/*
!public/uploads/.gitkeep
!public/uploads/vehicles/.gitkeep
```

Only directory structure is tracked, not actual images.

## Production Deployment Options

### Option 1: VPS/Dedicated Server
- Deploy to DigitalOcean, AWS EC2, or similar
- Images persist on server disk
- Regular backups recommended

### Option 2: Cloud Storage (Recommended for Production)
- Use AWS S3, Cloudflare R2, or similar
- Modify upload API to use cloud SDK
- Benefits: CDN, scalability, reliability

### Option 3: Hybrid Approach
- Development: Local storage
- Production: Cloud storage
- Use environment variables to switch

## File Management

### Deleting Vehicles
When a vehicle is deleted, consider:
1. Delete database records in `vehicle_images`
2. Optionally delete physical files from disk

**Add cleanup function:**
```typescript
import { unlink, rm } from 'fs/promises'
import path from 'path'

async function deleteVehicleImages(vehicleId: string) {
  const vehicleDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles', vehicleId)
  await rm(vehicleDir, { recursive: true, force: true })
}
```

### Storage Space Monitoring
Monitor disk usage:
```bash
# Check uploads folder size
du -sh dashboard/public/uploads/vehicles/

# List largest directories
du -h dashboard/public/uploads/vehicles/ | sort -rh | head -20
```

## Troubleshooting

### Images Not Showing
1. Check file exists: `ls public/uploads/vehicles/[vehicle-id]/`
2. Check permissions: `chmod -R 755 public/uploads/`
3. Check URL in browser dev tools
4. Verify database `image_url` matches file path

### Upload Fails
1. Check API route logs in terminal
2. Verify directory permissions
3. Check disk space: `df -h`
4. Ensure `public/uploads/vehicles/` exists

### Image URLs Wrong
Database should store URLs like:
- ✅ `/uploads/vehicles/123/image.jpg`
- ❌ `http://localhost:3000/uploads/...`
- ❌ `file:///Users/...`

## Testing

Test the upload functionality:
1. Go to Add Vehicle page
2. Upload vehicle images and CR papers
3. Check `public/uploads/vehicles/[new-vehicle-id]/`
4. Verify images appear in vehicle details modal
5. Test download CR paper button

## Migration from Supabase Storage

If you have existing images in Supabase:

1. Download all images from Supabase Storage
2. Organize by vehicle ID
3. Update database URLs
4. Place in `public/uploads/vehicles/`

Script example:
```typescript
// Download from Supabase and save locally
const { data } = await supabase.storage.from('vehicle-images').list()
for (const file of data) {
  const { data: blob } = await supabase.storage
    .from('vehicle-images')
    .download(file.name)
  // Save blob to local filesystem
}
```

## Summary

✨ **What Changed:**
- Images now save to `public/uploads/vehicles/` instead of Supabase Storage
- New API route `/api/upload` handles file uploads
- Database still tracks image metadata
- URLs changed from Supabase URLs to local paths

🎯 **Next Steps:**
1. Test adding vehicles with images
2. Test editing vehicles and adding more images
3. Verify image display in inventory modal
4. Consider production deployment strategy
5. Set up backup process for uploads folder

---

**Created:** October 28, 2025  
**System:** PCN Vehicle Inventory 2.0
