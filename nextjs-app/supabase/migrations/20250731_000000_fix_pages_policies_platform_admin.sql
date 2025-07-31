-- Migration: Fix Pages RLS Policies for Platform Admin Bypass
-- This migration updates the pages RLS policies to allow platform admins to bypass restrictions

-- Step 1: Drop existing pages policies
DROP POLICY IF EXISTS "Users can view pages in their projects" ON pages;
DROP POLICY IF EXISTS "Users can create pages in their projects" ON pages;
DROP POLICY IF EXISTS "Users can update pages in their projects" ON pages;
DROP POLICY IF EXISTS "Only admins can delete pages" ON pages;

-- Step 2: Create updated RLS policies with platform admin bypass

-- SELECT: Users can view pages in projects they have access to OR platform admins can view all
CREATE POLICY "Users can view pages in their projects" ON pages
  FOR SELECT
  USING (
    -- Platform admins can see all pages
    EXISTS (
      SELECT 1 FROM account_users au
      WHERE au.user_id = auth.uid()
      AND au.account_id = '00000000-0000-0000-0000-000000000000'
      AND au.role IN ('admin', 'staff')
    )
    OR
    -- Regular users can see pages in their projects
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
    )
  );

-- INSERT: Platform admins can create pages anywhere, others need appropriate roles
CREATE POLICY "Users can create pages in their projects" ON pages
  FOR INSERT
  WITH CHECK (
    -- Platform admins can create pages in any project
    EXISTS (
      SELECT 1 FROM account_users au
      WHERE au.user_id = auth.uid()
      AND au.account_id = '00000000-0000-0000-0000-000000000000'
      AND au.role IN ('admin', 'staff')
    )
    OR
    -- Regular users with appropriate roles can create pages in their projects
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
      AND au.role IN ('admin', 'staff', 'account_owner')
    )
  );

-- UPDATE: Platform admins can update any page, others need appropriate roles
CREATE POLICY "Users can update pages in their projects" ON pages
  FOR UPDATE
  USING (
    -- Platform admins can update any page
    EXISTS (
      SELECT 1 FROM account_users au
      WHERE au.user_id = auth.uid()
      AND au.account_id = '00000000-0000-0000-0000-000000000000'
      AND au.role IN ('admin', 'staff')
    )
    OR
    -- Regular users with appropriate roles can update pages in their projects
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
      AND au.role IN ('admin', 'staff', 'account_owner')
    )
  )
  WITH CHECK (
    -- Platform admins can update any page
    EXISTS (
      SELECT 1 FROM account_users au
      WHERE au.user_id = auth.uid()
      AND au.account_id = '00000000-0000-0000-0000-000000000000'
      AND au.role IN ('admin', 'staff')
    )
    OR
    -- Regular users with appropriate roles can update pages in their projects
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
      AND au.role IN ('admin', 'staff', 'account_owner')
    )
  );

-- DELETE: Platform admins can delete any page, others need admin role in their projects
CREATE POLICY "Users can delete pages in their projects" ON pages
  FOR DELETE
  USING (
    -- Platform admins can delete any page
    EXISTS (
      SELECT 1 FROM account_users au
      WHERE au.user_id = auth.uid()
      AND au.account_id = '00000000-0000-0000-0000-000000000000'
      AND au.role IN ('admin', 'staff')
    )
    OR
    -- Account admins can delete pages in their projects
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN account_users au ON au.account_id = p.account_id
      WHERE au.user_id = auth.uid()
      AND au.role = 'admin'
    )
  );

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'Pages RLS policies updated with platform admin bypass';
END $$;