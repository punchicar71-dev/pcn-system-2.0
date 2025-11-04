-- ==========================================
-- Migration: Add agent_type to sales_agents table
-- Date: 2025-11-04
-- Description: Add agent type field to classify agents as Office Sales Agent or Vehicle Showroom Agent
-- ==========================================

-- Add agent_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'sales_agents' 
        AND column_name = 'agent_type'
    ) THEN
        -- Create the enum type
        CREATE TYPE agent_type_enum AS ENUM ('Office Sales Agent', 'Vehicle Showroom Agent');
        
        ALTER TABLE public.sales_agents 
        ADD COLUMN agent_type agent_type_enum DEFAULT 'Office Sales Agent';
        
        RAISE NOTICE 'Added agent_type column to sales_agents table';
    ELSE
        RAISE NOTICE 'agent_type column already exists';
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.sales_agents.agent_type 
IS 'Type of sales agent: Office Sales Agent or Vehicle Showroom Agent';

-- ==========================================
-- Verification
-- ==========================================

SELECT 
    '=== Updated sales_agents Schema ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'sales_agents'
ORDER BY ordinal_position;
