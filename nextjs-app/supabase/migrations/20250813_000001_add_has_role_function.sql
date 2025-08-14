-- ============================================================================
-- Add has_role() function from PROD
-- ============================================================================
-- This function is used by many RLS policies to check user roles
-- It was missing from our migrations but exists in PROD

CREATE OR REPLACE FUNCTION public.has_role(allowed_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role from account_users
  SELECT role INTO user_role
  FROM account_users
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Check if the user's role is in the allowed roles
  RETURN user_role = ANY(allowed_roles);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(text[]) TO authenticated;

COMMENT ON FUNCTION public.has_role(text[]) IS 'Check if the current user has one of the specified roles';