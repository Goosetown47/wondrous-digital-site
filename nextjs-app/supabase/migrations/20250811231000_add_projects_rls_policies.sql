-- Add RLS policies for projects table
-- This ensures users can only access projects in their accounts

-- First, ensure RLS is enabled on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

-- =====================================================
-- SELECT POLICY - Users can view projects in their accounts
-- =====================================================
CREATE POLICY "projects_select_policy" ON projects
FOR SELECT
TO authenticated
USING (
  -- Platform admins can see all projects
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can see projects in their accounts
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- INSERT POLICY - Users can create projects in their accounts
-- =====================================================
CREATE POLICY "projects_insert_policy" ON projects
FOR INSERT
TO authenticated
WITH CHECK (
  -- Platform admins can create projects in any account
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can create projects in accounts they belong to
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- UPDATE POLICY - Users can update projects in their accounts
-- =====================================================
CREATE POLICY "projects_update_policy" ON projects
FOR UPDATE
TO authenticated
USING (
  -- Platform admins can update any project
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can update projects in their accounts
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Ensure account_id cannot be changed to an account they don't have access to
  -- Platform admins can change to any account
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Regular users must maintain access to the account
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- DELETE POLICY - Users can delete projects in their accounts
-- =====================================================
CREATE POLICY "projects_delete_policy" ON projects
FOR DELETE
TO authenticated
USING (
  -- Platform admins can delete any project
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can delete projects in their accounts  
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
);

-- Add comment explaining the policies
COMMENT ON TABLE projects IS 'Projects table with RLS policies that allow users to manage projects in accounts they belong to';