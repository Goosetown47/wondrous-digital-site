-- Migration: Fix Infinite Recursion in RLS Policies
-- This completely rebuilds the RLS policies to avoid circular dependencies

-- Step 1: Drop ALL existing policies on account_users and accounts
DO $$
DECLARE
  policy RECORD;
BEGIN
  -- Drop all policies on account_users
  FOR policy IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'account_users' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON account_users', policy.policyname);
  END LOOP;
  
  -- Drop all policies on accounts
  FOR policy IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'accounts' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON accounts', policy.policyname);
  END LOOP;
  
  RAISE NOTICE 'Dropped all existing policies on account_users and accounts';
END $$;

-- Step 2: Create SIMPLE, non-recursive policies

-- Simple policy for account_users - users can only see their own records
CREATE POLICY "simple_account_users_select" ON account_users
  FOR SELECT
  USING (user_id = auth.uid());

-- Simple policy for account_users - users can update their own records
CREATE POLICY "simple_account_users_update" ON account_users
  FOR UPDATE
  USING (user_id = auth.uid());

-- Simple policy for accounts - users can see accounts they belong to
-- This uses a direct query without circular reference
CREATE POLICY "simple_accounts_select" ON accounts
  FOR SELECT
  USING (
    id IN (
      SELECT account_id 
      FROM account_users 
      WHERE user_id = auth.uid()
    )
  );

-- Allow account owners and admins to update accounts
CREATE POLICY "simple_accounts_update" ON accounts
  FOR UPDATE
  USING (
    id IN (
      SELECT account_id 
      FROM account_users 
      WHERE user_id = auth.uid() 
      AND role IN ('account_owner', 'admin')
    )
  );

-- Step 3: Fix the debug function with qualified names
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
  v_user_id UUID;  -- Use v_ prefix to avoid ambiguity
BEGIN
  v_user_id := auth.uid();
  
  RETURN QUERY
  SELECT 
    v_user_id as current_user_id,
    (SELECT COUNT(*) FROM account_users au WHERE au.user_id = v_user_id)::INTEGER as account_users_count,
    (SELECT COUNT(*) FROM accounts a WHERE EXISTS (
      SELECT 1 FROM account_users au2 
      WHERE au2.account_id = a.id AND au2.user_id = v_user_id
    ))::INTEGER as accounts_count,
    (SELECT EXISTS (
      SELECT 1 FROM account_users au3
      WHERE au3.user_id = v_user_id AND au3.role = 'admin'
    )) as is_admin,
    (SELECT jsonb_agg(row_to_json(au4.*)) FROM account_users au4 WHERE au4.user_id = v_user_id) as account_users_data,
    (SELECT jsonb_agg(row_to_json(a2.*)) FROM accounts a2 WHERE EXISTS (
      SELECT 1 FROM account_users au5 
      WHERE au5.account_id = a2.id AND au5.user_id = v_user_id
    )) as accounts_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Add policies for other operations that admins need

-- Admins can insert new account_users (for inviting users)
CREATE POLICY "admins_insert_account_users" ON account_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_users existing
      WHERE existing.account_id = account_users.account_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('account_owner', 'admin')
    )
  );

-- Admins can delete account_users (for removing users)
CREATE POLICY "admins_delete_account_users" ON account_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM account_users existing
      WHERE existing.account_id = account_users.account_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('account_owner', 'admin')
    )
  );

-- Step 5: Verify the fix
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE tablename IN ('accounts', 'account_users')
  AND schemaname = 'public';
  
  RAISE NOTICE 'Created % total RLS policies', policy_count;
END $$;