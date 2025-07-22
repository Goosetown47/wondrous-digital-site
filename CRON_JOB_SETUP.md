# Deployment Queue Cron Job Setup

## Manual Setup via Supabase Dashboard

Since the automatic setup isn't working, please follow these steps to set up the cron job manually:

### 1. Navigate to Cron Jobs
Go to: https://supabase.com/dashboard/project/bpdhbxvsguklkbusqtke/database/cron-jobs

### 2. Create New Cron Job
Click the "New cron job" or "Create cron job" button

### 3. Fill in the Details

**Name:** `process-deployment-queue`

**Schedule:** `*/2 * * * *`
(This runs every 2 minutes)

**Command:**
```sql
SELECT net.http_post(
  url := 'https://bpdhbxvsguklkbusqtke.supabase.co/functions/v1/process-deployment-queue',
  headers := jsonb_build_object(
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM',
    'Content-Type', 'application/json'
  ),
  body := '{}'::jsonb
);
```

### 4. Save the Cron Job
Click "Save" or "Create" to activate the cron job.

## What This Does

- Runs every 2 minutes
- Calls the `process-deployment-queue` Edge Function
- Processes any queued deployments automatically
- Uses the service role key for authentication

## Verification

After setting up the cron job:

1. Deploy a project through the UI
2. Check the Deployment Queue page - it should show as "queued"
3. Wait up to 2 minutes
4. The deployment should automatically change to "processing" then "completed"
5. Check the logs to see the deployment progress

## Alternative: Manual Processing

If you prefer not to set up the cron job, you can always:
- Use the "Process Queue" button in the Deployment Queue admin page
- This gives you more control over when deployments are processed