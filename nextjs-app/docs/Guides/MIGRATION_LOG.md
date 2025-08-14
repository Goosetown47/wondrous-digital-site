# Migration Log

This file tracks all manual database interventions and migration sync issues.

## 2025-08-11 - Role Constraint Fix

### Issue
- User creation was failing with "account_users_role_check" constraint violation
- Database had legacy roles: owner, member, viewer
- Application uses: admin, staff, account_owner, user

### Actions Taken
1. Created migration: `20250811000000_fix_account_users_role_constraint.sql`
2. Migration sync was broken due to phantom "20250810" migration
3. Applied SQL manually via Supabase Dashboard:
   ```sql
   ALTER TABLE account_users DROP CONSTRAINT IF EXISTS account_users_role_check;
   ALTER TABLE account_users ADD CONSTRAINT account_users_role_check 
   CHECK (role IN ('admin', 'staff', 'account_owner', 'user'));
   ```
4. Marked migrations as applied:
   - `npx supabase migration repair 20250810213000 --status applied`
   - `npx supabase migration repair 20250811000000 --status applied`

### Root Cause of Sync Issues
1. Inconsistent migration naming (underscore between date/time)
2. Phantom migration "20250810" in remote without proper timestamp
3. Manual SQL applications not tracked in migration history

### Prevention Measures
1. Created `scripts/check-migration-sync.sh` for pre-work checks
2. Standardized naming: `YYYYMMDDHHMMSS_description.sql`
3. Always run migration repair after manual SQL

---

## 2025-08-11 - Placeholder Migration for Sync

### Issue
- Migration `20250810213000` existed in remote but not locally
- Causing sync warnings despite being marked as applied

### Actions Taken
1. Created placeholder migration: `20250810213000_placeholder_audit_logs_duplicate.sql`
2. File contains only comments explaining it's a duplicate of audit logs creation
3. Migration sync now shows all migrations aligned

### Result
- Local and remote migrations are now fully synchronized
- No functional changes needed since audit logs table already exists

---

## Migration Sync Checklist

Before starting work:
- [ ] Run `./scripts/check-migration-sync.sh`
- [ ] Pull latest code from git
- [ ] Verify no local-only migrations

When applying migrations:
- [ ] Create migration file first
- [ ] Use standard naming format
- [ ] If manual SQL needed, run migration repair immediately
- [ ] Document in this log

If sync breaks:
- [ ] Check migration list for discrepancies
- [ ] Create placeholder files for phantom migrations
- [ ] Use migration repair to mark status
- [ ] Document the fix in this log