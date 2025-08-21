# Supabase Migration Workflow

This document outlines the proper workflow for managing Supabase database migrations to avoid sync issues.

## 🚨 Common Issues and Solutions

### Issue: "Remote migration versions not found in local migrations directory"
This happens when the remote database has migrations that aren't in your local directory.

**Solution:**
1. First, try to pull the latest changes from git
2. Use `supabase migration repair` to mark missing migrations as applied:
   ```bash
   # List current migration status to see what's out of sync
   npx supabase migration list --password 'YOUR_PASSWORD'
   
   # Mark a specific migration as applied (if you manually applied it)
   npx supabase migration repair 20250731_050000 --status applied --password 'YOUR_PASSWORD'
   
   # Or mark as reverted if it wasn't actually applied
   npx supabase migration repair 20250731_050000 --status reverted --password 'YOUR_PASSWORD'
   ```
3. If repair doesn't work, manually sync using the SQL Editor in Supabase Dashboard

### Issue: "duplicate key value violates unique constraint"
This happens when trying to apply a migration that was partially applied.

**Solution:**
1. Mark the migration as already applied:
   ```bash
   npx supabase migration repair TIMESTAMP --status applied --password 'YOUR_PASSWORD'
   ```
2. Or rename the migration file with a new timestamp
3. Or apply the SQL directly via Supabase Dashboard

## ✅ Best Practices

### 1. Before Creating New Migrations
```bash
# Always check current migration status first
cd nextjs-app
npx supabase migration list --password 'YOUR_PASSWORD'

# Pull latest changes from git
git pull origin main
```

### 2. Creating Migrations

#### Naming Convention
```
# REQUIRED FORMAT (14 digits, no underscore in timestamp):
YYYYMMDDHHMMSS_descriptive_name.sql

# ✅ CORRECT Examples:
20250820140000_add_stripe_tables.sql       # Aug 20, 2025 at 2:00 PM
20250820143000_fix_user_permissions.sql    # Aug 20, 2025 at 2:30 PM
20250820150500_update_rls_policies.sql     # Aug 20, 2025 at 3:05 PM

# ❌ INCORRECT (will cause conflicts):
20250820_000001_feature.sql  # Only date = max 1 per day!
20250820_fix_bug.sql         # Missing timestamp
2025-08-20-14-00-00.sql      # Wrong separators
```

**Why this format?**
- Supabase uses the filename prefix as a unique version key
- Using 14 digits (YYYYMMDDHHMMSS) allows multiple migrations per day
- Using only 8 digits (YYYYMMDD) limits you to one migration per day

#### Content Structure
```sql
-- Description of what this migration does
-- Why it's needed

-- Drop existing objects if needed (use IF EXISTS)
DROP POLICY IF EXISTS "old_policy_name" ON table_name;

-- Create new objects
CREATE POLICY "new_policy_name" ON table_name
FOR operation
TO authenticated
USING (conditions);

-- Add comments for complex logic
COMMENT ON POLICY "new_policy_name" ON table_name IS 'Description of what this policy does';
```

### 3. Testing Migrations

**Never test migrations directly on production!**

1. Create a test branch database (if using Supabase branching)
2. Or use a local Supabase instance
3. Test the migration thoroughly
4. Check for any RLS policy conflicts

### 4. Applying Migrations

#### Standard Flow
```bash
cd nextjs-app
npx supabase db push --password 'YOUR_PASSWORD'
```

#### If Out of Sync
```bash
# Option 1: Force include all
npx supabase db push --password 'YOUR_PASSWORD' --include-all

# Option 2: Apply directly via Dashboard
# Go to SQL Editor and paste the migration content
```

### 5. Emergency Procedures

#### When Migrations Are Blocked

1. **Create a hotfix SQL file:**
```bash
# Don't put in migrations folder if sync is broken
mkdir -p scripts/hotfixes
vim scripts/hotfixes/fix_urgent_issue.sql
```

