# Agent Type Feature - Quick Setup Guide

## Quick Summary
✅ Added "Agent Type" column to Sales Agents  
✅ Two agent type options: Office Sales Agent | Vehicle Showroom Agent  
✅ Updated UI with select dropdown in "Add new seller" dialog  

---

## 🚀 How to Deploy

### Step 1: Run the Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy & paste the migration file content from:
   ```
   /dashboard/migrations/2025_11_add_agent_type_to_sales_agents.sql
   ```
3. Click "Execute" and wait for confirmation
4. You should see: "Added agent_type column to sales_agents table"

### Step 2: Verify the Changes
1. Go to Settings → Sales Agent tab
2. Click "Add new seller" button
3. You should see:
   - User ID field
   - Sales Agent Name field
   - **Agent Type dropdown** ← NEW!
   - Email field

### Step 3: Test the Feature
1. Add a new sales agent:
   - User ID: `00471` (or any ID)
   - Name: `Test Agent`
   - Agent Type: Select either option
   - Email: (optional)
2. Click "Save"
3. Verify the new agent appears in the table with the Agent Type displayed

---

## 📝 What Changed

### Frontend (Dashboard)
- **Component:** `SalesAgentTab.tsx`
- **Changes:**
  - New "Agent Type" column in the table
  - New dropdown field in "Add new seller" dialog
  - Dropdown options: "Office Sales Agent" | "Vehicle Showroom Agent"

### Database
- **Table:** `sales_agents`
- **New Column:** `agent_type`
- **Type:** ENUM (Office Sales Agent | Vehicle Showroom Agent)
- **Default:** Office Sales Agent

### Type Definitions
- **File:** `database.types.ts`
- **Updated:** `SalesAgent` interface with `agent_type` field

---

## 🛠️ Troubleshooting

### Issue: Dropdown not showing in form
**Solution:** Make sure the dashboard app is restarted after code changes

### Issue: Migration fails with "Already exists"
**Solution:** The migration has built-in checks; you can run it again safely

### Issue: Agents show no type
**Solution:** Agents created before migration will default to "Office Sales Agent"

### Issue: Type errors in console
**Solution:** Clear browser cache (Ctrl+Shift+Del) and rebuild dashboard

---

## 📍 File Locations

| File | Location |
|------|----------|
| Migration SQL | `/dashboard/migrations/2025_11_add_agent_type_to_sales_agents.sql` |
| Component | `/dashboard/src/components/settings/SalesAgentTab.tsx` |
| Types | `/dashboard/src/lib/database.types.ts` |
| Documentation | `./AGENT_TYPE_UPDATE_COMPLETE.md` |

---

## ✨ Features Overview

### Add New Sales Agent Dialog
```
┌─────────────────────────────────┐
│   Add New Sales Agent           │
├─────────────────────────────────┤
│ User ID                         │
│ [input field]                   │
│                                 │
│ Sales Agent Name                │
│ [input field]                   │
│                                 │
│ Agent Type          ← NEW!      │
│ [dropdown: ▼]                   │
│  - Office Sales Agent           │
│  - Vehicle Showroom Agent       │
│                                 │
│ Email (Optional)                │
│ [input field]                   │
│                                 │
│ [Cancel]  [Save]                │
└─────────────────────────────────┘
```

### Sales Agent Table
```
┌──────────┬─────────────┬─────────────────────┬──────────────┬─────────┐
│ User ID  │ Agent Name  │ Agent Type          │ Availability │ Actions │
├──────────┼─────────────┼─────────────────────┼──────────────┼─────────┤
│ 00471    │ Rashmina    │ Office Sales Agent  │ [Toggle]     │ Delete  │
│ 00453    │ Ralph       │ Vehicle Showroom... │ [Toggle]     │ Delete  │
└──────────┴─────────────┴─────────────────────┴──────────────┴─────────┘
```

---

## 🎯 Next Steps (Optional)

- [ ] Add agent type filtering
- [ ] Create reports by agent type
- [ ] Add permissions based on agent type
- [ ] Update sales transaction details to show agent type
- [ ] Add bulk agent type updates

---

**Last Updated:** November 4, 2025  
**Status:** Ready for Testing ✅
