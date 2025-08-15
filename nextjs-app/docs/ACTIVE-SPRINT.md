## ------------------------------------------------ ##
# ACTIVE SPRINT
## ------------------------------------------------ ##

## OVERVIEW

**Production Version:** v0.1.3 
**Development Version:** v0.1.4 [ACTIVE]





# -------------------------------------------------------------------------------------- #
# VERSION 0.1.4 "Final Account Managmenet Features"
# -------------------------------------------------------------------------------------- #


### Goal: Finalize all our missing account management and admin features (needed for MVP)

### Notes:
Our initial MVP status launch will be aimed at getting to 25 customers as quickly as we can. We need to ensure all the features in our TOOLS section is finalized and up to date. We also need to ensure that our basic features in Account Management for account_owners is set up properly.



## PACKETS ----------------------------------------------------------------------------- ##


### [PACKET] User Invitation System ✅ COMPLETE
**Goal:** Complete the invitation acceptance flow and ensure proper email branding
**Deliverable:** Working end-to-end invitation system for manual user onboarding

**Implementation:**
- [x] 🚀 Created complete invitation database schema with RLS policies
- [x] 🚀 Built invitation service layer (lib/services/invitations.ts)
- [x] 🚀 Created /invitation page with comprehensive status handling
- [x] 🚀 Created /profile/setup page for new user signup from invitation
- [x] 🚀 Created /auth/verify-email-pending page for email verification flow
- [x] 🚀 Implemented all invitation API routes (accept, decline, resend, cancel)
- [x] 🚀 Connected "Invite User" button in AccountUsers component
- [x] 🚀 Added invitation management UI (view, resend, cancel in dropdown)
- [x] 🚀 Integrated Resend for branded invitation emails
- [x] 🚀 Updated invitation expiration from 7 days to 48 hours
- [x] 🪲 Fixed UX - replaced "Return Home" buttons with help email message
- [x] 🪲 Fixed email sending service - switched from queued to direct sending via Resend
- [x] 🪲 Fixed Supabase redirect URLs for preview deployments
- [x] 🪲 Fixed invitation acceptance flow - moved to login where session exists
- [x] 🚀 Created user_profiles table with migration and RLS policies
- [x] 🚀 Built welcome interstitial page (/profile/welcome) for first-time invited users
- [x] 🚀 Added personalized dashboard welcome using display_name from user_profiles
- [x] 🪲 Fixed profile_completed flag to ensure welcome page shows for new users

**Testing Completed:**
- [x] ⚗️ Tested full invitation flow from send to acceptance
- [x] ⚗️ Verified new user signup flow with email verification
- [x] ⚗️ Verified existing user acceptance flow
- [x] ⚗️ Tested all edge cases (expired, cancelled, already accepted, wrong user, invalid token)
- [x] ⚗️ Verified role assignment (user vs account_owner)
- [x] ⚗️ Verified all emails are Wondrous branded via Resend
- [x] ⚗️ Confirmed database records update correctly
- [x] ⚗️ End-to-end testing of complete invitation flow in production environment


### [PACKET] Account Owner User Management
**Goal:** Enable account owners to manage their team members and control project access
**Deliverable:** Full user management interface for account owners with per-project permissions

**Team Members Tab Features:**
- [x] 🪲 Fix "Access Denied" issue for account_owners accessing Team Members tab
- [x] 🚀 Display all users AND account_owners in the team list
- [x] 🚀 Show role badges for each team member (Account Owner vs User)
- [x] 🚀 Enable account_owners to invite new team members
- [x] 🚀 Allow account_owners to change user roles
- [x] 🚀 Allow account_owners to remove users from account
- [x] ✂️ Add bulk selection actions for managing multiple users (Not needed for MVP)

**Per-Project Access Control:**
- [x] 🚀 Create project access matrix showing which users can access which projects
- [x] 🚀 Add "Manage Access" button on each project for account_owners
- [x] 🚀 Create modal to grant/revoke project access for specific users
- [x] 🚀 Update project list to show only accessible projects for regular users
- [x] 🚀 Add project access indicators in user list (implemented as dropdown in Team Members)

**Sidebar Account Button Improvements:**
- [x] 🚀 Replace email with user's Full Name from profile
- [x] 🚀 Add role badge/pill under the name (Account Owner/User/Admin)
- [x] 🚀 Improve button styling to show it's clickable
- [x] 🚀 Add hover state and better visual design
- [x] 🚀 Ensure account settings panel opens correctly

**Database/Backend Updates:**
- [x] 🚀 Create project_users table for per-project permissions
- [x] 🚀 Add RLS policies for project-level access control
- [x] 🚀 Update queries to respect project permissions

