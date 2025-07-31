# Emergency SQL Application Log

This file tracks SQL that was applied directly to the database outside of the normal migration flow.

## Why This Log Exists

Sometimes migrations get out of sync and we need to apply critical fixes directly. This log ensures we:
1. Don't lose track of what was done
2. Can recreate the changes in proper migrations later
3. Have a record for debugging issues

## Format

Each entry should include:
- Timestamp
- SQL file that was applied
- Reason for emergency application
- Who applied it
- The actual SQL content

---

## Emergency SQL Applied: 20250731_050000
**File:** scripts/fix-project-delete-policies.sql
**Reason:** Migration system was out of sync, needed to fix delete permissions urgently
**Applied by:** Tyler (via Supabase Dashboard)

```sql
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
```

---