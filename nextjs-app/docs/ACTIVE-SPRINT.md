## ------------------------------------------------ ##
# ACTIVE SPRINT
## ------------------------------------------------ ##

**Production Version:** v0.1.0 (Released 8/1/2025 @ 11pm)
**Development Version:** v0.1.1 (Active Planning Now)


---

## Sprint Process Guide

### Sprint Planning (Start of Sprint)

  1. Review BACKLOG.md → Pull priority items into ACTIVE-SPRINT.md
  2. Set version number → Decide scope (major.minor.patch)
  3. Move packets → Cut H4 sections from BACKLOG to ACTIVE-SPRINT
  4. Order packets → Arrange by priority/dependency


### During Sprint Execution

#### Per Packet Workflow:

  1. Move packet to Current Focus → Work on one packet at a time
  2. Follow DEV-LIFECYCLE.md → Full/Fast Track/Emergency mode per packet
  3. As you discover issues → Add to "Found Work" section:
    - Critical → Must fix in current version
    - Non-Critical → Defer to next version
    - Tech Debt → Document for future
  4. Update STATUS-LOG.md → Log progress after each packet
  5. Check off tasks → Mark complete in ACTIVE-SPRINT.md
  6. Move to Sprint Backlog → When packet done, grab next

#### Daily Flow:

  - Start: Check Current Focus in ACTIVE-SPRINT.md
  - Work: Follow DEV-LIFECYCLE for that packet
  - Discover: Add found issues to appropriate section
  - End: Update STATUS-LOG with progress

#### Sprint Completion

  1. All packets done → Verify all tasks checked
  2. Create Release Notes → /docs/Release_Notes/v0.1.1.md
  3. Archive sprint content → Copy ACTIVE-SPRINT to STATUS-LOG
  4. Clear ACTIVE-SPRINT.md → Reset for next sprint
  5. Update version numbers → Production/Development in all docs


### Key Rules

  - ONE packet in Current Focus at a time
  - COMPLETE DEV-LIFECYCLE per packet before moving on
  - DOCUMENT found work immediately
  - UPDATE STATUS-LOG per packet completion
  - NEVER skip DEV-LIFECYCLE steps

---

## CLASSIFICATIONS
Use these classifications to identify each type of task. We can expand this list as needed.

🪲 - Bug
🚩 - Support Ticket Item
⚙️ - Rework
⚗️ - Testing / Review / Verify
✂️ - Cut/Postponed/Cancelled
🚀 - Feature 
📌 - Administrative / Operations

## Status Legend
- ⬜ Not Started
- 🟦 In Progress
- ✅ Complete
- ❌ Blocked
- 🟨 On Hold

## Manual Test Markings (User will mark):
- ✅ What works as expected
- ❌ What fails or doesn't work
- ⚠️ What's partially working or unclear
- 🤔 What you're unsure about



# Sprint Overview
## ------------------------------------------------ ##

### Version: v0.1.1 (development -> production)

### Goal: Solidify our platform architecture and most recent major release.

### Notes:
This sprint takes all our critical items from fixing database security issues, to segmenting out our databases for production and development, to testing and completing domain management, and verifying our last deployment works properly. This is considered a proper "follow up" to our major release in v0.1.0.



# Current Focus
## ------------------------------------------------ ##


#### [Packet] Post Deployment Clean Up & Testing
**Goal:** Clean up any broken features from our deployment bug fixes and thoroughly test all v0.1.0 functionality.


##### Domain System Testing
**Notes:** This is mission critical. We need to ensure that domains work across the board. If we can't deploy to sub domains and domains, a website builder is no use. 
- ✅ ⚗️ Test preview domains load correctly (project-slug.sites.wondrousdigital.com)
	- Fixed: Changed to use admin client to bypass RLS for public site viewing
- ✅ ⚗️ Test custom domain addition flow
	- Verified: Domain verification works with Vercel API
