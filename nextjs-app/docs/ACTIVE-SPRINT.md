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


##### Industry-Standard Architecture Refactor

**User Stories:**

*Auto-Save Feature:*
- [ ] As a content creator, I can edit content without manually saving so that I never lose work
- [ ] As a content creator, I can see when my content is being saved so that I know my work is safe
- [ ] As a content creator, I can continue editing while auto-save happens so that my workflow isn't interrupted

*Draft/Publish System:*
- [ ] As a content creator, I can edit content without affecting the live site so that I can work safely
- [ ] As a content creator, I can publish my draft changes when ready so that I control when updates go live
- [ ] As a site visitor, I only see published content so that I don't see work-in-progress

*Preview System:*
- [ ] As a content creator, I can preview my changes instantly so that I can see exactly what I'm building
- [ ] As a content creator, I can switch between builder and preview without saving so that my workflow is fast
- [ ] As a content creator, my preview shows exactly what's in the builder so that there's no confusion

*Edge Cases:*
- [ ] As a content creator, if auto-save fails, I see a clear error so that I know to retry
- [ ] As a content creator, if I navigate away with failed saves, I get a warning so that I don't lose work
- [ ] As a content creator, if I lose connection, my local changes are preserved so that I can save when reconnected

**Implementation Tasks:**

- [✅] 🚀 Implement single source of truth with Zustand
  - [✅] Update builderStore to be the primary data source
  - [✅] Add isDirty flag to track unsaved changes
  - [✅] Add lastSavedAt timestamp tracking
- [✅] 🚀 Implement auto-save functionality
  - [✅] Create useAutoSave hook with 2-second debounce
  - [✅] Add save status indicator to Canvas navbar
  - [✅] Remove manual save button requirement
- [ ] 🚀 Implement proper draft/publish system
  - [ ] Separate draft saves from published content
  - [ ] Add "Publish Changes" button to navbar
  - [ ] Update page queries to differentiate draft/published
- [ ] 🚀 Refactor preview to use Zustand state
  - [ ] Pass builder state to preview via context
  - [ ] Remove database fetch dependency in preview
  - [ ] Ensure instant preview without save delays
- [ ] ⚙️ Update data flow architecture
  - [ ] Remove optimistic updates from React Query
  - [ ] Simplify cache invalidation logic
  - [ ] Ensure single source of truth throughout
- [ ] ⚗️ Test auto-save functionality
  - [ ] Verify changes save every 2 seconds
  - [ ] Test save indicator shows correct status
  - [ ] Ensure no data loss on navigation
- [ ] ⚗️ Test draft/publish flow
  - [ ] Verify draft changes don't affect live site
  - [ ] Test publish updates live content
  - [ ] Confirm preview shows draft content
- [✅] ⚗️ Test new preview behavior
  - [✅] Verify instant preview without save
  - [✅] Test content consistency between builder/preview
  - [✅] Ensure no cache synchronization issues





##### Account & Project Dropdowns
- [ ] 🪲 As admin, When I change the account from one to another, my current view changes to that account. (currently nothing happens. E.g., If I am on one accounts project, then switch to another account, I should only that accounts projects. Right now I am set to Test 2 account and their Test Project 1, but on Wondrous Digital's Veterinary Template 1. The side nav changes properly, but the project and canvas pages don't reset properly until I CLICK into the new page within their project. If I switch accounts from the drop down, all pages should reset to that context automatically.)
- [ ] 🪲 When I change the project drop down from one to another, the application refreshes and shows that project's content automatically.


##### Domain System Testing
- ⚠️ ⚗️ Test preview domains load correctly (project-slug.sites.wondrousdigital.com)
	- The correct preview domain shows properly listed on the settings/domains section
	- The actual subdomain upon click does NOT show any website, just a 404 page.
- ⚠️ ⚗️ Test custom domain addition flow
	- I can add a domain, and it does say Pending Verification. But I am not sure if it is actually checking anything or not.
- [ ] ⚗️ Verify domain verification polling works
- [ ] ⚗️ Check SSL status indicators update properly
- [ ] ⚗️ Test DNS instruction copy button

##### Multi-Tenant Testing
- ✅ ⚗️ Test users can only see their own account's data
- ✅ ⚗️ Verify project access controls - non-members can't access
- ✅ ⚗️ Test permission gates block unauthorized actions
- ✅ ⚗️ Verify admin tools only visible to admin/staff
- [ ] ⚗️ Test RLS policies with different user roles

##### Core Component System Testing
- [ ] ⚗️ Test manual component addition form
- [ ] ⚗️ Verify component code syntax highlighting
- [ ] ⚗️ Test component search by name and type
- [ ] ⚗️ Check dependency tracking shows correct imports
- [ ] ⚗️ Test copy code functionality




# Found Work / Discovered Issues
## ------------------------------------------------ ##

### Critical (Must fix in v0.1.1)



### Non-Critical (Can defer to v0.1.2+)
- [ ] 🪲 Uses information works properly. (The count on the cards about how many times something in the library is being used. We have our theme's applied and in use, and its not counting.)
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






# Sprint Log
## ------------------------------------------------ ##

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








