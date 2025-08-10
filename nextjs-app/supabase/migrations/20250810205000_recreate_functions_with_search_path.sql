-- Recreate functions that still show search_path warnings
-- This time we'll drop and recreate them to ensure search_path is properly set

-- 1. check_projects_policy_recursion
DROP FUNCTION IF EXISTS public.check_projects_policy_recursion(UUID, UUID);
CREATE FUNCTION public.check_projects_policy_recursion(p_account_id UUID, p_current_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Debugging: raise notice with the inputs
  RAISE NOTICE 'check_projects_policy_recursion called with account_id: %, user_id: %', p_account_id, p_current_user_id;
  
  -- Allow the check
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 2. check_user_access
DROP FUNCTION IF EXISTS public.check_user_access(UUID, TEXT, UUID, TEXT);
CREATE FUNCTION public.check_user_access(
  user_id UUID,
  resource_type TEXT,
  resource_id UUID,
  required_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  account_id UUID;
  has_access BOOLEAN;
BEGIN
  -- For projects, get the account_id
  IF resource_type = 'project' THEN
    SELECT p.account_id INTO account_id
    FROM projects p
    WHERE p.id = resource_id;
  ELSE
    -- For other resources, resource_id might be the account_id
    account_id := resource_id;
  END IF;

  -- Check if user has permission
  SELECT EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.user_id = check_user_access.user_id
      AND au.account_id = check_user_access.account_id
  ) INTO has_access;

  RETURN has_access;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 3. generate_project_slug
DROP FUNCTION IF EXISTS public.generate_project_slug(TEXT);
CREATE FUNCTION public.generate_project_slug(project_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from project name
  base_slug := LOWER(REGEXP_REPLACE(project_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- If empty, use default
  IF base_slug = '' THEN
    base_slug := 'project';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM projects WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 4. get_deployment_url
DROP FUNCTION IF EXISTS public.get_deployment_url(UUID);
CREATE FUNCTION public.get_deployment_url(p_project_id UUID)
RETURNS TEXT AS $$
DECLARE
  project_slug TEXT;
BEGIN
  SELECT slug INTO project_slug FROM projects WHERE id = p_project_id;
  
  IF project_slug IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN 'https://' || project_slug || '.sites.wondrousdigital.com';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 5. is_system_admin
DROP FUNCTION IF EXISTS public.is_system_admin();
CREATE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 6. debug_user_access
DROP FUNCTION IF EXISTS public.debug_user_access(UUID, UUID);
CREATE FUNCTION public.debug_user_access(check_user_id UUID, check_project_id UUID)
RETURNS TABLE(
  step TEXT,
  result BOOLEAN,
  details JSONB
) AS $$
BEGIN
  -- Check 1: User exists
  RETURN QUERY
  SELECT 
    'User exists'::TEXT,
    EXISTS(SELECT 1 FROM auth.users WHERE id = check_user_id),
    jsonb_build_object('user_id', check_user_id);

  -- Check 2: Project exists
  RETURN QUERY
  SELECT 
    'Project exists'::TEXT,
    EXISTS(SELECT 1 FROM projects WHERE id = check_project_id),
    jsonb_build_object('project_id', check_project_id);

  -- Check 3: Get project's account_id
  RETURN QUERY
  SELECT 
    'Project account'::TEXT,
    TRUE,
    jsonb_build_object('account_id', p.account_id)
  FROM projects p
  WHERE p.id = check_project_id;

  -- Check 4: User's account membership
  RETURN QUERY
  SELECT 
    'User account membership'::TEXT,
    EXISTS(
      SELECT 1 
      FROM account_users au
      JOIN projects p ON p.account_id = au.account_id
      WHERE au.user_id = check_user_id
        AND p.id = check_project_id
    ),
    jsonb_build_object(
      'memberships', 
      (SELECT jsonb_agg(jsonb_build_object(
        'account_id', au.account_id,
        'role', au.role,
        'project_account_id', p.account_id
      ))
      FROM account_users au
      LEFT JOIN projects p ON p.id = check_project_id
      WHERE au.user_id = check_user_id)
    );

  -- Check 5: RLS check
  RETURN QUERY
  SELECT 
    'RLS allows access'::TEXT,
    EXISTS(
      SELECT 1 
      FROM projects p
      WHERE p.id = check_project_id
        AND (
          EXISTS (
            SELECT 1 FROM account_users au
            WHERE au.user_id = check_user_id
              AND au.account_id = p.account_id
          )
          OR
          is_system_admin()
        )
    ),
    NULL::JSONB;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 7. transition_project_status
DROP FUNCTION IF EXISTS public.transition_project_status(UUID, TEXT);
CREATE FUNCTION public.transition_project_status(
  p_project_id UUID,
  p_new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_status TEXT;
  valid_transition BOOLEAN := FALSE;
BEGIN
  -- Get current status
  SELECT status INTO current_status
  FROM projects
  WHERE id = p_project_id;
  
  -- Check if transition is valid
  CASE current_status
    WHEN 'draft' THEN
      valid_transition := p_new_status IN ('active', 'archived');
    WHEN 'active' THEN
      valid_transition := p_new_status IN ('archived', 'maintenance');
    WHEN 'maintenance' THEN
      valid_transition := p_new_status IN ('active', 'archived');
    WHEN 'archived' THEN
      valid_transition := p_new_status IN ('active', 'draft');
    ELSE
      valid_transition := FALSE;
  END CASE;
  
  IF valid_transition THEN
    UPDATE projects
    SET status = p_new_status,
        updated_at = NOW()
    WHERE id = p_project_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 8. validate_deployment_url
DROP FUNCTION IF EXISTS public.validate_deployment_url();
CREATE FUNCTION public.validate_deployment_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure deployment_url follows the expected pattern
  IF NEW.deployment_url IS NOT NULL AND 
     NEW.deployment_url !~ '^https://[a-z0-9-]+\.sites\.wondrousdigital\.com$' THEN
    RAISE EXCEPTION 'Invalid deployment URL format';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Final verification
DO $$
BEGIN
  RAISE NOTICE 'All 8 functions have been recreated with explicit search_path settings';
END $$;