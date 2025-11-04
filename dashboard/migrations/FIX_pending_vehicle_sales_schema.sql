-- ==========================================
-- FIX: pending_vehicle_sales Table Schema
-- Adds missing customer_title and leasing_company_id columns
-- ==========================================

-- First, let's check what columns currently exist
SELECT 
    '=== Current pending_vehicle_sales Schema ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pending_vehicle_sales'
ORDER BY ordinal_position;

-- ==========================================
-- ADD MISSING COLUMNS
-- ==========================================

-- 1. Add customer_title column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'pending_vehicle_sales' 
        AND column_name = 'customer_title'
    ) THEN
        ALTER TABLE public.pending_vehicle_sales 
        ADD COLUMN customer_title VARCHAR(10) 
        CHECK (customer_title IN ('Mr.', 'Miss.', 'Mrs.', 'Dr.'));
        
        RAISE NOTICE 'Added customer_title column';
    ELSE
        RAISE NOTICE 'customer_title column already exists';
    END IF;
END $$;

-- 2. Add leasing_company_id column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'pending_vehicle_sales' 
        AND column_name = 'leasing_company_id'
    ) THEN
        ALTER TABLE public.pending_vehicle_sales 
        ADD COLUMN leasing_company_id UUID;
        
        RAISE NOTICE 'Added leasing_company_id column';
    ELSE
        RAISE NOTICE 'leasing_company_id column already exists';
    END IF;
END $$;

-- ==========================================
-- ADD COMMENTS
-- ==========================================

COMMENT ON COLUMN public.pending_vehicle_sales.customer_title 
IS 'Formal title for the customer (Mr., Miss., Mrs., Dr.)';

COMMENT ON COLUMN public.pending_vehicle_sales.leasing_company_id 
IS 'References the leasing company when payment_type is Leasing';

-- ==========================================
-- ADD FOREIGN KEY CONSTRAINT
-- ==========================================

DO $$ 
BEGIN
    -- Check if leasing_companies table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'leasing_companies'
    ) THEN
        -- Add foreign key if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'fk_pending_sales_leasing_company'
        ) THEN
            ALTER TABLE public.pending_vehicle_sales 
            ADD CONSTRAINT fk_pending_sales_leasing_company 
            FOREIGN KEY (leasing_company_id) 
            REFERENCES public.leasing_companies(id) 
            ON DELETE SET NULL;
            
            RAISE NOTICE 'Added foreign key constraint for leasing_company_id';
        ELSE
            RAISE NOTICE 'Foreign key constraint already exists';
        END IF;
    ELSE
        RAISE NOTICE 'WARNING: leasing_companies table does not exist. Skipping foreign key.';
    END IF;
END $$;

-- ==========================================
-- CREATE INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_customer_title 
ON public.pending_vehicle_sales(customer_title);

CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_leasing_company 
ON public.pending_vehicle_sales(leasing_company_id);

-- ==========================================
-- VERIFY THE FIX
-- ==========================================

SELECT 
    '=== VERIFICATION: Updated Schema ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pending_vehicle_sales'
    AND column_name IN ('customer_title', 'leasing_company_id')
ORDER BY column_name;

-- Show total records
SELECT 
    '=== Total Records in Table ===' as info;

SELECT COUNT(*) as total_records
FROM public.pending_vehicle_sales;

SELECT 
    '=== Migration Complete! ===' as status,
    '✅ customer_title column added/verified' as step1,
    '✅ leasing_company_id column added/verified' as step2,
    '✅ Foreign key constraint added/verified' as step3,
    '✅ Indexes created' as step4;
