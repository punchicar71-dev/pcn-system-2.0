# Sales Agents Report - Visual Flow Diagram

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FILTER CONTROLS                               │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Agent Type       │  │ Select Agent     │  │ Date Range   │  │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ From: [    ] │  │
│  │ │ All          │ │  │ │ All Agents   │ │  │ To:   [    ] │  │
│  │ │ Office Sales │ │  │ │ John Smith   │ │  └──────────────┘  │
│  │ │ Showroom     │ │  │ │ Jane Doe     │ │                    │
│  │ └──────────────┘ │  │ └──────────────┘ │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FILTER LOGIC                                  │
│                                                                  │
│  IF Agent Type = "Office Sales Agent"                           │
│    THEN filter where office_sales_agent = selected agent        │
│                                                                  │
│  IF Agent Type = "Vehicle Showroom Agent"                       │
│    THEN filter where showroom_agent = selected agent            │
│                                                                  │
│  IF Agent Type = "All"                                          │
│    THEN filter where EITHER agent matches                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA TABLE                                    │
│                                                                  │
│  ┌─────┬───────┬──────────────────┬──────────────────────────┐  │
│  │ Veh │ Brand │ Office Sales     │ Vehicle Showroom Agent  │  │
│  ├─────┼───────┼──────────────────┼──────────────────────────┤  │
│  │ 001 │ Honda │ John Smith       │ AutoHub Showroom        │  │
│  │ 002 │ BMW   │ Jane Doe         │ Elite Motors            │  │
│  │ 003 │ Audi  │ John Smith       │ Prime Auto              │  │
│  └─────┴───────┴──────────────────┴──────────────────────────┘  │
│           ▲                                ▲                     │
│           │                                │                     │
│           └────────────────────────────────┘                     │
│              BOTH COLUMNS ALWAYS SHOWN                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Relationship

```
┌─────────────────────────────────────┐
│      SALES_AGENTS TABLE             │
│  (Settings → Sales Agent Tab)       │
├─────────────────────────────────────┤
│ • id (UUID)                         │
│ • name (TEXT)                       │
│ • agent_type:                       │
│   - Office Sales Agent              │
│   - Vehicle Showroom Agent          │
│ • is_active (BOOLEAN)               │
└─────────────────────────────────────┘
                 │
                 │ Referenced by
                 │ sales_agent_id
                 ▼
┌─────────────────────────────────────┐
│   PENDING_VEHICLE_SALES TABLE       │
│    (Sold Vehicles: status='sold')   │
├─────────────────────────────────────┤
│ • id (UUID)                         │
│ • vehicle_id (UUID) ────────┐       │
│ • sales_agent_id (UUID) ◄───┘       │
│   └─> Office Sales Agent            │
│                                     │
│ • third_party_agent (TEXT)          │
│   └─> Vehicle Showroom Agent        │
│                                     │
│ • status ('pending' | 'sold')       │
│ • selling_amount (NUMERIC)          │
│ • payment_type (TEXT)               │
│ • updated_at (TIMESTAMP)            │
└─────────────────────────────────────┘
                 │
                 │ References
                 │ vehicle_id
                 ▼
┌─────────────────────────────────────┐
│         VEHICLES TABLE              │
├─────────────────────────────────────┤
│ • id (UUID)                         │
│ • vehicle_number (TEXT)             │
│ • brand_id (UUID)                   │
│ • model_id (UUID)                   │
│ • manufacture_year (INTEGER)        │
│ • status (TEXT)                     │
└─────────────────────────────────────┘
```

---

## Filter Scenarios Visualization

### Scenario 1: Filter by Office Sales Agent "John Smith"

```
┌────────────────────────────────────────────────────────────┐
│ FILTER: Office Sales Agent → John Smith                   │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    SALES DATA                              │
│                                                            │
│  Sale 1: Office: John Smith  ✓ | Showroom: AutoHub     │
│  Sale 2: Office: Jane Doe    ✗ | Showroom: Elite       │
│  Sale 3: Office: John Smith  ✓ | Showroom: Prime       │
│  Sale 4: Office: Bob Wilson  ✗ | Showroom: AutoHub     │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼ FILTERED
┌────────────────────────────────────────────────────────────┐
│                  RESULT (2 sales)                          │
│                                                            │
│  Sale 1: Office: John Smith | Showroom: AutoHub         │
│  Sale 3: Office: John Smith | Showroom: Prime           │
└────────────────────────────────────────────────────────────┘
```

---

### Scenario 2: Filter by Vehicle Showroom Agent "AutoHub"

