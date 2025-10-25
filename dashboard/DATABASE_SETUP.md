# Database Setup Instructions

## Setting up Supabase Tables

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the migration**
   - Copy the contents of `supabase-migration.sql`
   - Paste it into the SQL editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

4. **Verify tables created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `countries` (with 15 pre-populated countries)
     - `vehicle_brands`
     - `vehicle_models`
     - `price_categories` (with 4 pre-populated categories)
     - `sales_agents` (with 3 pre-populated agents)

## Tables Structure

### countries
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

### vehicle_brands
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique)
- `logo_url` (TEXT, Optional)
- `created_at`, `updated_at`

### vehicle_models
- `id` (UUID, Primary Key)
- `brand_id` (UUID, Foreign Key to vehicle_brands)
- `name` (VARCHAR)
- `created_at`, `updated_at`
- Unique constraint on (brand_id, name)

### price_categories
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique)
- `min_price` (DECIMAL)
- `max_price` (DECIMAL)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

### sales_agents
- `id` (UUID, Primary Key)
- `user_id` (VARCHAR, Unique)
- `name` (VARCHAR)
- `email` (VARCHAR, Optional)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

## Importing Vehicle Brands & Models from CSV

To import the vehicle brands and models from the CSV file:

1. **Extract unique brands:**
   ```bash
   cat "vehicle brand & models.csv" | cut -d',' -f1 | sort -u | tail -n +2 > brands.txt
   ```

2. **Create a script or manually insert brands in Supabase**

3. **Then import models linked to their brands**

Or use the Settings page in the dashboard:
- Go to Settings > Vehicle Brands tab
- Click "Add Brand" to add brands one by one
- Click "Sync Models" to add models to each brand

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Current policies allow all operations (read, insert, update, delete)
- **Important:** Update the policies based on your authentication requirements
- Consider restricting write operations to authenticated admin users only

## Next Steps

1. Run the migration SQL in Supabase
2. Start the dashboard: `npm run dev`
3. Navigate to `/dashboard/settings`
4. Test all four tabs:
   - Vehicle Brands
   - Price Category
   - Sales Agent
   - Countries
