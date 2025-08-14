-- Fix security issues with account_users_with_details view
-- The view exposes auth.users data and doesn't enforce proper access control

-- Drop the insecure view
DROP VIEW IF EXISTS public.account_users_with_details;

-- Create a secure RPC function that enforces access control
CREATE OR REPLACE FUNCTION public.get_account_users_with_details(p_account_id UUID)
RETURNS TABLE (
  account_id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  invited_by UUID,
  email TEXT,
  email_confirmed_at TIMESTAMPTZ,
  display_name TEXT,
  avatar_url TEXT,
  profile_metadata JSONB
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user has access to this account
  -- Allow if user is a member of the account OR is an admin/staff
  IF NOT EXISTS (
    SELECT 1 FROM public.account_users
    WHERE account_users.account_id = p_account_id
      AND account_users.user_id = auth.uid()
  ) AND NOT EXISTS (
    -- Allow platform admins and staff to view any account
    SELECT 1 FROM public.account_users
    WHERE account_users.user_id = auth.uid()
      AND account_users.role IN ('admin', 'staff')
      AND account_users.account_id = '00000000-0000-0000-0000-000000000000'
  ) THEN
    -- Return empty result set instead of raising exception
    -- This prevents information leakage about account existence
    RETURN;
  END IF;
  
  -- Return the user data for the specified account
  RETURN QUERY
  SELECT 
    au.account_id,
    au.user_id,
    au.role,
    au.joined_at,
    au.invited_by,
    u.email,
    u.email_confirmed_at,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'display_name') as display_name,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    COALESCE(up.metadata, '{}'::jsonb) as profile_metadata
  FROM public.account_users au
  JOIN auth.users u ON au.user_id = u.id
  LEFT JOIN public.user_profiles up ON up.user_id = au.user_id
  WHERE au.account_id = p_account_id
  ORDER BY au.joined_at ASC;
END;
$$;

-- Grant execute permission only to authenticated users
GRANT EXECUTE ON FUNCTION public.get_account_users_with_details(UUID) TO authenticated;

-- Revoke direct access to prevent bypassing the function
REVOKE ALL ON FUNCTION public.get_account_users_with_details(UUID) FROM anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_account_users_with_details IS 
'Securely retrieves account users with their details. Only returns data if the requesting user is a member of the account or is a platform admin/staff.';