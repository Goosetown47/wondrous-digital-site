# Check Edge Function Logs

To see the actual error from the deployment, you need to check the Edge Function logs in Supabase dashboard:

1. Go to https://supabase.com/dashboard/project/bpdhbxvsguklkbusqtke/functions
2. Click on "process-deployment-queue"
3. Go to the "Logs" tab
4. Look for the most recent invocation

The enhanced error logging should show:
- "Deploying to Netlify site {siteId}, ZIP size: {bytes} bytes"
- "Netlify deploy response: {status} {statusText}"
- "Generated export result: {pageCount, assetCount}"
- "ZIP contents: [list of files]"
- If there's an error, detailed error information

Common issues to look for:
1. **No pages generated** - The DeploymentEngine couldn't find pages or sections
2. **Empty ZIP file** - The ZIP generation failed
3. **Netlify API error** - Authentication or API issues
4. **Build error** - The Netlify build failed

Based on the error details, we can fix the specific issue.