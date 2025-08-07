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
- [x] Domain status should reflect Vercel's actual status

### 3. Domain Verification - New Unverified Domain
- [x] Add a completely new test domain (e.g., test-local.yourdomain.com)
- [x] Click verify button
- [x] Should show "Not Verified" status
- [x] Should populate verification_details with DNS instructions

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

### 6. Primary Domain System
- [x] First domain added to project should automatically be marked as primary
- [x] Domain cards should show "Primary" badge for primary domain
- [x] Settings section should contain primary domain toggle switch
- [x] Primary domain toggle should be disabled and checked for current primary
- [x] Non-primary domains should have enabled toggle to make them primary
- [x] Making domain primary should update all other domains to non-primary

**Expected:** Each project has exactly one primary domain at all times

### 7. UI/UX Testing - Settings & Issues Sections
- [x] Domain cards should have expandable Settings section with gray background
- [x] Settings should contain WWW toggle and Primary domain toggle
- [x] Issues section should appear below settings when domain has problems
- [x] Issues should show DNS configuration errors and SSL status clearly
- [x] Toggle switches should work smoothly with loading states
- [x] Primary domain changes should show toast confirmation

**Expected:** Clean, organized interface with clear status indicators

### 8. API Testing
Using browser DevTools Network tab:
- [x] When adding a domain:
  - POST to `/api/projects/[projectId]/domains` should return 200
  - Domain should be added to Vercel if API configured
  - Should include `is_primary: true` for first domain
- [x] When verifying a domain:
  - POST to `/api/domains/[id]/verify` should return 200
  - Should check Vercel status and update database
- [x] When making domain primary:
  - POST to `/api/domains/[id]/make-primary` should return 200
  - Should update primary status for all project domains
- [x] Check responses for authentication errors

**Network requests observed:**
```
domains                     200  (Domain addition)
project_domains?select=*    200  (Fetching updated list)
status                      200  (Checking domain status)
make-primary               200  (Primary domain updates)
```

### 9. Troubleshooting Steps
If "Domain not found in Vercel" error occurs:
1. [x] Check browser console for detailed error logs
2. [x] Verify VERCEL_PROJECT_ID matches the project in Vercel dashboard
3. [x] Test Vercel API token has correct permissions:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.vercel.com/v10/projects/YOUR_PROJECT_ID/domains
   ```
4. [x] Check if domain exists in the correct Vercel project via dashboard

---

## Testing Steps (PREVIEW)

### 1. Domain Addition Flow
- [x] Navigate to Project Settings → Domain Settings
- [x] Click "Add Domain"
- [ ] Add a preview-specific test domain (e.g., preview-test.yourdomain.com)
- [ ] Verify no errors appear when clicking "Add Domain"
- [ ] Confirm domain appears in the list

**Expected:** Same as local, but using preview deployment URL

### 2. Domain Verification
- [ ] Test with both verified and unverified domains
- [ ] Verify button should work same as local
- [ ] Check that Vercel API calls succeed
- [ ] Refresh button should always be visible and show accurate status

**Expected:** Should behave identically to local environment

### 3. Primary Domain System (Preview)
- [ ] First domain added should automatically be marked as primary
- [ ] Primary domain toggle should work correctly
- [ ] Making domain primary should update other domains
- [ ] UI should show correct primary domain indicators

### 4. UI/UX Testing (Preview)
- [ ] Settings section should display properly on preview URL
- [ ] Issues section should show configuration problems
- [ ] Toggle switches should function correctly
- [ ] Toast messages should appear for all actions

### 5. Preview-Specific Tests
- [ ] Verify preview deployment URL works (*.vercel.app)
- [ ] Check that middleware correctly identifies preview environment
- [ ] Ensure database operations work with preview deployment

### 6. API Testing
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
- [ ] Refresh button should show accurate verification status

**Expected:** Full end-to-end domain functionality

### 3. Primary Domain System (Production)
- [ ] First domain should be automatically set as primary
- [ ] Primary domain should handle main website traffic
- [ ] Additional domains should redirect to primary domain
- [ ] Primary domain toggle should work in production environment
- [ ] Database should correctly track primary domain status

### 4. UI/UX Production Testing  
- [ ] Settings section should render correctly on custom domains
- [ ] Issues section should show real DNS configuration problems
- [ ] Toggle switches should function with production API calls
- [ ] Toast notifications should work on custom domains

### 5. Production-Specific Tests
- [ ] Custom domain routing works correctly
- [ ] SSL certificates provision and renew
- [ ] Domain shows as verified with SSL "READY" state
- [ ] Apex and www domains work correctly
- [ ] Domain redirects function as configured

### 6. Monitoring
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