```
┌────────────────────────────────────────────────────────────┐
│ FILTER: Vehicle Showroom Agent → AutoHub                  │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    SALES DATA                              │
│                                                            │
│  Sale 1: Office: John Smith  | Showroom: AutoHub    ✓   │
│  Sale 2: Office: Jane Doe    | Showroom: Elite      ✗   │
│  Sale 3: Office: John Smith  | Showroom: Prime      ✗   │
│  Sale 4: Office: Bob Wilson  | Showroom: AutoHub    ✓   │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼ FILTERED
┌────────────────────────────────────────────────────────────┐
│                  RESULT (2 sales)                          │
│                                                            │
│  Sale 1: Office: John Smith  | Showroom: AutoHub        │
│  Sale 4: Office: Bob Wilson  | Showroom: AutoHub        │
└────────────────────────────────────────────────────────────┘
```

---

### Scenario 3: Filter by All Agent Types → "John Smith"

```
┌────────────────────────────────────────────────────────────┐
│ FILTER: All Agent Types → John Smith                      │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    SALES DATA                              │
│                                                            │
│  Sale 1: Office: John Smith  ✓ | Showroom: AutoHub     │
│  Sale 2: Office: Jane Doe       | Showroom: Elite       │
│  Sale 3: Office: Bob Wilson     | Showroom: John Smith ✓│
│  Sale 4: Office: Bob Wilson     | Showroom: Prime       │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼ FILTERED (matches EITHER column)
┌────────────────────────────────────────────────────────────┐
│                  RESULT (2 sales)                          │
│                                                            │
│  Sale 1: Office: John Smith  | Showroom: AutoHub        │
│  Sale 3: Office: Bob Wilson  | Showroom: John Smith     │
└────────────────────────────────────────────────────────────┘
```

---

## Component State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   COMPONENT STATE                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  agentType: 'all' | 'Office Sales Agent' |                 │
│             'Vehicle Showroom Agent'                        │
│                                                             │
│  selectedAgent: 'all' | '[agent name]'                      │
│                                                             │
│  dateRange: { from: '', to: '' }                            │
│                                                             │
│  salesData: SaleRecord[]                                    │
│    └─> Raw data from database (all sold vehicles)          │
│                                                             │
│  filteredSalesData: SaleRecord[]                            │
│    └─> Filtered based on user selections                   │
│                                                             │
│  agents: SalesAgent[]                                       │
│    └─> From settings (sales_agents table)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  RENDER CYCLE                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Mount → fetchInitialData()                              │
│     - Load agents from settings                             │
│     - Load all sold sales                                   │
│     - Process into SaleRecord format                        │
│                                                             │
│  2. User changes filter → filterSalesData()                 │
│     - Apply agent type filter                               │
│     - Apply specific agent filter                           │
│     - Apply date range filter                               │
│     - Update filteredSalesData                              │
│                                                             │
│  3. Render → Display table with filteredSalesData           │
│     - Show both agent columns                               │
│     - Apply pagination                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Export Flow

```
┌────────────────────────────────┐
│   User clicks Export CSV       │
└────────────────────────────────┘
              │
              ▼
┌────────────────────────────────┐
│ Check filteredSalesData.length │
│ > 0 ?                          │
└────────────────────────────────┘
              │
              ├─── No ───> Show alert "No data to export"
              │
              └─── Yes
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│ Build CSV with headers:                                │
│ - Vehicle Number                                       │
│ - Brand, Model, Year                                   │
│ - Sales Price, Payment Type                            │
│ - Office Sales Agent                                   │
│ - Vehicle Showroom Agent                               │
│ - Sold Out Date                                        │
└────────────────────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│ Map each record to CSV row:                            │
│ record.office_sales_agent,                             │
│ record.showroom_agent,                                 │
│ ... other fields                                       │
└────────────────────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│ Create Blob and download:                              │
│ Filename: sales-agents-report-YYYY-MM-DD.csv           │
└────────────────────────────────────────────────────────┘
```

---

## Key Points Summary

1. **Every Sale = 2 Agents**
   - Office Sales Agent (from `sales_agent_id`)
   - Vehicle Showroom Agent (from `third_party_agent`)

2. **Table Always Shows Both**
   - No dynamic columns
   - Both agents visible at all times

3. **Filtering Logic**
   - Office Sales Agent type → filter by `office_sales_agent`
   - Vehicle Showroom Agent type → filter by `showroom_agent`
   - All types → filter by EITHER field

4. **Agent Dropdown Behavior**
   - Dynamically populates based on selected agent type
   - Shows unique agents from sales data
   - Includes both registered and "virtual" agents

5. **CSV Export**
   - Exports current filtered view
   - Always includes both agent columns
   - Filename includes current date

---

**Created:** November 14, 2025
**Component:** SalesAgentsReportTab.tsx
