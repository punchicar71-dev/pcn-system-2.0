# 📊 Local Image Storage Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PCN Vehicle Inventory                        │
│                     Local Image Storage System                   │
└─────────────────────────────────────────────────────────────────┘

┌───────────────┐       ┌───────────────┐       ┌──────────────┐
│   Add Vehicle │       │   Edit        │       │   View       │
│   Page        │       │   Vehicle     │       │   Vehicle    │
└───────┬───────┘       └───────┬───────┘       └──────┬───────┘
        │                       │                       │
        │ Upload                │ Upload                │ Display
        │ Images                │ More Images           │ Images
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │  /api/upload           │
                    │  (Upload Handler)      │
                    └───────────┬────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Create       │ │ Save File    │ │ Return URL   │
        │ Directory    │ │ to Disk      │ │ Path         │
        └──────────────┘ └──────────────┘ └──────┬───────┘
                                                  │
                                                  ▼
                                        ┌──────────────────┐
                                        │ Save to Database │
                                        │ vehicle_images   │
                                        └──────────────────┘
```

## Upload Flow Diagram

```
User Action                 Frontend                Backend                 Storage
───────────                 ────────                ───────                 ───────

1. Select Images
   📁 [Choose Files]
         │
         │
2. Submit Form
         │
         ├──────────────────►
         │                   Create FormData
         │                   ├─ file: File
         │                   ├─ vehicleId: string
         │                   └─ imageType: string
         │
         │
3. POST /api/upload
         │                   ├──────────────────►
         │                   │                   Validate Request
         │                   │                   │
         │                   │                   ├─ Check file exists
         │                   │                   ├─ Check vehicleId
         │                   │                   └─ Check imageType
         │                   │
         │                   │                   Create Directory
         │                   │                   │
         │                   │                   └──────────────────►
         │                   │                                       mkdir -p
         │                   │                                       /public/uploads/
         │                   │                                       vehicles/[id]/
         │                   │
         │                   │                   Write File
         │                   │                   │
         │                   │                   └──────────────────►
         │                   │                                       Save to disk
         │                   │                                       [timestamp]-[name]
         │                   │
         │                   │                   ◄──────────────────
         │                   │                   Success!
         │                   │
         │                   ◄──────────────────
         │                   Return { url, fileName, fileSize }
         │
         ◄──────────────────
         Success!
         │
         │
4. Save to DB
         │
         └──────────────────►
                             INSERT INTO vehicle_images
                             (vehicle_id, image_url, ...)
                             │
                             ◄──────────────────
                             Success!

5. Display Images
   🖼️ [Show in UI]
         │
         └──────────────────►
                             <img src="/uploads/..." />
                                           │
                                           └──────────────────►
                                                               Serve from
                                                               public/uploads/
```

## Directory Structure Evolution

```
Initial State:
dashboard/
└── public/
    └── uploads/
        └── vehicles/
            └── .gitkeep

After Adding Vehicle ID: abc-123
dashboard/
└── public/
    └── uploads/
        └── vehicles/
            ├── .gitkeep
            └── abc-123/                    ← Created automatically

After Uploading Gallery Image:
dashboard/
└── public/
    └── uploads/
        └── vehicles/
            ├── .gitkeep
            └── abc-123/
                └── 1730123456-car-front.jpg    ← Gallery image

After Uploading CR Paper:
dashboard/
└── public/
    └── uploads/
        └── vehicles/
            ├── .gitkeep
            └── abc-123/
                ├── 1730123456-car-front.jpg
                ├── 1730123457-car-side.jpg
                └── documents/                   ← Created automatically
                    └── 1730123458-cr-paper.pdf ← CR document

After Adding Multiple Vehicles:
dashboard/
└── public/
    └── uploads/
        └── vehicles/
            ├── .gitkeep
            ├── abc-123/
            │   ├── 1730123456-car-front.jpg
            │   ├── 1730123457-car-side.jpg
            │   └── documents/
            │       └── 1730123458-cr-paper.pdf
            ├── def-456/
            │   ├── 1730123500-suv-front.jpg
            │   └── documents/
            │       └── 1730123501-registration.pdf
            └── ghi-789/
                ├── 1730123600-sedan-1.jpg
                ├── 1730123601-sedan-2.jpg
                └── 1730123602-sedan-3.jpg
```

## Data Flow: Add Vehicle

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Vehicle Details Form                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Vehicle Number: _______________                          │ │
│ │ Brand: [Select]   Model: [Select]                        │ │
│ │ Year: ____   Country: [Select]                           │ │
│ └─────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Upload Images                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📁 Vehicle Images: [Select Files]                        │ │
│ │    ├─ car-front.jpg  (2.3 MB)                           │ │
│ │    ├─ car-side.jpg   (1.8 MB)                           │ │
│ │    └─ car-rear.jpg   (2.1 MB)                           │ │
│ │                                                           │ │
│ │ 📄 CR Paper: [Select File]                               │ │
│ │    └─ registration.pdf  (0.5 MB)                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Submit & Process                                     │
│                                                              │
│   [Publish Vehicle] Button Clicked                          │
│            │                                                 │
│            ├──► 1. Insert vehicle record to database        │
│            │    └─► Returns: vehicle_id = "abc-123"         │
│            │                                                 │
│            ├──► 2. Upload gallery images                    │
│            │    ├─► POST /api/upload (car-front.jpg)        │
│            │    │   └─► /uploads/vehicles/abc-123/17...jpg  │
│            │    ├─► POST /api/upload (car-side.jpg)         │
│            │    │   └─► /uploads/vehicles/abc-123/17...jpg  │
│            │    └─► POST /api/upload (car-rear.jpg)         │
│            │        └─► /uploads/vehicles/abc-123/17...jpg  │
│            │                                                 │
│            ├──► 3. Upload CR paper                          │
│            │    └─► POST /api/upload (registration.pdf)     │
│            │        └─► /uploads/.../documents/17...pdf     │
│            │                                                 │
│            └──► 4. Save image records to database           │
│                 └─► INSERT INTO vehicle_images (x4)         │
│                                                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Success!                                             │
│                                                              │
│  ✅ Vehicle Added Successfully!                              │
│  ✅ 3 Gallery Images Uploaded                                │
│  ✅ 1 CR Paper Uploaded                                      │
│  ✅ Ready to View in Inventory                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Image Display Flow

```
User Opens Vehicle Details
         │
         ▼
