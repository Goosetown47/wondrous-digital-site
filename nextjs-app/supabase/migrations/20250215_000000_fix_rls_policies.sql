-- Migration: Fix RLS Policies for Account Access
-- This ensures users can properly read their accounts and account_users records

-- Step 1: Drop existing policies that might be blocking
DROP POLICY IF EXISTS "Users can read own account_users" ON account_users;
DROP POLICY IF EXISTS "Users can view account members" ON account_users;
DROP POLICY IF EXISTS "Users can read their accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view their accounts" ON accounts;

-- Step 2: Create simple, permissive policies for account_users
CREATE POLICY "Users can read own account_users records" ON account_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Step 3: Create policy for accounts - users can see accounts they belong to
CREATE POLICY "Users can view their accounts" ON accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = accounts.id
      AND account_users.user_id = auth.uid()
    )
  );

-- Step 4: Ensure RLS is enabled on both tables
ALTER TABLE account_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Step 5: Create a debug function to check what the current user can see
CREATE OR REPLACE FUNCTION debug_user_access()
RETURNS TABLE (
  current_user_id UUID,
  account_users_count INTEGER,
  accounts_count INTEGER,
  is_admin BOOLEAN,
  account_users_data JSONB,
  accounts_data JSONB
) AS $$
DECLARE
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  RETURN QUERY
  SELECT 
    user_id as current_user_id,
    (SELECT COUNT(*) FROM account_users WHERE account_users.user_id = user_id)::INTEGER as account_users_count,
    (SELECT COUNT(*) FROM accounts a WHERE EXISTS (
      SELECT 1 FROM account_users au 
      WHERE au.account_id = a.id AND au.user_id = user_id
    ))::INTEGER as accounts_count,
    (SELECT EXISTS (
      SELECT 1 FROM account_users 
      WHERE account_users.user_id = user_id AND role = 'admin'
    )) as is_admin,
    (SELECT jsonb_agg(row_to_json(au.*)) FROM account_users au WHERE au.user_id = user_id) as account_users_data,
    (SELECT jsonb_agg(row_to_json(a.*)) FROM accounts a WHERE EXISTS (
      SELECT 1 FROM account_users au 
      WHERE au.account_id = a.id AND au.user_id = user_id
    )) as accounts_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_user_access() TO authenticated;

-- Step 6: Verify the setup
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE tablename IN ('accounts', 'account_users');
  
  RAISE NOTICE 'Created % RLS policies for accounts and account_users tables', policy_count;
END $$;