# 🔌 Local Storage API Reference

## Upload API Endpoint

### POST `/api/upload`

Upload a vehicle image to local storage.

#### Request

**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ Yes | Image file to upload |
| `vehicleId` | string | ✅ Yes | UUID of the vehicle |
| `imageType` | string | ✅ Yes | Either `gallery` or `cr_paper` |

#### Example Usage

```typescript
// Upload a gallery image
const uploadImage = async (file: File, vehicleId: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('vehicleId', vehicleId)
  formData.append('imageType', 'gallery')

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  return await response.json()
}

// Usage
const result = await uploadImage(myFile, 'abc-123-def-456')
console.log(result.url) // /uploads/vehicles/abc-123-def-456/1730123456-image.jpg
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "url": "/uploads/vehicles/abc-123-def-456/1730123456-image.jpg",
  "fileName": "car-photo.jpg",
  "fileSize": 245678,
  "storagePath": "/uploads/vehicles/abc-123-def-456/1730123456-image.jpg"
}
```

**Error (400/500):**
```json
{
  "error": "No file uploaded",
  "details": "Error message here"
}
```

---

## Cleanup API Endpoint

### DELETE `/api/upload/cleanup`

Delete all images for a specific vehicle.

#### Request

**Method:** `DELETE`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "vehicleId": "abc-123-def-456"
}
```

#### Example Usage

```typescript
// Delete all vehicle images
const deleteVehicleImages = async (vehicleId: string) => {
  const response = await fetch('/api/upload/cleanup', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vehicleId }),
  })

  if (!response.ok) {
    throw new Error('Failed to delete images')
  }

  return await response.json()
}

// Usage
await deleteVehicleImages('abc-123-def-456')
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Vehicle images deleted successfully",
  "vehicleId": "abc-123-def-456"
}
```

**Error (400/500):**
```json
{
  "error": "Vehicle ID is required",
  "details": "Error message here"
}
```

---

## Stats API Endpoint

### GET `/api/upload?action=stats`

Get storage statistics (future enhancement).

#### Request

**Method:** `GET`  
**Query Params:** `?action=stats`

#### Example Usage

```typescript
const response = await fetch('/api/upload?action=stats')
const stats = await response.json()
```

#### Response

```json
{
  "success": true,
  "message": "Storage stats endpoint",
  "uploadsPath": "/uploads/vehicles/"
}
```

---

## Implementation Examples

### Full Upload Flow in Add Vehicle

```typescript
const uploadImages = async (vehicleId: string) => {
  const { vehicleImages, crImages } = formState.vehicleDetails
  const uploadPromises: Promise<any>[] = []

  // Upload vehicle images
  for (let i = 0; i < vehicleImages.length; i++) {
    const file = vehicleImages[i]
    
    const uploadPromise = (async () => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('vehicleId', vehicleId)
      formData.append('imageType', 'gallery')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()

      // Save to database
      await supabase.from('vehicle_images').insert({
        vehicle_id: vehicleId,
        image_url: result.url,
        image_type: 'gallery',
        storage_path: result.storagePath,
        file_name: result.fileName,
        file_size: result.fileSize,
        is_primary: i === 0,
        display_order: i,
      })
    })()

    uploadPromises.push(uploadPromise)
  }

  // Upload CR papers
  for (let i = 0; i < crImages.length; i++) {
    const file = crImages[i]
    
    const uploadPromise = (async () => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('vehicleId', vehicleId)
      formData.append('imageType', 'cr_paper')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()

      // Save to database
      await supabase.from('vehicle_images').insert({
        vehicle_id: vehicleId,
        image_url: result.url,
        image_type: 'cr_paper',
        storage_path: result.storagePath,
        file_name: result.fileName,
        file_size: result.fileSize,
        is_primary: false,
        display_order: i,
      })
    })()

    uploadPromises.push(uploadPromise)
  }

  await Promise.all(uploadPromises)
}
```

### Delete Vehicle with Cleanup

```typescript
const deleteVehicle = async (vehicleId: string) => {
  try {
    // 1. Delete from database
    await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)

    // 2. Clean up images from local storage
    await fetch('/api/upload/cleanup', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vehicleId }),
    })

    console.log('Vehicle and images deleted successfully')
  } catch (error) {
    console.error('Delete failed:', error)
  }
}
```

### Batch Upload with Progress

```typescript
const uploadWithProgress = async (
  files: File[], 
  vehicleId: string,
  onProgress: (percent: number) => void
) => {
  let completed = 0
  const total = files.length

  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('vehicleId', vehicleId)
    formData.append('imageType', 'gallery')

    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    completed++
    onProgress((completed / total) * 100)
  }
}

