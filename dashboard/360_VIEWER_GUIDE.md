# 360° Image Viewer Feature

## Overview
A fully interactive 360-degree image viewer has been added to your vehicle management system. This feature allows users to view vehicles from all angles with smooth rotation and interactive controls.

## Features

### 🎯 Core Functionality
- **Drag to Rotate**: Users can click and drag (or swipe on mobile) to rotate through vehicle images
- **Auto-Rotation**: Automatic rotation mode with adjustable speed
- **Fullscreen Mode**: Expand viewer to fullscreen for immersive viewing
- **Touch Support**: Fully responsive with mobile touch gestures
- **Image Preloading**: Smooth experience with progressive image loading
- **Progress Indicator**: Visual progress bar showing rotation position

### 🎨 User Interface
- **View Mode Toggle**: Switch between Gallery and 360° View
- **Interactive Controls**:
  - Play/Pause auto-rotation
  - Reset to first frame
  - Fullscreen toggle
- **Visual Feedback**:
  - Image counter (e.g., "5 / 24")
  - 360° VIEW badge
  - Loading progress indicator
  - Helpful tooltips

### 📱 Responsive Design
- Works on desktop, tablet, and mobile devices
- Touch-optimized for mobile viewing
- Adaptive controls for different screen sizes

## Components Created

### 1. `Image360Viewer` Component
**Location**: `/dashboard/src/components/ui/360-viewer.tsx`

A reusable 360° image viewer component with the following props:

```typescript
interface Image360ViewerProps {
  images: string[]           // Array of image URLs
  autoRotate?: boolean       // Enable auto-rotation (default: false)
  autoRotateSpeed?: number   // Speed in milliseconds (default: 50)
  sensitivity?: number       // Drag sensitivity (default: 5)
  className?: string         // Additional CSS classes
  showControls?: boolean     // Show control buttons (default: true)
  height?: string           // Container height (default: '500px')
}
```

**Features**:
- Smooth drag-based rotation
- Auto-rotation with play/pause
- Fullscreen support
- Loading state with progress
- Help overlay for first-time users
- Keyboard-friendly

### 2. `VehicleImageViewer` Component
**Location**: `/dashboard/src/components/vehicle/VehicleImageViewer.tsx`

A comprehensive vehicle image viewer that combines both gallery carousel and 360° view modes.

```typescript
interface VehicleImageViewerProps {
  images: VehicleImage[]     // Array of vehicle images
  vehicleName?: string       // Vehicle name for alt text
  className?: string         // Additional CSS classes
}
```

**Features**:
- Toggle between Gallery and 360° View
- Displays image count
- Primary image badge
- Usage instructions
- Sorted by display_order

## Integration

### Inventory Page
The 360° viewer has been integrated into the inventory page vehicle details modal:

**File**: `/dashboard/src/app/(dashboard)/inventory/page.tsx`

```tsx
import VehicleImageViewer from '@/components/vehicle/VehicleImageViewer'

// In the modal:
<VehicleImageViewer
  images={vehicleImages}
  vehicleName={`${selectedVehicle.brand_name} ${selectedVehicle.model_name}`}
/>
```

## Usage Instructions

### For End Users

1. **View Vehicle Details**: Click the "View" (eye icon) button on any vehicle in the inventory
2. **Switch to 360° View**: Click the "360° View" button at the top of the image viewer
3. **Interact with the View**:
   - **Drag**: Click and drag left/right to rotate
   - **Auto-Rotate**: Click the Play button to auto-rotate
   - **Fullscreen**: Click the maximize button for fullscreen view
   - **Reset**: Click the reset button to return to the first frame

### For Developers

#### Basic Usage
```tsx
import Image360Viewer from '@/components/ui/360-viewer'

<Image360Viewer
  images={[
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    // ... more images
  ]}
  autoRotate={false}
  sensitivity={8}
/>
```

#### With VehicleImageViewer
```tsx
import VehicleImageViewer from '@/components/vehicle/VehicleImageViewer'

<VehicleImageViewer
  images={vehicleImages}
  vehicleName="Toyota Corolla 2020"
/>
```

## Best Practices

### Image Requirements
For the best 360° experience:
- **Number of Images**: 24-36 images recommended for smooth rotation
- **Image Size**: 1920x1080px or similar aspect ratio
- **File Format**: JPG or PNG
- **File Size**: Optimize images to < 500KB each for faster loading
- **Consistency**: All images should be taken at the same:
  - Distance from the vehicle
  - Height/angle
  - Lighting conditions
  - Background (preferably uniform)

### Capture Process
1. Place vehicle on a turntable or walk around it
2. Take photos at regular intervals (every 10-15 degrees)
3. Maintain consistent framing and focus
4. Use a tripod for stable shots
5. Process images to ensure consistent sizing

### Performance Tips
- Images are preloaded for smooth rotation
- Use optimized/compressed images
- Consider lazy loading for vehicles with many images
- Enable auto-rotation sparingly to save resources

## Configuration

### Adjusting Rotation Speed
```tsx
<Image360Viewer
  images={images}
  autoRotateSpeed={100}  // Slower rotation (higher = slower)
/>
```

### Adjusting Drag Sensitivity
```tsx
<Image360Viewer
  images={images}
  sensitivity={5}  // Lower = more sensitive
/>
```

### Custom Height
```tsx
<Image360Viewer
  images={images}
  height="600px"
/>
```

## Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ✅ Fullscreen API support required for fullscreen mode

## Future Enhancements
- [ ] Zoom in/out functionality
- [ ] Hotspots for highlighting specific features
- [ ] Integration with AR/VR viewers
- [ ] AI-powered background removal
- [ ] Automated 360° image generation from video
- [ ] Speed controls for auto-rotation
- [ ] Thumbnail strip for quick navigation
- [ ] Share 360° view link

## Troubleshooting

### Images not loading
- Check image URLs are publicly accessible
- Verify CORS settings on image host
- Check browser console for errors

### Slow performance
- Reduce image file sizes
- Reduce number of images
- Check network speed
- Clear browser cache

### Rotation not smooth
- Increase the number of images
- Ensure images are evenly spaced
- Adjust sensitivity setting

## Support
For issues or questions, contact the development team or check the project documentation.

---

**Version**: 1.0.0  
**Last Updated**: October 28, 2025  
**Author**: PCN System Development Team
