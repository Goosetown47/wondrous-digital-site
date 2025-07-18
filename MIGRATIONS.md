# Migration History

This file tracks all database migrations applied to the Wondrous Digital Website project.

## Important: Migration Process

### Naming Convention
All migrations MUST follow this format:
```
YYYYMMDD_HHMMSS_descriptive_name.sql
```

Example: `20250118_143022_add_global_navigation_fields.sql`

### Before Creating a Migration
1. Check for existing migrations on the same day:
   ```bash
   ls supabase/migrations/ | grep "$(date +%Y%m%d)"
   ```

2. Use full timestamp to avoid conflicts:
   ```bash
   mv my_migration.sql "supabase/migrations/$(date +%Y%m%d_%H%M%S)_my_description.sql"
   ```

### Applying Migrations
Always use the CLI method:
```bash
export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612
npx supabase db push --password 'aTR9dv8Q7J2emyMD'
```

## Migration Log

### 2025-01-18

#### Issue: Migration Naming Conflicts
- **Problem**: Remote had generic migrations named `20250118` without descriptions
- **Solution**: Used `npx supabase migration repair --status applied 20250118 20250711`
- **Lesson**: Always use full timestamps and descriptive names

#### Pending Migrations (as of 2025-01-18)
- `20250118_000001_template_metadata.sql` - Adds template-specific fields to projects
- `20250118_000002_netlify_deployment_fields.sql` - Adds Netlify deployment tracking
- `20250118_flexible_domain_management.sql` - Adds custom domain support
- `20250718_global_navigation_fields.sql` - Adds global nav/footer section IDs
- `20250719_global_navigation_fields_only.sql` - Standalone version of global nav fields

#### Applied via SQL Editor
- **Migration**: Global Navigation Fields
- **Date**: 2025-01-18 (COMPLETED)
- **Applied by**: User via Supabase SQL Editor
- **Original file**: `20250118_global_navigation_fields.sql` (deleted after application)
- **Purpose**: Add global_nav_section_id and global_footer_section_id to projects table
- **Method**: Direct SQL due to migration system conflicts
- **Result**: ✅ Successfully applied - global navigation checkbox now works

#### RLS Policy Issue - Projects Table
- **Date**: 2025-01-18
- **Issue**: Global navigation checkbox failed with 400 error even after migration
- **Root Cause**: Missing UPDATE policy on projects table for authenticated users
- **Solution**: Applied `20250118_151500_add_projects_update_policy.sql`
- **Migration**: Adds UPDATE policy allowing users to update their own projects
- **Status**: ✅ COMPLETED - Applied via CLI with --include-all flag
- **Result**: Global navigation checkbox now works properly for all users

#### Migration System Test
- **Date**: 2025-01-18
- **Test**: Created and applied `20250718_145230_test_migration_system.sql`
- **Result**: ✅ Successfully applied via CLI - migration system confirmed working
- **Cleanup**: Test migration deleted after verification

### Previous Migrations
- Various migrations from 2025-01-07 to 2025-01-17
- Mix of CLI-applied and direct SQL migrations
- Some with generic names (just dates) causing conflicts

## Best Practices

1. **Always use timestamps** down to the second
2. **Document here** when applying migrations outside normal CLI flow
3. **Check status first**: `npx supabase migration list --password 'aTR9dv8Q7J2emyMD'`
4. **Communicate** with team before applying migrations
5. **Test locally** if possible before pushing to production

## Troubleshooting

If you encounter "Remote migration versions not found":
1. List problematic migrations
2. Use `migration repair` to sync state
3. Document the repair in this file
4. Apply pending migrations

See [HOW-TO-USE-SUPABASE.md](docs/HOW-TO-USE-SUPABASE.md) for detailed commands.