**Admin Tools Enhancement (COMPLETED):**
- [x] 🚀 Created complex Account Assignment Dropdown for Tools/Users section
- [x] 🚀 Implemented wireframe design with selector box and expandable dropdown (650px width)
- [x] 🚀 Added Active Accounts section with role/primary/access controls
- [x] 🚀 Added Available Accounts section with filters and search
- [x] 🚀 Enabled ADMIN/STAFF to manage user-account relationships
- [x] 🚀 Gave admins absolute control for security situations
- [x] 🪲 Fixed all TypeScript errors and React hooks violations
- [x] 🚀 Created centralized RoleBadge component for UI consistency


### [PACKET] Final Account Fixes & Updates
*These are the final clean up tasks we need to complete before moving on to the next release*

**User Profiles**
- [x] 🪲 Create missing user_profiles entries for existing users
- [x] 🚀 Add profile creation trigger for new users
- [x] ⚗️ Verify profile form elements are accessible

**Settings**
- [x] ⚠ This section in Settings (this is the link in the dropdown connected to the account at the bottom of the sidebar) has nothing really in it. It's placeholder. We either need to comment it out until we do something, or add some functionality.
- [x] ⚠ Check the Security tab. We should remove the two factor auth and active sessions, but should fix the change password functionality.
- [x] ⚠ The items in profile should work - a way to change your email and display name.
- [x] ⚠ We should make the avatar photo work. We'll need to set up a bucket on supabase to hold the user images.

**Project Details**
- [x] 🪲 Fix "Created by" to use user_profiles/display_name (currently shows raw user ID)
  This is in the Tools/Projects/Settings view. The overview tab has "Created by" b9c3e24e-c5da-491d-90c5-f733d8bd7c77 which isn't helpful info.

**UI Cleanup**
- [ ] 🚀 Move "back" link above HEADER
- [x] 🪲 Remove/fix redundant edit button in settings view
- [x] 🪲 Temporarily comment out the Account Management / Account Settings item in sidebar nav as it is unfinished and doesn't have a page. Also it's redundant and in drop-up for the account selector at the bottom.

**Bug Fixes**
- [x] 🪲 Users table doesn't auto-refresh without a page reload when something changes
- [ ] 🪲 [Management/Tools/Users/Multiple Users Selected / Action box] The users select div with "change role" and "remove from account" and clear selection options needs to have consistent looking buttons instead of just text or buttons
- [x] 🪲 The users select div with "change role" and "remove from account" and clear selection stays active even when the selected item in the list is no longer there (e.g., I deleted it) (it works if I deselect it) -- It should actively check if something is selected or not, then respond accordingly
- [x] 🪲 Project Settings / General tab: The Preview Domain still has ".sites" in it and we don't use that sub sub domain anymore. The Domains tab is correct
- [x] 🪲 Toast notifications often double up (we get two at the same time, duplicates). This happens for many actions across the app.
- [x] 🪲 In library, the unpublished / all toggle looks janky. It's not a real toggle component and should be.
- [x] 🪲 In Lab, the pill boxes that contain the tag for what an item is (theme, section, etc.) has dark text on a relatively dark color bg. We should keep the color bg but make the text white or a light version of the color to create proper contrast.

**Staff Assignments** 
- [x] ✂️ Let's comment out Staff Assignments pages right now. There is "Staff/ My Assignments" and "Management / Tools / Staff Assignments" pages. We can keep them in the codebase but remove them from the navigation. We're going to address these way down the road when we hire employees. Could be a year potentially. Don't delete the functionality or the role, but let's just remove it from the UI or comment it out for later.


**Build Warnings (DISCUSS THIS)**
*Do we need to take care of these things? I want to have a discussion*
- [x] ⚠ Linting is disabled. (Should it be?)
      ⚠ Warning: Found multiple lockfiles. Selecting
- [x] /home/goosetown/package-lock.json. Consider removing the lockfiles at:
        * /home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/package
     -lock.json
        * /home/goosetown/Claude/Projects/wondrous-digital-site/package-lock.json
      (Should we fix this?)





## MANUAL TESTS ----------------------------------------------------------------------------- ##

### Account Owner User Management Testing

**Team Management Stories:**
- [x] As an account_owner, I can view all team members (both users and other account_owners) in the Team Members tab
- [x] As an account_owner, I can invite new team members with either user or account_owner role
- [x] As an account_owner, I can change a user's role between user and account_owner
- [x] As an account_owner, I can remove users from my account

