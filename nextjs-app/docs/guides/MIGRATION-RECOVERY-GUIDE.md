# Migration Recovery Guide

This guide helps you recover from common Supabase migration sync issues and maintain a healthy migration state.

## 🚨 Quick Recovery Steps

### 1. Check Current Status
```bash
cd nextjs-app
./scripts/check-migration-status.sh 'your_password'
```

### 2. Automatic Repair
```bash
# Dry run first to see what will be done
./scripts/repair-migration-sync.sh --password 'your_password' --dry-run

# Execute repairs
./scripts/repair-migration-sync.sh --password 'your_password' --auto-fix
```

### 3. Verify Fix
```bash
./scripts/verify-migration-sync.sh --password 'your_password' --show-fix
```

## 📋 Common Scenarios

### Scenario 1: "Remote migration versions not found in local"

**Cause**: You applied SQL directly via Supabase Dashboard without creating a local migration file.

**Fix**:
```bash
# Option 1: Mark the missing migration as applied
npx supabase migration repair 20250731_050000 --status applied --password 'your_password'

# Option 2: Use the repair script
./scripts/repair-migration-sync.sh --password 'your_password' --auto-fix
```

### Scenario 2: Pending migrations that were already applied

**Cause**: Migration was applied manually but Supabase still thinks it's pending.

**Fix**:
```bash
# Mark specific migration as applied
npx supabase migration repair 20250731_050000 --status applied --password 'your_password'

# Or use repair script for all pending
./scripts/repair-migration-sync.sh --password 'your_password' --auto-fix
```

### Scenario 3: Emergency fix needed when migrations are out of sync

**Cause**: Critical bug needs immediate fix but migrations won't apply due to sync issues.

**Fix**:
```bash
# Create a proper migration file and apply manually
./scripts/apply-emergency-sql.sh scripts/urgent-fix.sql --create-migration --auto-repair --password 'your_password'
```

This will:
1. Create a proper migration file with timestamp
2. Show you the SQL to apply manually
3. Provide the repair command to run after manual application

### Scenario 4: Schema drift after manual changes

**Cause**: Database schema was modified directly without migrations.

**Fix**:
```bash
# See what changed
npx supabase db diff --password 'your_password'

# Create a migration for the changes
npx supabase db diff --password 'your_password' > drift-fix.sql
./scripts/apply-emergency-sql.sh drift-fix.sql --create-migration --auto-repair --password 'your_password'
```

## 🛠️ Prevention Strategies

### 1. Always Create Migration Files
Even for emergency fixes:
```bash
# Instead of applying SQL directly, create a migration first
npx supabase migration new emergency_fix
# Add your SQL to the created file
# Then apply manually and mark as applied
```

### 2. Use the Emergency SQL Script
```bash
# This creates proper tracking
./scripts/apply-emergency-sql.sh fix.sql --create-migration
```

### 3. Regular Sync Checks
```bash
# Add to your routine
./scripts/verify-migration-sync.sh --password 'your_password'
```

### 4. Document Manual Changes
Always update `scripts/emergency-sql-log.md` when applying SQL manually.

## 🔄 Full Reset (Last Resort)

If migrations are completely broken:

### Option 1: Reset Migration History (Development Only)
```bash
# WARNING: Only do this in development!
# 1. Export current schema
npx supabase db dump --password 'your_password' > backup.sql

# 2. Reset migrations table
# In Supabase Dashboard SQL Editor:
TRUNCATE supabase_migrations.schema_migrations;

# 3. Mark all local migrations as applied
for file in supabase/migrations/*.sql; do
    timestamp=$(basename "$file" | grep -oE '^[0-9]{8}_[0-9]{6}')
    npx supabase migration repair "$timestamp" --status applied --password 'your_password'
done
```

### Option 2: Start Fresh (Nuclear Option)
```bash
# 1. Backup everything
npx supabase db dump --password 'your_password' > full-backup.sql

# 2. Create a consolidation migration
cat supabase/migrations/*.sql > supabase/migrations/20250801_000000_consolidated.sql

# 3. Remove old migrations
mkdir supabase/migrations/archive
mv supabase/migrations/*.sql supabase/migrations/archive/

# 4. Move consolidated back
mv supabase/migrations/archive/20250801_000000_consolidated.sql supabase/migrations/

# 5. Reset migration history and apply consolidated
# In Supabase Dashboard
```

## 📚 Command Reference

### Check Commands
```bash
# Full status check
./scripts/check-migration-status.sh 'password'

# Verify sync
./scripts/verify-migration-sync.sh --password 'password' --show-fix

# List migrations
npx supabase migration list --password 'password'

# Check drift
npx supabase db diff --password 'password'
```

### Repair Commands
```bash
# Auto repair
./scripts/repair-migration-sync.sh --password 'password' --auto-fix

# Manual repair
npx supabase migration repair TIMESTAMP --status applied --password 'password'

# Emergency SQL with repair
./scripts/apply-emergency-sql.sh fix.sql --create-migration --auto-repair --password 'password'
```

### Prevention Commands
```bash
# Create migration properly
npx supabase migration new descriptive_name

# Apply migrations
npx supabase db push --password 'password'
```

## ⚠️ Important Notes

1. **Always backup before major operations**
2. **Test repairs on a development database first**
3. **Document all manual interventions**
4. **Communicate with team about migration changes**
5. **Never reset migrations in production**

## 🆘 When All Else Fails

If you're still stuck:

1. Export current database state: `npx supabase db dump`
2. Document the exact error messages
3. Check `scripts/emergency-sql-log.md` for recent manual changes
4. Consider creating a new Supabase project and migrating data
5. Reach out to Supabase support with migration history details

Remember: The goal is to keep your local migration files in sync with what's actually applied to the database. The repair tools help automate this process.