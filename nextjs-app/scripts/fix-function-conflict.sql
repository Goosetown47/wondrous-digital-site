-- Fix the get_recent_audit_logs function conflict
-- The function exists but with a different return type

-- First, drop the existing function
DROP FUNCTION IF EXISTS public.get_recent_audit_logs(UUID, INTEGER);

-- Then it will be recreated by the migration with the correct signature