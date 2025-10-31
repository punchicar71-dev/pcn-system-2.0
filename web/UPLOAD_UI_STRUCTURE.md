# Web Home Page Upload UI - Visual Structure

## Page Layout Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     HERO SECTION                            │
│        (Background Image with Search Box)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              BRAND LOGOS SECTION                            │
│     (BMW, Honda, Toyota, etc. - Horizontal Scroll)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            LATEST VEHICLES SECTION                          │
│     (4 Featured Vehicle Cards in Grid)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
╔═════════════════════════════════════════════════════════════╗
║       ⭐ NEW: UPLOAD SECTION - "Want to Sell?" ⭐          ║
║                                                              ║
║  Background: Gradient (slate-50 to slate-100)              ║
║                                                              ║
║  Section Title:                                             ║
║  "Want to Sell Your Vehicle?"                              ║
║  "Upload your vehicle images and documents..."             ║
║                                                              ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     ║
║  │   CARD 1     │  │   CARD 2     │  │   CARD 3     │     ║
║  │              │  │              │  │              │     ║
║  │  [HEADER]    │  │  [HEADER]    │  │  [HEADER]    │     ║
║  │  Orange/Yel  │  │  Blue        │  │  Purple      │     ║
║  │              │  │              │  │              │     ║
║  │  🖼️          │  │  ⟲           │  │  📄          │     ║
║  │  Vehicle     │  │  360° View   │  │  Documents   │     ║
║  │  Images      │  │  Images      │  │  & Registration
║  │              │  │              │  │              │     ║
║  │ Description  │  │ Description  │  │ Description  │     ║
║  │              │  │              │  │              │     ║
║  │ ✓ Require.   │  │ ✓ Require.   │  │ ✓ Require.   │     ║
║  │ ✓ Require.   │  │ ✓ Require.   │  │ ✓ Require.   │     ║
║  │ ✓ Require.   │  │ ✓ Require.   │  │ ✓ Require.   │     ║
║  │              │  │              │  │              │     ║
║  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │     ║
║  │ │ Drop    │ │  │ │ Drop    │ │  │ │ Upload  │ │     ║
║  │ │ Zone    │ │  │ │ Zone    │ │  │ │ Zone    │ │     ║
║  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │     ║
║  └──────────────┘  └──────────────┘  └──────────────┘     ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │    SIMPLE 3-STEP PROCESS                              │ ║
║  │                                                        │ ║
║  │ ⭕ 1: Upload Images & Documents                       │ ║
║  │      → Start by uploading your photos...             │ ║
║  │                                                        │ ║
║  │ ⭕ 2: Quick Verification                             │ ║
║  │      → Our team reviews your submission...           │ ║
║  │                                                        │ ║
║  │ ⭕ 3: Get Listed                                      │ ║
║  │      → Your vehicle appears on marketplace...         │ ║
║  │                                                        │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │     [📤 Start Selling Your Vehicle]                   │ ║
║  │          (Primary CTA Button)                         │ ║
║  │                                                        │ ║
║  │     Questions? View our Help Guide                    │ ║
║  └────────────────────────────────────────────────────────┘ ║
╚═════════════════════════════════════════════════════════════╝
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           SERVICES OVERVIEW SECTION                         │
│        (Dark background with 3 service cards)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CTA SECTION (Call-to-Action)                   │
│        Orange background with buttons                       │
└─────────────────────────────────────────────────────────────┘
```

## Upload Card Anatomy (Individual Card Detail)

```
┌─────────────────────────────────┐
│   [HEADER GRADIENT]             │ ← h-40, Gradient background
│   [ICON SIZE 64]                │ ← Color-coded by type
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  📤 Vehicle Images              │ ← Title with icon
│  Upload clear photos...         │ ← Description text
│                                 │
│  ✓ High-quality photos rec.     │ ← Requirement item
│  ✓ Min 6-10 images             │
│  ✓ JPG, PNG format             │
│                                 │
│  ┌─────────────────────────────┐│ ← Dashed border drop zone
│  │ [ICON]                      ││
│  │ Drag & drop here...         ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (< 768px)
```
[UPLOAD CARD 1]
[UPLOAD CARD 2]
[UPLOAD CARD 3]
(Single column, full width)

[PROCESS STEP 1]
[PROCESS STEP 2]
[PROCESS STEP 3]
(Stacked vertically, no arrows)
```

### Tablet (768px - 1024px)
```
[UPLOAD CARD 1] [UPLOAD CARD 2]
[UPLOAD CARD 3] [EMPTY]
(Two columns)

[STEP 1]      [STEP 2]      [STEP 3]
(Three columns with arrows hidden)
```

### Desktop (> 1024px)
```
[UPLOAD CARD 1] [UPLOAD CARD 2] [UPLOAD CARD 3]
(Three columns, full display)

[STEP 1] → [STEP 2] → [STEP 3]
(Three columns with visible arrows between steps)
```

## Color Scheme

### Header Gradients
```
Gallery:    from-[#F5A623] to-[#E09615]  (Orange/Yellow)
360°:       from-blue-500 to-blue-600     (Blue)
Documents:  from-purple-500 to-purple-600 (Purple)
```

### Interactive States
```
Idle:   border-[color]-300, bg-white
Hover:  border-[color]-500, bg-[color]-50
Active: Darker border, maintained bg
```

### Text Colors
```
Title:   text-slate-900 (bold)
Body:    text-slate-600
Accent:  text-[#F5A623] (buttons & highlights)
Success: text-green-500 (checkmarks)
```

## Component Files Structure

```
web/
├── src/
│   ├── app/
│   │   └── page.tsx                    ← Main home page
│   │       imports UploadSection
│   │
│   └── components/
│       ├── UploadSection.tsx           ← Main container
│       │   └── imports UploadCard (x3)
│       │
│       └── UploadCard.tsx              ← Reusable card
│           └── Handles drag/drop logic
│
└── UPLOAD_UI_README.md                 ← Documentation
```

## Key Features Implementation

### Drag & Drop
```typescript
1. onDragOver  → Prevent default, highlight zone
2. onDragLeave → Remove highlight
3. onDrop      → Handle dropped files
4. handleFileSelect → Input change handler
```

### File Validation
```
Gallery:    accept="image/*"
360°:       accept="image/*" (multiple)
Documents:  accept=".pdf,.jpg,.jpeg,.png"
```

### Accessibility
```
- Proper <label htmlFor> associations
- Semantic HTML structure
- Color + icons for identification
- Keyboard navigable
- Screen reader friendly
```

## Hover Effects

```
Card Level:
- Box shadow: shadow-lg → shadow-2xl
- Transition smooth (transition-shadow)

Drop Zone:
- Border: color-300 → color-500
- Background: white → color-50
- Cursor: pointer

Buttons:
- bg-[#F5A623] → bg-[#E09615]
- Shadow enhancement
```

## Future Enhancement Areas

1. **File Preview**: Show thumbnail previews before upload
2. **Progress Tracking**: Real-time upload progress bars
3. **Validation**: Client-side file validation
4. **Error States**: Visual error messages
5. **Success States**: Confirmation animations
6. **Retry Logic**: Failed upload retry mechanisms
7. **Integration**: Connect to actual upload API
8. **Storage**: S3 or cloud storage integration

---

This structure provides a clean, professional, 100% accurate UI for vehicle upload functionality on the web home page.
