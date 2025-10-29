-- Create user_sessions table to track real-time active sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_auth_id ON public.user_sessions(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity);

-- Create a function to automatically update last_activity timestamp
CREATE OR REPLACE FUNCTION update_session_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_activity on update
CREATE TRIGGER trigger_update_session_last_activity
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_last_activity();

-- Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Mark sessions as inactive if no activity for more than 5 minutes
  UPDATE public.user_sessions
  SET is_active = false
  WHERE is_active = true
    AND last_activity < NOW() - INTERVAL '5 minutes';
    
  -- Delete old inactive sessions (older than 24 hours)
  DELETE FROM public.user_sessions
  WHERE is_active = false
    AND last_activity < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions table
-- Allow users to view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions
  FOR SELECT
  USING (auth.uid() = auth_id);

-- Allow users to insert their own sessions
CREATE POLICY "Users can create their own sessions"
  ON public.user_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- Allow users to update their own sessions
CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions
  FOR UPDATE
  USING (auth.uid() = auth_id);

-- Allow users to delete their own sessions
CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions
  FOR DELETE
  USING (auth.uid() = auth_id);

-- Allow service role to manage all sessions (for admin operations)
CREATE POLICY "Service role can manage all sessions"
  ON public.user_sessions
  FOR ALL
  USING (true);

-- Grant permissions
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.user_sessions TO service_role;

-- Comment on table
COMMENT ON TABLE public.user_sessions IS 'Tracks real-time user session activity for determining online/offline status';
