# Process Deployment Queue Edge Function

This Supabase Edge Function processes the deployment queue, handling up to 3 deployments concurrently while respecting Netlify's API rate limits.

## Overview

The function:
1. Fetches up to 3 pending deployments from the `deployment_queue` table
2. Marks them as 'processing'
3. For each deployment:
   - Creates or updates a Netlify site
   - Generates and uploads the deployment ZIP
   - Monitors deployment status
   - Updates the project record
4. Handles retries for failed deployments
5. Returns a summary of processing results

## Environment Variables

Required environment variables (set in Supabase Dashboard):

- `NETLIFY_ACCESS_TOKEN`: Your Netlify API token
- `NETLIFY_TEAM_ID`: Your Netlify team ID (optional)

The following are automatically provided by Supabase:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin access

## Deployment

Deploy this function using the Supabase CLI:

```bash
supabase functions deploy process-deployment-queue
```

## Setting Environment Variables

```bash
supabase secrets set NETLIFY_ACCESS_TOKEN=your-token
supabase secrets set NETLIFY_TEAM_ID=your-team-id
```

## Invoking the Function

### Manual Invocation

```bash
# From CLI
supabase functions invoke process-deployment-queue

# Via HTTP
curl -X POST https://your-project.supabase.co/functions/v1/process-deployment-queue \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Scheduled Invocation (Cron)

You can set up a cron job to run this function periodically. In your Supabase Dashboard:

1. Go to Edge Functions
2. Select this function
3. Add a cron schedule (e.g., `*/2 * * * *` for every 2 minutes)

## Response Format

```json
{
  "processed": 3,
  "succeeded": 2,
  "failed": 1,
  "errors": [
    {
      "deploymentId": "uuid",
      "error": "Error message"
    }
  ],
  "duration": 45000
}
```

## Error Handling

- Failed deployments are automatically retried up to 3 times
- After max attempts, deployments are marked as 'failed'
- All operations are logged to the `deployment_logs` table
- Errors are included in the response for debugging

## Security

- Uses service role key for database operations
- All environment variables should be set securely via Supabase Dashboard
- CORS headers are included for browser-based invocations

## Development

To run locally:

```bash
supabase functions serve process-deployment-queue --env-file ./supabase/functions/process-deployment-queue/.env.local
```

## Monitoring

Monitor function execution in:
- Supabase Dashboard > Edge Functions > Logs
- `deployment_logs` table for detailed deployment history
- `deployment_queue` table for queue status