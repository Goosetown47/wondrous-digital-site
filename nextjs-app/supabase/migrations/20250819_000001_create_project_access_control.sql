-- Create project_users table for per-project access control
CREATE TABLE IF NOT EXISTS project_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at timestamptz DEFAULT now() NOT NULL,
  access_level text DEFAULT 'viewer' CHECK (access_level IN ('viewer', 'editor', 'admin')),
  
  -- Ensure unique user per project
  UNIQUE(project_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_project_users_project_id ON project_users(project_id);
CREATE INDEX idx_project_users_user_id ON project_users(user_id);
CREATE INDEX idx_project_users_account_id ON project_users(account_id);

-- Enable RLS
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_users

-- Policy: Account owners can view all project access in their account
CREATE POLICY "Account owners can view project access" ON project_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = project_users.account_id
        AND account_users.user_id = auth.uid()
        AND account_users.role = 'account_owner'
    )
  );

-- Policy: Users can view their own project access
CREATE POLICY "Users can view own project access" ON project_users
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Account owners can grant project access
CREATE POLICY "Account owners can grant project access" ON project_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = project_users.account_id
        AND account_users.user_id = auth.uid()
        AND account_users.role = 'account_owner'
    )
  );

-- Policy: Account owners can update project access
CREATE POLICY "Account owners can update project access" ON project_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = project_users.account_id
        AND account_users.user_id = auth.uid()
        AND account_users.role = 'account_owner'
    )
  );

-- Policy: Account owners can revoke project access
CREATE POLICY "Account owners can revoke project access" ON project_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = project_users.account_id
        AND account_users.user_id = auth.uid()
        AND account_users.role = 'account_owner'
    )
  );

-- Policy: Admin and staff can manage all project access
CREATE POLICY "Admin/staff can manage project access" ON project_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.user_id = auth.uid()
        AND account_users.account_id = '00000000-0000-0000-0000-000000000000'
        AND account_users.role IN ('admin', 'staff')
    )
  );

-- Update projects table RLS to consider project_users
-- First, drop existing policies that need updating
DROP POLICY IF EXISTS "Users can view projects in their accounts" ON projects;

-- Create new policy that considers both account membership and project-specific access
CREATE POLICY "Users can view accessible projects" ON projects
  FOR SELECT
  USING (
    -- Admin/staff can see all
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.user_id = auth.uid()
        AND account_users.account_id = '00000000-0000-0000-0000-000000000000'
        AND account_users.role IN ('admin', 'staff')
    )
    OR
    -- Account owners can see all projects in their account
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = projects.account_id
        AND account_users.user_id = auth.uid()
        AND account_users.role = 'account_owner'
    )
    OR
    -- Regular users can only see projects they have explicit access to
    EXISTS (
      SELECT 1 FROM project_users
      WHERE project_users.project_id = projects.id
        AND project_users.user_id = auth.uid()
    )
  );

-- Function to check if a user has project access
CREATE OR REPLACE FUNCTION has_project_access(
  p_project_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin/staff
  IF EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = p_user_id
      AND account_id = '00000000-0000-0000-0000-000000000000'
      AND role IN ('admin', 'staff')
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is account owner of the project's account
  IF EXISTS (
    SELECT 1 FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = p_project_id
      AND au.user_id = p_user_id
      AND au.role = 'account_owner'
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user has explicit project access
  IF EXISTS (
    SELECT 1 FROM project_users
    WHERE project_id = p_project_id
      AND user_id = p_user_id
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create a view to make it easier to query project access with user details
CREATE OR REPLACE VIEW project_access_view AS
SELECT 
  pu.id,
  pu.project_id,
  pu.user_id,
  pu.account_id,
  pu.granted_by,
  pu.granted_at,
  pu.access_level,
  p.name as project_name,
  up.display_name as user_display_name,
  up.avatar_url as user_avatar_url,
  gb_up.display_name as granted_by_display_name
FROM project_users pu
JOIN projects p ON p.id = pu.project_id
LEFT JOIN user_profiles up ON up.user_id = pu.user_id
LEFT JOIN user_profiles gb_up ON gb_up.user_id = pu.granted_by;

-- Grant permissions on the view
GRANT SELECT ON project_access_view TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE project_users IS 'Manages per-project access control for regular users. Account owners have implicit access to all projects in their account.';
COMMENT ON COLUMN project_users.access_level IS 'Access level for the user on this project: viewer (read-only), editor (can modify), admin (full control)';