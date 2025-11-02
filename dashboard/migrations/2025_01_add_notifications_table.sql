-- Create notifications table for tracking user actions on vehicles
-- Run this in Supabase SQL Editor

-- Drop table if exists (for fresh setup)
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'added', 'updated', 'deleted', 'moved_to_sales', 'sold'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  vehicle_number VARCHAR(50),
  vehicle_brand VARCHAR(100),
  vehicle_model VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON notifications;
CREATE TRIGGER notifications_updated_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid()::text = (SELECT auth_id::text FROM users WHERE id = user_id));

-- Users can insert their own notifications
CREATE POLICY "Users can create own notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT auth_id::text FROM users WHERE id = user_id));

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid()::text = (SELECT auth_id::text FROM users WHERE id = user_id));

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid()::text = (SELECT auth_id::text FROM users WHERE id = user_id));

-- Insert some sample notifications (optional - remove if not needed)
-- First, get a sample user ID
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  SELECT id INTO sample_user_id FROM users LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, vehicle_number, vehicle_brand, vehicle_model, is_read)
    VALUES 
      (sample_user_id, 'added', 'Vehicle Added', 'Toyota Aqua (CBA-3822) added to the Inventory.', 'CBA-3822', 'Toyota', 'Aqua', false),
      (sample_user_id, 'moved_to_sales', 'Moved to Sales', 'Toyota Aqua (CBA-3822) moved to the Selling Process — now listed in Sales Transactions (Pending).', 'CBA-3822', 'Toyota', 'Aqua', false),
      (sample_user_id, 'sold', 'Vehicle Sold', 'Toyota Aqua (CBA-3822) sale completed — vehicle moved to Sold Out.', 'CBA-3822', 'Toyota', 'Aqua', false);
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Notifications table created successfully!';
  RAISE NOTICE '📊 Table: notifications';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '📈 Indexes created for performance';
  RAISE NOTICE '⚡ Triggers configured for auto-updates';
  RAISE NOTICE '✨ Ready to track vehicle notifications!';
END $$;
