-- Fix security issues identified in project access objects
-- 1. Function has_project_access needs immutable search_path
-- 2. View project_access_view should not have SECURITY DEFINER

-- Fix the function to have an immutable search path
-- This prevents SQL injection attacks via search path manipulation
CREATE OR REPLACE FUNCTION has_project_access(
  p_project_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if user is admin/staff
  IF EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = p_user_id
      AND account_id = '00000000-0000-0000-0000-000000000000'
      AND role IN ('admin', 'staff')
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is account owner of the project's account
  IF EXISTS (
    SELECT 1 FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = p_project_id
      AND au.user_id = p_user_id
      AND au.role = 'account_owner'
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user has explicit project access
  IF EXISTS (
    SELECT 1 FROM project_users
    WHERE project_id = p_project_id
      AND user_id = p_user_id
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Recreate the view without SECURITY DEFINER (use default SECURITY INVOKER)
-- This ensures the view respects RLS policies on underlying tables
DROP VIEW IF EXISTS project_access_view;

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

-- Re-grant permissions on the view
GRANT SELECT ON project_access_view TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW project_access_view IS 'View for querying project access with user details. Respects RLS policies on underlying tables.';
COMMENT ON FUNCTION has_project_access IS 'Checks if a user has access to a project. Uses SECURITY DEFINER with immutable search path for security.';