- ✅ ⚗️ Verify domain verification polling works
- ✅ ⚗️ Check SSL status indicators update properly
- ✅ ⚗️ Test DNS instruction copy button

##### Account & Project Dropdowns
- ✅ 🪲 Fix account switching not refreshing page context
- ✅ 🪲 Fix project switching not automatically showing new project content

##### RLS Testing
- ✅ ⚗️ Test multi-tenant RLS policies (manually tested and verified)


#### [Packet] Domain Architecture Refactor (COMPLETED)
**Goal:** Implement server-side domain architecture following industry standards
**Note:** Move all domain verification operations to server-side with admin privileges to bypass RLS restrictions
**Deliverable:** Server-side domain system with proper authentication and SSL tracking

##### Server-Side Architecture Implementation
- [✅] 🚀 Move updateDomainVerification to domains.server.ts with admin client
- [✅] 🚀 Create /api/domains/[id]/update route for server-side verification updates
- [✅] ⚙️ Refactor domain-verification.ts to use server client for all operations
- [✅] ⚙️ Update verify API route to use server-side updateDomainVerification
- [✅] ⚙️ Ensure all domain write operations are server-side only
- [✅] ⚙️ Keep client-side domain hooks read-only
- [✅] ⚗️ Test automatic verification updates work without manual intervention
- [✅] ⚗️ Verify RLS no longer blocks domain verification updates
- [✅] 📌 Document server-side domain architecture pattern

##### Database Migration
- [✅] 🚀 Create migration for ssl_state column (TEXT DEFAULT 'PENDING')
- [✅] 🚀 Create migration for verification_details column (JSONB)
- [✅] 🚀 Apply migrations to database
- [✅] ⚗️ Verify columns exist and are properly typed




# Found Work / Discovered Issues
## ------------------------------------------------ ##

### Critical (Must fix in v0.1.1)



### Non-Critical (Can defer to v0.1.2+)
- ✅ 🪲 Uses information works properly. (Fixed: API endpoint now properly increments usage count when library items are used)
- [ ] 🚀 I can permanently delete things inside lab
- [ ] ⚗️ Check grid/list view toggle persists preference (Broken, does not remember)
- [ ] ⚗️ Verify version tracking increments properly
- [ ] 🪲 Page switching does not maintain unsaved changes or give a warning.
- [❌] ⚗️ Test page status toggle (published/draft)
  - This function doesn't exist

### Technical Debt Identified
- [ ] [Code quality issues discovered during investigation]






# Sprint Backlog
## ------------------------------------------------ ##



#### [Packet] Database Security Hardening
**Goal:** Fix critical security warnings identified by Supabase linter
**Note:** These are security vulnerabilities that could be exploited and should be fixed immediately in both dev and production.
**Deliverable:** Secure database functions and auth configuration meeting security best practices

##### Function Security Fixes
- [ ] 🪲 Fix function_search_path_mutable for `generate_slug_from_email`
- [ ] 🪲 Fix function_search_path_mutable for `update_deployment_queue_updated_at`
- [ ] 🪲 Fix function_search_path_mutable for `cleanup_old_deployments`
- [ ] 🪲 Fix function_search_path_mutable for `is_system_admin`
- [ ] 🪲 Fix function_search_path_mutable for `has_role`
- [ ] 🪲 Fix function_search_path_mutable for `check_user_access`
- [ ] 🪲 Fix function_search_path_mutable for `transition_project_status`
- [ ] 🪲 Fix function_search_path_mutable for `create_user_profile`
- [ ] 🪲 Fix function_search_path_mutable for `validate_deployment_url`
- [ ] 🪲 Fix function_search_path_mutable for `debug_user_access`
- [ ] 🪲 Fix function_search_path_mutable for `get_deployment_url`
- [ ] 🪲 Fix function_search_path_mutable for `is_valid_domain`
- [ ] 🪲 Fix function_search_path_mutable for `generate_project_slug`
- [ ] 🪲 Fix function_search_path_mutable for `check_projects_policy_recursion`
- [ ] 🪲 Fix function_search_path_mutable for `check_theme_type`
- [ ] 🪲 Fix function_search_path_mutable for `update_user_profiles_updated_at`
- [ ] 🪲 Fix function_search_path_mutable for `update_netlify_site_cache_updated_at`
- [ ] 🪲 Fix function_search_path_mutable for `update_updated_at_column`

