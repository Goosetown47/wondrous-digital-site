# Database Migrations for PACKET 3.5 - Final Billing Features

## Overview
These 7 migrations need to be applied to DEV/STAGING databases before deployment. They implement the billing features completed in PACKET 3.5.

## ⚠️ IMPORTANT: Application Order
Apply these migrations in the exact order listed below. Each migration builds upon the previous ones.

## Migration Files to Apply (in order):

### 1. `20250902120000_subscription_state_enum.sql`
**Purpose**: Adds subscription state management with formal state machine
- Creates `subscription_state` enum type
- Adds state transition tracking table
- Implements state validation functions
- **Key features**: State machine for subscription lifecycle management

### 2. `20250902150000_add_cooldown_tracking.sql`
**Purpose**: Implements 24-hour cooldown between plan changes
- Adds `last_plan_change_at` and `cooldown_override` columns
- Creates helper functions to check cooldown status
- **Key features**: Prevents rapid plan switching, includes test override

### 3. `20250902180000_grace_period_notifications.sql`
**Purpose**: Tracks payment grace period notifications
- Creates `grace_period_notifications` table
- Tracks scheduled and sent notifications for failed payments
- **Key features**: Day 0, Day 7, Day 13, and downgrade notifications

### 4. `20250903020000_fix_database_security_issues.sql`
**Purpose**: Fixes database security issues (attempt 1)
- Fixes `project_access_view` security definer issue
- Enables RLS on `subscription_state_warnings`
- Adds `search_path` to functions for security
- **Note**: This was the first attempt, some functions had wrong signatures

### 5. `20250903030000_fix_database_security_issues_v2.sql`
**Purpose**: Fixes database security issues (production-safe version)
- Same fixes as above but preserves original function signatures
- Ensures backward compatibility
- **Key features**: Production-safe security fixes

### 6. `20250903040000_fix_remaining_function_warnings.sql`
**Purpose**: Completes security fixes for remaining functions
- Fixes `search_path` on cooldown and notification functions
- Addresses the last 4 functions with correct signatures
- **Key features**: Final security hardening

### 7. `20250904120000_add_account_unlock_feature.sql`
**Purpose**: Adds unlimited feature access mechanism
- Adds `is_unlocked` boolean to accounts table
- Allows admins to grant full features regardless of tier
- **Key features**: Used for Wondrous accounts and special trials

## Application Instructions

### For DEV Database (hlpvvwlxjzexpgitsjlw):
1. Navigate to Supabase Dashboard: https://app.supabase.com/project/hlpvvwlxjzexpgitsjlw/editor
2. Go to SQL Editor
3. Copy and paste each migration file content
4. Execute in order (1-7)
5. Verify each migration succeeds before proceeding to next

### For STAGING Database (same as DEV):
- Already applied since DEV and STAGING share the same database

### For PROD Database (bpdhbxvsguklkbusqtke):
- **DO NOT APPLY YET** - Wait until after staging verification
- Same process as DEV but use: https://app.supabase.com/project/bpdhbxvsguklkbusqtke/editor

## Verification Steps After Migration

1. **Check enum type created**:
```sql
SELECT typname FROM pg_type WHERE typname = 'subscription_state';
```

2. **Verify new tables exist**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_state_transitions', 'subscription_state_warnings', 'grace_period_notifications');
```

3. **Check accounts table columns**:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'accounts' 
AND column_name IN ('subscription_state', 'last_plan_change_at', 'cooldown_override', 'is_unlocked');
```

4. **Verify functions have search_path**:
```sql
SELECT proname, prosecdef, proconfig 
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('is_in_cooldown', 'get_cooldown_end_time', 'has_sent_billing_notification');
```

## Expected Results
- All migrations should execute without errors
- Database linter should show 0 errors and reduced warnings
- Application should function normally with enhanced billing features

## Rollback Plan
If issues occur, each migration has been designed to be safe:
- Functions use CREATE OR REPLACE (won't break existing)
- Columns use ADD COLUMN IF NOT EXISTS (idempotent)
- New tables won't affect existing functionality

## Next Steps
After successful migration:
1. Test billing features on DEV
2. Deploy code to staging branch
3. Test on staging environment
4. Apply migrations to PROD database
5. Deploy to production (nextjs-pagebuilder-core branch)