┌─────────────────────────┐
│ Fetch vehicle data      │
│ from database           │
│                         │
│ SELECT * FROM vehicles  │
│ WHERE id = 'abc-123'    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Fetch image URLs        │
│ from database           │
│                         │
│ SELECT image_url        │
│ FROM vehicle_images     │
│ WHERE vehicle_id = ...  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Returns:                                 │
│ [                                        │
│   "/uploads/vehicles/abc-123/17...jpg", │
│   "/uploads/vehicles/abc-123/17...jpg", │
│   "/uploads/vehicles/abc-123/17...jpg"  │
│ ]                                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Display in Modal/Carousel               │
│                                          │
│ <img src="/uploads/vehicles/..." />     │
│           │                              │
│           ▼                              │
│   Next.js serves from public/           │
│           │                              │
│           ▼                              │
│   Browser displays image                │
│                                          │
└──────────────────────────────────────────┘
```

## Comparison: Before vs After

### Before (Supabase Storage)

```
User Upload
    │
    ▼
Upload to Supabase Storage
    │
    ├─► Storage Bucket: "vehicle-images"
    │   └─► Cloud Storage (External)
    │
    ▼
Get Public URL
    │
    └─► https://xxx.supabase.co/storage/v1/object/public/...
         │
         ▼
    Save URL to Database
         │
         ▼
    Display: Fetch from Cloud
```

### After (Local Storage)

```
User Upload
    │
    ▼
Upload to Local API
    │
    ├─► /api/upload
    │   └─► public/uploads/vehicles/ (Local Disk)
    │
    ▼
Get Local Path
    │
    └─► /uploads/vehicles/abc-123/...
         │
         ▼
    Save Path to Database
         │
         ▼
    Display: Serve from public/
```

## Component Integration

```
┌────────────────────────────────────────────────────────────┐
│                    React Components                         │
└────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ AddVehiclePage   │  │ EditVehicleModal │  │ InventoryPage    │
│                  │  │                  │  │                  │
│ uploadImages()   │  │ uploadNewImages()│  │ fetchVehicle     │
│      │           │  │      │           │  │ Details()        │
│      │           │  │      │           │  │      │           │
│      ▼           │  │      ▼           │  │      ▼           │
│ POST /api/upload │  │ POST /api/upload │  │ Display images   │
│      │           │  │      │           │  │ from URLs        │
│      ▼           │  │      ▼           │  │                  │
│ Save to DB       │  │ Save to DB       │  └──────────────────┘
└──────────────────┘  └──────────────────┘

┌────────────────────────────────────────────────────────────┐
│                     API Routes                              │
└────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ /api/upload      │  │ /api/upload/     │  │ /uploads/...     │
│ (POST)           │  │ cleanup          │  │ (Static Files)   │
│                  │  │ (DELETE)         │  │                  │
│ • Receive file   │  │ • Delete vehicle │  │ • Served by      │
│ • Create dir     │  │   images folder  │  │   Next.js from   │
│ • Save to disk   │  │ • Clean up disk  │  │   public/        │
│ • Return URL     │  │   space          │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    File System                              │
└────────────────────────────────────────────────────────────┘

public/uploads/vehicles/
├── abc-123/
│   ├── 1730123456-front.jpg  ←──── Gallery Images
│   ├── 1730123457-side.jpg
│   └── documents/
│       └── 1730123458-cr.pdf ←──── CR Papers
└── def-456/
    └── 1730123500-suv.jpg

┌────────────────────────────────────────────────────────────┐
│                    Database                                 │
└────────────────────────────────────────────────────────────┘

vehicles                          vehicle_images
┌─────────────────┐              ┌──────────────────────┐
│ id: abc-123     │──────────────│ vehicle_id: abc-123  │
│ vehicle_number  │       ▲      │ image_url: /uploads/ │
│ brand_id        │       │      │ image_type: gallery  │
│ model_id        │       │      │ display_order: 0     │
│ ...             │       │      └──────────────────────┘
└─────────────────┘       │      ┌──────────────────────┐
                          └──────│ vehicle_id: abc-123  │
                                 │ image_url: /uploads/ │
                                 │ image_type: cr_paper │
                                 │ display_order: 0     │
                                 └──────────────────────┘
```

## Summary

✅ **Simple Architecture:** Upload → Save → Display  
✅ **Local Storage:** Fast, no external dependencies  
✅ **Database Sync:** URLs tracked in vehicle_images table  
✅ **Automatic Cleanup:** Optional deletion on vehicle removal  
✅ **Next.js Serving:** Files served from public/ directory  

**System is ready!** All images now save locally. 🎉

---

**Architecture Version:** 1.0  
**Created:** October 28, 2025
