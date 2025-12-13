-- ==========================================
-- Migration: Allow Multiple Sold-Out Records for Same Vehicle
-- Purpose: Support vehicles being sold multiple times through the system
--          Each sale is preserved as a separate historical transaction
-- Date: 2025-12-13
-- ==========================================

-- IMPORTANT: This migration enables the same vehicle to be:
-- 1. Sold (status = 'sold' in pending_vehicle_sales)
-- 2. Re-added to inventory (new record in vehicles table)
-- 3. Sold again (another 'sold' record in pending_vehicle_sales)
-- All sold-out records are preserved with their own timestamp and transaction data

-- ==========================================
-- STEP 1: Ensure vehicle_id can be NULL
-- This allows historical sold records to remain even when vehicle is deleted/re-added
-- ==========================================

DO $$ 
BEGIN
    -- Check current nullable status
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'pending_vehicle_sales' 
        AND column_name = 'vehicle_id'
        AND is_nullable = 'NO'
    ) THEN
        -- Drop the foreign key constraint temporarily
        ALTER TABLE public.pending_vehicle_sales 
        DROP CONSTRAINT IF EXISTS pending_vehicle_sales_vehicle_id_fkey;
        
        -- Make vehicle_id nullable
        ALTER TABLE public.pending_vehicle_sales 
        ALTER COLUMN vehicle_id DROP NOT NULL;
        
        -- Re-add the foreign key constraint with ON DELETE SET NULL
        ALTER TABLE public.pending_vehicle_sales 
        ADD CONSTRAINT pending_vehicle_sales_vehicle_id_fkey 
        FOREIGN KEY (vehicle_id) 
        REFERENCES public.vehicles(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Made vehicle_id nullable with ON DELETE SET NULL';
    ELSE
        RAISE NOTICE 'vehicle_id is already nullable';
    END IF;
END $$;

-- ==========================================
-- STEP 2: Add Index on Status for Performance
-- Helps with queries filtering sold vs pending records
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_status 
ON public.pending_vehicle_sales(status);

-- ==========================================
-- STEP 3: Add Index on Updated_At for Sold Date Queries
-- The updated_at timestamp represents when the sale was marked as 'sold'
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_updated_at 
ON public.pending_vehicle_sales(updated_at);

-- ==========================================
-- STEP 4: Add Comments for Documentation
-- ==========================================

COMMENT ON COLUMN public.pending_vehicle_sales.vehicle_id 
IS 'References the vehicle at time of sale. Can be NULL for historical records when vehicle is deleted/re-added. Use snapshot columns (vehicle_number, brand_name, model_name, manufacture_year) for display.';

COMMENT ON COLUMN public.pending_vehicle_sales.status 
IS 'Sale status: pending (in sales transactions) or sold (completed sale in sold-out table). Multiple sold records can exist for the same vehicle_number.';

COMMENT ON COLUMN public.pending_vehicle_sales.updated_at 
IS 'Timestamp when record was last updated. For sold records, this represents the sold-out date/time.';

-- ==========================================
-- VERIFICATION
-- ==========================================

SELECT 
    '=== pending_vehicle_sales Schema Check ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pending_vehicle_sales'
    AND column_name IN ('vehicle_id', 'vehicle_number', 'brand_name', 'model_name', 'status')
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    '=== Foreign Key Constraints ===' as info;

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.pending_vehicle_sales'::regclass
AND conname LIKE '%vehicle_id%';

-- Test query: Show how multiple sold records work
SELECT 
    '=== Example: Multiple Sold Records for Same Vehicle ===' as info;

SELECT 
    '
    Example scenario:
    1. Vehicle ABC-1234 is sold on 2025-01-15 (Sale ID: 1, vehicle_id: xyz-123)
    2. Vehicle ABC-1234 is re-added to inventory (new vehicle_id: xyz-456)
    3. Vehicle ABC-1234 is sold again on 2025-06-20 (Sale ID: 2, vehicle_id: xyz-456)
    
    Result in pending_vehicle_sales:
    - Record 1: status=sold, vehicle_number=ABC-1234, updated_at=2025-01-15, vehicle_id=NULL (old vehicle deleted)
    - Record 2: status=sold, vehicle_number=ABC-1234, updated_at=2025-06-20, vehicle_id=xyz-456 (current vehicle)
    
    Both records are preserved in Sold Out table, distinguished by their sold-out timestamp.
    ' as explanation;

SELECT '✅ Migration completed: Multiple sold-out records now supported' AS status;
