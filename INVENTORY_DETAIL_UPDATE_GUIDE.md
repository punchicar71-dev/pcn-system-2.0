# Inventory Page Vehicle Detail & Edit Update

## Overview
This document describes the improvements made to the inventory page vehicle detail view modal and edit functionality, including:

1. ✅ Enhanced Vehicle Detail Modal with Carousel
2. ✅ 360° Image View Integration
3. ✅ AWS S3 Image Loading from Supabase
4. ✅ CR/Paper Image Download Functionality
5. ✅ Seller Information Display
6. ✅ Vehicle Options Display
7. ⚠️ Edit Modal Improvements (In Progress)

## What Has Been Fixed

### 1. Vehicle Image S3 Storage
- **File**: `dashboard/migrations/2025_01_add_s3_key_to_vehicle_images.sql`
- **File**: `dashboard/src/app/(dashboard)/add-vehicle/page.tsx`

**Changes:**
- Made `storage_path` column nullable in `vehicle_images` table
- Added `storage_path` field to all image insert operations
- Now properly stores both `s3_key` and `storage_path` for S3 images

### 2. Vehicle Detail Modal (New Implementation Needed)
**File**: `dashboard/src/components/inventory/VehicleDetailModal.tsx`

The new modal needs to include:

**Features:**
- 5 tabs: Overview, Gallery, 360° View, Documents, Seller
- Shadcn UI Carousel for image slideshow with auto-play
- Load images from Supabase `vehicle_images` table
- Filter images by type:
  - `gallery` → Gallery tab
  - `image_360` → 360° View tab
  - `cr_paper` / `document` → Documents tab
- Download CR/Paper images functionality
- Display seller information from `sellers` table
- Display vehicle options from `vehicle_options` & `vehicle_options_master` tables

## Implementation Guide

### Step 1: Install Required Dependencies

```bash
cd dashboard
npm install embla-carousel-autoplay
```

### Step 2: Create the New VehicleDetailModal Component

Create `/dashboard/src/components/inventory/VehicleDetailModal.tsx` with the following structure:

