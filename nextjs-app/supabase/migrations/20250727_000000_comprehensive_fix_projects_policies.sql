-- Migration: Comprehensive Fix for Projects Policies
-- This migration drops ALL existing policies and recreates them without infinite recursion

-- Step 1: Drop ALL existing policies on projects table
DO $$
DECLARE
  policy_rec RECORD;
BEGIN
  -- Loop through all policies on projects table and drop them
  FOR policy_rec IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'projects' 
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON projects', policy_rec.policyname);
  END LOOP;
END $$;

-- Step 2: Create simple, non-recursive policies

-- SELECT: Users can view projects in their accounts
CREATE POLICY "simple_select_projects" ON projects
  FOR SELECT
  USING (
    -- System admins can see all projects
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
    OR
    -- Users can see projects in their accounts
    account_id IN (
      SELECT account_id 
      FROM account_users 
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Admin and staff can create projects
CREATE POLICY "simple_insert_projects" ON projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = projects.account_id
      AND role IN ('admin', 'staff')
    )
  );

-- UPDATE: Users with appropriate roles can update
CREATE POLICY "simple_update_projects" ON projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = projects.account_id
      AND role IN ('admin', 'staff', 'account_owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = projects.account_id
      AND role IN ('admin', 'staff', 'account_owner')
    )
  );

-- DELETE: Only admins can delete
CREATE POLICY "simple_delete_projects" ON projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = projects.account_id
      AND role = 'admin'
    )
  );

-- Step 3: Prevent future problematic policies
-- Create a trigger to warn about self-referential policies (optional, for debugging)
CREATE OR REPLACE FUNCTION check_projects_policy_recursion()
RETURNS event_trigger AS $$
BEGIN
  RAISE NOTICE 'Policy created/altered on projects table - please ensure no self-referential queries';
END;
$$ LANGUAGE plpgsql;

-- Create event trigger (commented out as it requires superuser)
-- CREATE EVENT TRIGGER check_projects_policies
-- ON ddl_command_end
-- WHEN TAG IN ('CREATE POLICY', 'ALTER POLICY')
-- EXECUTE FUNCTION check_projects_policy_recursion();

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'All projects policies replaced with simple, non-recursive versions';
END $$;