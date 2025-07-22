-- Add cron job to automatically process deployment queue
-- This migration creates a scheduled job that runs every 2 minutes to process queued deployments

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant necessary permissions for http requests
GRANT USAGE ON SCHEMA net TO postgres;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres;

-- Unschedule any existing job with the same name (ignore errors if it doesn't exist)
DO $$
BEGIN
  PERFORM cron.unschedule('process-deployment-queue');
EXCEPTION
  WHEN OTHERS THEN
    -- Job doesn't exist, that's fine
    NULL;
END;
$$;

-- Create cron job to process deployment queue every 2 minutes
-- IMPORTANT: Replace YOUR_SERVICE_ROLE_KEY with the actual service role key before applying this migration
-- The service role key can be found in Supabase Dashboard > Settings > API > Service role key (secret)
SELECT cron.schedule(
  'process-deployment-queue',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://bpdhbxvsguklkbusqtke.supabase.co/functions/v1/process-deployment-queue',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000 -- 1 minute timeout
  );
  $$
);

-- Add comment to document the cron job
COMMENT ON SCHEMA cron IS 'Scheduled jobs including deployment queue processing';

-- Verify the cron job was created (this is just for logging purposes)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-deployment-queue') THEN
    RAISE NOTICE 'Deployment queue cron job successfully scheduled to run every 2 minutes';
  ELSE
    RAISE WARNING 'Failed to create deployment queue cron job';
  END IF;
END $$;