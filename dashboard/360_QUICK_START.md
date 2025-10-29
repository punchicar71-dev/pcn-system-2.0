# 360° Image Viewer - Quick Start

## ✅ What's Been Added

Three new components have been created for 360° vehicle viewing:

1. **Image360Viewer** - Core 360° rotation component
2. **VehicleImageViewer** - Combined gallery + 360° view switcher  
3. **Test Page** - Interactive demo and testing page

## 🚀 Quick Start

### 1. Test the Feature

Visit the test page to try it out:
```
http://localhost:3000/test-360
```

On this page you can:
- Load demo car images instantly
- Add your own image URLs
- Adjust rotation speed and sensitivity
- Test drag, auto-rotate, and fullscreen modes

### 2. How It's Already Integrated

The 360° viewer is now available in your **Inventory page**:

1. Go to **Inventory** page
2. Click the **View** (eye icon) on any vehicle
3. In the modal, you'll see a toggle at the top: **Gallery** / **360° View**
4. Click **360° View** to switch modes
5. Drag the image to rotate the vehicle!

## 📋 Features

### Interactive Controls
- **Drag to Rotate**: Click and drag left/right (or swipe on mobile)
- **Auto-Rotate**: Click Play button for automatic rotation
- **Fullscreen**: Click maximize for immersive view
- **Reset**: Return to first frame instantly

### Smart UI
- Image counter showing current frame
- Loading progress indicator
- 360° badge indicator
- Help tooltip on first use
- Mobile-friendly touch gestures

## 🎯 How to Add 360° Images to Vehicles

For best results, you need multiple images of the vehicle from different angles:

### Recommended Setup
- **24-36 images** for smooth rotation
- Photos taken every 10-15 degrees around the vehicle
- Consistent distance, height, and lighting
- Same aspect ratio for all images

### Current System
Your existing vehicle images will work! The system will:
1. Use all uploaded "gallery" images
2. Display them in order based on `display_order`
3. Allow rotation through them in 360° mode

## 🛠️ Technical Details

### New Files Created

```
dashboard/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── 360-viewer.tsx          (Core 360° component)
│   │   └── vehicle/
│   │       └── VehicleImageViewer.tsx   (Gallery + 360° combo)
│   └── app/
│       └── (dashboard)/
│           └── test-360/
│               └── page.tsx             (Test/demo page)
└── 360_VIEWER_GUIDE.md                  (Full documentation)
```

### Modified Files

```
dashboard/
└── src/
    └── app/
        └── (dashboard)/
            └── inventory/
                └── page.tsx             (Added VehicleImageViewer)
```

## 📱 Browser Support

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Chrome Android)
- ✅ Tablet devices
- ✅ Touch and mouse input

## 🎨 Customization

### Adjust Auto-Rotation Speed
Edit the VehicleImageViewer component:
```tsx
<Image360Viewer
  autoRotateSpeed={100}  // milliseconds (higher = slower)
/>
```

### Adjust Drag Sensitivity
```tsx
<Image360Viewer
  sensitivity={5}  // lower = more sensitive
/>
```

### Change Viewer Height
```tsx
<Image360Viewer
  height="600px"  // any CSS height value
/>
```

## 📖 Full Documentation

See `360_VIEWER_GUIDE.md` for:
- Complete API reference
- Image capture best practices
- Advanced configuration options
- Performance optimization tips
- Troubleshooting guide

## 🎓 Example Usage

### Basic Usage
```tsx
import Image360Viewer from '@/components/ui/360-viewer'

<Image360Viewer
  images={[
    'https://example.com/car-front.jpg',
    'https://example.com/car-side.jpg',
    // ... more images
  ]}
/>
```

### With Vehicle Data
```tsx
import VehicleImageViewer from '@/components/vehicle/VehicleImageViewer'

<VehicleImageViewer
  images={vehicleImages}
  vehicleName="Toyota Camry 2020"
/>
```

## 🆘 Need Help?

1. **Test Page Not Loading?**
   - Make sure dev server is running: `npm run dev`
   - Navigate to: `http://localhost:3000/test-360`

2. **Images Not Rotating Smoothly?**
   - You need at least 8-10 images minimum
   - 24+ images recommended for best results
   - Check image sizes are consistent

3. **Want to Modify?**
   - All code is in TypeScript/React
   - Components use Tailwind CSS for styling
   - Easy to customize colors, sizes, and behavior

## ✨ Next Steps

1. **Test it now**: Visit `/test-360` page
2. **Add more vehicle images**: Upload multiple angles for each vehicle
3. **Customize**: Adjust speeds and sensitivity to your preference
4. **Enjoy**: Give your users an amazing viewing experience!

---

**Ready to use!** 🎉 The 360° viewer is fully integrated and ready for testing.
