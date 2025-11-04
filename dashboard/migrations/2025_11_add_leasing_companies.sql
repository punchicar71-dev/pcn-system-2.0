-- ==========================================
-- LEASING COMPANIES TABLE
-- ==========================================

-- Create leasing companies table
CREATE TABLE IF NOT EXISTS public.leasing_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_leasing_companies_company_id ON public.leasing_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_leasing_companies_is_active ON public.leasing_companies(is_active);

-- Enable Row Level Security
ALTER TABLE public.leasing_companies ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy
DROP POLICY IF EXISTS "Allow all access to leasing_companies" ON public.leasing_companies;
CREATE POLICY "Allow all access to leasing_companies" 
  ON public.leasing_companies 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create update trigger
DROP TRIGGER IF EXISTS update_leasing_companies_updated_at ON public.leasing_companies;
CREATE TRIGGER update_leasing_companies_updated_at 
  BEFORE UPDATE ON public.leasing_companies
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.leasing_companies (company_id, name, is_active) VALUES
  ('00471', 'LB Finance', true),
  ('00453', 'Peoples Leasing', true),
  ('00423', 'HNB Leasing', false)
ON CONFLICT (company_id) DO NOTHING;

-- Verification
SELECT 'Leasing Companies Table Created Successfully!' as status;
SELECT * FROM public.leasing_companies ORDER BY created_at DESC;
