# Migration Naming Guide

## ⚠️ CRITICAL: Use Full Timestamp Format

### The ONE Rule
**ALWAYS use 14-digit timestamp format: `YYYYMMDDHHMMSS_description.sql`**

### Quick Reference

#### ✅ CORRECT Format
```bash
# Generate migration name with current timestamp:
echo "Migration name: $(date +%Y%m%d%H%M%S)_your_feature_name.sql"

# Examples:
20250820140000_pending_stripe_payments.sql   # Aug 20, 2025, 2:00:00 PM
20250820141530_fix_webhook_handler.sql       # Aug 20, 2025, 2:15:30 PM
20250820143000_update_user_roles.sql         # Aug 20, 2025, 2:30:00 PM
```

#### ❌ WRONG Formats (These WILL Fail!)
```bash
20250820_000001_feature.sql    # Missing time = only 1 per day!
20250820_feature.sql            # Missing sequence and time
2025-08-20-140000_feature.sql  # Wrong separators
20250820_140000_feature.sql    # Underscore in timestamp
```

## Why This Matters

Supabase migration system uses the filename prefix as a unique version key:
- **8 digits** (YYYYMMDD) = Maximum 1 migration per day ❌
- **14 digits** (YYYYMMDDHHMMSS) = Unlimited migrations per day ✅

## Common Errors and Solutions

### Error: "duplicate key value violates unique constraint"
**Cause**: Using date-only format when a migration already exists for that day.
**Solution**: Use full 14-digit timestamp format.

### Error: "Remote migration versions not found in local"
**Cause**: Remote has migrations your local doesn't recognize.
**Solution**: 
```bash
# Mark conflicting remote migration as reverted
npx supabase migration repair YYYYMMDD --status reverted --password 'YOUR_PASSWORD'
```

## Creating a Migration

### Automatic (Recommended)
```bash
# From nextjs-app directory
MIGRATION_NAME="your_feature_description"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
cat > supabase/migrations/${TIMESTAMP}_${MIGRATION_NAME}.sql << 'EOF'
-- Description: What this migration does
-- Author: Your name
-- Date: $(date +%Y-%m-%d)

-- Your SQL here
EOF
```

### Manual
1. Get timestamp: `date +%Y%m%d%H%M%S`
2. Create file: `supabase/migrations/[TIMESTAMP]_[description].sql`
3. Add your SQL

## Examples from Our Codebase

These migrations follow the correct format:
- `20250810200000_fix_function_search_paths_security.sql`
- `20250810201000_move_pg_net_extension.sql`
- `20250810202000_auth_security_settings.sql`
- `20250820140000_pending_stripe_payments.sql`

## Quick Checks

Before creating a migration:
```bash
# Check existing migrations for today
ls supabase/migrations/ | grep "^$(date +%Y%m%d)"

# Get next available timestamp
echo "Next migration: $(date +%Y%m%d%H%M%S)_description.sql"
```

## Remember
- **Always 14 digits** for the timestamp
- **No underscores** within the timestamp portion
- **One underscore** between timestamp and description
- **Multiple migrations per day** are supported with this format

---
*Last Updated: August 20, 2025*
*This guide was created after discovering migration conflicts due to incorrect naming conventions.*