// Usage
await uploadWithProgress(myFiles, vehicleId, (percent) => {
  console.log(`Upload progress: ${percent}%`)
})
```

---

## Error Handling

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| "No file uploaded" | 400 | Missing file in FormData | Ensure file is appended |
| "Vehicle ID is required" | 400 | Missing vehicleId | Include vehicleId in request |
| "Upload failed" | 500 | Disk write error | Check permissions & space |
| "Failed to delete images" | 500 | Directory not found | Vehicle folder doesn't exist |

### Robust Error Handling

```typescript
const safeUpload = async (file: File, vehicleId: string) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('vehicleId', vehicleId)
    formData.append('imageType', 'gallery')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Upload failed')
    }

    const result = await response.json()
    return { success: true, data: result }
    
  } catch (error) {
    console.error('Upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
```

---

## File Paths

### URL Structure

```
Gallery Image:
/uploads/vehicles/[vehicle-id]/[timestamp]-[filename].jpg

CR Paper:
/uploads/vehicles/[vehicle-id]/documents/[timestamp]-[filename].pdf
```

### Physical Paths

```
Gallery Image:
public/uploads/vehicles/[vehicle-id]/[timestamp]-[filename].jpg

CR Paper:
public/uploads/vehicles/[vehicle-id]/documents/[timestamp]-[filename].pdf
```

### Example

```
URL: /uploads/vehicles/abc-123/1730123456-car.jpg
Physical: public/uploads/vehicles/abc-123/1730123456-car.jpg
Access in browser: http://localhost:3001/uploads/vehicles/abc-123/1730123456-car.jpg
```

---

## Testing the API

### Test Upload

```bash
# Test with curl
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/image.jpg" \
  -F "vehicleId=test-123" \
  -F "imageType=gallery"
```

### Test Cleanup

```bash
# Test with curl
curl -X DELETE http://localhost:3001/api/upload/cleanup \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"test-123"}'
```

### Test Stats

```bash
# Test with curl
curl http://localhost:3001/api/upload?action=stats
```

---

## Performance Considerations

### Upload Speed
- **Average:** 50-100 images/minute on local filesystem
- **Factors:** File size, disk speed, CPU

### Optimization Tips
1. Upload in parallel with `Promise.all()`
2. Limit concurrent uploads to 5-10
3. Use compression before upload if needed
4. Consider image resizing for thumbnails

### Example: Controlled Parallel Upload

```typescript
const uploadInBatches = async (files: File[], vehicleId: string, batchSize = 5) => {
  const results = []
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(file => uploadImage(file, vehicleId))
    )
    results.push(...batchResults)
  }
  
  return results
}
```

---

## Security Notes

### Current Implementation
- ✅ Files sanitized (special characters removed)
- ✅ Unique timestamps prevent collisions
- ✅ Organized by vehicle ID
- ⚠️ No auth check on upload (add if needed)
- ⚠️ No file type validation (add if needed)

### Recommended Enhancements

```typescript
// Add file type validation
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type')
}

// Add file size limit (e.g., 10MB)
const maxSize = 10 * 1024 * 1024
if (file.size > maxSize) {
  throw new Error('File too large')
}

// Add auth check
const session = await getServerSession()
if (!session) {
  throw new Error('Unauthorized')
}
```

---

## Summary

✅ **Simple Upload:** `POST /api/upload` with FormData  
✅ **Clean Deletion:** `DELETE /api/upload/cleanup`  
✅ **Direct Access:** Files served from `/uploads/...`  
✅ **Database Sync:** URLs stored in `vehicle_images` table  

**Ready to use!** The API is live at `http://localhost:3001/api/upload`

---

**Documentation Version:** 1.0  
**Last Updated:** October 28, 2025
