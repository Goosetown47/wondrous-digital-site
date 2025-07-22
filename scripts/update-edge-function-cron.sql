-- Update Edge Function cron job with proper authentication
-- Run this in your Supabase SQL Editor

-- First, unschedule the existing job
SELECT cron.unschedule('process-deployments');

-- Get your project's service role key and URL from:
-- Settings > API > Service role key (secret)
-- Replace YOUR_SERVICE_ROLE_KEY below with your actual key

-- Create new cron job with authentication
SELECT cron.schedule(
  'process-deployments',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://bpdhbxvsguklkbusqtke.supabase.co/functions/v1/process-deployment-queue',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Verify the cron job is scheduled
SELECT * FROM cron.job WHERE jobname = 'process-deployments';

-- Note: The Edge Function needs these environment variables set in Supabase Dashboard:
-- NETLIFY_ACCESS_TOKEN = nfp_qtP2LJS4xQU7Dzwf137emA8wKFKSF2fg3bfe
-- NETLIFY_TEAM_ID = wondrous-digital