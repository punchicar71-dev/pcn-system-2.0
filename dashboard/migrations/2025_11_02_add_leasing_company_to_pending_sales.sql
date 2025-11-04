-- Add leasing_company_id column to pending_vehicle_sales table
-- This allows tracking which leasing company is financing a sale

ALTER TABLE public.pending_vehicle_sales 
ADD COLUMN IF NOT EXISTS leasing_company_id UUID;

-- Add foreign key constraint to leasing_companies table
ALTER TABLE public.pending_vehicle_sales 
ADD CONSTRAINT fk_pending_sales_leasing_company 
FOREIGN KEY (leasing_company_id) 
REFERENCES public.leasing_companies(id) 
ON DELETE SET NULL;

-- Add comment to document the column
COMMENT ON COLUMN public.pending_vehicle_sales.leasing_company_id IS 'References the leasing company when payment_type is Leasing';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_leasing_company 
ON public.pending_vehicle_sales(leasing_company_id);

-- Display success message
SELECT 'Migration completed: Added leasing_company_id to pending_vehicle_sales table' AS status;
