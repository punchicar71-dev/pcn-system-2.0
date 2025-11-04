# 🎨 Sell Vehicle Step 2 - Visual Guide

## 📱 Updated Form Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Setup Selling information                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Search Vehicle *                                               │
│  [🔍 Search by Vehicle Number                          ]       │
│                                                                 │
│  Selling Amount *                                              │
│  [Rs                                                    ]       │
│                                                                 │
│  Advance Amount                                                │
│  [Rs                                                    ]       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ To Pay Amount                        ⭐ NEW               │ │
│  │ Rs. 2,475,000.00                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Payment Method *                        ✏️ UPDATED           │
│  [Select option...                                      ▼]     │
│   • Cash                                                       │
│   • Leasing                                                    │
│                                                                 │
│  Select Leasing Company *                ⭐ NEW (Conditional)  │
│  [Select leasing company...                             ▼]     │
│   • Commercial Bank Leasing                                    │
│   • LOLC Finance                                               │
│   • Nations Trust Bank                                         │
│                                                                 │
│  In-House Sales Agent                                          │
│  [Select option...                                      ▼]     │
│                                                                 │
│  Third Party Sales Agent                                       │
│  [Ex: John Doe                                          ]      │
│                                                                 │
│  [Back]  [Sell Vehicle]                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Interactive Behavior

### Scenario 1: Cash Payment (Default)
```
Step 1: User enters Selling Amount
        ┌──────────────────────┐
        │ Selling Amount *     │
        │ [2,500,000    ]     │
        └──────────────────────┘

Step 2: User enters Advance Amount
        ┌──────────────────────┐
        │ Advance Amount       │
        │ [25,000       ]     │
        └──────────────────────┘

Step 3: To Pay Amount appears automatically
        ┌──────────────────────────────┐
        │ To Pay Amount                │
        │ Rs. 2,475,000.00             │
        └──────────────────────────────┘

Step 4: Select "Cash" payment method
        ┌──────────────────────┐
        │ Payment Method *     │
        │ [Cash        ▼]     │
        └──────────────────────┘

Result: No additional fields needed
        ✓ Ready to proceed!
```

---

### Scenario 2: Leasing Payment
```
Step 1-3: Same as Cash (Amounts entered)

Step 4: Select "Leasing" payment method
        ┌──────────────────────┐
        │ Payment Method *     │
        │ [Leasing     ▼]     │
        └──────────────────────┘
                ↓
        ⚡ New field appears!

Step 5: Select Leasing Company (REQUIRED)
        ┌─────────────────────────────┐
        │ Select Leasing Company *    │
        │ [LOLC Finance        ▼]    │
        └─────────────────────────────┘

Result: Leasing company recorded
        ✓ Ready to proceed!
```

---

## 💰 To Pay Amount - Live Calculation

### Example 1: Basic Sale
```
Selling Amount:    Rs. 2,500,000
Advance Amount:    Rs.    25,000
                   ─────────────
To Pay Amount:     Rs. 2,475,000.00
```

### Example 2: Full Payment
```
Selling Amount:    Rs. 1,800,000
Advance Amount:    Rs. 1,800,000
                   ─────────────
To Pay Amount:     Rs.         0.00
```

### Example 3: No Advance
```
Selling Amount:    Rs. 3,200,000
Advance Amount:    Rs.         0
                   ─────────────
To Pay Amount:     Rs. 3,200,000.00
```

---

## 🎯 Payment Method Options

### Before Update ❌
```
Payment Type *
├── Cash
├── Leasing
├── Bank Transfer    ← REMOVED
└── Check            ← REMOVED
```

### After Update ✅
```
Payment Method *
├── Cash       ✓ Simplified
└── Leasing    ✓ With company selection
```

---

## 🏢 Leasing Company Selection

### When Visible
```
IF Payment Method = "Leasing"
THEN Show "Select Leasing Company"
ELSE Hide field
```

### Data Source
```
Settings → Leasing Company Tab
           ↓
    Fetch active companies
           ↓
    Display in dropdown
```

### Example Companies List
```
┌────────────────────────────────┐
│ Select Leasing Company *       │
├────────────────────────────────┤
│ Select leasing company...      │
│ ────────────────────────────   │
│ ABANS Finance                  │
│ Alliance Finance               │
│ LOLC Finance                   │
│ Nations Trust Bank             │
│ People's Leasing               │
│ Senkadagala Finance            │
└────────────────────────────────┘
```

