## ------------------------------------------------ ##
# ACTIVE SPRINT
## ------------------------------------------------ ##

## OVERVIEW

**Production Version:** v0.1.2 
**Development Version:** v0.1.3 [ACTIVE]




# -------------------------------------------------------------------------------------- #
# VERSION 0.1.3 "Security Hardening"
# -------------------------------------------------------------------------------------- #

### Goal: Complete the most important security updates we absolutely need before we launch in MVP 1.0 status.

### Notes:
Our initial MVP status launch will be aimed at getting to 25 customers as quickly as we can. We will not allow public sign ups until we're probably north of 50 customers on the platform and have time to polish the platform to a point the public may really want to sign up for it.



## PACKETS ----------------------------------------------------------------------------- ##



### [PACKET] MVP Security Essentials
  **Goal:** Implement minimum viable security for manual user management
  **Deliverable:** Platform secure enough for 25 manually-managed customers

  ##### Critical XSS Prevention
  - [x] 🚀 Install and configure DOMPurify
  - [x] 🪲 Fix innerHTML usage in preview routes
  - [x] 🚀 Add basic input sanitization to all forms
  - [x] 🚀 Add length limits to prevent overflow attacks

  ##### Essential Security Headers
  - [x] 🚀 Implement basic security headers middleware
  - [x] 🚀 Configure secure cookies
  - [x] 🚀 Set up HSTS for production

  ##### RLS Verification
  - [x] ⚗️ Test cross-tenant data isolation (manually verified by user)
  - [x] ⚗️ Verify users can't access other accounts (manually verified by user)
  - [x] ⚗️ Test admin access patterns work correctly (manually verified by user)
  - [x] 🚀 Fix any RLS gaps found (no gaps found)

  ##### Authentication Basics
  - [x] 🚀 Implement password reset flow (using Resend with branded emails)
  - [x] 🚀 Add session timeout (basic - configured in security headers)
  - [x] 🚀 Remove public signup (as you mentioned)



## MANUAL TESTS ----------------------------------------------------------------------------- ##

### XSS Prevention Stories:
- [x] **As a platform admin**, I can trust that user-generated content (project names, descriptions) is sanitized so that XSS attacks cannot execute
- [x] **As a platform admin**, I can safely preview customer websites without risk of malicious scripts executing in my browser
- [x] **As any user**, I cannot inject scripts through form fields that would affect other users

### Security Headers Stories:
- [⚠️] **As a platform user**, my session cookies are protected with httpOnly and secure flags so they can't be stolen via JavaScript
  - *Note: Supabase auth cookies cannot be HttpOnly by design (client needs access for token refresh). SameSite=Lax is set for CSRF protection, and we have comprehensive XSS prevention.*
- [x] **As a platform user**, I am protected from clickjacking attacks when using the application
- [x] **As a platform admin**, the production site enforces HTTPS via HSTS headers

### RLS/Access Control Stories:
- [x] **As a regular user**, I cannot access data from accounts I don't belong to
- [x] **As a regular user**, I cannot see other users' projects or settings
- [x] **As a platform admin**, I can access all accounts and projects for support purposes
- [x] **As an account owner**, only I and platform admins can see my account's sensitive data

### Authentication Stories:
- [x] **As a user who forgot my password**, I can request a password reset link via email
- [x] **As a visitor**, I cannot sign up for a new account (signup is disabled for MVP)
- [x] **As a platform admin**, I can manually create accounts for our 25 initial customers

### Edge Cases:
- [x] **As a malicious user**, I cannot overflow form fields to cause database errors or crashes
- [x] **As a user**, I see appropriate error messages when security validations fail




## SPRINT LOGS ----------------------------------------------------------------------------- ##

### Day 1 - Starting v0.1.3 Security Sprint
- ✅ Completed pre-flight checklist - environment is clean (2 TypeScript errors in test files, warnings only in lint)
- ✅ Dev server running on port 3001
- ✅ Created and documented 16 user stories for security features
- ✅ XSS Prevention Phase Complete:
  - Installed DOMPurify and isomorphic-dompurify
  - Created comprehensive sanitization utilities in /lib/sanitization.ts
  - Fixed innerHTML usage in preview route with proper sanitization
  - Added input sanitization and length limits to auth schemas
  - Updated AccountSettings and user creation schemas
  - Fixed lint errors after course correction
  - Added 33 tests for sanitization utilities (all passing)
  - Added 11 tests for auth schemas (all passing)
- ✅ Security Headers & Cookies Phase Complete:
  - Created security-headers.ts with comprehensive header configuration
  - Integrated security headers into middleware for all responses
  - Configured secure cookies with httpOnly, secure, and sameSite settings
  - Added HSTS for production environments
  - Added CSP (Content Security Policy) with appropriate settings
  - Added 17 tests for security headers (all passing)
- ✅ Authentication Updates:
  - Removed public signup link from login page
  - Created signup disabled page with informative message
  - Kept signup route accessible but shows "invitation only" message
