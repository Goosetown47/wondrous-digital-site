-- =====================================================
-- Migration: Fix project_sections RLS column reference
-- Purpose: Fix INSERT/UPDATE policies to use correct column reference
-- Issue: WITH CHECK/USING clauses must reference NEW row columns directly
-- Date: 2025-10-03
-- =====================================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert project sections" ON project_sections;

-- Recreate INSERT policy with CORRECT column reference
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
      WHERE projects.id = project_id  -- ✅ FIXED: Use column directly, not project_sections.project_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update project sections" ON project_sections;

-- Recreate UPDATE policy with CORRECT column reference
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
      WHERE projects.id = project_id  -- ✅ FIXED: Use column directly, not project_sections.project_id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Note: DELETE policy is fine as-is, USING clause can reference table columns

-- Add explanatory comment
COMMENT ON POLICY "Users can insert project sections" ON project_sections IS 'Platform admins and project owners/admins can create global sections. Column references use NEW row values.';
