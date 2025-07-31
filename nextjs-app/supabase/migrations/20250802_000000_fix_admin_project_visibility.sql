-- Fix project visibility for platform admins
-- Platform admins should see ALL projects across ALL accounts

-- Drop existing policy that doesn't properly check for platform admins
DROP POLICY IF EXISTS "simple_select_projects" ON projects;

-- Create new comprehensive SELECT policy
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

-- Update INSERT policy to allow platform admins and staff to create projects
DROP POLICY IF EXISTS "users_can_create_projects" ON projects;

CREATE POLICY "users_can_create_projects" ON projects
  FOR INSERT
  WITH CHECK (
    -- Platform admins can create projects in any account
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
    )
    OR
    -- Platform staff can create projects in assigned accounts
    EXISTS (
      SELECT 1 FROM account_users au
      WHERE au.user_id = auth.uid()
      AND au.account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND au.role = 'staff'
      AND account_id IN (
        SELECT account_id 
        FROM staff_account_assignments 
        WHERE staff_user_id = auth.uid()
      )
    )
    OR
    -- Account owners can create projects in their accounts
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = projects.account_id
      AND role = 'account_owner'
      AND account_id != '00000000-0000-0000-0000-000000000000'::uuid
    )
  );

-- Update UPDATE policy
DROP POLICY IF EXISTS "users_can_update_own_projects" ON projects;

CREATE POLICY "users_can_update_projects" ON projects
  FOR UPDATE
  USING (
    -- Platform admins can update any project
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
    )
    OR
    -- Platform staff can update projects in assigned accounts
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
    -- Account owners can update their projects
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = projects.account_id
      AND role = 'account_owner'
      AND account_id != '00000000-0000-0000-0000-000000000000'::uuid
    )
  );

-- Update DELETE policy
DROP POLICY IF EXISTS "users_can_delete_own_projects" ON projects;

CREATE POLICY "users_can_delete_projects" ON projects
  FOR DELETE
  USING (
    -- Only platform admins can delete projects
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
    )
  );

-- Add comment explaining the platform account
COMMENT ON POLICY "users_can_view_projects" ON projects IS 
  'Platform admins (role=admin in platform account 00000000-0000-0000-0000-000000000000) can see all projects. Staff see assigned accounts. Regular users see their own accounts.';