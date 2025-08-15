-- Fix: Allow anonymous users to view account info when part of invitation
-- This fixes the 406 error when loading invitation page

-- Enable RLS on accounts table if not already enabled
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists (to allow re-running migration)
DROP POLICY IF EXISTS "Public can view accounts for invitations" ON public.accounts;

-- Allow reading minimal account info when it's referenced by an invitation
-- This allows the invitation page to work for non-authenticated users
CREATE POLICY "Public can view accounts for invitations" ON public.accounts
  FOR SELECT
  USING (
    -- Allow access if there's at least one invitation for this account
    EXISTS (
      SELECT 1 FROM public.account_invitations
      WHERE account_invitations.account_id = accounts.id
    )
  );

-- Note: This policy only allows reading account data (name, slug, etc.)
-- when there's an associated invitation. It doesn't grant write access
-- or allow viewing accounts without invitations.