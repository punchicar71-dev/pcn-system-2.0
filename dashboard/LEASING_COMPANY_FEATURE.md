# Leasing Company Feature Implementation

## Overview
This update adds a **Leasing Company** management tab to the Settings page, allowing you to manage finance and leasing company partners in the system.

## What's Been Added

### 1. Database Table
- **Table Name**: `leasing_companies`
- **Columns**:
  - `id` - UUID (Primary Key)
  - `company_id` - Unique 5-digit identifier
  - `name` - Company name
  - `is_active` - Availability toggle
  - `created_at` - Timestamp
  - `updated_at` - Timestamp

### 2. UI Components
- New tab in Settings page: **Leasing Company**
- Table displaying all leasing companies with:
  - Company ID
  - Finance Company Name
  - Availability toggle (Switch)
  - Delete button
- Add Company dialog with:
  - Company Name input field
  - Save button
- Delete confirmation popup

### 3. Features
✅ View all leasing companies in a table
✅ Add new leasing companies (auto-generates 5-digit ID)
✅ Toggle availability (active/inactive)
✅ Delete companies with confirmation dialog
✅ Full Supabase integration with RLS policies

## Installation Steps

### Step 1: Run the Database Migration

You need to run the SQL migration to create the `leasing_companies` table in your Supabase database.

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `/dashboard/migrations/2025_11_add_leasing_companies.sql`
4. Copy and paste the entire content into the SQL Editor
5. Click **Run** to execute the migration

**Option B: Using Supabase CLI**
```bash
cd dashboard
supabase db push
```

### Step 2: Verify the Migration
After running the migration, you should see:
- ✅ New table `leasing_companies` created
- ✅ 3 sample companies added:
  - LB Finance (00471)
  - Peoples Leasing (00453)
  - HNB Leasing (00423)

### Step 3: Test the Feature
1. Navigate to **Settings** page in your dashboard
2. Click on the **Leasing Company** tab
3. You should see the sample companies listed
4. Try adding a new company
5. Test the availability toggle
6. Test the delete functionality

## Files Modified

### New Files
1. `/dashboard/migrations/2025_11_add_leasing_companies.sql` - Database migration
2. `/dashboard/src/components/settings/LeasingCompanyTab.tsx` - Main component
3. `/dashboard/LEASING_COMPANY_FEATURE.md` - This documentation

### Modified Files
1. `/dashboard/src/app/(dashboard)/settings/page.tsx` - Added new tab
2. `/dashboard/src/lib/database.types.ts` - Added `LeasingCompany` interface

## Usage Guide

### Adding a New Company
1. Click the **+ Add Company** button
2. Enter the company name
3. Click **Save**
4. A unique 5-digit ID is automatically generated
5. Company is added with active status by default

### Toggling Availability
- Click the switch next to any company
- Active (ON) = Company is available for selection
- Inactive (OFF) = Company is hidden from selection

### Deleting a Company
1. Click the **Delete** button next to a company
2. Confirm the deletion in the popup dialog
3. Company is permanently removed from the database

## Database Schema

```sql
CREATE TABLE public.leasing_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Integration

The component uses Supabase client for all operations:

```typescript
// Fetch all companies
supabase.from('leasing_companies').select('*')

// Add new company
supabase.from('leasing_companies').insert([{ company_id, name, is_active }])

// Update availability
supabase.from('leasing_companies').update({ is_active }).eq('id', companyId)

// Delete company
supabase.from('leasing_companies').delete().eq('id', companyId)
```

## Security

- ✅ Row Level Security (RLS) enabled
- ✅ Policies allow all authenticated users to manage companies
- ✅ Automatic timestamp updates via trigger
- ✅ Unique constraint on `company_id` prevents duplicates

## Troubleshooting

### Migration Failed
- Check if you have proper database permissions
- Ensure the `update_updated_at_column()` function exists
- Verify UUID extension is enabled

### Companies Not Showing
- Check browser console for errors
- Verify Supabase connection in `/dashboard/src/lib/supabase-client.ts`
- Ensure RLS policies are correctly applied

### Cannot Add Company
- Check if company ID already exists (should auto-retry)
- Verify network connection to Supabase
- Check browser console for detailed error messages

## Future Enhancements

Possible improvements:
- [ ] Edit company name functionality
- [ ] Company contact details (phone, email, address)
- [ ] Custom company ID format
- [ ] Company logo upload
- [ ] Filter and search functionality
- [ ] Export companies to CSV
- [ ] Company usage statistics

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify the Supabase connection
3. Ensure all migration steps were completed
4. Check RLS policies in Supabase dashboard

---

**Implementation Date**: November 2, 2025
**Version**: 1.0.0
