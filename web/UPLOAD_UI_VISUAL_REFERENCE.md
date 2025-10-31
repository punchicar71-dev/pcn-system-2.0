# 📸 Upload UI Visual Reference Card

## Quick Visual Preview

### Section Overview
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Want to Sell Your Vehicle?                             ║
║   Upload your vehicle images and documents...             ║
║                                                            ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    ║
║  │              │  │              │  │              │    ║
║  │  [ORANGE]    │  │  [BLUE]      │  │  [PURPLE]    │    ║
║  │  HEADER      │  │  HEADER      │  │  HEADER      │    ║
║  │              │  │              │  │              │    ║
║  │  🖼️ Vehicle  │  │  ⟲ 360°      │  │  📄 Docs     │    ║
║  │  Images      │  │  Images      │  │  & Reg       │    ║
║  │              │  │              │  │              │    ║
║  │ Description  │  │ Description  │  │ Description  │    ║
║  │ • Require 1  │  │ • Require 1  │  │ • Require 1  │    ║
║  │ • Require 2  │  │ • Require 2  │  │ • Require 2  │    ║
║  │ • Require 3  │  │ • Require 3  │  │ • Require 3  │    ║
║  │              │  │              │  │              │    ║
║  │ ┌─────────┐  │  │ ┌─────────┐  │  │ ┌─────────┐  │    ║
║  │ │ DROP    │  │  │ │ DROP    │  │  │ │ DROP    │  │    ║
║  │ │ ZONE    │  │  │ │ ZONE    │  │  │ │ ZONE    │  │    ║
║  │ └─────────┘  │  │ └─────────┘  │  │ └─────────┘  │    ║
║  └──────────────┘  └──────────────┘  └──────────────┘    ║
║                                                            ║
║  [3-STEP PROCESS]                                          ║
║  ⭕ 1 → ⭕ 2 → ⭕ 3                                         ║
║                                                            ║
║  [📤 START SELLING YOUR VEHICLE]                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Upload Card Detailed View

