-- Force fix search_path for functions that still show warnings
-- Using ALTER FUNCTION approach which should work even if CREATE OR REPLACE didn't

-- Use ALTER FUNCTION to set search_path on all SECURITY DEFINER functions
-- This approach should work even if CREATE OR REPLACE didn't take effect

-- check_projects_policy_recursion
ALTER FUNCTION public.check_projects_policy_recursion(UUID, UUID) 
SET search_path = public, pg_temp;

-- check_theme_type
ALTER FUNCTION public.check_theme_type() 
SET search_path = public, pg_temp;

-- check_user_access
ALTER FUNCTION public.check_user_access(UUID, TEXT, UUID, TEXT) 
SET search_path = public, pg_temp;

-- generate_project_slug
ALTER FUNCTION public.generate_project_slug(TEXT) 
SET search_path = public, pg_temp;

-- get_deployment_url
ALTER FUNCTION public.get_deployment_url(UUID) 
SET search_path = public, pg_temp;

-- has_role
ALTER FUNCTION public.has_role(TEXT[]) 
SET search_path = public, pg_temp;

-- is_system_admin
ALTER FUNCTION public.is_system_admin() 
SET search_path = public, pg_temp;

-- is_valid_domain
ALTER FUNCTION public.is_valid_domain(TEXT) 
SET search_path = public, pg_temp;

-- page_has_unpublished_changes
ALTER FUNCTION public.page_has_unpublished_changes(UUID) 
SET search_path = public, pg_temp;

-- publish_page_draft
ALTER FUNCTION public.publish_page_draft(UUID) 
SET search_path = public, pg_temp;

-- update_deployment_queue_updated_at
ALTER FUNCTION public.update_deployment_queue_updated_at() 
SET search_path = public, pg_temp;

-- update_netlify_site_cache_updated_at
ALTER FUNCTION public.update_netlify_site_cache_updated_at() 
SET search_path = public, pg_temp;

-- update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public, pg_temp;

-- update_user_profiles_updated_at
ALTER FUNCTION public.update_user_profiles_updated_at() 
SET search_path = public, pg_temp;

-- cleanup_old_deployments
ALTER FUNCTION public.cleanup_old_deployments() 
SET search_path = public, pg_temp;

-- create_user_profile
ALTER FUNCTION public.create_user_profile() 
SET search_path = public, pg_temp;

-- debug_user_access
ALTER FUNCTION public.debug_user_access(UUID, UUID) 
SET search_path = public, pg_temp;

-- generate_slug_from_email
ALTER FUNCTION public.generate_slug_from_email(TEXT) 
SET search_path = public, pg_temp;

-- transition_project_status
ALTER FUNCTION public.transition_project_status(UUID, TEXT) 
SET search_path = public, pg_temp;

-- validate_deployment_url
ALTER FUNCTION public.validate_deployment_url() 
SET search_path = public, pg_temp;

-- handle_new_user (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
  END IF;
END $$;

-- mark_security_check_compliant (from our previous migration)
ALTER FUNCTION public.mark_security_check_compliant(TEXT) 
SET search_path = public, pg_temp;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Completed ALTER FUNCTION statements to set search_path on all SECURITY DEFINER functions';
END $$;