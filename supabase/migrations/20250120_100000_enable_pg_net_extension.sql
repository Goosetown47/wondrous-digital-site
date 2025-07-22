-- Enable pg_net extension for HTTP requests from cron jobs
-- This is required for the deployment queue cron job to call Edge Functions

-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres;

-- Verify the extension is enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE NOTICE 'pg_net extension successfully enabled';
  ELSE
    RAISE WARNING 'Failed to enable pg_net extension';
  END IF;
END $$;