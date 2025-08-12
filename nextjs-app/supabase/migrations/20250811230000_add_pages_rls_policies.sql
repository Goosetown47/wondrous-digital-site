-- Add RLS policies for pages table to fix client-side updates
-- This migration adds proper RLS policies that allow users to manage pages
-- in projects they have access to through their account membership

-- First, ensure RLS is enabled on pages table
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "pages_select_policy" ON pages;
DROP POLICY IF EXISTS "pages_insert_policy" ON pages;
DROP POLICY IF EXISTS "pages_update_policy" ON pages;
DROP POLICY IF EXISTS "pages_delete_policy" ON pages;

-- =====================================================
-- SELECT POLICY - Users can view pages in their projects
-- =====================================================
CREATE POLICY "pages_select_policy" ON pages
FOR SELECT
TO authenticated
USING (
  -- Platform admins can see all pages
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can see pages in projects they have access to
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- INSERT POLICY - Users can create pages in their projects
-- =====================================================
CREATE POLICY "pages_insert_policy" ON pages
FOR INSERT
TO authenticated
WITH CHECK (
  -- Platform admins can create pages anywhere
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can create pages in projects they have access to
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- UPDATE POLICY - Users can update pages in their projects
-- =====================================================
CREATE POLICY "pages_update_policy" ON pages
FOR UPDATE
TO authenticated
USING (
  -- Platform admins can update any page
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can update pages in projects they have access to
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Ensure project_id cannot be changed to a project they don't have access to
  -- Platform admins can change to any project
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Regular users must maintain access to the project
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- DELETE POLICY - Users can delete pages in their projects
-- =====================================================
CREATE POLICY "pages_delete_policy" ON pages
FOR DELETE
TO authenticated
USING (
  -- Platform admins can delete any page
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can delete pages in projects they have access to
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
);

-- Add comment explaining the policies
COMMENT ON TABLE pages IS 'Pages table with RLS policies that allow users to manage pages in projects they have access to via account membership';