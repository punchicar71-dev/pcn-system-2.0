# Add Vehicle Step 2 - Seller Title Update

## Overview
This update adds a formal title dropdown (Mr., Miss., Mrs., Dr.) to the Seller Details section in the Add Vehicle flow (Step 2). The title dropdown is integrated with the First Name input field, matching the UI design exactly.

## Changes Made

### 1. Database Schema Updates

#### Sellers Table
Added `title` column to store seller titles:
```sql
ALTER TABLE public.sellers 
ADD COLUMN IF NOT EXISTS title VARCHAR(10) CHECK (title IN ('Mr.', 'Miss.', 'Mrs.', 'Dr.'));
```

**Migration file:** `dashboard/migrations/2025_01_add_title_to_sellers.sql`

#### Pending Vehicle Sales Table
Added `customer_title` column to store customer titles in sales transactions:
```sql
ALTER TABLE public.pending_vehicle_sales 
ADD COLUMN IF NOT EXISTS customer_title VARCHAR(10) CHECK (customer_title IN ('Mr.', 'Miss.', 'Mrs.', 'Dr.'));
```

**Migration file:** `dashboard/migrations/2025_01_add_customer_title_to_pending_sales.sql`

### 2. UI Components Updated

#### Add Vehicle Flow
- **Step2SellerDetails.tsx**: Added title dropdown integrated with First Name field
- **StepIndicator.tsx**: Already has correct step titles (Vehicle, Seller, Options, Selling, Notes, Summary, Publish)

#### Sell Vehicle Flow
- **CustomerDetails.tsx**: Added title dropdown for customer details
- **SellVehicleStepIndicator.tsx**: Already has correct step configuration

#### Edit Vehicle Modal
- **EditVehicleModal.tsx**: Added title dropdown in seller details tab

### 3. Type Definitions
- **vehicle-form.types.ts**: Updated `SellerDetailsData` interface to include `title` field

### 4. Database Operations
All database insert and update operations now include the title field:
- Add vehicle page (seller insert)
- Sell vehicle page (customer title insert)
- Edit vehicle modal (seller update/insert)
- Selling info component (seller name display includes title)

## How to Apply

### Step 1: Run Database Migrations

You need to run the SQL migrations in your Supabase database. You can do this either through:

**Option A: Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the contents of each migration file:
   - `dashboard/migrations/2025_01_add_title_to_sellers.sql`
   - `dashboard/migrations/2025_01_add_customer_title_to_pending_sales.sql`
4. Run each SQL script

**Option B: Using Supabase CLI**
```bash
cd dashboard
supabase db push
```

### Step 2: Verify the Changes

After running the migrations, verify in Supabase:
1. Check `sellers` table has `title` column
2. Check `pending_vehicle_sales` table has `customer_title` column

### Step 3: Test the Application

1. **Test Add Vehicle Flow:**
   - Navigate to Add Vehicle page
   - Go to Step 2 (Seller Details)
   - Verify the title dropdown appears beside First Name field
   - Select different titles and complete the flow
   - Check database to ensure title is saved

2. **Test Sell Vehicle Flow:**
   - Navigate to Sell Vehicle page
   - Fill in Customer Details (Step 1)
   - Verify title dropdown works
   - Complete the sale and check if customer_title is saved

3. **Test Edit Vehicle:**
   - Open any vehicle in inventory
   - Click Edit
   - Go to Seller Details tab
   - Verify title dropdown appears and works

## UI Features

### Title Dropdown Design
- Positioned inline with First Name input field
- Shows selected title with dropdown arrow icon
- Dropdown menu appears below the button
- Options: Mr., Miss., Mrs., Dr.
- Clicking outside closes the dropdown
- Default value: "Mr."

### Visual Styling
- Dropdown button: Left-rounded corners, bordered
- First Name input: Right-rounded corners, connects seamlessly
- Hover states for better UX
- Focus ring for accessibility
- Consistent with existing design system

## Files Modified

### Components
1. `/dashboard/src/components/vehicle/Step2SellerDetails.tsx`
2. `/dashboard/src/components/sell-vehicle/CustomerDetails.tsx`
3. `/dashboard/src/components/inventory/EditVehicleModal.tsx`
4. `/dashboard/src/components/sell-vehicle/SellingInfo.tsx`

### Pages
1. `/dashboard/src/app/(dashboard)/add-vehicle/page.tsx`
2. `/dashboard/src/app/(dashboard)/sell-vehicle/page.tsx`

### Types
1. `/dashboard/src/types/vehicle-form.types.ts`

### Migrations
1. `/dashboard/migrations/2025_01_add_title_to_sellers.sql`
2. `/dashboard/migrations/2025_01_add_customer_title_to_pending_sales.sql`

## Breaking Changes
None - This is a backward-compatible update. Existing records without titles will continue to work normally.

## Notes
- The title field is optional in the database (nullable)
- Default value "Mr." is used when no title is selected
- All forms now consistently handle titles across the application
- Seller names displayed in various places now include the title when available

## Support
If you encounter any issues:
1. Check that migrations ran successfully in Supabase
2. Clear browser cache and reload the application
3. Verify that all files were updated correctly
4. Check browser console for any errors

---
**Last Updated:** November 1, 2025
**Version:** 2.0