##### Extension Security
- [ ] 🪲 Move pg_net extension out of public schema

##### Auth Security Configuration
- [ ] 🚀 Enable leaked password protection in Supabase Auth settings
- [ ] 🚀 Reduce OTP expiry from current setting to under 1 hour

##### Validation & Documentation
- [ ] ⚗️ Run Supabase security linter after all fixes
- [ ] ⚗️ Verify all warnings are resolved
- [ ] 📌 Document security fix patterns for future functions
- [ ] 📌 Create migration script for all security fixes







#### [Packet] Domain System - Comprehensive Implementation
**Goal:** Build a robust domain management system that handles all DNS configurations and edge cases
**Note:** This is mission critical functionality for the website builder platform
**Deliverable:** Complete domain system with verification, SSL tracking, and comprehensive error handling

##### Domain Addition & Verification Stories
- [ ] ⚗️ As a user adding a new domain, I can add my apex domain (example.com) and see clear DNS instructions
- [ ] ⚗️ As a user adding a subdomain, I can add it (sub.example.com) and see CNAME instructions
- [ ] ⚗️ As a user with both apex and www, I can add both and link them together
- [ ] ⚗️ As a user checking verification, I see real-time status updates every 10 seconds
- [ ] ⚗️ As a user with a verified domain, I can see SSL certificate status continuously
- [ ] ⚗️ As a user with failed verification, I see specific error messages and troubleshooting steps

##### DNS Configuration Stories
- [ ] ⚗️ As a user using nameservers, I can point my entire domain to Vercel's nameservers
- [ ] ⚗️ As a user using A records, I can add the correct A record for my apex domain
- [ ] ⚗️ As a user using CNAME, I can add the correct CNAME for subdomains/www
- [ ] ⚗️ As a user with DNS propagation delays, I see estimated wait times based on my setup
- [ ] ⚗️ As a user with incorrect DNS, I get specific feedback on what's wrong

##### Domain Management Stories
- [ ] ⚗️ As a user with multiple projects, I cannot add the same domain to two projects
- [ ] ⚗️ As a user removing a domain, it's properly removed from both database and Vercel
- [ ] ⚗️ As a user with an existing Vercel domain, I can import it to my project
- [ ] ⚗️ As a user switching primary domains, redirects are set up automatically
- [ ] ⚗️ As a user with expired domains, I see appropriate warnings

##### WWW Handling Stories
- [ ] 🚀 As a user adding example.com, I'm prompted to also add www.example.com
- [ ] 🚀 As a user with both domains, I can choose which redirects to which
- [ ] 🚀 As a user, I see which is my primary domain clearly marked
- [ ] 🚀 As a user, apex↔www redirects work seamlessly in production

##### Reserved Domain Stories
- [ ] ⚗️ As Wondrous Digital account, I can add wondrousdigital.com to my marketing project
- [ ] ⚗️ As Wondrous Digital account, I can add www.wondrousdigital.com
- [ ] ⚗️ As any other account, I cannot add wondrousdigital.com (get permission error)
- [ ] ⚗️ As platform admin, I can grant reserved domain permissions to specific accounts

##### Edge Cases & Error Handling
- [ ] ⚗️ Domain already exists in another Vercel project → Clear error with options
- [ ] ⚗️ Domain already in our database → Proper duplicate handling
- [ ] ⚗️ Domain verification times out → Retry mechanism works
- [ ] ⚗️ Invalid domain format → Immediate validation feedback
- [ ] ⚗️ Vercel API down → Graceful degradation with queued operations
- [ ] ⚗️ User adds domain but doesn't verify → Reminder system after 24 hours

