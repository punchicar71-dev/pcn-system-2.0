-- ==========================================
-- Migration: Add body_type to Vehicle Snapshot in pending_vehicle_sales
-- Purpose: Store body_type at time of sale to optimize dashboard queries
--          This prevents needing to join to vehicles table which may fail
--          when vehicle_id is NULL (vehicle re-added after being sold)
-- Date: 2025-12-13
-- ==========================================

-- Add body_type column to pending_vehicle_sales
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'pending_vehicle_sales' 
        AND column_name = 'body_type'
    ) THEN
        ALTER TABLE public.pending_vehicle_sales 
        ADD COLUMN body_type VARCHAR(50);
        
        RAISE NOTICE 'Added body_type column';
    ELSE
        RAISE NOTICE 'body_type column already exists';
    END IF;
END $$;

-- ==========================================
-- BACKFILL EXISTING RECORDS
-- Update existing records with body_type from vehicles table
-- ==========================================

UPDATE public.pending_vehicle_sales pvs
SET body_type = v.body_type
FROM public.vehicles v
WHERE pvs.vehicle_id = v.id
AND pvs.body_type IS NULL;

-- ==========================================
-- ADD COMMENT
-- ==========================================

COMMENT ON COLUMN public.pending_vehicle_sales.body_type 
IS 'Snapshot of vehicle body type at time of sale - preserved even if vehicle is deleted/re-added';

-- ==========================================
-- CREATE INDEX for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_body_type 
ON public.pending_vehicle_sales(body_type);

-- ==========================================
-- VERIFY MIGRATION
-- ==========================================

SELECT 
    '✅ Migration complete! body_type column added to pending_vehicle_sales.' as message,
    COUNT(*) as total_records,
    COUNT(body_type) as records_with_body_type,
    COUNT(*) - COUNT(body_type) as records_missing_body_type
FROM public.pending_vehicle_sales;
