## ------------------------------------------------ ##
# ACTIVE SPRINT
## ------------------------------------------------ ##

## OVERVIEW

**Production Version:** v0.1.1 
**Development Version:** v0.1.2 [ACTIVE]




# -------------------------------------------------------------------------------------- #
# VERSION 0.1.2 "Critical Infrastructure"
# -------------------------------------------------------------------------------------- #

### Goal: Complete important infrastructure updates and create a database for dev.

### Notes:

Test Accounts:
- admin@wondrousdigital.com \ Password: atz_dek-nky2WBU_jav
- staff@wondrousdigital.com \ Password: tvt*gdy5aka-UTF2zfu
- owner@example.com \ Password: afq!HXC7pqk3fgv4rym
- test-user@example.com \ Password: ukc-zbr5DZT4pfb3yvf



## PACKETS ----------------------------------------------------------------------------- ##


#### [Packet] Service Layer & API Updates
**Goal:** Complete account-aware implementation gaps and fix critical infrastructure  
**Deliverable:** Fully account-aware service layer with proper audit logging
**Note:** Much of the foundation is already built - we're filling in gaps and completing partial implementations

##### Critical Infrastructure Fix

Created the Missing Audit Logs Table 📊
- [x] 🪲 Create audit_logs table migration (currently missing but referenced in code!)
  - [x] 🪲 Design table schema based on existing audit service usage
  - [x] 🪲 Create migration file with proper indexes
  - [x] 🪲 Test audit logging works after table creation

  The Problem: Your code was trying to write to an audit_logs table that didn't
  exist! Every time someone created a project, updated a page, or changed
  settings, the code tried to log it but silently failed.

  What I Did:
  - Created a proper audit_logs table in your database
  - Added security policies so users can only see logs for their own accounts
  - Platform admins can see everything (for support/debugging)

  Why It's Better:
  - You now have a complete history of who did what and when
  - Great for security compliance (some customers require this)
  - Helps with debugging ("Why did this project disappear?")
  - Enables features like "Activity Feed" for users


##### Service Layer Account Context Gaps
**Update Pages service with full account context**
The Problem: The Pages service was partially trusting that pages wouldn't be
accessed across accounts, but it wasn't actively checking. It's like having
apartment doors that usually stay locked but don't actually verify your key.

The Key Addition - verifyProjectAccess():
  This function checks:
  1. Is the user a platform admin? (They can see everything)
  2. Is the user a member of the account that owns this project?
  3. If neither, throw "Access Denied"

- [x] 🚀 Update Pages service with full account context
  - [x] 🚀 Add account_id filtering to all page queries
  - [x] 🚀 Ensure pages can't be accessed cross-account
  - [x] 🚀 Update page creation to use account context
  - [x] 🚀 Added verifyProjectAccess() function for all operations
  - [x] 🚀 Added missing functions (duplicatePage, publishPageDraft, etc.)
  - [x] 🚀 Fixed all TypeScript errors and build passes



- [x] 🚀 Add admin/staff access controls to platform APIs
  - [x] 🚀 Theme APIs now require admin/staff role (403 for regular users)
  - [x] 🚀 Core Components APIs restricted to admin/staff only
  - [x] 🚀 Library APIs restricted to admin/staff only
  - [x] 🚀 Lab APIs restricted to admin/staff only
  - [x] 🚀 All APIs return consistent 403 Forbidden for unauthorized access
  - [x] 🚀 Permission checks happen before database queries (performance)
  - [x] 🚀 Service role pattern maintained for actual queries

##### Standardize Error Handling
- [x] 🚀 Create consistent permission denied errors
  - [x] 🚀 All admin APIs return 403 with "Access denied. Admin or staff role required."
  - [x] 🚀 Consistent error format across all protected endpoints
- [x] 🚀 Security-focused error messages
  - [x] 🚀 Don't reveal why access was denied (security best practice)
  - [x] 🚀 Log access attempts to audit_logs for monitoring

##### Testing Infrastructure
- [x] 🚀 Created comprehensive API security test suite
  - [x] 🚀 Tests for unauthenticated access (401 responses)
  - [x] 🚀 Tests for regular user access (403 responses)
  - [x] 🚀 Tests for staff access (200 responses)
  - [x] 🚀 Tests for admin access (200 responses)
  - [x] 🚀 Verified permission checks happen before DB queries
  - [x] 🚀 All 20 security tests passing

##### Already Completed (Found During Scan)
- ✅ useAccount(), useAccountProjects(), useAccountUsers() hooks exist
- ✅ Permission system with hasPermission() and requirePermission()
- ✅ Account switching functionality
- ✅ Projects service has account filtering
- ✅ Basic audit logging implementation (just needs table)

