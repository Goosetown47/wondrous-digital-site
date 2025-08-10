-- Create audit_logs table for tracking all user actions
-- This table is referenced throughout the codebase but was missing from migrations

-- First check if table exists and has correct structure
DO $$
BEGIN
  -- If table doesn't exist, create it
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    CREATE TABLE public.audit_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      metadata JSONB DEFAULT '{}' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    
    RAISE NOTICE 'Created audit_logs table';
  ELSE
    RAISE NOTICE 'audit_logs table already exists';
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_account_id ON public.audit_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Add helpful comments
COMMENT ON TABLE public.audit_logs IS 'Audit trail of all user actions within the platform';
COMMENT ON COLUMN public.audit_logs.action IS 'Action performed, e.g., project:create, account.update, user.role.update';
COMMENT ON COLUMN public.audit_logs.resource_type IS 'Type of resource affected, e.g., project, account, user, theme';
COMMENT ON COLUMN public.audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN public.audit_logs.metadata IS 'Additional context about the action in JSON format';

-- Enable RLS (Row Level Security)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view audit logs for their accounts" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create RLS policies
-- Policy: Users can only read audit logs for their accounts
-- Platform admins (users with 'admin' role in platform account) can see all
CREATE POLICY "Users can view audit logs for their accounts" ON public.audit_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id 
      FROM public.account_users 
      WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::UUID
      AND role = 'admin'
    )
  );

-- Policy: Only system can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Audit logs cannot be updated
-- (No UPDATE policy = no updates allowed)

-- Policy: Audit logs cannot be deleted by users
-- (No DELETE policy = no deletes allowed except CASCADE)

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO service_role;

-- Create a helper function to get recent audit logs for an account
CREATE OR REPLACE FUNCTION public.get_recent_audit_logs(
  p_account_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  account_id UUID,
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.account_id,
    al.user_id,
    up.email as user_email,
    up.display_name as user_name,
    al.action,
    al.resource_type,
    al.resource_id,
    al.metadata,
    al.created_at
  FROM public.audit_logs al
  LEFT JOIN public.user_profiles up ON up.user_id = al.user_id
  WHERE al.account_id = p_account_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'audit_logs table setup complete with RLS policies and indexes';
  RAISE NOTICE 'Table is now ready to receive audit log entries from the application';
END $$;