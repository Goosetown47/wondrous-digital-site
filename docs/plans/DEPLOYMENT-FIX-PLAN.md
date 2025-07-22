# Netlify Deployment System Fix - Implementation Plan

## Problem Summary

The deployment system is currently failing with "Failed to create Netlify site" errors because:

1. **Site Name Conflicts**: Edge Function uses just the subdomain (e.g., "dentist-1") as the Netlify site name, which must be globally unique across all Netlify accounts
2. **Domain Management Issues**: Inconsistent domain/subdomain handling across the UI
3. **Missing Database Support**: The flexible domain management migration exists but hasn't been applied
4. **No Custom Domain Support**: System doesn't properly handle custom domains vs wondrousdigital.com

## Phase 1: Database Foundation ✅ [COMPLETED]

### Goal
Apply the flexible domain management migration and ensure database schema supports proper domain tracking.

### Tasks
- [x] Rename and apply `20250118_flexible_domain_management.sql.bak` migration
- [x] Verify all projects have deployment_domain set (default: 'wondrousdigital.com')
- [x] Test project_management_view includes custom_domains
- [x] Validate domain constraint functions work

### Migration Details
The migration adds:
- `deployment_domain` column to projects table
- `custom_domains` array to customers table  
- Unique constraint on subdomain+deployment_domain
- Domain validation functions
- Updated project_management_view with computed URLs

## Phase 2: Fix Edge Function Site Creation ✅ [COMPLETED]

### Goal
Fix "Failed to create Netlify site" errors by using globally unique site names.

### Current Issue
```typescript
// BROKEN: Just uses subdomain
const site = await createNetlifySite(netlifyToken, payload.subdomain, netlifyTeamId)
```

### Solution Implemented
```typescript
// Generate globally unique site name
function generateNetlifySiteName(subdomain: string, domain: string): string {
  const timestamp = Date.now().toString(36); // Short timestamp
  
  if (domain === 'wondrousdigital.com') {
    return subdomain ? `${subdomain}-wd-${timestamp}` : `wd-root-${timestamp}`;
  } else {
    // Convert domain to slug: "raleigh-dentist.com" → "raleigh-dentist"
    const domainSlug = domain
      .toLowerCase()
      .replace(/\.(com|net|org|io|co|us|uk|ca|au|de|fr|jp|cn|in|br|mx)$/i, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (subdomain) {
      return `${subdomain}-${domainSlug}-${timestamp}`;
    } else {
      return `${domainSlug}-${timestamp}`;
    }
  }
}
```

### Tasks
- [x] Update Edge Function to use unique site names
- [x] Add detailed error logging for Netlify API responses
- [x] Deploy updated Edge Function
- [x] Fix Edge Function to set custom_domain for correct URLs
- [ ] Test with actual deployments

### Custom Domain Fix
Updated the Edge Function to:
1. Generate unique internal site names (e.g., `dentist-1-wd-m3k8n9p`)
2. Set the `custom_domain` field to the actual desired domain (e.g., `dentist-1.wondrousdigital.com`)
3. This ensures sites are accessible at the correct URLs, not just the `.netlify.app` URLs

### NetlifyDomainManager Implementation
Created a comprehensive domain management system:
1. **Domain Parsing**: Extracts primary domain from full domain (e.g., `raleigh-dentist.com` from `holiday.raleigh-dentist.com`)
2. **Site Discovery**: Finds existing Netlify sites by domain, using cache for efficiency
3. **Domain Alias Management**: Adds subdomains as aliases to existing sites instead of creating new sites
4. **Site Caching**: Uses `netlify_site_cache` table to reduce API calls

Key Features:
- One Netlify site per primary domain
- Subdomains added as domain aliases (e.g., `holiday.raleigh-dentist.com` → alias on `raleigh-dentist.com` site)
- Proper handling of wondrousdigital.com subdomains
- Efficient site reuse and deployment

### NetlifyDeploymentEngine Implementation
Created a proper static site generation system:
1. **Section Rendering**: Converts section JSON to semantic HTML (hero, text, cards, etc.)
2. **CSS Generation**: Compiles site_styles to production CSS with variables
3. **Responsive Design**: Mobile-first CSS with utility classes
4. **Asset Management**: Handles images, CSS files, and netlify.toml
5. **SEO Ready**: Proper meta tags, structured HTML

Key Improvements:
- Production-ready HTML output (not just basic wrappers)
- Proper CSS with components and utilities
- Section-specific rendering (hero sections, cards, CTAs)
- Clean file structure with /css/ directory
- Netlify configuration for clean URLs