**Project Access Stories:**
- [x] As an account_owner, I can see a matrix showing which users have access to which projects
- [x] As an account_owner, I can click "Manage Access" on any project to control who can access it
- [x] As a regular user, I only see projects I have been granted access to
- [x] As an account_owner, I can see project access indicators in the user list

**UI Enhancement Stories:**
- [x] As any user, I see my full name instead of email in the sidebar account button
- [x] As any user, I see a role badge (Account Owner/User/Admin) under my name
- [ ] As any user, I can clearly see the account button is clickable with proper hover states

**Edge Cases:**
- [ ] As an account_owner trying to remove the last account_owner, I see an error preventing this
- [ ] As a user without access to any projects, I see a helpful message instead of an empty list

### User Invitation System Testing ✅ COMPLETE

**Core Stories:**
- [x] As a new user, I can click an invitation link in my email and see a welcoming page that explains what I'm being invited to
- [x] As a new user, I can create an account from the invitation page and automatically join the account
- [x] As an existing user, I can log in from the invitation page and accept the invitation
- [x] As an invited user, I can see the account name, who invited me, and what role I'll have
- [x] As an invited user, I can decline an invitation if I don't want to join

**Edge Cases:**
- [x] As a user with an expired invitation, I see a clear message that the invitation has expired with help email
- [x] As a user with an invalid token, I see an error message with help email
- [x] As a user already in the account, I see a message that I'm already a member with "Go to Accounts" button
- [x] As a logged-in user visiting an invitation for my email, I can accept without re-logging in

**Additional Edge Cases Tested:**
- [x] As a user with a cancelled invitation, I see a clear message that it's been cancelled with help email
- [x] As a logged-in user visiting an invitation for a different email, I see a warning to log out and use correct email
- [x] Invitation expiration changed from 7 days to 48 hours and verified in new invitations
- [x] All error states show help email (hello@wondrousdigital.com) instead of "Return Home" button














## SPRINT LOGS ----------------------------------------------------------------------------- ##

- ✅ **Completed entire User Invitation System packet**
  - Built complete invitation infrastructure from scratch
  - Created /invitation, /profile/setup, and /auth/verify-email-pending pages
  - Implemented full API layer with accept, decline, resend, cancel functionality
  - Integrated Resend for branded email notifications
  - Connected AccountUsers component with invitation management UI
  - Updated invitation expiration from 7 days to 48 hours per requirements
  - Improved UX by replacing "Return Home" buttons with help email contact

- ✅ **Fixed critical email delivery issues**
  - Discovered email queue wasn't processing (no worker/cron job)
  - Switched from queueEmail() to sendEmail() for immediate delivery
  - Verified emails now send immediately with proper Resend branding

- ✅ **Fixed Supabase authentication redirects**
  - Identified Site URL misconfiguration (was localhost:3000)
  - Updated to production URL for proper email confirmations
  - Added emailRedirectTo parameter for dynamic preview URLs

- ✅ **Resolved invitation acceptance bug**
  - Root cause: Server-side /auth/confirm had no session after email verification
  - Moved invitation acceptance to login flow where session exists
  - Users now correctly join invited accounts instead of creating new ones

- ✅ **Implemented welcome interstitial for invited users**
  - Created /profile/welcome page with account context
  - Shows who invited them, their role, and account details
  - Profile setup form with display name, phone, avatar upload
  - "Skip for Now" option for quick access
  - Created user_profiles table with proper RLS policies

- ✅ **Added personalized dashboard experience**
  - Dashboard now shows "Welcome, [Name]" using display_name
  - Fetches from user_profiles with fallback to email prefix
  - Profile_completed flag ensures welcome page shows once

- 🔧 **Database migrations applied:**
  - 20250815_000001_create_invitation_system.sql
  - 20250816_000001_fix_invitation_account_access.sql  
  - 20250817_000001_fix_account_users_security.sql
  - 20250818_000001_create_user_profiles.sql (with profile_completed flag)

- ✅ **Production testing completed successfully**
  - Full end-to-end flow tested on Vercel preview
  - Invitation → Signup → Email Verification → Welcome → Dashboard
  - All edge cases working correctly

- ✅ **Thoroughly tested all invitation scenarios**
  - New user signup flow with email verification
  - Existing user acceptance flow
  - All edge cases: expired, cancelled, already accepted, wrong user, invalid token
  - Role assignment verification (user vs account_owner)
  - Database record integrity confirmed

- 🔧 **Issues found and fixed:**
  - Replaced unhelpful "Return Home" buttons with support email contact
  - Adjusted invitation expiration to 48 hours (was 7 days)
  - All tests passing, no outstanding issues