### Card Structure
```
┌─────────────────────────────────────┐
│  HEADER: h-40 with gradient color   │  ← Orange/Blue/Purple
│  Centered icon (size 64)            │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│                                     │
│  📤 Title (xl font, bold)          │  ← Orange/Blue/Purple icon
│  Description text (slate-600)       │
│                                     │
│  ✓ Requirement 1 (green check)     │
│  ✓ Requirement 2 (green check)     │
│  ✓ Requirement 3 (green check)     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │  ← Dashed border
│  │  DROP/CLICK ZONE            │   │
│  │  Icon + Text                │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## Color Reference Diagram

### Gallery Card
```
┌────────────────────────────────────┐
│ Gradient: #F5A623 → #E09615        │  ← Orange to Yellow
│ Icon: 🖼️                            │
└────────────────────────────────────┘
  Title: text-[#F5A623]
  Drop Zone: border-slate-300
  Hover: bg-orange-50
```

### 360° Card
```
┌────────────────────────────────────┐
│ Gradient: Blue-500 → Blue-600      │  ← Light Blue to Dark Blue
│ Icon: ⟲                             │
└────────────────────────────────────┘
  Title: text-blue-500
  Drop Zone: border-blue-300
  Hover: bg-blue-50
```

### Documents Card
```
┌────────────────────────────────────┐
│ Gradient: Purple-500 → Purple-600  │  ← Light Purple to Dark Purple
│ Icon: 📄                            │
└────────────────────────────────────┘
  Title: text-purple-500
  Drop Zone: border-purple-300
  Hover: bg-purple-50
```

## Interactive States

### Idle State
```
┌─────────────────────┐
│   [HEADER]          │
│                     │
│   Title Text        │
│   Description       │
│   Requirements      │
│                     │
│ ┌─────────────────┐ │
│ │   DROP ZONE     │ │  ← border-slate-300 (gray)
│ │                 │ │     bg-white
│ └─────────────────┘ │
└─────────────────────┘
   shadow-lg
```

### Hover State
```
┌─────────────────────┐
│   [HEADER]          │
│                     │
│   Title Text        │
│   Description       │
│   Requirements      │
│                     │
│ ┌─────────────────┐ │
│ │   DROP ZONE     │ │  ← border-[color]-500 (colored)
│ │                 │ │     bg-[color]-50 (light)
│ └─────────────────┘ │
└─────────────────────┘
   shadow-2xl  ← Enhanced shadow
```

### Drag Over State
```
┌─────────────────────┐
│   [HEADER]          │
│                     │
│   Title Text        │
│   Description       │
│   Requirements      │
│                     │
│ ┌─────────────────┐ │
│ │   DROP ZONE     │ │  ← border-current (highlighted)
│ │     (READY)     │ │     bg-[color]-50 (prominent)
│ │                 │ │     cursor-pointer active
│ └─────────────────┘ │
└─────────────────────┘
   shadow-2xl  ← Max shadow
```

## Process Flow Diagram

### Three-Step Display
```
┌─────────────────────────────────────────────────────────┐
│                  SIMPLE 3-STEP PROCESS                  │
│                                                         │
│  ⭕───────────────────────────────────────────────────  │
│  │ 1                                                    │
│  │ Upload Images & Documents                           │
│  │ Start by uploading your vehicle photos...           │
│                                                         │
│  ⭕───────────────────────────────────────────────────  │
│     → 2                                                 │
│       Quick Verification                               │
│       Our team reviews your submission...              │
│                                                         │
│  ⭕───────────────────────────────────────────────────  │
│        → 3                                              │
│          Get Listed                                    │
│          Your vehicle appears on marketplace...         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Mobile Version (Stacked)
```
┌──────────────────┐
│ ⭕ 1             │
│ Upload Images    │
└──────────────────┘
        ↓
┌──────────────────┐
│ ⭕ 2             │
│ Quick Verify     │
└──────────────────┘
        ↓
┌──────────────────┐
│ ⭕ 3             │
│ Get Listed       │
└──────────────────┘
```

### Desktop Version (Inline)
```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ ⭕ 1             │ →   │ ⭕ 2             │ →   │ ⭕ 3             │
│ Upload Images    │     │ Quick Verify     │     │ Get Listed       │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Responsive Grid Layout

### Mobile (< 768px)
```
┌─────────────────┐
│   CARD 1        │
│   (Full width)  │
└─────────────────┘
┌─────────────────┐
│   CARD 2        │
│   (Full width)  │
└─────────────────┘
┌─────────────────┐
│   CARD 3        │
│   (Full width)  │
└─────────────────┘
```

### Tablet (768px - 1024px)
```
┌─────────────────┐ ┌─────────────────┐
│   CARD 1        │ │   CARD 2        │
│   (50% width)   │ │   (50% width)   │
└─────────────────┘ └─────────────────┘
┌─────────────────┐
│   CARD 3        │
│   (Full width)  │
└─────────────────┘
```

### Desktop (> 1024px)
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   CARD 1        │ │   CARD 2        │ │   CARD 3        │
│  (33.33%)       │ │  (33.33%)       │ │  (33.33%)       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## File Upload Zones - Technical View

### Accepted Files
```
Gallery:
  .jpg, .jpeg, .png, .gif, .webp
  Max: 10MB per file

360°:
  .jpg, .jpeg, .png
  Max: 5MB per file

Documents:
  .pdf, .jpg, .jpeg, .png
  Max: 15MB per file
```

### Validation Indicators
```
✓ Valid File
  ├── Correct format
  ├── Within size limit
  └── Correct dimensions

✗ Invalid File
  ├── Wrong format → Show error
  ├── Too large → Show error
  └── Wrong dimensions → Show warning
```

## Typography Reference

### Font Sizes
```
Page Title (h1): text-4xl font-bold
Card Title (h3): text-xl font-bold
Step Title (h4): text-lg font-semibold
Body Text (p): text-base
Small Text: text-sm
```

### Font Weights
```
Extra Bold: font-bold (card headers)
Bold: font-semibold (section titles)
Normal: default (body text)
```

### Colors
```
Primary Text: text-slate-900
Secondary Text: text-slate-600
Accent: text-[#F5A623]
Success: text-green-500
Info: text-blue-500
Warning: text-amber-500
```

## Spacing Reference

### Padding
```
Section: py-16 (vertical), px-4 (responsive)
Card: p-8 (internal padding)
Header: h-40 (fixed height)
Drop Zone: p-6 (internal)
```

### Margins
```
Between sections: gap-8
Between cards: gap-6
Title spacing: mb-2, mb-3, mb-6, mb-8, mb-12
```

### Border Radius
```
Large containers: rounded-xl
Buttons: rounded-lg
Small elements: rounded
```

## Shadow Effects

### Cards
```
Normal: shadow-lg
Hover: shadow-2xl
Transition: transition-shadow
```

### Buttons
```
Normal: shadow-lg
Hover: shadow-xl
```

## Icon Reference

### From Lucide React
```
Upload:      📤 Size 20-24
Image:       🖼️ Size 64
FileUp:      📄 Size 64
CheckCircle: ✓ Size 18
```

### Custom SVG
```
360° Rotation: ⟲ (Custom SVG in 360° card header)
Arrows: → (Text arrows in process flow)
```

---

## Quick Copy-Paste Reference

### Import Statement
```typescript
import UploadSection from '@/components/UploadSection';
```

### Usage
```typescript
<UploadSection />
```

### Tailwind Classes
```
Section bg:    bg-gradient-to-br from-slate-50 to-slate-100
Cards:         bg-white rounded-xl shadow-lg
Headers:       from-[#F5A623] to-[#E09615]
Hover:         hover:shadow-2xl transition-shadow
```

---

This visual reference card provides quick visual representations of all UI elements and their states.