## Phase 3: UI Domain Synchronization ✅ [COMPLETED]

### Goal
Ensure domain/subdomain changes are synchronized across all UI components.

### Account Management Updates
- [x] Add custom_domains field to CreateAccountModal
- [x] Add custom_domains field to EditAccountModal (created new component)
- [x] Display custom_domains in AccountsPage table
- [x] Add domain format validation

### Project Management Updates
- [x] Show customer's custom domains in CreateProjectModal
- [x] Allow deployment_domain selection during creation
- [x] Fix EditProjectModal to show customer's custom domains
- [x] Update ProjectsPage to show deployment URLs (via project_management_view)

### Key Areas to Sync
1. **Projects List**: Domain/Subdomain columns ✅
2. **Edit Project Modal**: Domain settings ✅
3. **Deploy Modal**: Domain selection ✅
4. **Accounts Page**: Custom domains display ✅

## Phase 4: Deployment Modal Enhancement

### Goal
Fix domain selection showing "Custom Domain" incorrectly.

### Current Issue
The deployment modal doesn't properly recognize existing deployment_domain values, defaulting to "Custom Domain" in the dropdown.

### Tasks
- [ ] Debug deployment_domain recognition logic
- [ ] Fix custom_domains array loading
- [ ] Ensure dropdown shows correct selection
- [ ] Test with various domain configurations

## Phase 5: Testing & Validation

### Goal
Ensure end-to-end deployment works for all scenarios.

### Test Scenarios
1. **wondrousdigital.com subdomain**
   - [ ] Create project with dentist-2.wondrousdigital.com
   - [ ] Deploy successfully
   - [ ] Verify live URL works

2. **Custom apex domain**
   - [ ] Add custom domain to customer
   - [ ] Create project with raleigh-dentist.com
   - [ ] Deploy successfully
   - [ ] Verify live URL works

3. **Custom subdomain**
   - [ ] Create project with holiday.raleigh-dentist.com
   - [ ] Deploy successfully
   - [ ] Verify live URL works

4. **Re-deployment**
   - [ ] Re-deploy existing site
   - [ ] Verify it updates the same Netlify site
   - [ ] Check deployment history

### Debug Queries
```sql
-- Check recent deployment failures
SELECT id, project_id, status, error_message, payload->>'subdomain' as subdomain, 
       payload->>'deployment_domain' as domain, created_at 
FROM deployment_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check projects with deployment info
SELECT project_name, subdomain, deployment_domain, netlify_site_id, deployment_status 
FROM projects 
WHERE deployment_status IS NOT NULL;
```

## Phase 6: Documentation

### Goal
Document the deployment system for future reference.

### Tasks
- [ ] Create docs/DEPLOYMENT-ARCHITECTURE.md
- [ ] Update CLAUDE.md with deployment troubleshooting
- [ ] Document Edge Function environment setup

## Progress Tracking

### Completed
- ✅ Initial analysis and plan creation
- ✅ Phase 1: Database Foundation
- ✅ Phase 2: Fix Edge Function (with custom domain support)
- ✅ Phase 2.5: Implement NetlifyDomainManager for proper domain handling
- ✅ Phase 2.6: Enhanced Static Site Generation with NetlifyDeploymentEngine
- ✅ Phase 2.7: Production-Ready Queue Integration (Rate Limiting, Exponential Backoff, Cache Management)
- ✅ Phase 3: UI Domain Synchronization (All UI components updated)

### Ready for Testing
- 🧪 Test deployment with dentist project
- 🧪 Verify domain alias management works correctly
- 🧪 Verify enhanced HTML/CSS generation produces proper sites
- 🧪 Verify rate limiting and retry logic works
- 🧪 Test UI components with custom domains

### Pending
- ⏳ Phase 4: Deployment Modal Enhancement (may already be working correctly)
- ⏳ Phase 5: Full Testing Suite
- ⏳ Phase 6: Documentation

## Notes

### Edge Function Environment Variables
- `NETLIFY_ACCESS_TOKEN`: Already set correctly
- `NETLIFY_TEAM_ID`: "wondrous-digital" (correct)
- `SUPABASE_URL`: Set
- `SUPABASE_SERVICE_ROLE_KEY`: Set

### Netlify API Limits
- Rate limit: 500 calls/minute
- Domain aliases: 50 per site
- Site name: Must be globally unique

### Known Issues
1. Subdomain updates fail with "Failed to update project"
2. Deployment modal shows "Custom Domain" instead of saved domain
3. Edge Function uses non-unique site names