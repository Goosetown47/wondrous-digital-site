# How to Use Supabase with This Project

This guide provides comprehensive instructions for connecting to and managing the Supabase database for the Wondrous Digital Website project.

## Project Details

- **Project Name**: Wondrous-Digital-Website
- **Project Reference**: bpdhbxvsguklkbusqtke
- **Region**: us-east-2
- **Dashboard URL**: https://supabase.com/dashboard/project/bpdhbxvsguklkbusqtke

## Required Credentials

### 1. Supabase Access Token (for CLI)
```bash
export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612
```

### 2. Database Password
```bash
# Current password (as of 2025-01-17)
aTR9dv8Q7J2emyMD
```

### 3. Service Role Key (for application/MCP)
Located in `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM
```

## Essential Supabase CLI Commands

### 1. Check Project Status
```bash
# List all projects
export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612
npx supabase projects list

# Check local/remote migration status
npx supabase migration list --password 'aTR9dv8Q7J2emyMD'
```

### 2. Push Migrations
```bash
# Push new migrations to remote
export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612
npx supabase db push --password 'aTR9dv8Q7J2emyMD'

# If migrations are out of order, use --include-all
npx supabase db push --include-all --password 'aTR9dv8Q7J2emyMD'

# Auto-confirm (for scripts)
echo "Y" | npx supabase db push --password 'aTR9dv8Q7J2emyMD'
```

### 3. Pull Remote Changes
```bash
# Pull remote schema changes
npx supabase db pull --password 'aTR9dv8Q7J2emyMD'

# Generate TypeScript types from database
npx supabase gen types typescript --project-id bpdhbxvsguklkbusqtke > src/types/supabase.ts
```

### 4. Fix Migration Issues
```bash
# If you get "Remote migration versions not found in local migrations directory"
# List the problematic migrations first:
npx supabase migration list --password 'aTR9dv8Q7J2emyMD'

# Then repair them (mark as reverted if they don't exist locally):
npx supabase migration repair --status reverted 20250710083222 20250711030626 --password 'aTR9dv8Q7J2emyMD'

# Or mark as applied if they should be considered done:
npx supabase migration repair --status applied 20250117 --password 'aTR9dv8Q7J2emyMD'
```

### 5. Direct Database Connection
```bash
# Using Supabase CLI (not supported for remote by default)
# You'll need to use the Dashboard SQL Editor or a PostgreSQL client

# Connection string format:
postgresql://postgres:[PASSWORD]@db.bpdhbxvsguklkbusqtke.supabase.co:5432/postgres

# Pooler connection (for applications):
postgresql://postgres.bpdhbxvsguklkbusqtke:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

## Creating Migrations

### 1. File Naming Convention
```
supabase/migrations/YYYYMMDD_HHMMSS_descriptive_name.sql
```

Example:
```
20250717_182500_add_user_preferences.sql
```

### 2. Migration Best Practices

```sql
-- Always use IF NOT EXISTS for creating objects
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light'
);

-- Use notices for columns that might exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS new_field VARCHAR(255);

-- For constraints, check if they exist first
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_status') THEN
    ALTER TABLE projects ADD CONSTRAINT check_valid_status 
    CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;
```

### 3. Testing Migrations Locally
Before pushing to production, test your migration:
```bash
# Create a test migration
echo "-- Test comment
COMMENT ON SCHEMA public IS 'Test migration';" > supabase/migrations/$(date +%Y%m%d_%H%M%S)_test.sql

# Push it
npx supabase db push --password 'aTR9dv8Q7J2emyMD'
```

## MCP Server Configuration

The project includes MCP (Model Context Protocol) configuration in `.mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=bpdhbxvsguklkbusqtke"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612"
      }
    }
  }
}
```

When MCP is available, you can use commands like:
- `mcp__supabase-write__apply_migration`
- `mcp__supabase-write__execute_sql`

## Troubleshooting Common Issues

### 1. "Wrong password" Error
- The database password may have been reset
- Get the new password from the Supabase Dashboard: Settings → Database
- Update the password in your commands
- Ask the user to verify the password is correct, if not, get a new one

### 2. "Remote migration versions not found"
- This means the remote has migrations your local doesn't have
- Use `migration repair` to mark them as reverted
- Or pull them down with `db pull`

### 3. "duplicate key value violates unique constraint"
- Migration version numbers must be unique
- Use more specific timestamps: `YYYYMMDD_HHMMSS`
- Check existing migrations with `migration list`

### 4. "cannot change name of view column"
- Views in PostgreSQL cannot have column names changed
- Drop and recreate the view instead
- Or create a new view with a different name

### 5. Connection Issues
- Ensure SUPABASE_ACCESS_TOKEN is exported
- Check if you're behind a firewall/VPN
- Verify the project is active in Supabase Dashboard

## Environment Setup for New Sessions

Run this at the start of each new Claude Code session:
```bash
# Set up Supabase access
export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612

# Verify connection
npx supabase projects list | grep Wondrous

# Check migration status
npx supabase migration list --password 'aTR9dv8Q7J2emyMD' | tail -10
```

## Important Notes

1. **Never commit passwords** to version control
2. **Always test migrations** before applying to production
3. **Keep migrations idempotent** - they should be safe to run multiple times
4. **Document breaking changes** in migration files
5. **Backup before major migrations** using the Dashboard

## Quick Reference Card

```bash
# Setup
export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612

# Common Commands
npx supabase migration list --password 'aTR9dv8Q7J2emyMD'        # List migrations
npx supabase db push --password 'aTR9dv8Q7J2emyMD'              # Push migrations
npx supabase projects list                                       # List projects

# Project Details
Project: Wondrous-Digital-Website
Ref: bpdhbxvsguklkbusqtke
Pass: aTR9dv8Q7J2emyMD
```

## Related Documentation

- [MCP-SETUP.md](../MCP-SETUP.md) - MCP server setup instructions
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Migration Guide](https://supabase.com/docs/guides/migrations)