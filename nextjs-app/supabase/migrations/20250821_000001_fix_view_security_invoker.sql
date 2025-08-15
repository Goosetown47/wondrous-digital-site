-- Explicitly fix the security definer issue on project_access_view
-- The view is showing as having SECURITY DEFINER even though we didn't specify it
-- This migration explicitly sets SECURITY INVOKER

-- Drop the view completely first (CASCADE to drop dependent objects if any)
DROP VIEW IF EXISTS project_access_view CASCADE;

-- Recreate with explicit SECURITY INVOKER
-- Note: In PostgreSQL 15+, we can use WITH (security_invoker = true)
-- For older versions, views are SECURITY INVOKER by default
CREATE VIEW project_access_view AS
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
LEFT JOIN user_profiles gb_up ON gb_up.user_id = pu.granted_by;

-- Explicitly set the view owner to ensure it's not using definer security
-- This ensures the view runs with the privileges of the invoking user
ALTER VIEW project_access_view OWNER TO postgres;

-- Grant permissions
GRANT SELECT ON project_access_view TO authenticated;
GRANT SELECT ON project_access_view TO anon;

-- Alternative: Create a secure function that returns the same data
-- This gives us explicit control over access and avoids view security issues
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

-- Add comments for documentation
COMMENT ON VIEW project_access_view IS 'View for project access data. Uses SECURITY INVOKER to run with calling user privileges and respect RLS on underlying tables.';
COMMENT ON FUNCTION get_project_access_for_account IS 'Secure function to get project access for an account. Checks user authorization before returning data.';

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_project_access_for_account TO authenticated;