# Sales Agents Report - Testing Guide

## Quick Test Scenarios

### Test 1: View All Sales (Default View)
1. Navigate to **Reports → Sales Agents Report**
2. Default filters should be:
   - Agent Type: `All Agent Types`
   - Agent: `All Agents`
3. **Expected Result:**
   - Table shows ALL sold vehicles
   - Each row displays BOTH `Office Sales Agent` and `Vehicle Showroom Agent` columns
   - Both agents' names should be visible for each sale

---

### Test 2: Filter by Office Sales Agent Type
1. Select **Sales Agent Type:** `Office Sales Agent`
2. Leave **Agent:** `All Agents`
3. **Expected Result:**
   - Agent dropdown should only show Office Sales Agents
   - Table shows all sales with valid Office Sales Agents
   - Both agent columns still visible

---

### Test 3: Filter by Specific Office Sales Agent
1. Select **Sales Agent Type:** `Office Sales Agent`
2. Select a specific agent from **Agent** dropdown
3. **Expected Result:**
   - Table shows only sales where that agent is the Office Sales Agent
   - Selected agent info appears above the table: `"[Agent Name] - Total Sale: X"`
   - Both agent columns still visible

---

### Test 4: Filter by Vehicle Showroom Agent Type
1. Select **Sales Agent Type:** `Vehicle Showroom Agent`
2. Leave **Agent:** `All Agents`
3. **Expected Result:**
   - Agent dropdown should only show Vehicle Showroom Agents
   - Table shows all sales with valid Vehicle Showroom Agents
   - Both agent columns still visible

---

### Test 5: Filter by Specific Vehicle Showroom Agent
1. Select **Sales Agent Type:** `Vehicle Showroom Agent`
2. Select a specific agent from **Agent** dropdown
3. **Expected Result:**
   - Table shows only sales where that agent is the Vehicle Showroom Agent
   - Selected agent info appears above the table
   - Both agent columns still visible

---

### Test 6: Filter by Specific Agent (Any Type)
1. Select **Sales Agent Type:** `All Agent Types`
2. Select a specific agent from **Agent** dropdown
3. **Expected Result:**
   - Table shows sales where the agent appears in EITHER the Office Sales Agent OR Vehicle Showroom Agent column
   - Agent dropdown shows all agents with their type in parentheses: `"John Doe (Office Sales Agent)"`

---

### Test 7: Date Range Filter
1. Select any Agent Type and Agent combination
2. Set **From Date** and **To Date**
3. **Expected Result:**
   - Table shows only sales within the selected date range
   - All other filters remain active

---

### Test 8: CSV Export
1. Apply any combination of filters
2. Click **Export CSV** button
3. **Expected Result:**
   - CSV file downloads with name: `sales-agents-report-YYYY-MM-DD.csv`
   - CSV contains columns:
     - Vehicle Number
     - Brand
     - Model
     - Year
     - Sales Price
     - Payment Type
     - **Office Sales Agent**
     - **Vehicle Showroom Agent**
     - Sold Out Date
   - Only filtered data is exported

---

### Test 9: Stats Cards
1. Check the top stats cards
2. **Expected Result:**
   - **Office Sale Agent:** Shows count from Settings → Sales Agent Tab (active agents)
   - **Vehicle Showroom Agent:** Shows count from Settings → Sales Agent Tab (active agents)

---

### Test 10: Pagination
1. Apply filters that return many results
2. Change **Rows per page** dropdown (5, 10, 25, 50)
3. Navigate using **Previous/Next** buttons
4. Click page numbers
5. **Expected Result:**
   - Pagination updates correctly
   - Shows correct range: "Showing X to Y of Z"
   - All controls work smoothly

---

## Edge Cases to Test

### Edge Case 1: Sale with Missing Office Sales Agent
- If `sales_agent_id` is NULL
- **Expected:** Office Sales Agent column shows `N/A`

### Edge Case 2: Sale with Missing Vehicle Showroom Agent
- If `third_party_agent` is NULL
- **Expected:** Vehicle Showroom Agent column shows `N/A`

### Edge Case 3: No Sales Data
- Fresh database with no sold vehicles
- **Expected:** Table shows "No sales records found for the selected filters"

### Edge Case 4: Agent Not in Settings
- Sale has agent name but agent doesn't exist in Settings → Sales Agent Tab
- **Expected:** Agent still appears in dropdown and report (virtual agent)

---

## Sample Data Validation

### Sample Sale Record:
```
Vehicle: CAR-1234
Office Sales Agent: John Smith
Vehicle Showroom Agent: AutoHub Showroom
```

**When filtered by:**
1. `Office Sales Agent` → `John Smith` → Should appear ✓
2. `Vehicle Showroom Agent` → `AutoHub Showroom` → Should appear ✓
3. `Office Sales Agent` → `Other Agent` → Should NOT appear ✗
4. `All Agent Types` → `John Smith` → Should appear ✓
5. `All Agent Types` → `AutoHub Showroom` → Should appear ✓

---

## Browser Console Checks

Open browser DevTools console and verify:
```
Getting agents for type: [selected type]
Total sales data: [number]
Office agent names: [array of names]
Showroom agent names: [array of names]
```

---

## Common Issues & Solutions

### Issue: Dropdown shows no agents
**Solution:** Check if there are any sold vehicles with status='sold' in pending_vehicle_sales table

### Issue: Stats cards show 0
**Solution:** Check if sales_agents table has is_active=true agents

### Issue: CSV export is empty
**Solution:** Verify filters are not too restrictive, check console for errors

### Issue: Both agent columns show N/A
**Solution:** Check if pending_vehicle_sales records have both sales_agent_id and third_party_agent populated

---

## SQL Queries for Manual Verification

### Check Sold Vehicles:
```sql
SELECT 
  pvs.id,
  v.vehicle_number,
  sa.name as office_agent,
  sa.agent_type,
  pvs.third_party_agent as showroom_agent,
  pvs.updated_at as sold_date
FROM pending_vehicle_sales pvs
LEFT JOIN vehicles v ON pvs.vehicle_id = v.id
LEFT JOIN sales_agents sa ON pvs.sales_agent_id = sa.id
WHERE pvs.status = 'sold'
ORDER BY pvs.updated_at DESC;
```

### Check Active Agents:
```sql
SELECT 
  name, 
  agent_type, 
  is_active 
FROM sales_agents 
WHERE is_active = true
ORDER BY agent_type, name;
```

---

**Last Updated:** November 14, 2025
**Status:** Ready for Testing ✅
