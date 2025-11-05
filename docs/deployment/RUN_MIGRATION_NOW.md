# 🚀 RUN THIS MIGRATION FIRST!

## IMPORTANT: Run This Before Using PCN Advance Amount Feature

The database column `pcn_advance_amount` needs to be added to your `price_categories` table.

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste this SQL:**

```sql
-- Add PCN Advance Amount column
ALTER TABLE public.price_categories 
ADD COLUMN IF NOT EXISTS pcn_advance_amount DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Update existing rows with default values
UPDATE public.price_categories 
SET pcn_advance_amount = CASE 
  WHEN name = 'Low Level' THEN 25000
  WHEN name = 'Mid Level' THEN 50000
  WHEN name = 'High Level' THEN 100000
  WHEN name = 'Luxury' THEN 100000
  ELSE 0
END
WHERE pcn_advance_amount = 0;

-- Verify it worked
SELECT id, name, min_price, max_price, pcn_advance_amount 
FROM price_categories;
```

4. **Click "Run" or press Ctrl+Enter**

5. **You should see:**
   - "Success. No rows returned" (for ALTER TABLE)
   - Your categories with pcn_advance_amount values

### Option 2: Via Supabase CLI (If you have it)

```bash
# From your project root
supabase db execute -f dashboard/migrations/2025_11_add_pcn_advance_amount_to_price_categories.sql
```

### ✅ How to Verify It Worked

Run this query in SQL Editor:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'price_categories' 
AND column_name = 'pcn_advance_amount';
```

You should see:
- column_name: `pcn_advance_amount`
- data_type: `numeric`
- column_default: `0`

### 🎉 After Migration

Once you run this migration:
1. Refresh your browser
2. Go to Settings → Price Category
3. The "PCN Advance Amount" column and inputs will work!

---

**Need Help?** The full migration file is at:
`dashboard/migrations/2025_11_add_pcn_advance_amount_to_price_categories.sql`
