-- ============================================================================
-- Fix account_users RLS policies to match PROD (Version 2)
-- ============================================================================
-- This is a duplicate of 20250813_000002 with a new timestamp to avoid conflict

-- Drop the complex/broken policies if they exist
DROP POLICY IF EXISTS "Users can view their own account memberships" ON public.account_users;
DROP POLICY IF EXISTS "Users can view members of their accounts" ON public.account_users;  
DROP POLICY IF EXISTS "Users can view account members" ON public.account_users;
DROP POLICY IF EXISTS "Platform admins can view all account memberships" ON public.account_users;
DROP POLICY IF EXISTS "Account owners can manage account users" ON public.account_users;
DROP POLICY IF EXISTS "Authorized users can manage account users" ON public.account_users;

-- Drop existing simple policies if they exist (idempotent)
DROP POLICY IF EXISTS "simple_account_users_select" ON public.account_users;
DROP POLICY IF EXISTS "simple_account_users_update" ON public.account_users;
DROP POLICY IF EXISTS "admins_insert_account_users" ON public.account_users;
DROP POLICY IF EXISTS "admins_delete_account_users" ON public.account_users;

-- Create the simple policies from PROD
CREATE POLICY "simple_account_users_select" ON public.account_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "simple_account_users_update" ON public.account_users
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "admins_insert_account_users" ON public.account_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_users existing
      WHERE existing.account_id = account_users.account_id 
        AND existing.user_id = auth.uid() 
        AND existing.role = ANY(ARRAY['account_owner', 'admin'])
    )
  );

CREATE POLICY "admins_delete_account_users" ON public.account_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM account_users existing
      WHERE existing.account_id = account_users.account_id 
        AND existing.user_id = auth.uid() 
        AND existing.role = ANY(ARRAY['account_owner', 'admin'])
    )
  );