-- Create pending_vehicle_sales table
CREATE TABLE IF NOT EXISTS pending_vehicle_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_nic VARCHAR(20),
  customer_mobile VARCHAR(20) NOT NULL,
  customer_landphone VARCHAR(20),
  customer_email VARCHAR(100),
  selling_amount DECIMAL(12, 2) NOT NULL,
  advance_amount DECIMAL(12, 2) DEFAULT 0,
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('Cash', 'Leasing', 'Bank Transfer', 'Check')),
  sales_agent_id UUID REFERENCES sales_agents(id) ON DELETE SET NULL,
  third_party_agent VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_vehicle_id ON pending_vehicle_sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_status ON pending_vehicle_sales(status);
CREATE INDEX IF NOT EXISTS idx_pending_vehicle_sales_created_at ON pending_vehicle_sales(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pending_vehicle_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pending_vehicle_sales_updated_at
  BEFORE UPDATE ON pending_vehicle_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_vehicle_sales_updated_at();

-- Grant permissions (adjust based on your RLS policies)
ALTER TABLE pending_vehicle_sales ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow authenticated users full access to pending_vehicle_sales" ON pending_vehicle_sales;
DROP POLICY IF EXISTS "Allow all operations" ON pending_vehicle_sales;

-- Create policy for all users (including anon) to view, insert, update, and delete
CREATE POLICY "Allow all operations on pending_vehicle_sales"
  ON pending_vehicle_sales
  FOR ALL
  USING (true)
  WITH CHECK (true);
