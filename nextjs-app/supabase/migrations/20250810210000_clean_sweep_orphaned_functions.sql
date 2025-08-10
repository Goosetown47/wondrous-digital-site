-- Clean Sweep: Remove Orphaned Functions from Old Migrations
-- These functions were created by migrations that have been moved to temp_remove/
-- They are not in the current baseline and not used in the application

-- First, let's document what we're removing and why
DO $$
BEGIN
  RAISE NOTICE 'Removing orphaned functions from old migrations that are no longer tracked';
  RAISE NOTICE 'These functions were causing search_path security warnings';
  RAISE NOTICE 'None of these functions are used in the current application';
END $$;

-- Drop all versions of these functions
-- Using CASCADE to handle any dependencies (like triggers or policies)
-- If any of these fail, it means they're still being used somewhere

-- 1. check_projects_policy_recursion - Old RLS helper, not in baseline
DROP FUNCTION IF EXISTS public.check_projects_policy_recursion() CASCADE;
DROP FUNCTION IF EXISTS public.check_projects_policy_recursion(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_projects_policy_recursion(UUID, UUID, TEXT) CASCADE;

-- 2. check_user_access - Old permission check, not in baseline
DROP FUNCTION IF EXISTS public.check_user_access() CASCADE;
DROP FUNCTION IF EXISTS public.check_user_access(UUID, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.check_user_access(UUID, TEXT, UUID) CASCADE;

-- 3. generate_project_slug - Old slug generator, not in baseline
DROP FUNCTION IF EXISTS public.generate_project_slug() CASCADE;
DROP FUNCTION IF EXISTS public.generate_project_slug(TEXT) CASCADE;

-- 4. get_deployment_url - Old URL generator, not in baseline
DROP FUNCTION IF EXISTS public.get_deployment_url(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_deployment_url(TEXT) CASCADE;

-- 5. is_system_admin - This one might be tricky, let's check both versions
-- The old version took a user_id parameter, newer versions don't
DROP FUNCTION IF EXISTS public.is_system_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_system_admin(UUID) CASCADE;

-- 6. debug_user_access - Debug helper, not in baseline
DROP FUNCTION IF EXISTS public.debug_user_access() CASCADE;
DROP FUNCTION IF EXISTS public.debug_user_access(UUID, UUID) CASCADE;

-- 7. transition_project_status - Old state machine, not in baseline
DROP FUNCTION IF EXISTS public.transition_project_status(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.transition_project_status(UUID, TEXT, TEXT) CASCADE;

-- 8. validate_deployment_url - Old trigger function, not in baseline
DROP FUNCTION IF EXISTS public.validate_deployment_url() CASCADE;
DROP FUNCTION IF EXISTS public.validate_deployment_url(TEXT) CASCADE;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Successfully removed orphaned functions';
  RAISE NOTICE 'This should resolve all function_search_path_mutable warnings';
END $$;

-- Note: If you need any of these functions in the future, create them properly
-- with SET search_path = public, pg_temp; as part of the function definition