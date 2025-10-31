# Visual Implementation Overview

## Print Acceptance Document Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Add Vehicle Wizard                           │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Vehicle Details                                        │
│  Step 2: Seller Details    ← Captures seller info              │
│  Step 3: Vehicle Options                                        │
│  Step 4: Selling Details                                        │
│  Step 5: Special Notes                                          │
│  Step 6: Summary                                                │
│  Step 7: Success           ← Print button appears here          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User clicks "Print Acceptance Doc"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              New Window Opens with Document                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  [Background: acceptance.png template image]             │ │
│  │                                                           │ │
│  │  [Overlay: Data positioned with CSS]                     │ │
│  │                                          Date: 31/10/2025 │ │
│  │                                                           │ │
│  │  Address, City: 46/KL, Gemunupura, Kaduwela             │ │
│  │  Name: John Doe                                          │ │
│  │  Vehicle: CAA-1234                                       │ │
│  │  Brand, Model: Toyota, Aqua                              │ │
│  │                                                           │ │
│  │                                                           │ │
│  │                                                           │ │
│  │                                    ID: 123456789V         │ │
│  │  Mobile: 0771234567                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Print Dialog Opens Automatically
                              ↓
                    User Prints or Cancels
                              ↓
                    Window Closes Automatically
```

## Data Flow

```
┌──────────────────┐
│  User fills      │
│  Step 2 form     │
│  (Seller Info)   │
└────────┬─────────┘
         │
         ↓
┌────────────────────────┐
│  formState stored in   │
│  Add Vehicle Page      │
│  Component State       │
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│  Passed as props to    │
│  Step7Success          │
│  component             │
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│  Used in print         │
│  function to           │
│  generate document     │
└────────────────────────┘
```

## Component Structure

```
page.tsx (Add Vehicle)
│
├─ formState
│  ├─ vehicleDetails (Step 1)
│  ├─ sellerDetails (Step 2)  ← We use this!
│  ├─ vehicleOptions (Step 3)
│  ├─ sellingDetails (Step 4)
│  └─ specialNotes (Step 5)
│
└─ Step 7 Render
   │
   └─ <Step7Success>
      │
      ├─ Props:
      │  ├─ vehicleNumber
      │  ├─ brandName
      │  ├─ modelName
      │  ├─ year
      │  └─ sellerDetails ← New!
      │     ├─ firstName
      │     ├─ lastName
      │     ├─ address
      │     ├─ city
      │     ├─ nicNumber
      │     └─ mobileNumber
      │
      └─ Buttons:
         ├─ Add New Vehicle
         ├─ Print Acceptance Doc ← Updated!
         └─ Go to Inventory
```

## Document Template Structure

```
┌─────────────────────────────────────────┐  ← A4 Page (210mm x 297mm)
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ MALABE PUNCHI CAR NIWASA        ┃  │
│  ┃ [Company Header/Logo]           ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                         │
│  Date: {31/10/2025} ←── .date          │
│                                         │
│  Vehicle Acceptance Document            │
│                                         │
│  Address: {46/KL...Kaduwela}           │ ← .address-city
│                                         │
│  Name: {John Doe} ←── .seller-name     │
│                                         │
│  Vehicle No: {CAA-1234} ←── .vehicle-  │
│                                 number  │
│  Brand/Model: {Toyota, Aqua}           │ ← .brand-model
│                                         │
│  [Terms and Conditions text...]        │
│  [Multiple paragraphs in Sinhala...]   │
│                                         │
│                                         │
│  ID Number: {123456789V} ←── .id-      │
│                                 number  │
│  Mobile: {0771234567} ←── .mobile-     │
│                              number     │
│                                         │
│  [Footer / Reference Number]           │
└─────────────────────────────────────────┘
```

## CSS Positioning System

```
Page Layout (A4)
┌─────────────────────────────────────────┐
│ (0,0)                          (794,0)  │ ← Top edge
│  left: 0px                  right: 0px  │
│                                         │
│  ┌───────────────────────┐             │
│  │ .date position:       │             │
│  │ top: 240px           │             │
│  │ right: 120px         │             │
│  └───────────────────────┘             │
│                                         │
│  ┌─────────────────────┐               │
│  │ .address-city       │               │
│  │ top: 312px          │               │
│  │ left: 330px         │               │
│  └─────────────────────┘               │
│                                         │
│  (Each field positioned using          │
│   absolute positioning)                 │
│                                         │
│                                         │
│ (0,1123)                    (794,1123) │ ← Bottom edge
└─────────────────────────────────────────┘
```

## Print Mechanism

```
User Action
    ↓
┌─────────────────────────┐
│ handlePrintAcceptanceDoc│
│ function triggered      │
└───────────┬─────────────┘
            ↓
┌───────────────────────────────┐
│ 1. Collect all data           │
│    - Vehicle info             │
│    - Seller info              │
│    - Current date             │
└───────────┬───────────────────┘
            ↓
┌───────────────────────────────┐
│ 2. Generate HTML template     │
│    - Background image         │
│    - CSS positioning          │
│    - Data overlay             │
└───────────┬───────────────────┘
            ↓
┌───────────────────────────────┐
│ 3. Open new window            │
│    - Write HTML content       │
│    - Load template image      │
└───────────┬───────────────────┘
            ↓
┌───────────────────────────────┐
│ 4. Auto-trigger print         │
│    - window.print() called    │
│    - After 500ms delay        │
└───────────┬───────────────────┘
            ↓
┌───────────────────────────────┐
│ 5. Handle completion          │
│    - User prints or cancels   │
│    - Window auto-closes       │
└───────────────────────────────┘
```

## Field Mapping

```
Form Data                    →    Document Field
─────────────────────────────────────────────────
Current Date                 →    .date
sellerDetails.address,       →    .address-city
sellerDetails.city

sellerDetails.firstName,     →    .seller-name
sellerDetails.lastName

vehicleNumber                →    .vehicle-number

brandName, modelName         →    .brand-model

sellerDetails.nicNumber      →    .id-number

sellerDetails.mobileNumber   →    .mobile-number
```

## File Structure

```
dashboard/
│
├── public/
│   └── documents/
│       └── acceptance.png         ← Template image
│
└── src/
    ├── app/
    │   └── (dashboard)/
    │       └── add-vehicle/
    │           └── page.tsx       ← Modified: passes seller data
    │
    ├── components/
    │   └── vehicle/
    │       └── Step7Success.tsx   ← Modified: print function
    │
    └── types/
        └── vehicle-form.types.ts  ← Defines data structure
```

## Summary

✅ Button text updated  
✅ Print function implemented  
✅ Template integration complete  
✅ Data flow established  
✅ Auto-print functionality active  
✅ All fields populated in English  
✅ Positioning system in place  
✅ Fully functional and working  

The implementation is complete and ready to use!
