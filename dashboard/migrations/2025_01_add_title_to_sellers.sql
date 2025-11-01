-- Add title column to sellers table
-- This migration adds a title field for formal titles (Mr., Miss., Mrs., Dr.)

ALTER TABLE public.sellers 
ADD COLUMN IF NOT EXISTS title VARCHAR(10) CHECK (title IN ('Mr.', 'Miss.', 'Mrs.', 'Dr.'));

-- Add a comment to the column
COMMENT ON COLUMN public.sellers.title IS 'Formal title for the seller (Mr., Miss., Mrs., Dr.)';

-- Update existing records with a default title (optional - you can remove this if you don't want to set defaults)
-- UPDATE public.sellers SET title = 'Mr.' WHERE title IS NULL;

-- Create an index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_sellers_title ON public.sellers(title);
