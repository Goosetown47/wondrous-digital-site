# Fix Edge Function Cron Job

The Edge Function is deployed and working, but the cron job needs proper authentication to call it.

## Steps to Fix:

1. **Get your Service Role Key**:
   - Go to Supabase Dashboard > Settings > API
   - Find "Service role key (secret)" 
   - Copy the key (starts with `eyJ...`)

2. **Update the Cron Job**:
   - Go to SQL Editor in Supabase
   - Run this SQL (replace YOUR_SERVICE_ROLE_KEY with your actual key):

```sql
-- First, unschedule the existing job
SELECT cron.unschedule('process-deployments');

-- Create new cron job with authentication
SELECT cron.schedule(
  'process-deployments',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://bpdhbxvsguklkbusqtke.supabase.co/functions/v1/process-deployment-queue',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY_HERE',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

3. **Verify Environment Variables**:
   - Go to Edge Functions > process-deployment-queue
   - Check that these are set:
     - `NETLIFY_ACCESS_TOKEN` = `nfp_qtP2LJS4xQU7Dzwf137emA8wKFKSF2fg3bfe`
     - `NETLIFY_TEAM_ID` = `wondrous-digital`

4. **Test the Function**:
   - Click "Run Function" to manually trigger it
   - Check the logs for any errors

## Troubleshooting:

If deployments are still stuck in queue:
1. Check Edge Function logs for errors
2. Verify Netlify token is still valid
3. Check deployment_queue table for error messages
4. Manually run the function to see immediate results

The cron job will process up to 3 deployments every 2 minutes once properly configured.