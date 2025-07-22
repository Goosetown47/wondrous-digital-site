# Deployment Queue Setup Guide

## Overview
The deployment queue system processes website deployments asynchronously. For it to work automatically, a cron job needs to be set up to trigger the Edge Function periodically.

## Option 1: Apply Migration (Recommended)

1. **Get your Service Role Key**:
   - Go to Supabase Dashboard > Settings > API
   - Copy the "Service role key (secret)"

2. **Update the migration file**:
   - Open `supabase/migrations/20250719_012939_add_deployment_queue_cron_job.sql`
   - Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key

3. **Apply the migration**:
   ```bash
   export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612
   npx supabase db push --password 'aTR9dv8Q7J2emyMD'
   ```

## Option 2: Manual Setup via Supabase Dashboard

1. **Navigate to Cron Jobs**:
   - Go to Supabase Dashboard > Database > Cron Jobs

2. **Create New Cron Job**:
   - Name: `process-deployment-queue`
   - Schedule: `*/2 * * * *` (every 2 minutes)
   - Command:
   ```sql
   SELECT net.http_post(
     url := 'https://bpdhbxvsguklkbusqtke.supabase.co/functions/v1/process-deployment-queue',
     headers := jsonb_build_object(
       'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
       'Content-Type', 'application/json'
     ),
     body := '{}'::jsonb,
     timeout_milliseconds := 60000
   );
   ```
   - Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key

## Option 3: Manual SQL Execution

Run the contents of `scripts/update-edge-function-cron.sql` in the SQL Editor after updating the service role key.

## Verifying the Setup

1. **Check if cron job exists**:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'process-deployment-queue';
   ```

2. **Monitor deployment queue**:
   - Go to `/admin/deployment-queue` in the application
   - Create a test deployment
   - It should automatically move from "queued" to "processing" to "completed" within 2-4 minutes

## Troubleshooting

### Deployments stuck in "queued" status
- Verify the cron job is running: Check cron.job table
- Check Edge Function logs in Supabase Dashboard
- Manually trigger processing via Admin UI "Process Queue" button

### Authentication errors
- Ensure you're using the service role key, not the anon key
- Verify the Edge Function has proper environment variables set

### Edge Function not found
- Ensure the Edge Function is deployed: `supabase functions deploy process-deployment-queue`
- Check the function URL matches your project URL

## Security Notes
- Never commit the service role key to version control
- The service role key has full database access - handle with care
- Consider rotating keys periodically