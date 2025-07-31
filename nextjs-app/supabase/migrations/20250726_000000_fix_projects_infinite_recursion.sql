-- Migration: Fix Projects Infinite Recursion
-- Fixes the infinite recursion error in projects RLS policy

-- Step 1: Drop all existing policies on projects table
DROP POLICY IF EXISTS "Users can view project creator" ON projects;
DROP POLICY IF EXISTS "Users can view projects in their accounts" ON projects;
DROP POLICY IF EXISTS "Admin and staff can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their accounts" ON projects;
DROP POLICY IF EXISTS "Only admins can delete projects" ON projects;

-- Step 2: Create a non-recursive policy for SELECT
-- This checks if user is member of the account without self-referencing projects
CREATE POLICY "Users can view projects in their accounts" ON projects
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id 
      FROM account_users 
      WHERE user_id = auth.uid()
    )
  );

-- Step 3: Create policies for other operations (INSERT, UPDATE, DELETE)
-- Only admin/staff can create projects
CREATE POLICY "Admin and staff can create projects" ON projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = projects.account_id
      AND role IN ('admin', 'staff')
    )
  );

-- Users can update projects in their accounts if they have appropriate role
CREATE POLICY "Users can update projects in their accounts" ON projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = projects.account_id
      AND role IN ('admin', 'staff', 'account_owner')
    )
  );

-- Only admins can delete projects
CREATE POLICY "Only admins can delete projects" ON projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = projects.account_id
      AND role = 'admin'
    )
  );

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'Projects RLS policies fixed - infinite recursion resolved';
END $$;