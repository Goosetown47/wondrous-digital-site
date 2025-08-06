# Domain Architecture Testing Checklist

## Overview
This checklist is for testing the new server-side domain architecture implementation. Please mark each item as you test it.

## Prerequisites
- [x] Development server is running on port 3000
- [x] You have access to a test project
- [x] You have a test domain available (or use a subdomain)

## Testing Steps (LOCAL)

### 1. Domain Addition Flow
- [x] Navigate to Project Settings → Domain Settings
- [x] Click "Add Domain"
- [x] Enter a test domain (e.g., test.yourdomain.com)
- [FAIL] Verify no errors appear when clicking "Add Domain"
	- I'm in Wondrous Digital account, lahaie-private-server project.
	- I deleted the lahaie-private-server.com domain that was in there. 
	- I tried to re-add it
	- I got an error "Project not found or access denied."
- [ ] Confirm domain appears in the list

### 2. Domain Verification
- [ ] Click the refresh/verify button next to your domain
- [ ] Watch for the loading spinner
- [ ] Check that no permission errors appear in the UI
- [ ] Verify the domain status updates (even if it shows "not verified" due to DNS)

### 3. Database Verification
After adding and attempting to verify a domain, check that:
- [ ] Domain record exists in `project_domains` table
- [ ] `ssl_state` column shows 'PENDING' or appropriate status
- [ ] `verification_details` column contains data (if verification was attempted)
- [ ] No RLS errors in Supabase logs

### 4. Error Handling
- [ ] Try adding an invalid domain format (e.g., "not-a-domain")
- [ ] Verify appropriate error message appears
- [ ] Try adding the same domain twice
- [ ] Confirm duplicate domain error is shown

### 5. API Testing
Using browser DevTools Network tab:
- [ ] When verifying a domain, check for POST to `/api/domains/[id]/verify`
- [ ] Response should be 200 OK (not 403 Forbidden)
- [ ] When domain updates, check for PUT to `/api/domains/[id]/update`
- [ ] No authentication errors in responses

## Testing Steps (PREVIEW)

### 1. Domain Addition Flow
- [ ] Navigate to Project Settings → Domain Settings
- [ ] Click "Add Domain"
- [ ] Enter a test domain (e.g., test.yourdomain.com)
- [ ] Verify no errors appear when clicking "Add Domain"
- [ ] Confirm domain appears in the list

### 2. Domain Verification
- [ ] Click the refresh/verify button next to your domain
- [ ] Watch for the loading spinner
- [ ] Check that no permission errors appear in the UI
- [ ] Verify the domain status updates (even if it shows "not verified" due to DNS)

### 3. Database Verification
After adding and attempting to verify a domain, check that:
- [ ] Domain record exists in `project_domains` table
- [ ] `ssl_state` column shows 'PENDING' or appropriate status
- [ ] `verification_details` column contains data (if verification was attempted)
- [ ] No RLS errors in Supabase logs

### 4. Error Handling
- [ ] Try adding an invalid domain format (e.g., "not-a-domain")
- [ ] Verify appropriate error message appears
- [ ] Try adding the same domain twice
- [ ] Confirm duplicate domain error is shown

### 5. API Testing
Using browser DevTools Network tab:
- [ ] When verifying a domain, check for POST to `/api/domains/[id]/verify`
- [ ] Response should be 200 OK (not 403 Forbidden)
- [ ] When domain updates, check for PUT to `/api/domains/[id]/update`
- [ ] No authentication errors in responses


## Testing Steps (PROD)

### 1. Domain Addition Flow
- [ ] Navigate to Project Settings → Domain Settings
- [ ] Click "Add Domain"
- [ ] Enter a test domain (e.g., test.yourdomain.com)
- [ ] Verify no errors appear when clicking "Add Domain"
- [ ] Confirm domain appears in the list

### 2. Domain Verification
- [ ] Click the refresh/verify button next to your domain
- [ ] Watch for the loading spinner
- [ ] Check that no permission errors appear in the UI
- [ ] Verify the domain status updates (even if it shows "not verified" due to DNS)

### 3. Database Verification
After adding and attempting to verify a domain, check that:
- [ ] Domain record exists in `project_domains` table
- [ ] `ssl_state` column shows 'PENDING' or appropriate status
- [ ] `verification_details` column contains data (if verification was attempted)
- [ ] No RLS errors in Supabase logs

### 4. Error Handling
- [ ] Try adding an invalid domain format (e.g., "not-a-domain")
- [ ] Verify appropriate error message appears
- [ ] Try adding the same domain twice
- [ ] Confirm duplicate domain error is shown

### 5. API Testing
Using browser DevTools Network tab:
- [ ] When verifying a domain, check for POST to `/api/domains/[id]/verify`
- [ ] Response should be 200 OK (not 403 Forbidden)
- [ ] When domain updates, check for PUT to `/api/domains/[id]/update`
- [ ] No authentication errors in responses


## Expected Outcomes

✅ **Success Indicators:**
- Domains can be added without errors
- Verification process runs without permission errors
- Database properly stores SSL state and verification details
- API routes return 200 OK responses

❌ **Previous Issues (Should NOT Occur):**
- "Failed to update domain verification" errors
- RLS policy violations
- 403 Forbidden responses from API
- Database updates failing silently

## Console Commands for Verification

Check domain in database:
```sql
SELECT id, domain, verified, ssl_state, verification_details 
FROM project_domains 
WHERE domain = 'your-test-domain.com';
```

Check for RLS errors in logs:
```sql
SELECT * FROM auth.audit_log 
WHERE created_at > NOW() - INTERVAL '10 minutes' 
AND payload::text LIKE '%permission denied%';
```

## Notes
- The domain doesn't need to actually verify (DNS can be incorrect)
- We're testing that the system can update the database without RLS errors
- SSL state should update even if domain isn't verified
- Verification details should be stored as JSON

## Report Issues
If any test fails, please note:
1. Which step failed
2. Exact error message (if any)
3. Browser console errors
4. Network tab responses