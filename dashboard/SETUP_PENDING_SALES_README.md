# Setting Up Pending Vehicle Sales Table

## Steps to Create the Table in Supabase:

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project at https://supabase.com
   - Navigate to the **SQL Editor** from the left sidebar

2. **Run the Migration**
   - Click "New Query"
   - Copy the entire content from `CREATE_PENDING_SALES_TABLE.sql`
   - Paste it into the SQL editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

3. **Verify Table Creation**
   - Go to **Table Editor** from the left sidebar
   - You should see `pending_vehicle_sales` in the list of tables
   - Click on it to verify the columns

### Method 2: Using Supabase CLI

```bash
# Navigate to your project
cd dashboard

# Run the migration
supabase db push

# Or use psql directly
psql your_database_url < CREATE_PENDING_SALES_TABLE.sql
```

## Table Structure

The `pending_vehicle_sales` table includes:

### Columns:
- `id` (UUID) - Primary key
- `vehicle_id` (UUID) - References vehicles table
- `customer_first_name` (VARCHAR) - Customer's first name
- `customer_last_name` (VARCHAR) - Customer's last name
- `customer_address` (TEXT) - Customer's address
- `customer_city` (VARCHAR) - Customer's city
- `customer_nic` (VARCHAR) - National ID number
- `customer_mobile` (VARCHAR) - Mobile phone number
- `customer_landphone` (VARCHAR) - Landline number
- `customer_email` (VARCHAR) - Email address
- `selling_amount` (DECIMAL) - Vehicle selling price
- `advance_amount` (DECIMAL) - Advance payment
- `payment_type` (VARCHAR) - Cash, Leasing, Bank Transfer, or Check
- `sales_agent_id` (UUID) - References sales_agents table
- `third_party_agent` (VARCHAR) - Third party sales agent name
- `status` (VARCHAR) - 'pending' or 'sold'
- `created_at` (TIMESTAMPTZ) - Record creation time
- `updated_at` (TIMESTAMPTZ) - Last update time
- `created_by` (UUID) - User who created the record

### Features:
- ✅ Foreign key relationships with vehicles and sales_agents
- ✅ Automatic timestamps with triggers
- ✅ Row Level Security (RLS) enabled
- ✅ Indexes for optimized queries
- ✅ Check constraints for data validation

## Testing the Setup

After creating the table, test the functionality:

1. **Go to Sell Vehicle Page**
   - Navigate to `/sell-vehicle`
   - Fill in customer details (Step 1)
   - Search and select a vehicle (Step 2)
   - Fill in selling information
   - Click "Sell Vehicle"

2. **Check Sales Transactions**
   - Navigate to `/sales-transactions`
   - Click on "Pending Vehicles" tab
   - You should see the newly created sale

3. **Test Actions**
   - Click "View Detail" to view sale details
   - Click "Sold out" to mark as sold
   - Click delete icon to remove a sale

## Troubleshooting

### If table creation fails:

1. **Check Prerequisites**
   - Ensure `vehicles` table exists
   - Ensure `sales_agents` table exists

2. **Check Permissions**
   - Verify you have database admin access
   - Check RLS policies are correctly applied

3. **Foreign Key Issues**
   - If foreign key references fail, create those tables first
   - Or modify the SQL to remove foreign key constraints temporarily

### Common Errors:

**Error: "relation vehicles does not exist"**
- Solution: Create the vehicles table first

**Error: "relation sales_agents does not exist"**
- Solution: Create the sales_agents table first, or make sales_agent_id nullable

**Error: "permission denied"**
- Solution: Check your RLS policies and user permissions

## Next Steps

After successful table creation:

1. ✅ Sell Vehicle flow is complete
2. ✅ Pending sales are stored in database
3. ✅ Sales Transactions page displays pending sales
4. ✅ Can mark sales as sold or delete them

## Data Flow

```
1. User fills Step 1: Customer Details
   ↓
2. User fills Step 2: Selling Information (searches vehicle)
   ↓
3. User clicks "Sell Vehicle"
   ↓
4. Data is inserted into pending_vehicle_sales table
   ↓
5. User proceeds to Step 3: Confirmation
   ↓
6. Data appears in Sales Transactions > Pending Vehicles tab
```

## Database Relations

```
pending_vehicle_sales
├── vehicle_id → vehicles.id
└── sales_agent_id → sales_agents.id
```

This ensures data integrity and enables joins for fetching complete information.
