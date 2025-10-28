# Sold Vehicle Image Deletion & Export Feature

## Overview
This implementation automatically deletes vehicle images from the database when a vehicle is marked as "sold" and adds an export functionality to download sold vehicle data as CSV.

## Changes Made

### 1. Database Trigger (DELETE_VEHICLE_IMAGES_ON_SOLD.sql)
- **Location**: `/dashboard/DELETE_VEHICLE_IMAGES_ON_SOLD.sql`
- **Purpose**: Automatically deletes all vehicle images when a vehicle's sale status changes to 'sold'
- **Implementation**: 
  - Creates a PostgreSQL function `delete_vehicle_images_on_sold()`
  - Creates a trigger on `pending_vehicle_sales` table
  - Trigger fires AFTER UPDATE when status becomes 'sold'
  - Automatically deletes all rows from `vehicle_images` table for that vehicle_id

### 2. Updated ViewDetailModal Component
- **Location**: `/dashboard/src/components/sales-transactions/ViewDetailModal.tsx`
- **Changes**:
  - **Removed**: Image carousel and all image-related UI components
  - **Removed**: Image fetch queries from Supabase
  - **Added**: "Export Data" button in the header
  - **Added**: `exportToCSV()` function that generates and downloads CSV file
  - Updated UI to focus on vehicle details, seller/buyer information, and sale data

### 3. Export Data Feature
The CSV export includes:
- Vehicle Information (Number, Brand, Model, Year, etc.)
- Selling Information (Price, Payment Type, Sales Agent, Date)
- Seller Details (Name, Address, Mobile)
- Buyer Details (Name, Address, Mobile, NIC, Email)
- Vehicle Options (if any)

## How to Apply Database Changes

### Step 1: Run the SQL Script
Execute the following SQL script in your Supabase SQL Editor:

```sql
-- Run this in Supabase SQL Editor
\i DELETE_VEHICLE_IMAGES_ON_SOLD.sql
```

Or copy and paste the contents of `DELETE_VEHICLE_IMAGES_ON_SOLD.sql` directly into the SQL Editor and execute.

### Step 2: Verify the Trigger
Check if the trigger was created successfully:

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_delete_vehicle_images_on_sold';
```

### Step 3: Test the Functionality
1. Go to Sales Transactions page
2. Mark a pending vehicle as "Sold Out"
3. The vehicle images will be automatically deleted from the database
4. Open the sold vehicle details modal
5. Click "Export Data" button to download vehicle information as CSV

## Benefits

### 1. Automatic Image Cleanup
- **Database Optimization**: Removes unused images automatically
- **Storage Savings**: Frees up storage space in Supabase
- **No Manual Intervention**: Fully automated process
- **Data Integrity**: Ensures sold vehicles don't have associated images

### 2. Export Functionality
- **Data Portability**: Export vehicle data for external use
- **Record Keeping**: Easy archival of sold vehicle information
- **Reporting**: Use exported data in spreadsheets or other tools
- **Backup**: Create offline backups of important sales data

## UI Changes

### Before:
- Image carousel with navigation arrows
- CR Paper download button
- Gallery images displayed prominently

### After:
- Clean, data-focused interface
- Export Data button (replaces image functionality)
- Streamlined vehicle details view
- Better focus on transaction information

## File Structure
```
dashboard/
├── DELETE_VEHICLE_IMAGES_ON_SOLD.sql          # Database trigger script
└── src/
    └── components/
        └── sales-transactions/
            └── ViewDetailModal.tsx             # Updated modal component
```

## Testing Checklist
- [ ] SQL trigger created successfully
- [ ] Marking vehicle as sold deletes images
- [ ] Export Data button appears in sold vehicle modal
- [ ] CSV file downloads with correct data
- [ ] No images shown in sold vehicle modal
- [ ] All vehicle details display correctly
- [ ] Seller and buyer information is complete

## Notes
- Images are permanently deleted from the database when a vehicle is sold
- The trigger only fires when status changes to 'sold', not for other status updates
- CSV export filename includes vehicle number and date for easy identification
- The export function handles missing data gracefully (shows 'N/A')