##### Service Layer Summary
**What We Accomplished:**
1. **Fixed Critical Infrastructure** - Created missing audit_logs table that was causing silent failures
2. **Secured Admin APIs** - All Lab/Library/Core/Theme APIs now properly restricted to admin/staff only
3. **Maintained Performance** - Permission checks happen before DB queries, no performance impact
4. **Added Comprehensive Tests** - 20+ security tests ensure APIs can't be accessed by regular users
5. **Consistent Security Model** - Backend now enforces same restrictions as UI (no bypassing via API)

**Key Architecture Decision:**
Instead of making themes/library account-specific, we properly restricted them to admin/staff only.
This aligns with the platform design where regular users work through the Builder, not direct API access.



---

#### [Packet] User Creation Features
**Goal:** Create the ability for admins to create users for accounts manually in the admin tools area.

##### User Stories
- [x] 🚀 As a platform admin, I can create new users directly so that I can quickly set up test accounts and onboard users without email verification delays
- [x] 🚀 As a platform admin, I can specify all user details (email, password, name, role) so that users are ready to use immediately  
- [x] 🚀 As a platform admin, I can assign users to specific accounts during creation so that they have immediate access to the right resources
- [x] 🚀 As a platform admin, I can choose whether to auto-confirm email so that test users can log in immediately
- [x] 🚀 As a platform admin, I see validation errors if I enter invalid data so that I create users correctly
- [x] 🚀 As a platform admin, I see an error if I try to create a user with an existing email (edge case)
- [x] 🚀 As a platform admin, I can generate a secure random password if needed (edge case)
- [x] 🚀 As a platform admin, I can delete any user.

##### Implementation Tasks
- [x] 🚀 Pre-flight checks: Verify environment is clean (0 TypeScript/ESLint errors)
- [x] 🚀 Create `/app/api/users/create/route.ts` - Admin-only POST endpoint
- [x] 🚀 Update `/lib/services/users.ts` - Add createUser function
- [x] 🚀 Create `/app/(app)/tools/users/create/page.tsx` - User creation form
- [x] 🚀 Update users page - Change "Invite User" button to dropdown with Create/Invite options
- [x] 🚀 Implement form validation with Zod schemas
- [x] 🚀 Add password generation functionality
- [x] 🚀 Add account assignment for non-platform roles
- [x] 🚀 Add audit logging for user creation
- [x] 🪲 Fix user profile creation - Profile wasn't being created due to schema mismatch
- [x] 🚀 Add delete user functionality with proper admin controls
- [x] 🪲 Fix ESLint error in OPTIONS handler
- [x] ⚗️ Write unit tests for user creation service and API
  - [x] Created comprehensive unit tests for createUser service function (7 tests)
  - [x] Created unit tests for /api/users/create route (8 tests)
  - [x] All 15 tests passing with proper error handling and edge cases
  - [x] Fixed TypeScript errors in test files
  - [x] Fixed ESLint errors (replaced 'any' with proper types)
- [x] ⚗️ Manual testing with user for all stories
  - Created comprehensive manual test scenarios: [MANUAL-TEST-SCENARIOS.md](./MANUAL-TEST-SCENARIOS.md)
  - Covers all user stories and edge cases
  - Includes API security testing via browser console

##### Found Work During Manual Testing
- [x] 🪲 Theme API was blocking regular users from viewing themes
  - Issue: GET /api/themes was restricted to admin/staff only
  - Fix: Updated theme GET endpoints to allow all authenticated users
  - Regular users need to view themes to select them in Builder
  - Only CREATE/UPDATE/DELETE operations remain restricted to admin/staff
- [x] 🪲 Page updates failing with "0 rows returned" error
  - Issue: Missing RLS policies on pages and projects tables
  - Client-side Supabase operations were being blocked by RLS
  - Fix: Created comprehensive RLS policies for pages and projects tables
  - Policies check account membership through proper joins
  - Platform admins have full access, regular users limited to their accounts
- [x] 🪲 Console error: account_users query returning 406
  - Issue: useRole hook was incorrectly adding role as URL parameter with .eq('role', 'account_owner')
  - Fix: Removed the role filter from query, check role value after fetching
  - File: src/hooks/useRole.ts
- [x] 🪲 Console error: pages query returning 400
  - Issue: getAccountStats was querying pages table with non-existent account_id column
  - Fix: Updated query to join through projects table using projects.account_id
  - File: src/lib/services/accounts.ts

##### Found Work During Implementation
- [x] 🪲 User profiles table wasn't being populated on user creation
  - Issue: API was trying to insert non-existent columns (full_name, onboarding_completed)
  - Fix: Updated insert to match actual schema (display_name, phone, avatar_url, metadata)
