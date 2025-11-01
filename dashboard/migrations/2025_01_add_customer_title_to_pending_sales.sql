-- Add customer_title column to pending_vehicle_sales table
-- This migration adds a title field for customer formal titles (Mr., Miss., Mrs., Dr.)

ALTER TABLE public.pending_vehicle_sales 
ADD COLUMN IF NOT EXISTS customer_title VARCHAR(10) CHECK (customer_title IN ('Mr.', 'Miss.', 'Mrs.', 'Dr.'));

-- Add a comment to the column
COMMENT ON COLUMN public.pending_vehicle_sales.customer_title IS 'Formal title for the customer (Mr., Miss., Mrs., Dr.)';

-- Create an index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_customer_title ON public.pending_vehicle_sales(customer_title);
