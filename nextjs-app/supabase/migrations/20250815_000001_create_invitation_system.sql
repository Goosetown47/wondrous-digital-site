-- Create account_invitations table
CREATE TABLE IF NOT EXISTS public.account_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'account_owner')),
  token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  declined_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_account_invitations_account_id ON public.account_invitations(account_id);
CREATE INDEX idx_account_invitations_email ON public.account_invitations(email);
CREATE INDEX idx_account_invitations_token ON public.account_invitations(token);
CREATE INDEX idx_account_invitations_expires_at ON public.account_invitations(expires_at);

-- Create view for account_users with details
CREATE OR REPLACE VIEW public.account_users_with_details AS
SELECT 
  au.account_id,
  au.user_id,
  au.role,
  au.joined_at,
  au.invited_by,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data,
  u.raw_user_meta_data->>'full_name' as display_name,
  NULL::text as avatar_url,
  '{}'::jsonb as profile_metadata
FROM public.account_users au
JOIN auth.users u ON au.user_id = u.id;

-- Grant permissions on the view
GRANT SELECT ON public.account_users_with_details TO authenticated;

-- RLS Policies for account_invitations
ALTER TABLE public.account_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations for accounts they belong to
CREATE POLICY "Users can view invitations for their accounts" ON public.account_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE account_users.account_id = account_invitations.account_id
        AND account_users.user_id = auth.uid()
    )
  );

-- Policy: Account owners can create invitations
CREATE POLICY "Account owners can create invitations" ON public.account_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE account_users.account_id = account_invitations.account_id
        AND account_users.user_id = auth.uid()
        AND account_users.role = 'account_owner'
    )
  );

-- Policy: Account owners can update invitations (cancel, resend)
CREATE POLICY "Account owners can update invitations" ON public.account_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE account_users.account_id = account_invitations.account_id
        AND account_users.user_id = auth.uid()
        AND account_users.role = 'account_owner'
    )
  );

-- Policy: Anyone can view their own invitation by token (for acceptance page)
CREATE POLICY "Users can view invitation by token" ON public.account_invitations
  FOR SELECT
  USING (true); -- Token is unique and acts as authentication

-- Create function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  v_invitation RECORD;
  v_user_id UUID;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- Find the invitation
  SELECT * INTO v_invitation
  FROM public.account_invitations
  WHERE token = invitation_token
    AND cancelled_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation not found');
  END IF;

  -- Check if already accepted
  IF v_invitation.accepted_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation already accepted');
  END IF;

  -- Check if expired
  IF v_invitation.expires_at < NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation has expired');
  END IF;

  -- Check if user email matches invitation email (case-insensitive)
  IF LOWER((SELECT email FROM auth.users WHERE id = v_user_id)) != LOWER(v_invitation.email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email does not match invitation');
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.account_users
    WHERE account_id = v_invitation.account_id
      AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already a member of this account');
  END IF;

  -- Add user to account
  INSERT INTO public.account_users (account_id, user_id, role, invited_by)
  VALUES (v_invitation.account_id, v_user_id, v_invitation.role, v_invitation.invited_by);

  -- Mark invitation as accepted
  UPDATE public.account_invitations
  SET accepted_at = NOW(),
      accepted_by = v_user_id,
      updated_at = NOW()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'success', true, 
    'account_id', v_invitation.account_id,
    'role', v_invitation.role
  );
END;
$$;

-- Create function to decline invitation
CREATE OR REPLACE FUNCTION public.decline_invitation(invitation_token UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  -- Find the invitation
  SELECT * INTO v_invitation
  FROM public.account_invitations
  WHERE token = invitation_token
    AND cancelled_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation not found');
  END IF;

  -- Check if already processed
  IF v_invitation.accepted_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation already accepted');
  END IF;

  IF v_invitation.declined_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation already declined');
  END IF;

  -- Mark invitation as declined
  UPDATE public.account_invitations
  SET declined_at = NOW(),
      updated_at = NOW()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.accept_invitation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_invitation(UUID) TO authenticated;