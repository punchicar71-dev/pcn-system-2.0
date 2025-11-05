# Vehicle Card Image Carousel - Complete Implementation

## Problem Fixed
The vehicle card was showing only a single image instead of displaying all available vehicle images in an auto-playing carousel.

## Changes Made

### 1. **API Route Update** (`/web/src/app/api/vehicles/route.ts`)

#### Added `image_type` to the query
- Ensured image_type field is fetched from the database
- This allows filtering gallery images from other image types

#### Updated `transformToVehicleCard` function
- Now extracts ALL gallery images (not just the primary one)
- Sorts images by `display_order`
- Returns an `images` array with all gallery images:
```typescript
const galleryImages = vehicle.vehicle_images
  ?.filter((img: any) => img.image_type === 'gallery')
  .sort((a: any, b: any) => a.display_order - b.display_order)
  .map((img: any) => ({
    id: img.id,
    image_url: img.image_url,
    display_order: img.display_order
  })) || []
```

### 2. **VehicleCardData Type Update** (`/web/src/lib/types.ts`)
- Added `images` field to store array of image objects:
```typescript
images?: Array<{ 
  id: string
  image_url: string
  display_order: number 
}>
```

### 3. **VehicleCard Component Update** (`/web/src/components/VehicleCard.tsx`)

#### Simplified props
- Removed separate `images` prop (no longer needed)
- Component now reads images directly from `vehicle.images`

#### Image handling logic
```typescript
const allImages = vehicle.images && vehicle.images.length > 0
  ? vehicle.images.map(img => img.image_url)
  : (vehicle.imageUrl ? [vehicle.imageUrl] : [])
```

## How It Works Now

1. **Data Flow**:
   - API fetches all vehicle images from database
   - Filters for 'gallery' type images only
   - Sorts by display_order
   - Returns in VehicleCardData.images array

2. **Component Behavior**:
   - Receives complete images array from vehicle object
   - Auto-plays carousel (3 seconds per image)
   - Pauses auto-play on hover
   - Shows navigation arrows on hover
   - Displays dot indicators for all images
   - Shows image counter (e.g., "2 / 4")

3. **Image Carousel Features**:
   - ✅ All gallery images displayed
   - ✅ Auto-play every 3 seconds
   - ✅ Previous/Next navigation arrows
   - ✅ Clickable dot indicators
   - ✅ Image counter badge
   - ✅ Smooth fade transitions

## Testing Checklist

- [ ] Verify vehicles with multiple images show carousel
- [ ] Confirm auto-play rotates through all images
- [ ] Test navigation arrows appear on hover
- [ ] Test dot indicators are clickable
- [ ] Verify image counter shows correct values
- [ ] Check performance with many images
- [ ] Test vehicles with single image (fallback to imageUrl)
- [ ] Test vehicles with no images (placeholder)

## Data Requirements

For the carousel to work, vehicles must have associated images in the database:

```sql
-- Images must have:
- image_type = 'gallery'  -- filters out cr_paper, document, etc.
- image_url             -- valid URL to the image
- display_order         -- numeric order for sorting
```

## Performance Considerations

- Images are fetched with the vehicle data (no additional API calls)
- Auto-play interval uses memory-efficient setInterval
- Proper cleanup of intervals on component unmount
- Images use CSS opacity transitions (GPU accelerated)

## Rollback Plan

If issues arise, revert these files:
1. `/web/src/app/api/vehicles/route.ts` - Remove image filtering and sorting
2. `/web/src/components/VehicleCard.tsx` - Remove carousel logic
3. `/web/src/lib/types.ts` - Remove images field from VehicleCardData