- ✅ Password Reset Flow Complete:
  - Created branded password reset email template using BaseEmailTemplate
  - Implemented password reset API using Resend (not Supabase default emails)
  - Created forgot password page with rate limiting (3 attempts per hour)
  - Created update password page with password strength indicator
  - Updated auth confirm route to handle recovery tokens
  - Added "Forgot Password?" link to login page
  - Fixed TypeScript and lint errors
- ✅ Session timeout already configured (30 minutes in security-headers.ts)
- ✅ All MVP Security Essentials packet tasks completed!



### Day 2 - Completed a HARD reset of the DEV database and created a complete copy of the PROD database.
#### Notes:
Then replaced existing DEV database with the copy of PROD so they are now 100% in sync. I worked with Claude Opus 4.1 in the Desktop application to complete these tasks. Everything is verified and working properly.

### Day 3 - XSS Prevention Testing & Fixes
- ✅ Fixed XSS validation across all input fields:
  - Enhanced sanitization to detect encoded HTML entities (e.g., `&lt;script&gt;`)
  - Fixed client-side sanitization that was preventing proper validation messages
  - Added comprehensive server-side validation for all create/update operations
  - Implemented `wouldBeSanitized()` function to detect HTML without modifying input
- ✅ Completed manual testing of XSS prevention:
  - Project creation/update: PASSED (rejects scripts, shows field-specific errors)
  - User creation: PASSED (properly validates full name, display name)
  - Account creation/update: PASSED (validates name, slug, description)
  - Preview display: PASSED (safe rendering, no script execution)
- ✅ Fixed lab preview route (direct DB access instead of HTTP round-trip)
- ✅ Fixed user deletion to properly CASCADE delete from all related tables
- ✅ All XSS Prevention user stories verified and working
- ✅ Edge cases handled: overflow attacks prevented, clear error messages shown

### Day 3 (cont.) - Security Headers Verification
- ✅ Verified security headers implementation:
  - X-Frame-Options: DENY (clickjacking protection) 
  - X-Content-Type-Options: nosniff
  - Content-Security-Policy configured
  - HSTS configured for production
  - All headers applied via middleware
- ⚠️ Important finding: Supabase auth cookies cannot be HttpOnly by design
  - This is intentional - client JavaScript needs access for token refresh
  - Mitigation: SameSite=Lax is set (CSRF protection)
  - Mitigation: Comprehensive XSS prevention already implemented
- ✅ All Security Headers stories verified (with noted limitation)

Here are the notes from Claude Opus 4.1 Desktop:
# Database Synchronization Report
**Date**: August 13, 2025  
**Project**: wondrous-digital-site (Next.js on Vercel with Supabase)

## Executive Summary
Successfully synchronized DEV database with PROD database. Both environments now have identical schemas, data, and configurations. DEV database was having issues and has been completely replaced with a copy of the working PROD database.

## Environment Details

### PROD Database
- **Project ID**: `bpdhbxvsguklkbusqtke`
- **Region**: us-east-2
- **Status**: ✅ Working correctly
- **Direct Connection**: `postgresql://postgres:[PASSWORD]@db.bpdhbxvsguklkbusqtke.supabase.co:5432/postgres`
- **Session Pooler**: `postgresql://postgres.bpdhbxvsguklkbusqtke:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres`

### DEV Database
- **Project ID**: `hlpvvwlxjzexpgitsjlw`
- **Region**: us-east-2
- **Status**: ✅ Now working (exact copy of PROD)
- **Direct Connection**: `postgresql://postgres:[PASSWORD]@db.hlpvvwlxjzexpgitsjlw.supabase.co:5432/postgres`
- **Session Pooler**: `postgresql://postgres.hlpvvwlxjzexpgitsjlw:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres`

## Problem Solved
1. DEV database was out of sync and problematic
2. Migrations were inconsistent between environments
3. Local migration files didn't match database state
4. Authentication users and account_users tables were mismatched

## Actions Performed

### 1. Database Backup
Created complete backup of PROD database:
```bash
pg_dump "postgresql://postgres.bpdhbxvsguklkbusqtke:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres" > prod-complete.sql
```
- **Location**: `~/prod-backup/prod-complete.sql`
- **Note**: Used Session Pooler URL to avoid IPv6 connectivity issues

### 2. DEV Database Reset
Completely cleared DEV database:
```sql
DROP SCHEMA public CASCADE; 
CREATE SCHEMA public;
```
This removed 34 objects including tables, functions, and policies.

### 3. Database Restoration
Restored PROD backup to DEV:
```bash
psql "postgresql://postgres.hlpvvwlxjzexpgitsjlw:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres" < prod-complete.sql
```

### 4. Authentication Data Sync
- Cleared DEV auth.users table (CASCADE deleted related tables)
- Restored auth.users from PROD
- Separately restored account_users table data