---

## 📊 Field Validation

### Required Fields (*)
- ✓ Search Vehicle
- ✓ Selling Amount
- ✓ Payment Method
- ✓ Leasing Company (only if Payment Method = Leasing)

### Optional Fields
- Advance Amount
- In-House Sales Agent
- Third Party Sales Agent

### Validation Rules
```
1. Selling Amount > 0
2. Advance Amount ≥ 0
3. If Leasing → Must select company
4. If Cash → Company field hidden
```

---

## 🎨 Color Scheme

### To Pay Amount Box
- **Background:** Light Blue (#EFF6FF)
- **Border:** Blue (#BFDBFE)
- **Text:** Dark Blue (#1E3A8A)
- **Size:** Large, bold (2xl)

### Form Elements
- **Inputs:** White background, gray border
- **Focus:** Green ring (#10B981)
- **Required:** Red asterisk (#EF4444)
- **Labels:** Gray text (#374151)

---

## 🔗 Integration with Settings

### Leasing Company Management
```
Dashboard → Settings → Leasing Company
            ↓
    Add/Edit/Delete Companies
            ↓
    Mark Active/Inactive
            ↓
    Automatically appears in Sell Vehicle
```

### Flow Diagram
```
Settings Page               Sell Vehicle Page
┌─────────────┐            ┌──────────────────┐
│  Add LOLC   │────────────→│  LOLC appears   │
│  Finance    │            │  in dropdown     │
└─────────────┘            └──────────────────┘
      ↓                            ↓
┌─────────────┐            ┌──────────────────┐
│ Set Active  │────────────→│  Selectable     │
│   = true    │            │                  │
└─────────────┘            └──────────────────┘
      ↓                            ↓
┌─────────────┐            ┌──────────────────┐
│ Set Active  │────────────→│  Hidden from    │
│   = false   │            │  dropdown        │
└─────────────┘            └──────────────────┘
```

---

## 📱 Responsive Design

### Desktop View (Default)
- Two columns: Form on left, Vehicle details on right
- Full width form fields
- Side-by-side layout

### Mobile View (Auto-adjusted)
- Single column layout
- Stacked fields
- Full-width buttons
- Maintains all functionality

---

## ⚡ Real-time Updates

### Auto-calculation
```
User types in Selling Amount
        ↓
Calculation updates immediately
        ↓
To Pay Amount refreshes
```

### Conditional Display
```
User selects "Leasing"
        ↓
Field slides in smoothly
        ↓
User selects company
```

---

## 🎯 User Experience

### Benefits
1. ✅ **Transparency:** See exact balance immediately
2. ✅ **Simplicity:** Only 2 payment options
3. ✅ **Flexibility:** Conditional fields reduce clutter
4. ✅ **Integration:** Seamless with settings
5. ✅ **Professional:** Clean, modern interface

### Before vs After
```
BEFORE:                    AFTER:
─────────────────────────────────────────
Manual calculation         Auto-calculated
4 payment options          2 focused options
No leasing tracking        Full integration
                          Conditional UI
```

---

## 🔍 Technical Details

### State Management
```typescript
const [sellingData, setSellingData] = useState({
  searchVehicle: '',
  selectedVehicle: null,
  sellingAmount: '',
  advanceAmount: '',
  paymentType: '',          // Cash or Leasing
  leasingCompany: '',       // ⭐ NEW
  inHouseSalesAgent: '',
  thirdPartySalesAgent: '',
});
```

### Database Record
```typescript
{
  vehicle_id: 'uuid',
  selling_amount: 2500000,
  advance_amount: 25000,
  payment_type: 'Leasing',
  leasing_company_id: 'uuid',  // ⭐ NEW
  // ... other fields
}
```

---

## 📋 Quick Reference

### New Features
1. **To Pay Amount** - Auto-calculated display
2. **Payment Method** - Renamed and simplified
3. **Leasing Company** - Conditional select field

### Removed
- Bank Transfer option ❌
- Check option ❌

### Modified
- "Payment Type" → "Payment Method"
- Only Cash and Leasing remain

---

**Visual Guide Complete!**  
**Date:** November 2, 2025  
**Status:** ✅ Ready to Use
