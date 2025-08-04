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

##### Theme System Testing & Fixes
- ✅ 🪲 Fix color picker functionality that's currently broken
- ✅ 🪲 Colors don't show up in the lab on the theme builder cards
- ✅ 🪲 The color picker does show up on click, but it no longer changes the preview elements in the theme builder.
- ✅ Light/dark toggle works in theme builder on preview UI
- ✅ 🪲 Border radius works in Labs theme builder
- ✅ ⚗️ Test theme application in Builder - verify CSS variables apply correctly
- ✅ ⚗️ Test theme switching - ensure themes persist when changing	
- ✅ ⚗️ Verify dark/light mode toggle works in theme preview
- ✅ ⚗️ Check theme isolation - ensure theme only applies to Canvas, not app UI

##### Lab Environment Testing
- ✅ ⚗️ Verify inline editing saves content properly
- ✅ ⚗️ Test responsive preview handles (desktop/tablet/mobile resizing)
- ✅ ⚗️ Test Lab-to-Library promotion with proper metadata

##### Library System Testing
- ✅ ⚗️ Test CRUD operations for Sites, Pages, Sections, and Themes
- ✅ ⚗️ Verify publish/unpublish toggle updates status correctly
- ✅ ⚗️ Test search functionality across all library types


##### Builder Testing
- ✅ ⚗️ Test drag-and-drop from section library to canvas
- ✅ ⚗️ Verify sections render with correct props after drop
- ✅ ⚗️ Test page saving shows success/error states
- [ ] 🪲 Fix theme selector if not showing themes properly
- [ ] 🪲 Page switching does not maintain unsaved changes or give a warning.

##### Page Management Testing
- ✅ ⚗️ Test page creation with slug generation
- ✅ ⚗️ Verify SEO metadata (title, description, OG image) saves
- ✅ ⚗️ Test page duplication creates proper copy
- ⚠️ ⚗️ Verify homepage cannot be deleted
	- We should always have a home page, but I currently can not set any other page to be the home page. The switches are greyed out. I should be able to set any page to home page. And the switch should be surfaced to the card/list item level.
- [❌] ⚗️ Test page status toggle (published/draft)
	- This function doesn't exist
- [ ] 🪲 I can see my page in preview mode in a browser window (currently doesn't work)
- [ ] 🪲 Page deletion works. It auto refreshes the listed pages and shows the proper pages listed. (this is broken)


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