### 5. File Organization
- Created backup directory: `~/database-backups/`
- Backed up entire supabase folder: `~/database-backups/supabase-backup-20250813/`
- Cleaned up redundant migration folders (migrations-backup, migrations-clean)
- Restored original migration files

## Current State

### Database Synchronization
✅ DEV and PROD databases are identical:
- Same table structures
- Same data
- Same RLS policies  
- Same functions and triggers
- Same auth users
- Same account_users relationships

### Migration Files
**Location**: `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/supabase/migrations/`

**Current Migrations** (21 files total):
1. `20250112_add_foreign_key_constraints.sql` (4 KB)
2. `20250113_add_missing_foreign_keys_safe.sql` (9 KB)
3. `20250813_000001_add_has_role_function.sql` (1 KB)
4. `20250814_000001_fix_account_users_rls.sql` (3 KB)
5. `20250809230000_initial_baseline_fixed.sql` (2 KB)
6. `20250809231000_add_www_project_domain.sql` (2 KB)
7. `20250810000000_create_audit_logs_table.sql` (5 KB)
8. `20250810200000_fix_function_search_paths_security.sql` (13 KB)
9. `20250810201000_move_pg_net_extension.sql` (2 KB)
10. `20250810202000_auth_security_settings.sql` (3 KB)
11. `20250810203000_fix_rls_security_checks.sql` (2 KB)
12. `20250810204000_force_fix_function_search_paths.sql` (4 KB)
13. `20250810205000_recreate_functions_with_search_path.sql` (7 KB)
14. `20250810210000_clean_sweep_orphaned_functions.sql` (3 KB)
15. `20250810211000_final_cleanup_orphaned_functions.sql` (1 KB)
16. `20250810212000_drop_correct_function_signatures.sql` (1 KB)
17. `20250810213000_placeholder_audit_logs_duplicate.sql` (1 KB)
18. `20250811000000_fix_account_users_role_constraint.sql` (1 KB)
19. `20250811230000_add_pages_rls_policies.sql` (4 KB)
20. `20250811231000_add_projects_rls_policies.sql` (4 KB)
21. `20250812000000_remove_broken_theme_check_function.sql` (2 KB)

### File Structure
```
/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/
├── supabase/
│   ├── migrations/         (21 migration files - current source of truth)
│   ├── config.toml         (Supabase configuration)
│   └── seed.sql           (Seed data if any)
├── .temp/                  (Temporary files)
├── scripts/                (Build/deployment scripts)
└── State/                  (Application state)

~/database-backups/
└── supabase-backup-20250813/  (Complete backup of supabase folder)

~/prod-backup/
└── prod-complete.sql      (PROD database dump)
```

## Important Notes

### Connection Issues Resolved
- **Problem**: IPv6 connectivity issues with direct database URLs
- **Solution**: Use Session Pooler URLs (aws-0-us-east-2.pooler.supabase.com)
- **Why**: Session Pooler endpoints resolve to IPv4 addresses

### Docker Limitations
- Supabase CLI commands requiring Docker (`supabase db pull`, `supabase db diff`) won't work
- Workaround: Use direct PostgreSQL commands with pooler URLs

### What Was NOT Copied
- Storage files (actual uploaded images/documents)
- Edge Functions  
- Environment variables/secrets
- SMTP configuration

## Recommended Workflow Going Forward

### For Database Changes
1. **Make changes in DEV first** via Supabase Dashboard
2. **Document changes** in a new migration file:
   ```bash
   echo "-- Description: [change description]
   -- Date: $(date +%Y-%m-%d)
   
   [SQL STATEMENTS];" > supabase/migrations/$(date +%Y%m%d%H%M%S)_change_name.sql
   ```
3. **Test thoroughly** in DEV
4. **Apply to PROD** via SQL Editor in PROD Dashboard
5. **Commit migration file** to version control

### For Claude Code
- All database structure is documented in `/supabase/migrations/` files
- DEV and PROD are currently identical
- Use DEV for all development and testing
- Session Pooler URLs work better than direct connections

### Quick Commands Reference
```bash
# Connect to DEV
psql "postgresql://postgres.hlpvvwlxjzexpgitsjlw:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres"

# Connect to PROD  
psql "postgresql://postgres.bpdhbxvsguklkbusqtke:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres"

# Backup database
pg_dump "[POOLER_URL]" > backup.sql

# Restore database
psql "[POOLER_URL]" < backup.sql
```

## Security Recommendations
1. ✅ Change both database passwords (visible in terminal history)
2. ✅ Use environment variables for connection strings
3. ✅ Never commit passwords to version control
4. ✅ Clear terminal history: `history -c && history -w`

## Verification Steps
To verify everything is working:
1. Check DEV Dashboard - all tables should have data
2. Check Authentication > Users - should match PROD
3. Check account_users table - should have proper user-account relationships
4. Test your application against DEV - should work identically to PROD

## Status: ✅ COMPLETE
Both databases are synchronized and ready for development.







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