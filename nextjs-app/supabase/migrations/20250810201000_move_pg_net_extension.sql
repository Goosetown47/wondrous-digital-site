-- Move pg_net extension to dedicated schema for security
-- This prevents potential security issues with extensions in the public schema

-- Create a dedicated schema for pg_net if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to postgres role
GRANT USAGE ON SCHEMA extensions TO postgres;

-- Check if pg_net is installed in public schema and move it
DO $$
BEGIN
  -- Check if pg_net exists in public schema
  IF EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'pg_net' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Drop the extension from public schema
    DROP EXTENSION IF EXISTS pg_net CASCADE;
    
    -- Recreate in extensions schema
    CREATE EXTENSION pg_net WITH SCHEMA extensions;
    
    RAISE NOTICE 'pg_net extension moved from public to extensions schema';
  ELSIF NOT EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'pg_net'
  ) THEN
    -- If pg_net doesn't exist at all, create it in extensions schema
    CREATE EXTENSION pg_net WITH SCHEMA extensions;
    
    RAISE NOTICE 'pg_net extension created in extensions schema';
  ELSE
    RAISE NOTICE 'pg_net extension already exists in non-public schema';
  END IF;
END $$;

-- Update any functions or code that might reference pg_net to use the new schema
-- For example, if you have HTTP request functions, they would now use:
-- extensions.http_post() instead of pg_net.http_post()

-- Grant necessary permissions for authenticated users to use pg_net functions if needed
-- This is optional and depends on your security requirements
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO authenticated;

-- Add a comment explaining the security improvement
COMMENT ON SCHEMA extensions IS 'Dedicated schema for PostgreSQL extensions to improve security isolation';