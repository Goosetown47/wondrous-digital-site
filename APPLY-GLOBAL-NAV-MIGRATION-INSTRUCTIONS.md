# Instructions to Complete Global Navigation Fix

## Current Status
- ✅ Code changes completed (ProjectContext updated with new fields and refetchProject method)
- ✅ Migration files created
- ✅ Migration tracking system established (MIGRATIONS.md)
- ✅ CLAUDE.md updated with migration best practices
- ❌ Database migration needs to be applied

## To Complete the Fix

### Option 1: Apply via SQL Editor (Recommended - Quickest)
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/bpdhbxvsguklkbusqtke/sql/new)
2. Copy and paste the contents of either:
   - `APPLY-THIS-MIGRATION-NOW.sql` (in root directory)
   - `scripts/apply-global-nav-direct.sql`
3. Click "Run"
4. You should see success messages confirming the columns were added

### Option 2: Fix Migration System First
1. Clean up conflicting migrations:
   ```bash
   export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612
   
   # Check what migrations are problematic
   npx supabase migration list --password 'aTR9dv8Q7J2emyMD'
   
   # Apply our specific global nav migration
   npx supabase db push --password 'aTR9dv8Q7J2emyMD'
   ```

## What This Fix Enables
Once the migration is applied:
- ✅ Global navigation checkbox will work without errors
- ✅ Set any navigation section as global → appears on all pages
- ✅ Set any footer section as global → appears on all pages  
- ✅ PagePreview already displays these sections correctly
- ✅ Foundation ready for ProjectPreview (multi-page preview)

## Files Created/Updated
- `supabase/migrations/20250718_global_navigation_fields.sql` - Original migration
- `supabase/migrations/20250719_global_navigation_fields_only.sql` - Standalone version
- `src/contexts/ProjectContext.tsx` - Added fields and refetchProject method
- `MIGRATIONS.md` - New migration tracking document
- `CLAUDE.md` - Updated with migration best practices

## Next Steps After Migration
1. Test the global navigation checkbox in PageBuilder
2. Verify global sections appear in page previews
3. Proceed with Website Preview System implementation