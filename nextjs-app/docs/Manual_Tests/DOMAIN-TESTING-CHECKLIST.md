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

## Environment Variables & Domain Status

### Important Note About Preview Deployments
Preview deployments may use a different `VERCEL_PROJECT_ID` than your local/production environment. This means:
- Domains configured in your production Vercel project may show as "DNS Setup Required" on preview
- This is expected behavior and not a bug
- The domain management UI should still function correctly
- To verify which project ID is being used, check browser console for `[VERCEL]` logs

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

### 8. Status Badge & SSL Synchronization Testing
- [x] Status badge shows "Configured" (green) when DNS is valid
- [x] Status badge shows "DNS Setup Required" (amber) when DNS not configured
- [x] Status badge shows "Checking Configuration" (blue) during verification
- [x] Status badge shows "Configuration Error" (red) for errors
- [x] No duplicate status icons appear in domain card header
- [x] SSL status updates to "READY" automatically when DNS is configured
- [x] SSL status persists correctly after page reload
- [x] SSL display checks both API response and database values
- [x] No need to manually refresh for SSL status to update

**Expected:** Status badges provide clear, consistent feedback without redundancy

### 9. DNS Configuration Collapsible Section
- [x] DNS Configuration section auto-collapses when domain is configured
- [x] DNS Configuration section stays expanded for unconfigured domains
- [x] Click header to manually expand/collapse DNS configuration
- [x] Green checkmark icon appears next to "DNS Configuration" when configured
- [x] Expand/collapse arrow changes direction appropriately
- [x] Provider dropdown remains accessible in collapsed header
- [x] DNS records display correctly when section is expanded
- [x] No promotional text about hosting provider appears
- [x] No confusing helper text about www configuration shows

**Expected:** Smart collapsible behavior that reduces clutter for configured domains

### 10. Issues Section Behavior
- [x] Issues section only appears when there are actual errors
- [x] "Domain is fully configured and active" does NOT appear in Issues
- [x] Issues section is completely hidden for properly configured domains
- [x] Error messages display with appropriate color coding (red/amber)
- [!] Multiple issues display as bullet points when present
	- The bullet points aren't properly aligned with the middle of the text. They're aligned with the bottom of the text line.
- [x] Issues section appears above DNS Configuration section

**Expected:** Issues section provides actionable feedback only when needed

### 11. API Testing
Using browser DevTools Network tab:
- [x] When adding a domain:
  - POST to `/api/projects/[projectId]/domains` should return 200
  - Domain should be added to Vercel if API configured
  - Should include `is_primary: true` for first domain
- [x] When verifying a domain:
  - POST to `/api/domains/[id]/verify` should return 200
  - Should check Vercel status and update database
- [ ] When checking DNS configuration:
  - GET to `/api/domains/[id]/dns-config` should return 200
  - Should update SSL status in database when configured
  - Response includes real-time configuration status
- [x] When making domain primary:
  - POST to `/api/domains/[id]/make-primary` should return 200
  - Should update primary status for all project domains
- [x] Check responses for authentication errors

**Network requests observed:**
```
domains                     200  (Domain addition)
project_domains?select=*    200  (Fetching updated list)
status                      200  (Checking domain status)
dns-config                  200  (DNS configuration check)
make-primary               200  (Primary domain updates)
```

### 12. Troubleshooting Steps
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
- [x] Add a preview-specific test domain (e.g., preview-test.yourdomain.com)
- [x] Verify no errors appear when clicking "Add Domain"
- [x] Confirm domain appears in the list

**Expected:** Same as local, but using preview deployment URL

### 2. Domain Verification
- [!] Test with both verified and unverified domains
	- **Note:** Domains may show different status on preview vs local/production
	- This is expected if preview deployment uses a different `VERCEL_PROJECT_ID`
	- Example: lahaie-private-server.com shows "DNS Setup Required" on preview but "Configured" on local
	- This happens because the domain is configured for the production Vercel project, not the preview project
- [x] Verify button should work same as local
- [x] Check that Vercel API calls succeed
- [x] Refresh button should always be visible and show accurate status

**Expected:** UI functionality should work identically to local, but domain status may differ based on which Vercel project is configured

### 3. Primary Domain System (Preview)
- [ ] First domain added should automatically be marked as primary
- [ ] Primary domain toggle should work correctly
- [ ] Making domain primary should update other domains
- [ ] UI should show correct primary domain indicators
- [ ] When the primary domain is deleted, it should 

### 4. UI/UX Testing (Preview)
- [ ] Settings section should display properly on preview URL
- [ ] Issues section should show configuration problems
- [ ] Toggle switches should function correctly
- [ ] Toast messages should appear for all actions

### 5. Status Badges & SSL (Preview)
- [ ] Status badge shows "Configured" (green) for domains with valid DNS
- [ ] Status badge shows "DNS Setup Required" (amber) for new domains
- [ ] SSL status automatically updates to "READY" when DNS configured
- [ ] No manual refresh needed for SSL status synchronization
- [ ] Status badges render correctly on preview deployment URL

### 6. DNS Configuration UI (Preview)
- [ ] DNS Configuration section auto-collapses for configured domains
- [ ] Manual expand/collapse works smoothly
- [ ] Green checkmark appears for configured domains
- [ ] No promotional hosting provider text appears
- [ ] DNS records display properly when expanded

### 7. Issues Section (Preview)
- [ ] Issues section only shows for domains with real problems
- [ ] No "fully configured" message appears as an issue
- [ ] Issues section completely hidden for working domains
- [ ] Error messages have proper color coding

### 8. Preview-Specific Tests
- [ ] Verify preview deployment URL works (*.vercel.app)
- [ ] Check that middleware correctly identifies preview environment
- [ ] Ensure database operations work with preview deployment

### 9. API Testing
- [ ] All API endpoints should be accessible via preview URL
- [ ] Authentication should work correctly
- [ ] Vercel API integration should function
- [ ] DNS config endpoint updates SSL status in database

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

### 5. Production Status & SSL Testing
- [ ] Status badges show accurate real-time status
- [ ] SSL automatically shows "READY" when DNS propagates
- [ ] No manual refresh needed for status updates
- [ ] Database and API SSL status stay synchronized
- [ ] Status persists correctly across sessions

### 6. Production DNS Configuration UI
- [ ] DNS section auto-collapses for live configured domains
- [ ] Green checkmark shows for verified production domains
- [ ] No hosting provider promotional text visible
- [ ] Expand/collapse works on production domain URLs

### 7. Production-Specific Tests
- [ ] Custom domain routing works correctly
- [ ] SSL certificates provision and renew
- [ ] Domain shows as verified with SSL "READY" state
- [ ] Apex and www domains work correctly
- [ ] Domain redirects function as configured

### 8. Monitoring
- [ ] Check for any domain-related errors in production logs
- [ ] Verify SSL renewal happens automatically
- [ ] Monitor domain verification status over time
- [ ] Confirm SSL status updates persist in database

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