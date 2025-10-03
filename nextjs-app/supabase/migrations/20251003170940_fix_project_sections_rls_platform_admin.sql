-- =====================================================
-- Migration: Fix project_sections RLS for platform admins
-- Purpose: Allow platform admins to insert/update/delete global sections
-- Date: 2025-10-03
-- =====================================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert project sections" ON project_sections;

-- Recreate INSERT policy with platform admin support
CREATE POLICY "Users can insert project sections"
  ON project_sections
  FOR INSERT
  WITH CHECK (
    -- Platform admin/staff can insert to any project
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = '00000000-0000-0000-0000-000000000000'
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('admin', 'staff')
    )
    OR
    -- Regular users must be owner/admin of the project's account
    EXISTS (
      SELECT 1 FROM projects
      INNER JOIN accounts ON accounts.id = projects.account_id
      INNER JOIN account_users ON account_users.account_id = accounts.id
      WHERE projects.id = project_sections.project_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update project sections" ON project_sections;

-- Recreate UPDATE policy with platform admin support
CREATE POLICY "Users can update project sections"
  ON project_sections
  FOR UPDATE
  USING (
    -- Platform admin/staff can update any project section
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = '00000000-0000-0000-0000-000000000000'
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('admin', 'staff')
    )
    OR
    -- Regular users must be owner/admin of the project's account
    EXISTS (
      SELECT 1 FROM projects
      INNER JOIN accounts ON accounts.id = projects.account_id
      INNER JOIN account_users ON account_users.account_id = accounts.id
      WHERE projects.id = project_sections.project_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Drop existing DELETE policy
DROP POLICY IF EXISTS "Users can delete project sections" ON project_sections;

-- Recreate DELETE policy with platform admin support
CREATE POLICY "Users can delete project sections"
  ON project_sections
  FOR DELETE
  USING (
    -- Platform admin/staff can delete any project section
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = '00000000-0000-0000-0000-000000000000'
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('admin', 'staff')
    )
    OR
    -- Regular users must be owner/admin of the project's account
    EXISTS (
      SELECT 1 FROM projects
      INNER JOIN accounts ON accounts.id = projects.account_id
      INNER JOIN account_users ON account_users.account_id = accounts.id
      WHERE projects.id = project_sections.project_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Add comment
COMMENT ON POLICY "Users can insert project sections" ON project_sections IS 'Platform admins and project owners/admins can create global sections';
