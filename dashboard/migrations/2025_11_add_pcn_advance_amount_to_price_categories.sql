-- Migration: Add PCN Advance Amount to Price Categories
-- Date: November 2025
-- Description: Adds pcn_advance_amount column to price_categories table

-- Add the pcn_advance_amount column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'price_categories' 
    AND column_name = 'pcn_advance_amount'
  ) THEN
    ALTER TABLE public.price_categories 
    ADD COLUMN pcn_advance_amount DECIMAL(12, 2) NOT NULL DEFAULT 0;
    
    RAISE NOTICE 'Column pcn_advance_amount added successfully to price_categories table';
  ELSE
    RAISE NOTICE 'Column pcn_advance_amount already exists in price_categories table';
  END IF;
END $$;

-- Optional: Update existing rows with default values based on category
-- You can customize these values as needed
UPDATE public.price_categories 
SET pcn_advance_amount = CASE 
  WHEN name = 'Low Level' THEN 25000
  WHEN name = 'Mid Level' THEN 50000
  WHEN name = 'High Level' THEN 100000
  WHEN name = 'Luxury' THEN 100000
  ELSE 0
END
WHERE pcn_advance_amount = 0;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'price_categories' 
AND column_name = 'pcn_advance_amount';
