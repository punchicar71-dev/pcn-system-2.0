# Web Home Page - Upload UI Enhancement

## Overview
Added a professional, 100% accurate upload UI section to the Punch Car Niwasa web home page. This section allows users to easily upload their vehicles for sale with three distinct upload categories.

## Features

### ✨ Three Upload Categories

1. **Vehicle Images (Gallery)**
   - Orange/Yellow gradient header (`#F5A623` to `#E09615`)
   - For standard vehicle photography
   - Requirements:
     - High-quality photos recommended
     - Minimum 6-10 images
     - JPG, PNG format
   - Drag-and-drop support with hover effect

2. **360° View Images**
   - Blue gradient header (`from-blue-500 to-blue-600`)
   - For interactive 360-degree viewing
   - Requirements:
     - Sequential photos
     - 12-24 images optimal
     - Same dimensions preferred
   - Custom rotation icon indicator

3. **Registration & Documents**
   - Purple gradient header (`from-purple-500 to-purple-600`)
   - For CR books, registration, and emission tests
   - Requirements:
     - CR book required
     - Clear, legible copies
     - PDF or image formats
   - File upload support

### 📋 Simple 3-Step Process

The upload section includes a clear process flow:
1. **Upload Images & Documents** - Start with vehicle photos and registration
2. **Quick Verification** - Our team reviews the submission
3. **Get Listed** - Vehicle appears on the marketplace

### 🎨 Design Features

- **Gradient Headers**: Each upload card has a unique color gradient for easy identification
- **Icon System**: Clear icons from `lucide-react` for visual recognition
- **Hover Effects**: Shadow expansion and background color transitions
- **Responsive Grid**: 1 column on mobile, 3 columns on desktop
- **Accessibility**: Proper form controls with labels and ARIA attributes
- **Drag & Drop**: Full drag-and-drop support on all upload areas

## Component Structure

### Files Created

```
web/src/components/
├── UploadSection.tsx      # Main section component
└── UploadCard.tsx         # Reusable upload card component
```

### Component Hierarchy

```
HomePage (page.tsx)
└── UploadSection
    ├── UploadCard (Gallery)
    ├── UploadCard (360° Images)
    ├── UploadCard (Documents)
    └── Process Flow + CTA
```

## Component Props

### UploadCard Component

```typescript
interface UploadCardProps {
  type: 'gallery' | 'images360' | 'documents';
  title: string;                    // Card title
  description: string;              // Main description
  requirements: string[];           // List of requirements
  icon: React.ReactNode;           // Header icon element
  headerColor: string;             // Tailwind gradient classes
  borderColor: string;             // Dashed border color
  hoverBgColor: string;            // Hover background color
  onDrop?: (files: FileList) => void; // File drop handler
}
```

## Styling

- **Background**: Gradient from slate-50 to slate-100
- **Cards**: White with shadow and hover effects
- **Border Radius**: Consistent xl rounded corners
- **Font**: Bold titles with slate-900 text
- **Colors**: 
  - Primary accent: `#F5A623` (orange/yellow)
  - Secondary: Blue and Purple for differentiation
  - Text: Slate gray palette

## Integration

### Import in page.tsx

```typescript
import UploadSection from '@/components/UploadSection';

// In JSX
<UploadSection />
```

## File Upload Handling

The `UploadCard` component includes:
- `onDragOver`: Prevents default behavior for drag zones
- `onDragLeave`: Removes active state on drag leave
- `onDrop`: Handles dropped files
- `handleFileSelect`: Input change handler for file selection

## Future Enhancements

- Add file preview functionality
- Implement upload progress tracking
- Add image cropping tools
- Integrate S3 upload with presigned URLs
- Add validation and error handling
- Create upload status notifications

## Responsive Behavior

- **Mobile**: Single column layout
- **Tablet**: 2 columns where appropriate
- **Desktop**: 3 columns for upload cards
- **All devices**: Touch-friendly dropzones with adequate spacing

## Accessibility

- Proper form labels with `htmlFor` attributes
- Keyboard accessible file inputs
- Clear error states (future enhancement)
- Semantic HTML structure
- Color not the only indicator (icons + text)

## Testing Checklist

- [ ] Drag and drop files to upload areas
- [ ] Click to browse files
- [ ] Verify responsive layout on mobile/tablet/desktop
- [ ] Check hover states on cards
- [ ] Verify icon rendering
- [ ] Test link navigation to contact/help pages
- [ ] Validate form accessibility with screen readers

## Color Palette Reference

| Component | Colors |
|-----------|--------|
| Gallery Card | `from-[#F5A623] to-[#E09615]` |
| 360° Card | `from-blue-500 to-blue-600` |
| Documents Card | `from-purple-500 to-purple-600` |
| Primary CTA | `bg-[#F5A623] hover:bg-[#E09615]` |

---

**Last Updated**: October 31, 2025
**Version**: 1.0
