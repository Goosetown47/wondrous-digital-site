-- Fix project deletion by adding missing RLS policies

-- Drop any existing delete policies
DROP POLICY IF EXISTS "account_owners_delete_own_projects" ON projects;
DROP POLICY IF EXISTS "platform_admins_delete_any_project" ON projects;

-- Allow account owners to delete their own projects
CREATE POLICY "account_owners_delete_own_projects" ON projects
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE account_users.user_id = auth.uid()
    AND account_users.account_id = projects.account_id
    AND account_users.role = 'account_owner'
  )
);

-- Allow platform admins to delete any project
CREATE POLICY "platform_admins_delete_any_project" ON projects
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE account_users.user_id = auth.uid()
    AND account_users.account_id = '00000000-0000-0000-0000-000000000000'
    AND account_users.role = 'admin'
  )
);

-- Fix audit_logs permissions
DROP POLICY IF EXISTS "users_insert_own_audit_logs" ON audit_logs;

CREATE POLICY "users_insert_own_audit_logs" ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND
  (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.user_id = auth.uid()
      AND account_users.account_id = '00000000-0000-0000-0000-000000000000'
      AND account_users.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.user_id = auth.uid()
      AND account_users.account_id = audit_logs.account_id
    )
  )
);