- [x] 🚀 Delete user functionality requested by user
  - Added DELETE endpoint with admin-only access
  - Prevents self-deletion and deletion of other admins
  - Includes audit logging before deletion
  - ✅ User tested and confirmed it works in production

##### Test Results Summary (v0.1.2)
**Unit Tests Created and Passing:**
- ✅ User Creation Service Tests (7/7 passing)
  - Successfully create a user
  - Handle validation errors
  - Handle duplicate email error
  - Handle server errors
  - Handle JSON parsing errors
  - Handle network errors
  - Include hint in error message if available
- ✅ User Creation API Route Tests (8/8 passing)
  - Create a user successfully
  - Reject non-admin users
  - Handle validation errors
  - Handle duplicate email error
  - Require account_id for user and account_owner roles
  - Assign platform roles correctly
  - Clean up user if account assignment fails
  - Handle malformed JSON
- ✅ TypeScript: No errors (npx tsc --noEmit)
- ✅ ESLint: No errors (npm run lint)

**API Access Control Updates:**
- ✅ Fixed theme APIs to allow read access for all authenticated users
  - GET /api/themes - All users can view themes
  - GET /api/themes/[id] - All users can fetch specific theme
  - POST/PUT/DELETE - Still restricted to admin/staff only
- ✅ Other admin APIs remain properly restricted (Lab, Library, Core Components)


---


#### [Packet] Database Isolation (Supabase) 
**Goal:** Create proper isolation for our production and development databases. 
**Notes:** We currently have one single database powering development and production, which is not ideal and can cause serious issues down the road. We need to have both a development and production database that are completely in sync structurally, but utilize their own content. We need proper processes in place to handle this complexity.

##### Initial Planning & Assessment
- [ ] 📌 Document current database structure and dependencies
- [ ] 📌 Audit all environment variables across dev and production
- [ ] 📌 Create backup of current production database
- [ ] 📌 Map out all services that connect to the database
- [ ] 📌 Identify any hardcoded database connections

##### Supabase Project Setup
- [ ] ⚙️ Create new Supabase project for production
- [ ] ⚙️ Configure production project settings to match current setup
- [ ] ⚙️ Set up production authentication providers
- [ ] ⚙️ Configure production RLS policies
- [ ] ⚙️ Set up production Edge Functions (if any)

##### Migration Strategy Development
- [ ] 📌 Create migration script to copy schema from dev to prod
- [ ] 📌 Document which tables need data migration vs. fresh start
- [ ] 📌 Create data migration plan for essential data (accounts, users, etc.)
- [ ] 📌 Plan cutover strategy with minimal downtime
- [ ] 📌 Create rollback plan in case of issues

##### Environment Configuration
- [ ] ⚙️ Update .env.local with development database credentials
- [ ] ⚙️ Create .env.production with production database credentials
- [ ] ⚙️ Update Vercel environment variables for production
- [ ] ⚙️ Create environment switching mechanism for local development
- [ ] ⚙️ Update all service configurations to use correct env vars

##### Schema Synchronization Process
- [ ] 🚀 Set up migration tracking system (version control)
- [ ] 🚀 Create CI/CD pipeline for automatic migration deployment
- [ ] 🚀 Implement pre-deployment migration validation
- [ ] 🚀 Create migration rollback procedures
- [ ] 🚀 Document migration naming conventions and process

##### Data Management Procedures
- [ ] 📌 Create seed data scripts for development
- [ ] 📌 Implement data anonymization for dev database
- [ ] 📌 Set up regular production → dev sync process (schema only)
- [ ] 📌 Create data cleanup scripts for development
- [ ] 📌 Document data refresh procedures

##### Testing & Validation
- [ ] ⚗️ Test all migrations on development first
- [ ] ⚗️ Verify RLS policies work identically in both environments
- [ ] ⚗️ Test authentication flows in both environments
- [ ] ⚗️ Validate all API endpoints with new database
- [ ] ⚗️ Performance test with production-like data volume

##### Monitoring & Maintenance
- [ ] 🚀 Set up database monitoring for both environments
- [ ] 🚀 Configure backup schedules for production
- [ ] 🚀 Implement database health checks
- [ ] 🚀 Create alerts for schema drift detection
- [ ] 🚀 Set up query performance monitoring

##### Documentation & Training
- [ ] 📌 Document environment setup for new developers
- [ ] 📌 Create runbook for common database operations
- [ ] 📌 Document emergency procedures
- [ ] 📌 Create troubleshooting guide
- [ ] 📌 Update CLAUDE.md with new database setup









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