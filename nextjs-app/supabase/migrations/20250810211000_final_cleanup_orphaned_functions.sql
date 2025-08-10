-- Final Cleanup: Remove Last 2 Orphaned Functions
-- These were recreated by migration 20250810205000 before our clean sweep
-- They are not in the baseline and not used in the application

-- Drop the remaining orphaned functions
DROP FUNCTION IF EXISTS public.get_deployment_url(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.transition_project_status(UUID, TEXT) CASCADE;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Removed final 2 orphaned functions: get_deployment_url and transition_project_status';
  RAISE NOTICE 'All function_search_path_mutable warnings should now be resolved';
END $$;