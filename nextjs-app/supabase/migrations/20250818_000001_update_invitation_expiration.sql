-- Update invitation expiration from 7 days to 48 hours
-- This applies to new invitations only

-- Update the default value for the expires_at column
ALTER TABLE public.account_invitations 
  ALTER COLUMN expires_at 
  SET DEFAULT (NOW() + INTERVAL '48 hours');

-- Add a comment to document the change
COMMENT ON COLUMN public.account_invitations.expires_at IS 'Invitation expiration timestamp. Default is 48 hours from creation.';