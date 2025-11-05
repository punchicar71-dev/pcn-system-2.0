# Vehicle Card Image Slider Implementation Guide

## Overview
The VehicleCard component has been updated to include an **auto-playing image slider** that displays all available vehicle images with smooth transitions and interactive controls.

## New Features

### 1. **Auto-Play Carousel**
- Images automatically cycle through every 3 seconds
- Auto-play pauses when hovering over the image section
- Smooth fade transition between images

### 2. **Image Navigation**
- **Previous/Next Arrows**: Appear on hover, allow manual image navigation
- **Dot Indicators**: Click to jump to a specific image
- **Image Counter**: Shows current position (e.g., "2 / 4")

### 3. **Multiple Image Support**
- Displays all vehicle images in order of `display_order`
- Falls back to single `imageUrl` if no images array provided
- Gracefully handles cases with no images (shows placeholder)

### 4. **Responsive Controls**
- Navigation arrows appear only on hover for clean UI
- Dot indicators are interactive and clickable
- All controls have smooth transitions

## Usage

### Basic Usage (Single Image)
```tsx
<VehicleCard vehicle={vehicleData} />
```

### With Multiple Images
```tsx
<VehicleCard 
  vehicle={vehicleData}
  images={[
    { 
      id: '1', 
      image_url: 'https://example.com/image1.jpg',
      display_order: 1 
    },
    { 
      id: '2', 
      image_url: 'https://example.com/image2.jpg',
      display_order: 2 
    },
    { 
      id: '3', 
      image_url: 'https://example.com/image3.jpg',
      display_order: 3 
    }
  ]}
/>
```

## Data Structure

### VehicleCardData (Updated)
```typescript
export interface VehicleCardData {
  id: string
  name: string
  brand: string
  model: string
  year: number
  price: number
  fuelType: string
  transmission: string
  mileage?: number
  condition?: string
  imageUrl?: string
  images?: Array<{ 
    id: string
    image_url: string
    display_order: number 
  }>
  rating?: number
  daysAgo?: number
}
```

## Component Props

| Prop | Type | Description |
|------|------|-------------|
| `vehicle` | `VehicleCardData` | Vehicle data to display (required) |
| `images` | `Array<{id, image_url, display_order}>` | Array of vehicle images (optional) |

## Features Breakdown

### Auto-Play Behavior
- **Interval**: 3 seconds per image
- **Pause Condition**: Auto-play pauses when hovering
- **Restart**: Auto-play resumes when mouse leaves

### Visual Elements

#### Navigation Arrows
- Hidden by default
- Visible on hover
- Positioned on left and right sides
- Dark semi-transparent background with white icons

#### Dot Indicators
- Show below the image
- Yellow (#ffd700) for active image (wider)
- White with reduced opacity for inactive
- Clickable to jump to specific image

#### Image Counter
- Top-left corner
- Format: "current / total" (e.g., "2 / 4")
- Only shown when multiple images available
- Dark semi-transparent background

## Styling

### Tailwind Classes Used
- Image transitions: `transition-opacity duration-500`
- Button hover effects: `opacity-0 group-hover:opacity-100`
- Badge styling: `bg-black bg-opacity-50`
- Active dot indicator: `w-4` (wider) `bg-yellow-400`

## Accessibility

- All interactive elements have `aria-label` attributes
- Keyboard accessible through standard button behavior
- Clear visual feedback for current image

## Integration Points

### For API/Data Fetching
When fetching vehicle data, include images with proper `display_order`:

```typescript
// Example: Fetch from database
const vehicleData = await fetchVehicle(vehicleId);
const images = await fetchVehicleImages(vehicleId, {
  types: ['gallery'],
  orderBy: 'display_order'
});

// Pass to component
<VehicleCard 
  vehicle={vehicleData}
  images={images}
/>
```

## Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Performance Notes
- Optimized image loading with lazy evaluation
- Interval cleanup on component unmount
- Efficient state updates with useCallback (if needed)
- Image transitions use CSS transforms (performant)

## Future Enhancements
- Keyboard navigation (arrow keys)
- Touch/swipe support for mobile
- Image preloading
- Customizable auto-play interval
- Image fade-in animation on first load