2. **Apply via Supabase Dashboard:**
- Go to SQL Editor
- Paste the SQL
- Run it
- Document what was done

3. **Fix migrations later:**
- Once sync is restored, create a proper migration
- Include a comment that this was previously applied as a hotfix

#### Backup Before Major Changes
```sql
-- In Supabase SQL Editor, create a backup of critical tables
CREATE TABLE projects_backup_20250731 AS SELECT * FROM projects;
```

## 📋 Migration Checklist

Before creating a migration:
- [ ] Pull latest code from git
- [ ] Check current migration status
- [ ] Test on a non-production database first

When creating a migration:
- [ ] Use proper naming convention
- [ ] Include descriptive comments
- [ ] Use IF EXISTS for drops
- [ ] Test RLS policies thoroughly

After applying a migration:
- [ ] Verify the changes took effect
- [ ] Test the functionality
- [ ] Commit the migration file to git
- [ ] Document any manual interventions

## 🔧 Useful Commands

```bash
# List all migrations and their status
npx supabase migration list --password 'YOUR_PASSWORD'

# Create a new migration file
npx supabase migration new descriptive_name

# Check if migrations are in sync
npx supabase db diff --password 'YOUR_PASSWORD'

# Reset local database (DANGER - local only)
npx supabase db reset

# Pull remote schema (when out of sync)
npx supabase db pull --password 'YOUR_PASSWORD'

# Repair migration history (mark as applied/reverted)
npx supabase migration repair TIMESTAMP --status applied --password 'YOUR_PASSWORD'
npx supabase migration repair TIMESTAMP --status reverted --password 'YOUR_PASSWORD'
```

## 🔄 Migration Repair Workflow

When migrations get out of sync (e.g., after manually applying SQL), use the repair command:

### 1. Check Current Status
```bash
cd nextjs-app
npx supabase migration list --password 'YOUR_PASSWORD'
```

Look for migrations marked as "pending" that were actually applied manually.

### 2. Repair Migration History

For migrations you applied manually via Supabase Dashboard:
```bash
# Mark as applied
npx supabase migration repair 20250731_050000 --status applied --password 'YOUR_PASSWORD'
```

For migrations that exist locally but weren't actually applied:
```bash
# Mark as reverted
npx supabase migration repair 20250731_050000 --status reverted --password 'YOUR_PASSWORD'
```

### 3. Verify Sync Status
```bash
# Should show all migrations in sync
npx supabase migration list --password 'YOUR_PASSWORD'

# Should show no differences
npx supabase db diff --password 'YOUR_PASSWORD'
```

### 4. Best Practices for Manual SQL Application

When you must apply SQL manually:

1. **Create a proper migration file first:**
   ```bash
   npx supabase migration new fix_urgent_issue
   ```

2. **Add your SQL to the migration file**

3. **Apply manually via Dashboard**

4. **Mark as applied immediately:**
   ```bash
   npx supabase migration repair TIMESTAMP --status applied --password 'YOUR_PASSWORD'
   ```

5. **Document in emergency log:**
   ```bash
   ./scripts/apply-emergency-sql.sh supabase/migrations/TIMESTAMP_fix_urgent_issue.sql
   ```

## 🚀 Setting Up for Production

1. **Use environment variables for passwords:**
```bash
export SUPABASE_DB_PASSWORD='your_password'
npx supabase db push --password $SUPABASE_DB_PASSWORD
```

2. **Set up CI/CD for migrations:**
- Run migrations as part of deployment
- Use GitHub Actions or similar
- Always backup before applying

3. **Monitor migration health:**
- Set up alerts for failed migrations
- Keep a log of manual interventions
- Regular sync checks

## 📝 Record Keeping

Always document:
- What was changed
- Why it was changed
- Any manual SQL that was run
- Any issues encountered

Keep a `MIGRATION_LOG.md` file in the project for tracking manual interventions.