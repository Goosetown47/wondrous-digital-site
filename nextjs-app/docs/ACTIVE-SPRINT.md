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
- [ ] 🪲 Fix "Access Denied" issue for account_owners accessing Team Members tab
- [ ] 🚀 Display all users AND account_owners in the team list
- [ ] 🚀 Show role badges for each team member (Account Owner vs User)
- [ ] 🚀 Enable account_owners to invite new team members
- [ ] 🚀 Allow account_owners to change user roles
- [ ] 🚀 Allow account_owners to remove users from account
- [ ] 🚀 Add bulk selection actions for managing multiple users

**Per-Project Access Control:**
- [ ] 🚀 Create project access matrix showing which users can access which projects
- [ ] 🚀 Add "Manage Access" button on each project for account_owners
- [ ] 🚀 Create modal to grant/revoke project access for specific users
- [ ] 🚀 Update project list to show only accessible projects for regular users
- [ ] 🚀 Add project access indicators in user list

**Sidebar Account Button Improvements:**
- [ ] 🚀 Replace email with user's Full Name from profile
- [ ] 🚀 Add role badge/pill under the name (Account Owner/User/Admin)
- [ ] 🚀 Improve button styling to show it's clickable
- [ ] 🚀 Add hover state and better visual design
- [ ] 🚀 Ensure account settings panel opens correctly

**Database/Backend Updates:**
- [ ] 🚀 Create project_users table for per-project permissions
- [ ] 🚀 Add RLS policies for project-level access control
- [ ] 🚀 Update queries to respect project permissions


### [PACKET] User Profile Fix
**Goal:** Fix missing user profiles for existing users
**Deliverable:** All users have editable profiles

- [ ] 🪲 Create missing user_profiles entries for existing users
- [ ] 🚀 Add profile creation trigger for new users
- [ ] ⚗️ Verify profile form elements are accessible


### [PACKET] Plan Management for Manual Billing
**Goal:** Allow admins to manually manage customer plans
**Deliverable:** Admin interface for plan assignment

- [ ] 🚀 Add plan selector to account settings (admin only)
  - Plans: [Basic Web Subscriptions: FREE, BASIC($29/month)], 
           [Marketing Platform: PRO ($397/month), MAX ($697/month), SCALE ($997/month)]
- [ ] 🚀 Create addons management interface
           [GEO/SEO Package: PERFORM ($459/month)]
- [ ] 🚀 Add one-time fee tracking
  - Platform Setup Fee ($1500)
  - SEO Setup Fee ($750)
- [ ] 🚀 Add billing notes field for manual tracking


### [PACKET] Essential Account Management
**Goal:** Core functionality for managing 25 accounts
**Deliverable:** Basic account and project management tools

**Account Safety**
- [ ] 🚀 Require 2-step process for DELETE accounts (suspend first)
- [ ] 🚀 Require typed "DELETE" confirmation in modal

**Project Details**
- [ ] 🪲 Fix "Created by" to use user_profiles/display_name (currently shows raw user ID)
- [ ] 🚀 Show configured domains in project details

**UI Cleanup**
- [ ] 🪲 Fix contact information display in Overview tab (currently empty/incomplete)
- [ ] 🚀 Move "back" link above HEADER
- [ ] 🪲 Remove/fix redundant edit button in settings view

**Sign Up**
- [ ] ✂️ Remove public signup from login form (already disabled but may have leftover link)



### [PACKET] Tools Area - AccountUsers Component
**Goal:** Replace placeholder with functional user management
**Deliverable:** Working user list and management in Tools area

- [ ] 🚀 Implement actual user listing in /tools/accounts/[id]/components/AccountUsers
- [ ] 🚀 Add role management functionality
- [ ] 🚀 Connect to invitation system
- [ ] 🚀 Add remove user functionality


### [PACKET] Bug Fixes

- [ ] 🪲 Users table doesn't auto-refresh without a page reload when something changes
- [ ] 🪲 The users select div with "change role" and "remove from account" and clear selection options needs to have consistent looking buttons instead of just text or buttons
- [ ] 🪲 The users select div with "change role" and "remove from account" and clear selection stays active even when the selected item in the list is no longer there (e.g., I deleted it) (it works if I deselect it) -- It should actively check if something is selected or not, then respond accordingly
- [ ] 🪲 Project Settings / General tab: The Preview Domain still has ".sites" in it and we don't use that sub sub domain anymore. The Domains tab is correct
- [ ] 🪲 Toast notifications often double up (we get two at the same time, duplicates). This happens for many actions across the app.



### [PACKET] Build Warnings

- [ ] ⚠ Linting is disabled. (Should it be?)
      ⚠ Warning: Found multiple lockfiles. Selecting
- [ ] /home/goosetown/package-lock.json. Consider removing the lockfiles at:
        * /home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/package
     -lock.json
        * /home/goosetown/Claude/Projects/wondrous-digital-site/package-lock.json
      (Should we fix this?)
- [ ] ⚠ What is the source of these issues we see every build? Should we fix them?
     <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (108kiB)
     impacts deserialization performance (consider using Buffer instead and decode
      when needed)
     <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (154kiB)
     impacts deserialization performance (consider using Buffer instead and decode
      when needed)
     <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (139kiB)
     impacts deserialization performance (consider using Buffer instead and decode
      when needed)
     <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (138kiB)
     impacts deserialization performance (consider using Buffer instead and decode
      when needed)



## MANUAL TESTS ----------------------------------------------------------------------------- ##

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