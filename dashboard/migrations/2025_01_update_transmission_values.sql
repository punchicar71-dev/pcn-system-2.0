-- ========================================
-- UPDATE TRANSMISSION VALUES
-- ========================================
-- This migration updates the transmission constraint to only allow 'Auto' and 'Manual'
-- Removes 'Automatic' as an option

-- Step 1: Update any existing 'Automatic' values to 'Auto'
UPDATE public.vehicles 
SET transmission = 'Auto' 
WHERE transmission = 'Automatic';

-- Step 2: Drop the old constraint
ALTER TABLE public.vehicles 
DROP CONSTRAINT IF EXISTS check_transmission;

-- Step 3: Add the new constraint with only 'Auto' and 'Manual'
ALTER TABLE public.vehicles 
ADD CONSTRAINT check_transmission CHECK (transmission IN ('Auto', 'Manual'));

-- Step 4: Verify the changes
SELECT 
    transmission, 
    COUNT(*) as count
FROM public.vehicles
GROUP BY transmission
ORDER BY transmission;

-- Expected output:
-- transmission | count
-- -------------|-------
-- Auto         | X
-- Manual       | X

-- ========================================
-- ✅ Migration Complete!
-- ========================================
-- The transmission field now only accepts 'Auto' or 'Manual'