- ✅ **Account Owner User Management Progress**
  - Fixed critical permission system bug (hasPermission function incorrectly joining tables)
  - Implemented proper API routes with service role for role updates (PATCH) and user removal (DELETE)
  - Created reusable RoleBadge component for consistent UI across application
  - Built complex Account Assignment Dropdown matching user's wireframe design
  - Enabled admin absolute control for emergency account management situations
  - Manual Tests 1-4: All passed after fixes
  - Manual Test 5: Skipped (bulk actions not needed for MVP per user decision)
  - Manual Test 6-9: Pending (Project access UI not built for account owners yet)

- 🔧 **Technical Fixes Applied Today:**
  - Permission system: Fixed hasPermission to use separate queries instead of incorrect join
  - API Routes: Added PATCH/DELETE methods in /api/accounts/[id]/users/route.ts with service role
  - UI Components: Created /components/ui/role-badge.tsx for consistency
  - Admin Controls: Removed all restrictions for absolute admin power in dropdown
  - Fixed TypeScript errors with role type assertions
  - Fixed React hooks violations (hooks before early returns)

- ✅ **Project Access UI Implementation Complete (Jan 20, 2025)**
  - Created useAccountProjects hook for fetching projects with access status
  - Created ProjectAccessDropdown component based on AccountAssignmentDropdown pattern
  - Integrated dropdown into Team Members page as new "Project Access" column
  - Dropdown shows project count (e.g., "3 Projects", "All Projects", "No Access")
  - Account owners see read-only count (implicit access to all)
  - Regular users can toggle individual project access via checkboxes
  - Full data isolation - only shows projects from current account
  - Manual Tests 6-9: All completed successfully
  - TypeScript: ✅ NO ERRORS
  - ESLint: ✅ NO NEW ERRORS

- ✅ **Project Access UI Enhancements & Fixes (Jan 20, 2025)**
  - Fixed dropdown cutoff issue by converting to Popover component with portal rendering
  - Fixed dynamic UI updates - added correct query key invalidation for real-time updates
  - Resolved database security issues:
    - Fixed view `project_access_view` SECURITY DEFINER error with `WITH (security_invoker = on)`
    - Fixed function `has_project_access` search_path warning with `SET search_path = public, pg_temp`
    - Fixed function `get_project_access_for_account` search_path warning
  - Applied 3 security migrations successfully to DEV database
  - Full testing completed:
    - ✅ Account owners can grant/revoke project access for users
    - ✅ Regular users only see projects they have access to
    - ✅ Changes update immediately without page refresh
    - ✅ All security issues resolved in Supabase dashboard















# ------------------------------------------------ #
# PROCESS & RULES
# ------------------------------------------------ #

## ---------------------------------------------- ##
# Sprint Process Guide (for reference)

## Sprint Planning (Start of Sprint)

  1. [User will] Review BACKLOG.md → Pull priority items into ACTIVE-SPRINT.md
  2. [User will] Set version number → Decide scope (major.minor.patch)
  3. [User will] Move packets → Cut H4 sections from BACKLOG to ACTIVE-SPRINT
  4. [User will] Order packets → Arrange by priority/dependency


## During Sprint Execution

### Per Packet Workflow:

  1. Follow DEV-LIFECYCLE.md → Full/Fast Track/Emergency mode per packet
  2. As you discover issues → Add to "Found Work" section:
    - Critical → Must fix in current version
    - Non-Critical → Defer to next version
    - Tech Debt → Document for future
  3. Update ACTIVE-STATUS.md → Log progress after each packet
  4. Check off tasks → Mark complete in ACTIVE-SPRINT.md
  5. [User will] Move to Sprint Backlog → When packet done, grab next

### Daily Flow:

  - Start: Check Current Focus in ACTIVE-SPRINT.md
  - Work: Follow DEV-LIFECYCLE for that packet
  - Discover: Add found issues to appropriate section
  - End: Update ACTIVE-SPRINT with progress

### Sprint Completion

  1. All packets done → Verify all tasks checked
  2. Create Release Notes → /docs/Release_Notes/v0.1.1.md
  3. [User will] Archive sprint content → Copy ACTIVE-SPRINT to STATUS-LOG
  4. [User will] Clear ACTIVE-SPRINT.md → Reset for next sprint
  5. [User will] Update version numbers → Production/Development in all docs


## Key Rules

  - COMPLETE DEV-LIFECYCLE per packet before moving on
  - DOCUMENT found work immediately
  - NEVER skip DEV-LIFECYCLE steps

## ---------------------------------------------- ##


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