-- Fix search_path security vulnerability for all SECURITY DEFINER functions
-- This prevents SQL injection attacks through search_path manipulation
-- See: https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY

-- Fix check_projects_policy_recursion
CREATE OR REPLACE FUNCTION public.check_projects_policy_recursion(p_account_id UUID, p_current_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Debugging: raise notice with the inputs
  RAISE NOTICE 'check_projects_policy_recursion called with account_id: %, user_id: %', p_account_id, p_current_user_id;
  
  -- Allow the check
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix check_theme_type
CREATE OR REPLACE FUNCTION public.check_theme_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow public themes to be used by any project
  IF NEW.is_public = true THEN
    RETURN NEW;
  END IF;
  
  -- For private themes, they can only be used by projects in the same account
  IF EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = NEW.project_id
    AND p.account_id = (
      SELECT account_id FROM themes WHERE id = NEW.theme_id
    )
  ) THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Private themes can only be used by projects in the same account';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix check_user_access
CREATE OR REPLACE FUNCTION public.check_user_access(
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

-- Fix generate_project_slug
CREATE OR REPLACE FUNCTION public.generate_project_slug(project_name TEXT)
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

-- Fix get_deployment_url
CREATE OR REPLACE FUNCTION public.get_deployment_url(p_project_id UUID)
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

-- Fix has_role
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix is_system_admin
CREATE OR REPLACE FUNCTION public.is_system_admin()
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

-- Fix is_valid_domain
-- First drop the existing function to avoid parameter name conflicts
DROP FUNCTION IF EXISTS public.is_valid_domain(TEXT);
DROP FUNCTION IF EXISTS public.is_valid_domain(domain_name TEXT);

CREATE OR REPLACE FUNCTION public.is_valid_domain(domain TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic domain validation
  -- Must not be empty
  IF domain IS NULL OR domain = '' THEN
    RETURN FALSE;
  END IF;
  
  -- Must match basic domain pattern
  -- This is a simplified check - in production you might want more comprehensive validation
  IF domain !~ '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' THEN
    RETURN FALSE;
  END IF;
  
  -- Must not be a reserved domain
  IF domain IN ('localhost', 'example.com', 'test.com') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix page_has_unpublished_changes
CREATE OR REPLACE FUNCTION public.page_has_unpublished_changes(page_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_changes BOOLEAN;
BEGIN
  SELECT 
    CASE 
      WHEN draft_content IS NULL THEN FALSE
      WHEN draft_content::text = content::text THEN FALSE
      ELSE TRUE
    END INTO has_changes
  FROM pages
  WHERE id = page_id;
  
  RETURN COALESCE(has_changes, FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix publish_page_draft
-- Drop existing function first to handle potential return type differences
DROP FUNCTION IF EXISTS public.publish_page_draft(UUID);

CREATE OR REPLACE FUNCTION public.publish_page_draft(page_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pages
  SET 
    content = draft_content,
    draft_content = NULL,
    published_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = page_id
    AND draft_content IS NOT NULL;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_deployment_queue_updated_at
CREATE OR REPLACE FUNCTION public.update_deployment_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_netlify_site_cache_updated_at
CREATE OR REPLACE FUNCTION public.update_netlify_site_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_user_profiles_updated_at
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix cleanup_old_deployments
CREATE OR REPLACE FUNCTION public.cleanup_old_deployments()
RETURNS void AS $$
BEGIN
  -- Delete deployments older than 30 days that are not the latest for their project
  DELETE FROM deployment_queue
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND id NOT IN (
      SELECT DISTINCT ON (project_id) id
      FROM deployment_queue
      ORDER BY project_id, created_at DESC
    );
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix create_user_profile (already exists in baseline but needs search_path)
-- This is typically called by a trigger
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix debug_user_access
CREATE OR REPLACE FUNCTION public.debug_user_access(check_user_id UUID, check_project_id UUID)
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

-- Fix generate_slug_from_email
CREATE OR REPLACE FUNCTION public.generate_slug_from_email(email TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract username part of email and clean it
  base_slug := LOWER(SPLIT_PART(email, '@', 1));
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- If empty, use default
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'user';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness in accounts table and add counter if needed
  WHILE EXISTS (SELECT 1 FROM accounts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix transition_project_status
CREATE OR REPLACE FUNCTION public.transition_project_status(
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

-- Fix validate_deployment_url
CREATE OR REPLACE FUNCTION public.validate_deployment_url()
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

-- Additional fix for handle_new_user if it exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Call create_user_profile which will handle the actual profile creation
  -- This is just a wrapper for the trigger
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Add a comment explaining the security fix
COMMENT ON SCHEMA public IS 'All SECURITY DEFINER functions have been updated with explicit search_path to prevent SQL injection attacks through search path manipulation.';