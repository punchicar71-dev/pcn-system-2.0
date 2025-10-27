-- ============================================
-- STEP 2: ADD SAMPLE DATA
-- Run this AFTER Step 1 completes successfully
-- ============================================

-- ==========================================
-- INSERT SAMPLE VEHICLE BRANDS
-- ==========================================

INSERT INTO public.vehicle_brands (id, name, is_active, created_at) VALUES
  (uuid_generate_v4(), 'Toyota', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Honda', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Nissan', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Mitsubishi', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Suzuki', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Mazda', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'BMW', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Mercedes-Benz', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Audi', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Volkswagen', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Hyundai', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Kia', true, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- INSERT SAMPLE VEHICLE MODELS
-- ==========================================

-- Get brand IDs for reference
WITH brand_ids AS (
  SELECT id, name FROM public.vehicle_brands
)

-- Insert models
INSERT INTO public.vehicle_models (id, brand_id, name, is_active, created_at)
SELECT 
  uuid_generate_v4(),
  b.id,
  m.model_name,
  true,
  CURRENT_TIMESTAMP
FROM brand_ids b
CROSS JOIN LATERAL (
  VALUES 
    (CASE WHEN b.name = 'Toyota' THEN 'Prius' END),
    (CASE WHEN b.name = 'Toyota' THEN 'Corolla' END),
    (CASE WHEN b.name = 'Toyota' THEN 'Aqua' END),
    (CASE WHEN b.name = 'Toyota' THEN 'Vitz' END),
    (CASE WHEN b.name = 'Toyota' THEN 'Premio' END),
    (CASE WHEN b.name = 'Toyota' THEN 'Axio' END),
    (CASE WHEN b.name = 'Toyota' THEN 'CH-R' END),
    (CASE WHEN b.name = 'Honda' THEN 'Civic' END),
    (CASE WHEN b.name = 'Honda' THEN 'Fit' END),
    (CASE WHEN b.name = 'Honda' THEN 'Grace' END),
    (CASE WHEN b.name = 'Honda' THEN 'Vezel' END),
    (CASE WHEN b.name = 'Honda' THEN 'CR-V' END),
    (CASE WHEN b.name = 'Nissan' THEN 'Leaf' END),
    (CASE WHEN b.name = 'Nissan' THEN 'Note' END),
    (CASE WHEN b.name = 'Nissan' THEN 'X-Trail' END),
    (CASE WHEN b.name = 'Suzuki' THEN 'Swift' END),
    (CASE WHEN b.name = 'Suzuki' THEN 'Alto' END),
    (CASE WHEN b.name = 'Suzuki' THEN 'Wagon R' END)
) m(model_name)
WHERE m.model_name IS NOT NULL
ON CONFLICT (brand_id, name) DO NOTHING;

-- ==========================================
-- INSERT SAMPLE COUNTRIES
-- ==========================================

INSERT INTO public.countries (id, name, code, is_active, created_at) VALUES
  (uuid_generate_v4(), 'Japan', 'JP', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'United Kingdom', 'UK', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Germany', 'DE', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'United States', 'US', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'South Korea', 'KR', true, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Sri Lanka', 'LK', true, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- VERIFICATION
-- ==========================================

SELECT 
  'Brands installed' as info, 
  COUNT(*) as count 
FROM public.vehicle_brands;

SELECT 
  'Models installed' as info, 
  COUNT(*) as count 
FROM public.vehicle_models;

SELECT 
  'Countries installed' as info, 
  COUNT(*) as count 
FROM public.countries;

-- Success message
SELECT '🎉 SAMPLE DATA SETUP COMPLETE!' as message;
SELECT '✅ You can now test the Add Vehicle form at http://localhost:3001/add-vehicle' as next_action;
