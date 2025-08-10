-- Drop functions with their ACTUAL signatures as found in the database
-- Previous attempts failed because we were using wrong parameter lists

-- Drop get_deployment_url with its actual signature
DROP FUNCTION IF EXISTS public.get_deployment_url(p_subdomain character varying, p_domain character varying, p_deployment_url text) CASCADE;

-- Drop transition_project_status with its actual signature (including custom type)
DROP FUNCTION IF EXISTS public.transition_project_status(p_project_id uuid, p_new_status project_status_type, p_user_id uuid, p_reason text) CASCADE;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Dropped functions with correct signatures';
  RAISE NOTICE 'get_deployment_url(varchar, varchar, text) and transition_project_status(uuid, project_status_type, uuid, text)';
  RAISE NOTICE 'All function_search_path_mutable warnings should now be resolved';
END $$;