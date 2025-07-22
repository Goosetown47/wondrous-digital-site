# Update Cron Job Command

The pg_net wrapper function has been created successfully. Now you need to manually update the cron job in Supabase dashboard.

## Steps:

1. Go to Supabase Dashboard
2. Navigate to Database > Cron Jobs
3. Find the "process-deployments" job
4. Click on it to edit
5. Replace the command with:

```sql
SELECT public.http_post_wrapper(
  url := 'https://bpdhbxvsguklkbusqtke.supabase.co/functions/v1/process-deployment-queue',
  headers := jsonb_build_object(
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM',
    'Content-Type', 'application/json'
  ),
  body := '{}'::jsonb
);
```

6. Save the changes

## What Changed:

- Old: `SELECT net.http_post(...)`
- New: `SELECT public.http_post_wrapper(...)`

The wrapper function will handle finding the correct schema for pg_net functions.

## Testing:

After updating the cron job:
1. Wait for the next scheduled run (every 2 minutes)
2. Check the cron job logs - you should no longer see "schema 'net' does not exist"
3. The deployment queue should start processing automatically