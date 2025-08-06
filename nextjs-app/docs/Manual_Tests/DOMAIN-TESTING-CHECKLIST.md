# Domain Architecture Testing Checklist

## Overview
This checklist tests the server-side domain architecture implementation across all environments. Each environment has specific capabilities and limitations documented below.

## Prerequisites
- [x] Development server is running on port 3000/3001
- [x] You have access to a test project
- [x] You have a test domain available (or use a subdomain)
- [ ] Verify environment variables are set correctly:
  - `VERCEL_API_TOKEN` - Should have access to the project
  - `VERCEL_PROJECT_ID` - Should match the Vercel project containing your domains
  - `VERCEL_TEAM_ID` - Should be set if using team account

## Environment Capabilities

### LOCAL (localhost:3000)
**What WORKS:**
- Database operations (add/remove/update domains)
- Vercel API calls (check status, add domains, verify)
- Authentication and permissions
- All CRUD operations

**What DOESN'T WORK:**
- Custom domains won't route to localhost
- SSL certificates can't be provisioned (needs public URL)
- Webhooks can't reach localhost

**Expected Behaviors:**
- Domains already in Vercel should show their actual status
- New domains can be added to Vercel via API
- Verification status should update in database

### PREVIEW (Vercel preview deployments)
**What WORKS:**
- Everything from local PLUS:
- Public preview URLs accessible
- Webhooks can reach the deployment
- SSL works on preview URLs

**What DOESN'T WORK:**
- Custom domains route to production, not preview
- Some production features may be limited

### PRODUCTION (Vercel production deployment)
**What WORKS:**
- Everything!
- Custom domains route correctly
- SSL certificates provision automatically
- Full domain verification and routing

---

## Testing Steps (LOCAL)

### 1. Domain Addition Flow
- [x] Navigate to Project Settings → Domain Settings
- [x] Click "Add Domain"
- [x] Enter a test domain (e.g., test.yourdomain.com)
- [x] Verify no errors appear when clicking "Add Domain"
- [x] Confirm domain appears in the list

**Expected:** Domain should be added to database and appear in list immediately

### 2. Domain Verification - Existing Verified Domain
- [x] Click the refresh/verify button next to your domain
- [x] Watch for the loading spinner
- [x] Check that no permission errors appear in the UI
- [!] Domain status should reflect Vercel's actual status

**ISSUE FOUND:** "Domain not found in Vercel" error when domain IS in Vercel
- Domain: lahaie-private-server.com
- Status in Vercel: Verified
- Error: "Domain not found in Vercel. It may need to be added to the project first."

**This indicates either:**
1. Wrong VERCEL_PROJECT_ID in .env.local
2. API token doesn't have access to the project
3. Domain is in a different Vercel project than expected

### 3. Domain Verification - New Unverified Domain
- [ ] Add a completely new test domain (e.g., test-local.yourdomain.com)
- [ ] Click verify button
- [ ] Should show "Not Verified" status
- [ ] Should populate verification_details with DNS instructions

**Expected:** New domains should show as unverified with DNS configuration instructions

### 4. Database Verification
After adding and attempting to verify a domain, check that:
- [x] Domain record exists in `project_domains` table
- [x] `ssl_state` column shows 'PENDING' or appropriate status
- [!] `verification_details` column contains data (if verification was attempted)
  - **Note:** This is NULL for verified domains (expected)
  - Should contain DNS instructions for unverified domains
- [x] No RLS errors in Supabase logs
  - Check in Supabase Dashboard → Logs → Postgres Logs
  - Filter for ERROR level messages
  - Found unrelated error: "deployment_queue" table missing

### 5. Error Handling
- [x] Try adding an invalid domain format (e.g., "not-a-domain")
  - **Result:** Shows appropriate error message ✓
- [x] Try adding the same domain twice
  - **Result:** Shows duplicate domain error ✓

### 6. API Testing
Using browser DevTools Network tab:
- [ ] When adding a domain:
  - POST to `/api/projects/[projectId]/domains` should return 200
  - Domain should be added to Vercel if API configured
- [ ] When verifying a domain:
  - POST to `/api/domains/[id]/verify` should return 200
  - Should check Vercel status and update database
- [ ] Check responses for authentication errors

**Network requests observed:**
```
domains                     200  (Domain addition)
project_domains?select=*    200  (Fetching updated list)
status                      200  (Checking domain status)
```

### 7. Troubleshooting Steps
If "Domain not found in Vercel" error occurs:
1. [ ] Check browser console for detailed error logs
2. [ ] Verify VERCEL_PROJECT_ID matches the project in Vercel dashboard
3. [ ] Test Vercel API token has correct permissions:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.vercel.com/v10/projects/YOUR_PROJECT_ID/domains
   ```
4. [ ] Check if domain exists in the correct Vercel project via dashboard

---

## Testing Steps (PREVIEW)

### 1. Domain Addition Flow
- [ ] Navigate to Project Settings → Domain Settings
- [ ] Click "Add Domain"
- [ ] Add a preview-specific test domain (e.g., preview-test.yourdomain.com)
- [ ] Verify no errors appear when clicking "Add Domain"
- [ ] Confirm domain appears in the list

**Expected:** Same as local, but using preview deployment URL

### 2. Domain Verification
- [ ] Test with both verified and unverified domains
- [ ] Verify button should work same as local
- [ ] Check that Vercel API calls succeed

**Expected:** Should behave identically to local environment

### 3. Preview-Specific Tests
- [ ] Verify preview deployment URL works (*.vercel.app)
- [ ] Check that middleware correctly identifies preview environment
- [ ] Ensure database operations work with preview deployment

### 4. API Testing
- [ ] All API endpoints should be accessible via preview URL
- [ ] Authentication should work correctly
- [ ] Vercel API integration should function

---

## Testing Steps (PRODUCTION)

### 1. Domain Addition Flow
- [ ] Navigate to Project Settings → Domain Settings
- [ ] Add a production domain
- [ ] Verify domain appears in list

**Expected:** Domain added to both database and Vercel

### 2. Domain Verification & Routing
- [ ] Add domain with correct DNS pointing to Vercel
- [ ] Click verify - should become verified once DNS propagates
- [ ] Visit the custom domain - should load the correct project
- [ ] SSL certificate should provision automatically

**Expected:** Full end-to-end domain functionality

### 3. Production-Specific Tests
- [ ] Custom domain routing works correctly
- [ ] SSL certificates provision and renew
- [ ] Domain shows as verified with SSL "READY" state
- [ ] Apex and www domains work correctly
- [ ] Domain redirects function as configured

### 4. Monitoring
- [ ] Check for any domain-related errors in production logs
- [ ] Verify SSL renewal happens automatically
- [ ] Monitor domain verification status over time

---

## Expected Outcomes by Environment

### ✅ **All Environments Should:**
- Allow adding/removing domains from database
- Show correct domain status from Vercel
- Handle errors gracefully
- Enforce proper permissions

### ❌ **Common Issues:**
- "Domain not found in Vercel" - Check project ID and API token
- RLS errors - Should not occur with server-side architecture
- SSL pending forever - Normal in local, check DNS in production

## Debug Information to Collect

When issues occur, collect:
1. Browser console errors
2. Network tab responses (especially error responses)
3. Supabase logs (Postgres and API logs)
4. Current environment variables (without exposing secrets)
5. Vercel project ID from dashboard
6. Domain status in Vercel dashboard

## Notes
- Domains need proper DNS only for production routing
- SSL provisioning only works with public URLs
- Verification can succeed even without proper DNS
- Platform admins should have access to all projects