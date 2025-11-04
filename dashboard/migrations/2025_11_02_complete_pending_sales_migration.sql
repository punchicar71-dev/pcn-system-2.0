-- Complete migration for pending_vehicle_sales table
-- Adds missing columns: customer_title and leasing_company_id

-- 1. Add customer_title column (if not exists)
ALTER TABLE public.pending_vehicle_sales 
ADD COLUMN IF NOT EXISTS customer_title VARCHAR(10) 
CHECK (customer_title IN ('Mr.', 'Miss.', 'Mrs.', 'Dr.'));

COMMENT ON COLUMN public.pending_vehicle_sales.customer_title 
IS 'Formal title for the customer (Mr., Miss., Mrs., Dr.)';

-- 2. Add leasing_company_id column (if not exists)
ALTER TABLE public.pending_vehicle_sales 
ADD COLUMN IF NOT EXISTS leasing_company_id UUID;

COMMENT ON COLUMN public.pending_vehicle_sales.leasing_company_id 
IS 'References the leasing company when payment_type is Leasing';

-- 3. Add foreign key constraint for leasing_company_id (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_pending_sales_leasing_company'
    ) THEN
        ALTER TABLE public.pending_vehicle_sales 
        ADD CONSTRAINT fk_pending_sales_leasing_company 
        FOREIGN KEY (leasing_company_id) 
        REFERENCES public.leasing_companies(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_customer_title 
ON public.pending_vehicle_sales(customer_title);

CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_leasing_company 
ON public.pending_vehicle_sales(leasing_company_id);

-- 5. Display success message
SELECT 
    'Migration completed successfully!' AS status,
    COUNT(*) AS total_records
FROM public.pending_vehicle_sales;

-- 6. Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pending_vehicle_sales'
    AND column_name IN ('customer_title', 'leasing_company_id')
ORDER BY column_name;