##### Performance & Monitoring
- [ ] 🚀 Implement domain_verification_logs table for debugging
- [ ] 🚀 Add SSL status tracking to project_domains table
- [ ] 🚀 Create domain health dashboard for platform admins
- [ ] 🚀 Set up alerts for domains losing verification

##### Developer Experience
- [ ] 📌 Document all domain-related error codes and solutions
- [ ] 📌 Create troubleshooting guide for common DNS issues
- [ ] 📌 Add domain system architecture documentation
- [ ] 📌 Create runbook for domain-related support tickets






# Sprint Log
## ------------------------------------------------ ##

### Unpublished Changes False Positives Fix - 8/4/2025 @ 1:55am
Fixed false positive issues with the "Unpublished changes" indicator:
- **Deep Equality Comparison**: Replaced fragile JSON.stringify with robust deepEqual utility
- **Change Detection**: Components now only trigger updates when content actually changes
- **User Experience**: Added ESC key handling to cancel edits without saving
- **Testing**: Added comprehensive tests for the deepEqual utility function
- The indicator now accurately reflects when there are real content changes

### Industry-Standard Architecture Refactor - 8/4/2025 @ 9:23pm
Completed a comprehensive refactor to implement industry-standard architecture patterns following WordPress Gutenberg and Webflow:

**Phase 1 - Zustand Store (Single Source of Truth)**:
- Refactored builderStore to be the primary data source for builder state
- Added isDirty flag tracking, lastSavedAt timestamps, and saveStatus management
- Removed reliance on React Query for builder state management

**Phase 2 - Auto-Save Implementation**:
- Created useAutoSave hook with 2-second debounce
- Added visual save indicators in CanvasNavbar showing saving/saved/error states
- Eliminated manual save button - all changes now save automatically
- Provides seamless editing experience without data loss

**Phase 3 - Preview Refactor**:
- Removed database fetch dependency from preview
- Preview now reads directly from Zustand store via BuilderContext
- Instant preview updates without save delays
- Fixed synchronization issues between builder and preview

**Phase 4 - Draft/Publish System**:
- Added published_sections column to pages table
- Implemented separate draft and published content streams
- Created publish workflow with dedicated button in navbar
- Live sites show published content while builder/preview show draft
- Added unpublished changes indicators

**Testing & Quality Assurance**:
- Fixed Vitest configuration (converted to .mjs, fixed ESM issues)
- All build, lint, and type checks passing
- Core functionality tests written and passing
- System ready for production use

This refactor addresses the critical content loss issues and brings the platform up to industry standards for content management systems.

### Theme System Color Fixes - 8/4/2025 @ 4:30pm
Fixed three critical theme-related bugs:
1. **Color picker not updating preview**: The ThemePreviewProvider was expecting a nested `colors` object but receiving direct theme variables. Updated to handle both formats.
2. **Colors not showing on theme cards**: HSL values were stored as space-separated ("222 47% 11%") but CSS requires comma-separated. Added conversion.
3. **Missing color swatches in dropdown**: Same HSL format issue in ThemeSelector component. Added conversion.

All theme color functionality is now working properly.

### Theme Dropdown Color Swatches - 8/4/2025 @ 5:00pm
Fixed the missing color swatches in the theme dropdown:
- **Issue**: Theme variables structure was `theme.variables.colors.primary` but code was looking for `theme.variables.primary`
- **Fix**: Updated ThemeSelector to access colors from the correct nested path
- Color swatches now properly display in the theme dropdown

### Dark Mode Text Fix & PR Merged - 8/4/2025 @ 5:50pm
- Fixed dark mode text visibility in Hero section by adding `text-foreground` classes
- Created PR #1 targeting correct deployment branch `nextjs-pagebuilder-core`
- Updated DEV-LIFECYCLE.md and CLAUDE.md with deployment branch information
- **PR #1 MERGED** - All theme fixes now deployed to production








