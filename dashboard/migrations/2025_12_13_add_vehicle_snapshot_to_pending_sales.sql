-- ==========================================
-- Migration: Add Vehicle Snapshot Columns to pending_vehicle_sales
-- Purpose: Store vehicle details at time of sale to preserve historical data
--          This allows the same vehicle to have multiple sold-out records
--          without losing vehicle information when vehicle is re-added
-- Date: 2025-12-13
-- ==========================================

-- 1. Add vehicle_number column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'pending_vehicle_sales' 
        AND column_name = 'vehicle_number'
    ) THEN
        ALTER TABLE public.pending_vehicle_sales 
        ADD COLUMN vehicle_number VARCHAR(50);
        
        RAISE NOTICE 'Added vehicle_number column';
    ELSE
        RAISE NOTICE 'vehicle_number column already exists';
    END IF;
END $$;

-- 2. Add brand_name column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'pending_vehicle_sales' 
        AND column_name = 'brand_name'
    ) THEN
        ALTER TABLE public.pending_vehicle_sales 
        ADD COLUMN brand_name VARCHAR(100);
        
        RAISE NOTICE 'Added brand_name column';
    ELSE
        RAISE NOTICE 'brand_name column already exists';
    END IF;
END $$;

-- 3. Add model_name column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'pending_vehicle_sales' 
        AND column_name = 'model_name'
    ) THEN
        ALTER TABLE public.pending_vehicle_sales 
        ADD COLUMN model_name VARCHAR(100);
        
        RAISE NOTICE 'Added model_name column';
    ELSE
        RAISE NOTICE 'model_name column already exists';
    END IF;
END $$;

-- 4. Add manufacture_year column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'pending_vehicle_sales' 
        AND column_name = 'manufacture_year'
    ) THEN
        ALTER TABLE public.pending_vehicle_sales 
        ADD COLUMN manufacture_year INTEGER;
        
        RAISE NOTICE 'Added manufacture_year column';
    ELSE
        RAISE NOTICE 'manufacture_year column already exists';
    END IF;
END $$;

-- ==========================================
-- BACKFILL EXISTING RECORDS
-- Update existing sold records with vehicle info from vehicles table
-- ==========================================

UPDATE public.pending_vehicle_sales pvs
SET 
    vehicle_number = v.vehicle_number,
    brand_name = vb.name,
    model_name = vm.name,
    manufacture_year = v.manufacture_year
FROM public.vehicles v
LEFT JOIN public.vehicle_brands vb ON v.brand_id = vb.id
LEFT JOIN public.vehicle_models vm ON v.model_id = vm.id
WHERE pvs.vehicle_id = v.id
AND (pvs.vehicle_number IS NULL OR pvs.brand_name IS NULL);

-- ==========================================
-- ADD COMMENTS
-- ==========================================

COMMENT ON COLUMN public.pending_vehicle_sales.vehicle_number 
IS 'Snapshot of vehicle number at time of sale - preserved even if vehicle is deleted/re-added';

COMMENT ON COLUMN public.pending_vehicle_sales.brand_name 
IS 'Snapshot of brand name at time of sale - preserved even if vehicle is deleted/re-added';

COMMENT ON COLUMN public.pending_vehicle_sales.model_name 
IS 'Snapshot of model name at time of sale - preserved even if vehicle is deleted/re-added';

COMMENT ON COLUMN public.pending_vehicle_sales.manufacture_year 
IS 'Snapshot of manufacture year at time of sale - preserved even if vehicle is deleted/re-added';

-- ==========================================
-- ADD INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_vehicle_number 
ON public.pending_vehicle_sales(vehicle_number);

CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_brand_name 
ON public.pending_vehicle_sales(brand_name);

-- ==========================================
-- VERIFICATION
-- ==========================================

SELECT 
    '=== Updated pending_vehicle_sales Schema ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pending_vehicle_sales'
    AND column_name IN ('vehicle_number', 'brand_name', 'model_name', 'manufacture_year')
ORDER BY ordinal_position;

-- Count records with vehicle info populated
SELECT 
    '=== Records with Vehicle Info ===' as info;

SELECT 
    COUNT(*) as total_records,
    COUNT(vehicle_number) as with_vehicle_number,
    COUNT(brand_name) as with_brand_name
FROM public.pending_vehicle_sales
WHERE status = 'sold';

SELECT '✅ Migration complete! Vehicle snapshot columns added to pending_vehicle_sales.' as message;
