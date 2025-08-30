-- Fix billing history access for platform admins
-- Platform admins (users with admin role in account 00000000-0000-0000-0000-000000000000)
-- should be able to view all billing history for payment verification

-- Drop existing policy
DROP POLICY IF EXISTS "Account owners can view their billing history" ON public.account_billing_history;

-- Create new policy that includes platform admins
CREATE POLICY "Account owners and platform admins can view billing history"
  ON public.account_billing_history
  FOR SELECT
  TO authenticated
  USING (
    -- Account owners can see their own billing history
    account_id IN (
      SELECT account_id FROM public.account_users
      WHERE user_id = auth.uid()
      AND role = 'account_owner'
    )
    OR
    -- Platform admins can see all billing history
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'
      AND role = 'admin'
    )
  );

-- Add comment for documentation
COMMENT ON POLICY "Account owners and platform admins can view billing history" ON public.account_billing_history IS 
  'Allows account owners to view their own billing history and platform admins to view all billing history for support purposes';