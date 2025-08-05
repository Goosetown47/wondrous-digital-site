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








