-- Force fix project RLS policies for platform admin visibility

-- Drop any existing SELECT policies on projects
DROP POLICY IF EXISTS "simple_select_projects" ON projects;
DROP POLICY IF EXISTS "users_can_view_projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects in their accounts" ON projects;

-- Create comprehensive SELECT policy
CREATE POLICY "users_can_view_projects" ON projects
  FOR SELECT
  USING (
    -- Platform admins can see all projects
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
    )
    OR
    -- Platform staff can see projects in their assigned accounts
    EXISTS (
      SELECT 1 FROM account_users au
      WHERE au.user_id = auth.uid()
      AND au.account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND au.role = 'staff'
      AND projects.account_id IN (
        SELECT account_id 
        FROM staff_account_assignments 
        WHERE staff_user_id = auth.uid()
      )
    )
    OR
    -- Regular users can see projects in their accounts
    projects.account_id IN (
      SELECT account_id 
      FROM account_users 
      WHERE user_id = auth.uid()
      AND account_id != '00000000-0000-0000-0000-000000000000'::uuid
    )
  );

-- Ensure RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;