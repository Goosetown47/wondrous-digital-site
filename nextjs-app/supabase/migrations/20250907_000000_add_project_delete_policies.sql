-- Add DELETE policies for projects table
-- This migration adds the ability for account owners to delete their own projects
-- and ensures platform admins can delete any project

-- Drop any existing delete policies to start fresh
DROP POLICY IF EXISTS "account_owners_delete_own_projects" ON projects;
DROP POLICY IF EXISTS "platform_admins_delete_any_project" ON projects;

-- Policy 1: Allow account owners to delete their own projects
CREATE POLICY "account_owners_delete_own_projects" ON projects
FOR DELETE
TO authenticated
USING (
  -- User must be an account owner of the project's account
  EXISTS (
    SELECT 1 FROM account_users
    WHERE account_users.user_id = auth.uid()
    AND account_users.account_id = projects.account_id
    AND account_users.role = 'account_owner'
  )
);

-- Policy 2: Allow platform admins to delete any project
CREATE POLICY "platform_admins_delete_any_project" ON projects
FOR DELETE
TO authenticated
USING (
  -- User must be an admin in the platform account
  EXISTS (
    SELECT 1 FROM account_users
    WHERE account_users.user_id = auth.uid()
    AND account_users.account_id = '00000000-0000-0000-0000-000000000000'
    AND account_users.role = 'admin'
  )
);

-- Also add audit_logs INSERT policy to fix the 403 error when logging deletions
DROP POLICY IF EXISTS "users_insert_own_audit_logs" ON audit_logs;

CREATE POLICY "users_insert_own_audit_logs" ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND
  -- User must have access to the account they're logging for
  (
    -- Platform admins can log actions for any account
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.user_id = auth.uid()
      AND account_users.account_id = '00000000-0000-0000-0000-000000000000'
      AND account_users.role = 'admin'
    )
    OR
    -- Account members can log actions for their own account
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.user_id = auth.uid()
      AND account_users.account_id = audit_logs.account_id
    )
  )
);