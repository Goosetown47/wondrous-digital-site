/*
  # Add System Admin Flag
  
  This migration adds support for system administrators who have access to all accounts
  and bypass all permission checks. The flag is stored in user metadata and must be
  set manually via the Supabase dashboard.
  
  To make a user a system admin:
  1. Go to Supabase Dashboard > Authentication > Users
  2. Find the user and click on them
  3. Edit their metadata
  4. Add: { "is_system_admin": true }
*/

-- Note: We cannot directly modify auth.users from a migration
-- The is_system_admin flag must be set manually in the Supabase dashboard
-- This migration just documents the expected structure

-- Create a helper function to check system admin status
CREATE OR REPLACE FUNCTION is_system_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_metadata JSONB;
BEGIN
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = user_id;
  
  RETURN COALESCE((user_metadata->>'is_system_admin')::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_system_admin(UUID) TO authenticated;

-- Update RLS policies to include system admin bypass
-- For example, update the projects view policy:
DROP POLICY IF EXISTS "Users can view projects in their accounts" ON projects;

CREATE POLICY "Users can view projects in their accounts" ON projects
  FOR SELECT
  USING (
    -- System admins can see all projects
    is_system_admin(auth.uid())
    OR
    -- Regular users see projects in their accounts
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = projects.account_id
      AND account_users.user_id = auth.uid()
    )
  );

-- Update other policies similarly...
DROP POLICY IF EXISTS "Users can view their accounts" ON accounts;

CREATE POLICY "Users can view their accounts" ON accounts
  FOR SELECT
  USING (
    -- System admins can see all accounts
    is_system_admin(auth.uid())
    OR
    -- Regular users see their own accounts
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = accounts.id
      AND account_users.user_id = auth.uid()
    )
  );

-- Add comment to document the system admin feature
COMMENT ON FUNCTION is_system_admin IS 'Checks if a user has system admin privileges. System admins have access to all accounts and bypass permission checks. The is_system_admin flag must be set in the user metadata via Supabase dashboard.';