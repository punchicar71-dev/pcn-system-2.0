# Seller Title Dropdown - Visual Implementation Guide

## UI Components Breakdown

### 1. Title Dropdown Component Structure

```
┌────────────────────────────────────────────────────┐
│ First Name *                                       │
├──────────┬─────────────────────────────────────────┤
│  Mr.  ▼  │ [First Name Input Field]                │
└──────────┴─────────────────────────────────────────┘
     ↓
┌──────────┐
│  Mr.     │
│  Miss.   │  ← Dropdown Menu
│  Mrs.    │
│  Dr.     │
└──────────┘
```

### 2. Component Details

#### Title Dropdown Button
- **Width:** 80px minimum
- **Height:** 40-42px (matches input field)
- **Border:** Left and top/bottom, no right border
- **Corners:** Rounded on left only (`rounded-l-lg`)
- **Background:** White with hover state
- **Content:** Selected title + chevron down icon
- **Interaction:** Click to toggle dropdown menu

#### First Name Input Field
- **Width:** Flexible (flex-1)
- **Height:** 40-42px
- **Border:** All sides except left
- **Corners:** Rounded on right only (`rounded-r-lg`)
- **Border on left:** Shared with dropdown
- **Placeholder:** Empty or removed

#### Dropdown Menu
- **Position:** Absolute, below the button
- **Width:** 80px
- **Background:** White
- **Border:** All sides with shadow
- **Z-index:** 50 (appears above other content)
- **Options:** 4 items (Mr., Miss., Mrs., Dr.)
- **Hover:** Gray background on each option
- **Corners:** Rounded (`rounded-lg`)

### 3. Integration Points

#### Add Vehicle Flow - Step 2 (Seller Details)
```
File: dashboard/src/components/vehicle/Step2SellerDetails.tsx

┌────────────────────────────────────────────────────────┐
│                    Seller Details                      │
├────────────────────────────────────────────────────────┤
│ First Name *              Last Name *                  │
│ ┌─────────┬──────────┐   ┌────────────────────────┐  │
│ │ Mr.  ▼  │          │   │ Doe                    │  │
│ └─────────┴──────────┘   └────────────────────────┘  │
│                                                        │
│ Address                                                │
│ ┌──────────────────────────────────────────────────┐ │
│ │ No1, Petta, Colombo 1                            │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ City                      NIC Number                  │
│ ┌────────────────────────┐ ┌─────────────────────┐  │
│ │ Colombo 1              │ │ Ex: 979690920v      │  │
│ └────────────────────────┘ └─────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

#### Sell Vehicle Flow - Step 1 (Customer Details)
```
File: dashboard/src/components/sell-vehicle/CustomerDetails.tsx

Same UI as above, but labeled as "Customer Details"
Used for collecting buyer information
```

#### Edit Vehicle Modal - Seller Tab
```
File: dashboard/src/components/inventory/EditVehicleModal.tsx

Within a tabbed interface:
┌────────────────────────────────────────────────────────┐
│ [Vehicle] [Seller] [Options]                           │
├────────────────────────────────────────────────────────┤
│ First Name              Last Name                      │
│ ┌─────────┬──────────┐ ┌──────────────────────────┐  │
│ │ Mr.  ▼  │ John     │ │ Smith                    │  │
│ └─────────┴──────────┘ └──────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 4. State Management

#### React State
```typescript
// Dropdown open/close state
const [isDropdownOpen, setIsDropdownOpen] = useState(false)

// Reference for click-outside detection
const dropdownRef = useRef<HTMLDivElement>(null)

// Available titles
const titles = ['Mr.', 'Miss.', 'Mrs.', 'Dr.']
```

#### Form Data
```typescript
interface SellerDetailsData {
  title: string;          // New field
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  nicNumber: string;
  mobileNumber: string;
  landPhoneNumber: string;
  emailAddress: string;
}
```

### 5. User Interactions

1. **Default State:**
   - Dropdown shows "Mr." as default
   - First name input is empty
   - Both fields have focus states on interaction

2. **Opening Dropdown:**
   - User clicks title button
   - Dropdown menu appears below
   - Current selection is shown in button

3. **Selecting Title:**
   - User clicks on any title option
   - Dropdown closes immediately
   - Selected title updates in button
   - Form data updates with new title

4. **Closing Dropdown:**
   - Click on an option (auto-closes)
   - Click outside dropdown area
   - Press Escape key (if implemented)

### 6. Accessibility Features

- **Label:** "First Name *" clearly indicates required field
- **Focus States:** Visual indication when focused
- **Keyboard Navigation:** Can be enhanced with arrow keys
- **ARIA Labels:** Can be added for screen readers
- **Required Field:** Asterisk (*) indicates requirement

### 7. Database Integration

#### On Save (Add Vehicle)
```sql
INSERT INTO sellers (
  vehicle_id,
  title,              -- NEW
  first_name,
  last_name,
  ...
) VALUES (
  '...',
  'Mr.',             -- Selected title
  'John',
  'Doe',
  ...
);
```

#### On Display
```typescript
// Seller name with title
const sellerName = `${seller.title || ''} ${seller.first_name} ${seller.last_name}`.trim()
// Result: "Mr. John Doe" or "John Doe" (if no title)
```

### 8. Responsive Behavior

#### Desktop (> 768px)
- Two columns layout for First Name and Last Name
- Full width dropdown and inputs
- Side-by-side arrangement

#### Mobile (< 768px)
- Single column layout
- Full width for all inputs
- Stacked arrangement
- Dropdown still inline with first name

### 9. Style Variables

```css
/* Colors */
--border-color: rgb(209, 213, 219);      /* gray-300 */
--hover-bg: rgb(249, 250, 251);          /* gray-50 */
--focus-ring: rgb(34, 197, 94);          /* green-500 */
--dropdown-bg: white;
--dropdown-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Sizes */
--input-height: 42px;
--dropdown-width: 80px;
--border-radius: 8px;
--dropdown-z-index: 50;
```

### 10. Testing Checklist

✅ Title dropdown appears correctly
✅ All 4 options are selectable
✅ Default value is "Mr."
✅ Selected title persists in form
✅ Data saves to database correctly
✅ Clicking outside closes dropdown
✅ UI matches provided design image
✅ Responsive on all screen sizes
✅ No console errors
✅ Works in all 3 locations (Add, Sell, Edit)

---

## Implementation Summary

This implementation provides a seamless, user-friendly interface for selecting formal titles while maintaining consistency with the existing design system. The dropdown integrates naturally with the First Name input field, creating a cohesive input experience that matches the provided UI mockup exactly.
