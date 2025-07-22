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

### 2025-07-22

#### Phase 2: Add HTML Template Column
- **Date**: 2025-07-22
- **Migration**: `20250722_100000_add_html_template_column.sql`
- **Purpose**: Begin Phase 2 of unified rendering system by adding template support
- **Applied by**: Claude via Supabase CLI
- **Method**: npx supabase db push
- **Changes**:
  - Added `html_template` TEXT column for Handlebars templates
  - Added `template_engine` VARCHAR column (default 'handlebars')
  - Added `parent_template_id` UUID column for template inheritance
  - Added `variables_schema` JSONB column for template variable definitions
  - Ensured customizable_fields defaults to '{}' (never null)
  - Added initial HTML templates for hero, features, and navigation sections
- **Status**: ✅ COMPLETED
- **Result**: Foundation for Phase 2 unified rendering system in place

### 2025-07-19

#### Add Deployment Queue Cron Job
- **Date**: 2025-07-19
- **Migration**: `20250719_012939_add_deployment_queue_cron_job.sql`
- **Purpose**: Add automatic cron job to process deployment queue every 2 minutes
- **Applied by**: Not yet applied
- **Method**: Requires manual update of service role key before applying
- **Changes**:
  - Enables pg_cron extension
  - Grants necessary permissions for HTTP requests
  - Creates cron job named 'process-deployment-queue' to run every 2 minutes
  - Cron job calls the Edge Function via HTTP POST with authentication
- **IMPORTANT**: Before applying this migration:
  1. Get service role key from Supabase Dashboard > Settings > API > Service role key (secret)
  2. Replace YOUR_SERVICE_ROLE_KEY in the migration file with the actual key
  3. Apply migration: `npx supabase db push --password 'aTR9dv8Q7J2emyMD'`
- **Status**: ⏳ PENDING - Needs service role key before application

### 2025-07-20

#### Fix Deployment Queue Deletion
- **Date**: 2025-07-20
- **Migration**: `20250720_100000_add_delete_policy_deployment_queue.sql`
- **Purpose**: Add missing RLS DELETE policy for admin users on deployment_queue table
- **Applied by**: Claude via Supabase CLI
- **Method**: npx supabase db push
- **Issue Fixed**: Admin users were unable to delete deployments from the UI because there was no RLS policy allowing DELETE operations
- **Changes**:
  - Added "Admins can delete deployments" policy for DELETE operations
  - Policy restricts deletion to only completed/failed deployments (matching service logic)
  - Only admin users can perform deletions

### 2025-01-21

#### Deployment Queue System
- **Date**: 2025-01-21
- **Migration**: `20250121_170000_create_deployment_queue.sql`
- **Purpose**: Add deployment queue system for scaled deployments
- **Applied by**: Claude via Supabase CLI
- **Method**: CLI with --include-all flag and auto-confirm
- **Changes**:
  - Created `deployment_queue` table for managing deployment tasks
  - Added priority-based queueing with status tracking
  - Added attempt tracking and error handling
  - Modified existing `deployment_logs` table to add deployment_id reference
  - Created indexes for performance optimization
  - Added RLS policies for secure access
  - Created auto-update trigger for updated_at
  - Added cleanup function for old deployments (30-day retention)
- **Status**: ✅ COMPLETED
- **Result**: Deployment queue system ready for handling 50+ concurrent deployments

### 2025-01-20

#### Deployment Tracking Fields
- **Date**: 2025-01-18 (Applied on 2025-01-20 due to timestamp conflicts)
- **Migration**: `20250120_201500_add_deployment_tracking_fields.sql`
- **Purpose**: Add deployment tracking and build status fields
- **Applied by**: Claude via Supabase CLI
- **Method**: CLI with --include-all flag
- **Changes**:
  - Added `last_deployed_at` TIMESTAMPTZ column to projects table
  - Added `build_status` TEXT column with enum constraint
  - Created `deployment_logs` table for build output tracking
  - Added indexes for deployment queries
  - Added RLS policies for deployment logs
- **Status**: ✅ COMPLETED
- **Result**: Deployment pipeline can now track build status and logs

### 2025-01-19

#### Pages Order and Homepage Columns
- **Date**: 2025-01-18 (Applied on 2025-01-19 due to timestamp conflicts)
- **Migration**: `20250119_160100_add_pages_order_and_homepage_columns.sql`
- **Purpose**: Add order_index and is_homepage columns to pages table
- **Applied by**: Claude via Supabase CLI
- **Method**: CLI with --include-all flag
- **Changes**:
  - Added `is_homepage` BOOLEAN column with default false
  - Added `order_index` INTEGER column with default 0
  - Created indexes for performance
  - Set first page of each project as homepage
  - Assigned sequential order_index values (homepage = 0, others by creation date)
- **Status**: ✅ COMPLETED
- **Result**: Fixed "column pages.order_index does not exist" error in ProjectPreview

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
- **Result**: Partial fix - RLS policies resolved but deeper issue remained

#### Missing page_sections Table & Section ID Mismatch
- **Date**: 2025-01-18
- **Issue**: Global navigation still failed after RLS fix - 400 error persisted
- **Root Cause**: Multiple architecture issues:
  1. Application expects `page_sections` table but it doesn't exist in database
  2. Sections stored as JSON in `pages.sections` but global nav expects separate `page_sections` table
  3. Page builder uses short IDs (`zuhexd8l7`) but global nav expects UUIDs
  4. Missing `global_nav_section_id` and `global_footer_section_id` columns in projects table
- **Solutions Applied**:
  1. Applied `20250118_155500_add_global_navigation_columns.sql` to add missing columns to projects table
  2. Applied `20250719_160500_create_page_sections_table.sql` to create page_sections table with RLS policies
  3. Updated `NavigationSettingsTab.tsx` to bridge page builder and global nav systems:
     - Creates/finds page_sections records when marking sections as global
     - Maps page builder short IDs to page_sections UUIDs
     - Updates useEffect to properly detect current global sections
- **Status**: ✅ COMPLETED - Comprehensive architectural fix applied
- **Result**: Global navigation checkbox fully functional with proper integration between page builder and global navigation systems
- **Final Fix**: Added Settings and Delete controls for global navigation sections in PageBuilderPage (maintains editing capability without move controls)

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