# CRITICAL: Fix DEV Database Issues

## Issues Being Fixed
1. ❌ Admin detection failing - tyler.lahaie@wondrous.gg not recognized as admin
2. ❌ Infinite recursion in account_users RLS policies causing API errors
3. ❌ Platform account using wrong ID

## How to Apply the Fix

### Step 1: Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your DEV project: **Wondrous-Digital-App-DEV**
3. Navigate to: **SQL Editor** (in left sidebar)

### Step 2: Run the Fix Script
1. Click **New Query** button
2. Copy the ENTIRE contents of: `scripts/fix-dev-database-critical.sql`
3. Paste into the SQL editor
4. Click **Run** button

### Step 3: Verify the Results
The script will show verification results at the bottom:
- ✅ Platform account created with ID: 00000000-0000-0000-0000-000000000000
- ✅ Tyler assigned to platform account as admin
- ✅ Staff user assigned to platform account
- ✅ RLS policies fixed (no recursion warnings)

### Step 4: Test in Application
1. Stop the dev server if running: `npm run dev:stop`
2. Start fresh: `npm run dev:start`
3. Sign in as: tyler.lahaie@wondrous.gg
4. Password: atz_dek-nky2WBU_jav
5. Check that:
   - You see "Admin" or "Staff" indicator in UI
   - No console errors about infinite recursion
   - Admin tools/functions are accessible

## What the Fix Does

### 1. Creates Correct Platform Account
- ID: `00000000-0000-0000-0000-000000000000` (expected by code)
- Name: "Wondrous Digital Platform"

### 2. Moves Admin Users
- Tyler moved from wrong account to platform account
- Staff user moved to platform account

### 3. Fixes RLS Policies
- Simplified account_users policies to avoid self-reference
- Updated all platform admin checks to use correct account ID
- Removed circular dependencies causing infinite recursion

### 4. Updates All References
- audit_logs policies
- core_components policies
- library_items policies
- All other admin-restricted tables

## If Something Goes Wrong

### Rollback Steps
If you need to rollback:
```sql
-- Remove tyler from platform account
DELETE FROM account_users 
WHERE user_id = '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1'
  AND account_id = '00000000-0000-0000-0000-000000000000';

-- Re-add to old account (if needed)
INSERT INTO account_users (account_id, user_id, role)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee',
  '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1',
  'admin'
);
```

### Common Issues
1. **"relation already exists" errors**: Ignore these, it means the fix was already partially applied
2. **"policy already exists" errors**: The script drops policies first, so this shouldn't happen
3. **Still getting infinite recursion**: Make sure ALL the SQL ran, not just part of it

## Success Criteria
After running the fix, you should see:
1. ✅ Tyler can log in without errors
2. ✅ Admin status shows as true
3. ✅ No infinite recursion errors in console
4. ✅ Admin tools are accessible
5. ✅ Can create/manage users