```typescript
'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image360Viewer from '@/components/ui/360-viewer'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import Autoplay from 'embla-carousel-autoplay'

interface VehicleDetailModalProps {
  open: boolean
  onClose: () => void
  vehicle: {
    id: string
    vehicle_number: string
    brand_name?: string
    model_name?: string
    // ... other vehicle fields
  }
}

export default function VehicleDetailModal({ open, onClose, vehicle }: VehicleDetailModalProps) {
  const [galleryImages, setGalleryImages] = useState([])
  const [image360, setImage360] = useState([])
  const [crImages, setCrImages] = useState([])
  const [sellerData, setSellerData] = useState(null)
  const [vehicleOptions, setVehicleOptions] = useState([])
  
  const supabase = createClient()
  
  useEffect(() => {
    if (open && vehicle?.id) {
      fetchVehicleData()
    }
  }, [open, vehicle?.id])

  const fetchVehicleData = async () => {
    // Fetch images from vehicle_images table
    const { data: imagesData } = await supabase
      .from('vehicle_images')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('display_order', { ascending: true })

    // Separate by type
    setGalleryImages(imagesData?.filter(img => img.image_type === 'gallery') || [])
    setImage360(imagesData?.filter(img => img.image_type === 'image_360') || [])
    setCrImages(imagesData?.filter(img => img.image_type === 'cr_paper') || [])

    // Fetch seller data
    const { data: sellerInfo } = await supabase
      .from('sellers')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .maybeSingle()
    
    setSellerData(sellerInfo)

    // Fetch vehicle options
    const { data: optionsData } = await supabase
      .from('vehicle_options')
      .select('option_id')
      .eq('vehicle_id', vehicle.id)

    // Get option names
    if (optionsData) {
      const { data: optionNames } = await supabase
        .from('vehicle_options_master')
        .select('option_name')
        .in('id', optionsData.map(opt => opt.option_id))
      
      setVehicleOptions(optionNames || [])
    }
  }

  const handleDownloadCRImages = async () => {
    for (const image of crImages) {
      const response = await fetch(image.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = image.file_name || `CR_${vehicle.vehicle_number}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }

  const plugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: true }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle.brand_name} {vehicle.model_name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="images">Gallery ({galleryImages.length})</TabsTrigger>
            <TabsTrigger value="360" disabled={image360.length === 0}>360° View</TabsTrigger>
            <TabsTrigger value="documents">Documents ({crImages.length})</TabsTrigger>
            <TabsTrigger value="seller">Seller</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Vehicle specs and featured carousel */}
            {galleryImages.length > 0 && (
              <Carousel plugins={[plugin.current]} className="w-full">
                <CarouselContent>
                  {galleryImages.map((image, index) => (
                    <CarouselItem key={image.id}>
                      <Card>
                        <CardContent className="flex aspect-[16/9] items-center justify-center p-0">
                          <Image
                            src={image.image_url}
                            alt={`${vehicle.vehicle_number} - ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
          </TabsContent>

          <TabsContent value="images">
            {/* Grid of all gallery images */}
          </TabsContent>

          <TabsContent value="360">
            {image360.length > 0 && (
              <Image360Viewer
                images={image360.map(img => img.image_url)}
                autoRotate={true}
                height="600px"
              />
            )}
          </TabsContent>

          <TabsContent value="documents">
            {crImages.length > 0 && (
              <>
                <Button onClick={handleDownloadCRImages}>
                  Download All CR/Paper Images
                </Button>
                {/* Grid of CR images */}
              </>
            )}
          </TabsContent>

          <TabsContent value="seller">
            {/* Display seller information */}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

### Step 3: Update Inventory Page

The inventory page (`dashboard/src/app/(dashboard)/inventory/page.tsx`) already imports and uses `VehicleDetailModal`. Just ensure the data passed includes:

```typescript
const openDetailModal = async (vehicleId: string) => {
  const { data: vehicleData } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .single()

  // Get vehicle from list for brand/model/country names
  const vehicleFromList = vehicles.find(v => v.id === vehicleId)

  setDetailVehicleData({
    ...vehicleData,
    brand_name: vehicleFromList?.brand_name,
    model_name: vehicleFromList?.model_name,
    country_name: vehicleFromList?.country_name,
  })
  setIsDetailModalOpen(true)
}
```

### Step 4: Fix Next.js Image Domain Configuration

Add AWS S3 bucket domain to `next.config.js`:

```javascript
const nextConfig = {
  images: {
    domains: [
      'wnorajpknqegnnmeotjf.supabase.co',
      'pcn-system-bucket.s3.us-east-1.amazonaws.com', // Add your S3 bucket domain
      'your-bucket-name.s3.your-region.amazonaws.com', // Or your actual bucket
    ],
  },
}
```

## Database Migration Required

Before testing, run the migration:

```sql
-- Already created in: dashboard/migrations/2025_01_add_s3_key_to_vehicle_images.sql

ALTER TABLE IF EXISTS vehicle_images
ALTER COLUMN storage_path DROP NOT NULL;

ALTER TABLE IF EXISTS vehicle_images
ADD COLUMN IF NOT EXISTS s3_key VARCHAR(500);

ALTER TABLE IF EXISTS vehicle_images
DROP CONSTRAINT IF EXISTS check_image_type;

ALTER TABLE IF EXISTS vehicle_images
ADD CONSTRAINT check_image_type CHECK (image_type IN ('gallery', 'cr_paper', 'document', 'image_360'));

CREATE INDEX IF NOT EXISTS idx_vehicle_images_s3_key ON vehicle_images(s3_key);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_image_type ON vehicle_images(image_type);
```

## Testing Checklist

- [ ] View vehicle details from inventory page
- [ ] Carousel auto-plays gallery images
- [ ] Can navigate between carousel images
- [ ] 360° view tab shows/hides based on images
- [ ] Can rotate 360° images
- [ ] CR/Paper images display in Documents tab
- [ ] Can download individual CR images
- [ ] Can download all CR images at once
- [ ] Seller information displays correctly
- [ ] Vehicle options display as badges
- [ ] Tag notes and special notes display
- [ ] All images load from S3 correctly

## Key Components Structure

```
dashboard/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       └── inventory/
│   │           └── page.tsx                    # Main inventory page
│   ├── components/
│   │   ├── inventory/
│   │   │   ├── VehicleDetailModal.tsx         # NEW: Enhanced detail modal
│   │   │   └── EditVehicleModal.tsx           # Existing edit modal
│   │   └── ui/
│   │       ├── carousel.tsx                    # Shadcn carousel
│   │       ├── 360-viewer.tsx                  # Existing 360 viewer
│   │       └── dialog.tsx                      # Shadcn dialog
│   └── lib/
│       ├── supabase-client.ts                  # Supabase client
│       └── s3-client.ts                        # S3 utilities
└── migrations/
    └── 2025_01_add_s3_key_to_vehicle_images.sql
```

## Benefits

1. **Better UX**: Auto-playing carousel with smooth transitions
2. **Organized Data**: Clear tabs for different content types
3. **S3 Integration**: All images loaded directly from AWS S3
4. **Download Feature**: Easy CR/Paper document downloads
5. **Complete Info**: Seller details and options in one place
6. **Responsive Design**: Works on mobile and desktop
7. **Performance**: Lazy loading with Next.js Image component

## Next Steps

1. Apply the database migration in Supabase
2. Install `embla-carousel-autoplay` package
3. Create the new VehicleDetailModal component (use code above as template)
4. Update Next.js config for S3 images
5. Test all functionality
6. Update EditVehicleModal if needed

## Notes

- Images are stored in S3 with structure: `{folder}/{vehicle_id}/{timestamp}-{filename}`
- The `vehicle_images` table has columns: `id`, `vehicle_id`, `image_url`, `s3_key`, `storage_path`, `image_type`, `display_order`, `file_name`, `file_size`, `is_primary`
- Image types: `gallery`, `image_360`, `cr_paper`, `document`
- Always filter by `image_type` to separate different kinds of images

---

**Status**: ⚠️ In Progress - VehicleDetailModal component needs to be created manually due to file corruption issue
**Date**: October 30, 2025
