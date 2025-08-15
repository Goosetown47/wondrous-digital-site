-- Fix the view using the exact syntax Supabase recommends
-- This should finally resolve the SECURITY DEFINER issue

-- Drop the existing view
DROP VIEW IF EXISTS project_access_view CASCADE;

-- Recreate with explicit security_invoker = on using the exact syntax from Supabase
CREATE VIEW public.project_access_view WITH (security_invoker = on) AS
SELECT 
  pu.id,
  pu.project_id,
  pu.user_id,
  pu.account_id,
  pu.granted_by,
  pu.granted_at,
  pu.access_level,
  p.name AS project_name,
  up.display_name AS user_display_name,
  up.avatar_url AS user_avatar_url,
  gb_up.display_name AS granted_by_display_name
FROM project_users pu
JOIN projects p ON p.id = pu.project_id
LEFT JOIN user_profiles up ON up.user_id = pu.user_id
LEFT JOIN user_profiles gb_up ON gb_up.user_id = pu.granted_by;

-- Grant permissions
GRANT SELECT ON project_access_view TO authenticated;
GRANT SELECT ON project_access_view TO anon;

-- Fix the function to have an immutable search path (resolves the WARNING)
DROP FUNCTION IF EXISTS get_project_access_for_account(uuid);

CREATE OR REPLACE FUNCTION get_project_access_for_account(
  p_account_id uuid
)
RETURNS TABLE (
  id uuid,
  project_id uuid,
  user_id uuid,
  account_id uuid,
  granted_by uuid,
  granted_at timestamptz,
  access_level text,
  project_name text,
  user_display_name text,
  user_avatar_url text,
  granted_by_display_name text
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if user has permission to view this account's project access
  -- Must be account owner, admin, or staff
  IF NOT EXISTS (
    SELECT 1 FROM account_users
    WHERE account_id = p_account_id
      AND user_id = auth.uid()
      AND role IN ('account_owner', 'admin', 'staff')
  ) AND NOT EXISTS (
    SELECT 1 FROM account_users
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
      AND user_id = auth.uid()
      AND role IN ('admin', 'staff')
  ) THEN
    -- User doesn't have permission, return empty result
    RETURN;
  END IF;

  -- Return project access data for the account
  RETURN QUERY
  SELECT 
    pu.id,
    pu.project_id,
    pu.user_id,
    pu.account_id,
    pu.granted_by,
    pu.granted_at,
    pu.access_level,
    p.name as project_name,
    up.display_name as user_display_name,
    up.avatar_url as user_avatar_url,
    gb_up.display_name as granted_by_display_name
  FROM project_users pu
  JOIN projects p ON p.id = pu.project_id
  LEFT JOIN user_profiles up ON up.user_id = pu.user_id
  LEFT JOIN user_profiles gb_up ON gb_up.user_id = pu.granted_by
  WHERE pu.account_id = p_account_id;
END;
$$;

-- Grant permissions on the function
GRANT EXECUTE ON FUNCTION get_project_access_for_account TO authenticated;

-- Add documentation comments
COMMENT ON VIEW project_access_view IS 'View with explicit security_invoker = on to respect calling user permissions and RLS policies';
COMMENT ON FUNCTION get_project_access_for_account IS 'Secure function with immutable search path for querying project access data';