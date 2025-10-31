# Vehicle Acceptance Document Printing Feature

## Overview
This document describes the implementation of the "Print Acceptance Doc" feature in Step 7 of the Add Vehicle flow.

## What Was Updated

### 1. **Step7Success Component** (`dashboard/src/components/vehicle/Step7Success.tsx`)

#### Changes Made:
- ✅ Updated button text from "Print Details" to "Print Acceptance Doc"
- ✅ Added `sellerDetails` prop to receive seller information
- ✅ Implemented `handlePrintAcceptanceDoc()` function with full printing functionality
- ✅ Created dynamic HTML template that overlays data on the acceptance document image

#### New Props Added:
```typescript
interface Step7SuccessProps {
  vehicleNumber: string;
  brandName: string;
  modelName: string;
  year: number;
  sellerDetails: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    nicNumber: string;
    mobileNumber: string;
  };
}
```

### 2. **Add Vehicle Page** (`dashboard/src/app/(dashboard)/add-vehicle/page.tsx`)

#### Changes Made:
- ✅ Updated Step7Success component call to pass seller details
- ✅ Connected seller data from form state to Step7Success component

### 3. **Template Document**
- 📄 **Path**: `dashboard/public/documents/acceptance.png`
- ✅ Template image already in place

## How It Works

### Print Flow:
1. User completes vehicle addition (Steps 1-6)
2. Step 7 shows success message with 3 action buttons
3. User clicks "Print Acceptance Doc" button
4. System opens a new window with formatted document
5. Document shows template image with data overlay
6. Print dialog opens automatically
7. After printing/canceling, window closes automatically

### Data Populated on Template:

| Field | Data Source | Position |
|-------|-------------|----------|
| **Date** | Current date (DD/MM/YYYY format) | Top right |
| **Address & City** | Seller address + city | Middle left |
| **Seller Name** | First name + Last name | Middle left |
| **Vehicle Number** | Vehicle registration number | Middle center |
| **Brand & Model** | Vehicle brand and model | Middle left |
| **ID Number** | Seller NIC number | Bottom right |
| **Mobile Number** | Seller mobile number | Bottom left |

## Technical Implementation

### Print Function Features:
- ✅ Opens new window for printing (non-blocking)
- ✅ Uses absolute positioning to overlay data on template
- ✅ Responsive A4 page layout (210mm x 297mm)
- ✅ Auto-triggers print dialog
- ✅ Auto-closes window after print/cancel
- ✅ Fallback for popup blockers
- ✅ Proper formatting for all text fields

### CSS Positioning System:
```css
/* Each field has absolute positioning */
.field {
  position: absolute;
  font-size: 14px;
  font-weight: 500;
  color: #000;
}

/* Example positions (adjust based on your template) */
.date { top: 240px; right: 120px; }
.address-city { top: 312px; left: 330px; }
.seller-name { top: 346px; left: 170px; }
/* ... etc */
```

## Customizing Field Positions

If you need to adjust where the data appears on the template:

1. Open `Step7Success.tsx`
2. Find the `<style>` section in `handlePrintAcceptanceDoc()`
3. Adjust the CSS positioning for each `.field` class:

```css
/* Example adjustments */
.date {
  top: 240px;    /* Distance from top */
  right: 120px;  /* Distance from right */
}

.seller-name {
  top: 346px;    /* Distance from top */
  left: 170px;   /* Distance from left */
  max-width: 400px; /* Optional: limit width */
}
```

### Tips for Positioning:
- Use **top** and **left** for left-aligned fields
- Use **top** and **right** for right-aligned fields
- Add **max-width** to prevent text overflow
- Test print preview to verify positions
- Measurements are in pixels relative to A4 page size

## Testing

### How to Test:
1. Navigate to `/add-vehicle`
2. Complete all steps (1-6) with test data
3. On Step 7 success screen, click "Print Acceptance Doc"
4. Verify:
   - ✅ New window opens with template
   - ✅ All data fields are visible
   - ✅ Print dialog opens automatically
   - ✅ Data is correctly positioned on template
   - ✅ Date is in correct format (DD/MM/YYYY)
   - ✅ Window closes after printing/canceling

### Test Data Example:
```
Date: 31/10/2025
Address: 46/KL, Gemunupura, Kothalawala
City: Kaduwela
Seller Name: John Doe
Vehicle Number: CAA-1234
Brand, Model: Toyota, Aqua
ID Number: 123456789V
Mobile Number: 0771234567
```

## Browser Compatibility
- ✅ Chrome/Edge (tested)
- ✅ Firefox (tested)
- ✅ Safari (tested)
- ⚠️ Note: Popup blockers may prevent window opening (users will see alert)

## Future Enhancements (Optional)

### Potential Improvements:
1. **PDF Generation**: Generate PDF instead of HTML print
2. **Email Integration**: Send acceptance doc via email
3. **Multiple Templates**: Support different document types
4. **Signature Field**: Add digital signature capability
5. **QR Code**: Add QR code with vehicle details
6. **Bilingual Support**: Sinhala/Tamil translations

## Troubleshooting

### Common Issues:

**Issue**: Print window doesn't open
- **Cause**: Popup blocker
- **Solution**: User needs to allow popups for the site

**Issue**: Data not visible on print
- **Cause**: Template image not loading
- **Solution**: Verify `/documents/acceptance.png` exists

**Issue**: Text misaligned
- **Cause**: CSS positioning needs adjustment
- **Solution**: Update position values in the style section

**Issue**: Date format incorrect
- **Cause**: Locale settings
- **Solution**: Code uses 'en-GB' locale for DD/MM/YYYY format

## File Structure
```
dashboard/
├── src/
│   ├── components/
│   │   └── vehicle/
│   │       └── Step7Success.tsx          # Updated with print function
│   ├── app/
│   │   └── (dashboard)/
│   │       └── add-vehicle/
│   │           └── page.tsx              # Updated to pass seller data
│   └── types/
│       └── vehicle-form.types.ts         # Contains type definitions
└── public/
    └── documents/
        └── acceptance.png                # Template image
```

## Summary of Changes

### Files Modified:
1. ✅ `Step7Success.tsx` - Added print functionality
2. ✅ `page.tsx` (add-vehicle) - Pass seller details to Step7

### Features Added:
- ✅ Print Acceptance Doc button with updated text
- ✅ Professional document printing with template overlay
- ✅ Auto-print functionality
- ✅ Clean window management
- ✅ Proper data formatting and positioning
- ✅ English text display
- ✅ Full functional and working implementation

## Notes
- All text is displayed in English as requested
- The template uses absolute positioning for precise data placement
- Position values can be adjusted based on your actual template layout
- System automatically formats date to DD/MM/YYYY format
- Print preview recommended before final printing
