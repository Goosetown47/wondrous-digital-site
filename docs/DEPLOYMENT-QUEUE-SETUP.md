# Deployment Queue Setup Guide

This guide explains how to set up and deploy the deployment queue processing system.

## Overview

The deployment queue system consists of:
1. Database tables (`deployment_queue` and `deployment_logs`)
2. Frontend services (DeploymentQueueService, NetlifyRateLimiter)
3. Supabase Edge Function (process-deployment-queue)

## Prerequisites

- Supabase project with applied migrations
- Netlify account with API access
- Supabase CLI installed

## Step 1: Apply Database Migrations

Ensure the deployment queue migration has been applied:

```bash
export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612
npx supabase db push --password 'aTR9dv8Q7J2emyMD'
```

## Step 2: Deploy the Edge Function

1. Install Supabase CLI if not already installed:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref bpdhbxvsguklkbusqtke
```

3. Set environment variables:
```bash
supabase secrets set NETLIFY_ACCESS_TOKEN=nfp_qtP2LJS4xQU7Dzwf137emA8wKFKSF2fg3bfe
supabase secrets set NETLIFY_TEAM_ID=wondrous-digital
```

4. Deploy the function:
```bash
supabase functions deploy process-deployment-queue
```

## Step 3: Set Up Scheduled Execution

In your Supabase Dashboard:

1. Navigate to Edge Functions
2. Select `process-deployment-queue`
3. Click "Schedule"
4. Add a cron expression:
   - `*/2 * * * *` - Every 2 minutes (recommended for high volume)
   - `*/5 * * * *` - Every 5 minutes (for normal volume)
   - `*/10 * * * *` - Every 10 minutes (for low volume)

## Step 4: Monitor the System

### Check Function Logs
```bash
supabase functions logs process-deployment-queue
```

### View Queue Status
Query the database to see queue status:
```sql
-- Current queue status
SELECT status, COUNT(*) 
FROM deployment_queue 
GROUP BY status;

-- Recent deployments
SELECT * FROM deployment_queue 
ORDER BY created_at DESC 
LIMIT 10;

-- Recent logs
SELECT * FROM deployment_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

## Step 5: Test the System

1. Queue a deployment through the UI (Deploy Project button)
2. Wait for the scheduled execution or manually invoke:
```bash
supabase functions invoke process-deployment-queue
```

3. Check the response and logs

## Troubleshooting

### Function Not Running
- Check environment variables are set correctly
- Verify function is deployed: `supabase functions list`
- Check function logs for errors

### Deployments Stuck in Queue
- Check Netlify API token is valid
- Verify rate limits aren't being hit
- Check deployment_logs for error messages

### Rate Limit Issues
- Reduce concurrent deployments in Edge Function
- Increase time between scheduled runs
- Check NetlifyRateLimiter configuration

## Production Considerations

1. **Monitoring**: Set up alerts for failed deployments
2. **Scaling**: Adjust concurrent deployment limit based on volume
3. **Backup**: Regular database backups including deployment history
4. **Cleanup**: The system auto-cleans deployments older than 30 days

## API Limits

- Netlify: 500 API calls per minute
- Concurrent deployments: 3 (configurable)
- Retry attempts: 3 per deployment
- Queue check interval: 2-10 minutes (based on cron)

## Security

- Edge Function uses service role key (admin access)
- Netlify tokens are stored as Supabase secrets
- RLS policies protect deployment data
- CORS headers allow browser-based monitoring