-- ========================================
-- QUICK FIX: Add Title Column to Sellers
-- ========================================
-- Run this in Supabase SQL Editor to fix the seller details bug

-- Step 1: Add the title column to sellers table
ALTER TABLE public.sellers 
ADD COLUMN IF NOT EXISTS title VARCHAR(10) CHECK (title IN ('Mr.', 'Miss.', 'Mrs.', 'Dr.'));

-- Step 2: Add a helpful comment
COMMENT ON COLUMN public.sellers.title IS 'Formal title for the seller (Mr., Miss., Mrs., Dr.)';

-- Step 3: Create an index for performance
CREATE INDEX IF NOT EXISTS idx_sellers_title ON public.sellers(title);

-- Step 4: Verify the column was added
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sellers'
  AND column_name = 'title';

-- You should see output like:
-- column_name | data_type         | character_maximum_length | is_nullable
-- ------------|-------------------|-------------------------|------------
-- title       | character varying | 10                      | YES

-- ========================================
-- ✅ That's it! Your seller details will now save correctly.
-- ========================================
