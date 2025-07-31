-- Fix accounts table RLS policies to allow platform admins access to all accounts
-- Platform admins should see ALL accounts for management purposes

-- Drop existing accounts SELECT policy that only allows users to see their own accounts
DROP POLICY IF EXISTS "Users can view their accounts" ON accounts;

-- Create new comprehensive SELECT policy that includes platform admin access
CREATE POLICY "users_can_view_accounts" ON accounts
  FOR SELECT
  USING (
    -- Platform admins can see all accounts
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
    )
    OR
    -- Platform staff can see all accounts (for future staff roles)
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'staff'
    )
    OR
    -- Regular users can see accounts they are members of
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = accounts.id
      AND account_users.user_id = auth.uid()
    )
  );

-- Also update the UPDATE policy to allow platform admins to modify accounts
DROP POLICY IF EXISTS "Account owners can update their accounts" ON accounts;

CREATE POLICY "users_can_update_accounts" ON accounts
  FOR UPDATE
  USING (
    -- Platform admins can update any account
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
    )
    OR
    -- Platform staff can update accounts (for future staff roles)
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'staff'
    )
    OR
    -- Account owners/admins can update their own accounts
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = accounts.id
      AND account_users.user_id = auth.uid()
      AND account_users.role IN ('owner', 'admin')
    )
  );

-- Add INSERT and DELETE policies for platform admins (account management)
CREATE POLICY "platform_admins_can_create_accounts" ON accounts
  FOR INSERT
  WITH CHECK (
    -- Only platform admins can create new accounts
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "platform_admins_can_delete_accounts" ON accounts
  FOR DELETE
  USING (
    -- Only platform admins can delete accounts
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
    )
    -- Prevent deletion of platform account itself
    AND accounts.id != '00000000-0000-0000-0000-000000000000'::uuid
  );

-- Add comment explaining the platform account approach
COMMENT ON POLICY "users_can_view_accounts" ON accounts IS 
  'Platform admins (role=admin in platform account 00000000-0000-0000-0000-000000000000) can see all accounts. Regular users see accounts they belong to.';