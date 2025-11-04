# View Detail Modal - Visual Guide 📋

## Modal Display - Before & After

### BEFORE UPDATE ❌
```
┌─────────────────────────────────────────────────────────────┐
│                    Vehicle Details                       [X] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Honda Civic 2020 - VH-001234                  [Export Data] │
│                                                              │
│  ┌────────────────── Selling Information ──────────────────┐ │
│  │                                                         │ │
│  │  Selling Price      : Rs. 1,500,000                   │ │
│  │  Payment Type       : [Hire Purchase Badge]           │ │
│  │  Sales Agent        : John Smith ← SINGLE FIELD       │ │
│  │                                                         │ │
│  │  Customer Price     : Rs. 1,500,000                   │ │
│  │  Down Payment       : Rs. 300,000                     │ │
│  │  Sold Out Date      : 11/04/2025                      │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### AFTER UPDATE ✅
```
┌─────────────────────────────────────────────────────────────┐
│                    Vehicle Details                       [X] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Honda Civic 2020 - VH-001234                  [Export Data] │
│                                                              │
│  ┌────────────────── Selling Information ──────────────────┐ │
│  │                                                         │ │
│  │  Selling Price           : Rs. 1,500,000             │ │
│  │  Payment Type            : [Hire Purchase Badge]     │ │
│  │  Sold Out Date           : 11/04/2025                │ │
│  │  Office Sales Agent      : John Smith ✨ NEW         │ │
│  │                                                         │ │
│  │  Customer Price          : Rs. 1,500,000             │ │
│  │  Down Payment            : Rs. 300,000               │ │
│  │  Vehicle Showroom Agent  : Jane Doe ✨ NEW           │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Field Breakdown

### 📊 Selling Information Section Layout

```
GRID: 2 Columns, 6 Rows

┌──────────────────────────────────┬──────────────────────────────────┐
│ LEFT COLUMN                      │ RIGHT COLUMN                     │
├──────────────────────────────────┼──────────────────────────────────┤
│ 1. Selling Price                 │ 1. Customer Price                │
│    Rs. 1,500,000                 │    Rs. 1,500,000                 │
├──────────────────────────────────┼──────────────────────────────────┤
│ 2. Payment Type                  │ 2. Down Payment                  │
│    [Hire Purchase]               │    Rs. 300,000                   │
├──────────────────────────────────┼──────────────────────────────────┤
│ 3. Sold Out Date                 │ 3. Vehicle Showroom Agent ✨      │
│    11/04/2025                    │    Jane Doe (Third Party)        │
├──────────────────────────────────┼──────────────────────────────────┤
│ 4. Office Sales Agent ✨          │                                  │
│    John Smith (In-house)         │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

---

## Agent Type Information

### Field 1: Office Sales Agent (Left Column)
- **Source:** `sales_agents` table (via `sales_agent_id` relation)
- **Type:** In-house sales agent
- **Agent Type Filter:** `agent_type = 'Office Sales Agent'`
- **Display:** Name from sales_agents.name
- **Fallback:** "N/A"

### Field 2: Vehicle Showroom Agent (Right Column)
- **Source:** `third_party_agent` field in pending_vehicle_sales table
- **Type:** Third-party/Showroom agent
- **Agent Type Filter:** `agent_type = 'Vehicle Showroom Agent'`
- **Display:** Agent identifier string
- **Fallback:** "N/A"

---

## Scenarios

### Scenario 1: Sale with Both Agents
```
Office Sales Agent      : John Smith ✓
Vehicle Showroom Agent  : Jane Doe ✓
```

### Scenario 2: Sale with Only Office Agent
```
Office Sales Agent      : John Smith ✓
Vehicle Showroom Agent  : N/A
```

### Scenario 3: Sale with Only Showroom Agent
```
Office Sales Agent      : N/A
Vehicle Showroom Agent  : Jane Doe ✓
```

### Scenario 4: Sale with No Agents (Rare)
```
Office Sales Agent      : N/A
Vehicle Showroom Agent  : N/A
```

---

## CSV Export Format

```csv
Field,Value
Vehicle Number,VH-001234
Brand,Honda
Model,Civic
Manufacture Year,2020
...
Selling Information,
Selling Price,"Rs. 1,500,000"
Customer Price,"Rs. 1,500,000"
Down Payment,"Rs. 300,000"
Payment Type,Hire Purchase
Office Sales Agent,John Smith
Vehicle Showroom Agent,Jane Doe
Status,Pending
Sold Date,2025-11-04
...
```

---

## UI Component Styling

### Labels
- **Color:** Gray-600
- **Font:** Text-gray-600
- **Min Width:** 140px (for alignment)
- **Font Size:** Normal

### Values
- **Color:** Gray-900
- **Font Weight:** Semibold
- **Font Size:** Normal

### Payment Type Badge
- **Background:** Cyan-100
- **Text Color:** Cyan-800
- **Border Radius:** Rounded-md
- **Padding:** px-3 py-1

### Layout Spacing
- **Row Gap:** 3 units (space-y-3)
- **Column Gap:** 6 units (gap-6)
- **Grid Columns:** 2 (grid-cols-2)

---

## Implementation Details

### Data Flow

```
1. Modal Opens
   ↓
2. Fetch from Supabase
   Query:
   - pending_vehicle_sales table
   - Relation: sales_agents (id, name, agent_type)
   - Fields: *, third_party_agent, sales_agent_id
   ↓
3. Extract Data
   - saleData.sales_agents.name → Office Sales Agent
   - saleData.third_party_agent → Vehicle Showroom Agent
   ↓
4. Display in Modal
   - Left Column: Office Sales Agent
   - Right Column: Vehicle Showroom Agent
   ↓
5. Export to CSV
   - Both agent fields exported
```

---

## Testing Points

✅ Check modal displays correctly with both agents  
✅ Verify agent names show correctly (not truncated)  
✅ Test N/A fallback when agent is missing  
✅ Verify CSV export includes both agent columns  
✅ Check spacing and alignment is consistent  
✅ Test with various screen sizes  
✅ Check no console errors  

---

**Last Updated:** November 4, 2025  
**Component:** ViewDetailModal.tsx  
**Status:** ✅ Complete & Ready for Testing
