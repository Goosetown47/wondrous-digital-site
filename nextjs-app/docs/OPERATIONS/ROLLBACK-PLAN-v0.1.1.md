# Rollback Plan for v0.1.1 - Draft/Publish System

## Overview
This document outlines the rollback procedure for the Draft/Publish system refactor introduced in v0.1.1.

## Key Changes Made

### 1. Database Changes
- Added `published_sections` column to `pages` table
- Added `publish_page_draft` function
- Added `page_has_unpublished_changes` function
- Added GIN index on `published_sections`

### 2. Code Changes
- Refactored Zustand store to manage draft/published state
- Implemented auto-save with 2-second debounce
- Added publish workflow in UI
- Updated preview to read from Zustand store
- Added deepEqual utility for change detection

## Rollback Procedure

### Phase 1: Quick Rollback (If critical issue found immediately)

1. **Revert to previous deployment**
   ```bash
   # In Vercel dashboard, revert to previous deployment
   # OR via CLI:
   vercel rollback
   ```

2. **Database remains compatible**
   - The `published_sections` column can remain in place
   - Existing code will ignore it and continue using `sections` column

### Phase 2: Full Rollback (If needed after extended use)

1. **Create backup of current data**
   ```sql
   -- Backup pages with unpublished changes
   CREATE TABLE pages_backup_v011 AS 
   SELECT * FROM pages 
   WHERE sections != published_sections;
   ```

2. **Sync published content back to sections**
   ```sql
   -- Ensure no data loss by copying published to draft
   UPDATE pages 
   SET sections = published_sections 
   WHERE published_sections != '[]'::jsonb;
   ```

3. **Remove database changes**
   ```sql
   -- Drop functions
   DROP FUNCTION IF EXISTS publish_page_draft(UUID);
   DROP FUNCTION IF EXISTS page_has_unpublished_changes(UUID);
   
   -- Drop index
   DROP INDEX IF EXISTS idx_pages_published_sections;
   
   -- Drop column (after confirming data is safe)
   ALTER TABLE pages DROP COLUMN published_sections;
   ```

4. **Deploy previous code version**
   - Revert to commit before refactor: `963afd7`
   - Or deploy from tag: `v0.1.0`

## Key Commits for Reference

- Start of refactor: `4dd26bf` (after TypeScript fixes)
- Database migration: Check migration file timestamp
- Unpublished changes fix: Latest commits on 8/6/2025

## Testing After Rollback

1. Verify pages load correctly
2. Test save functionality works
3. Confirm preview shows correct content
4. Check that all page edits persist

## Notes

- The refactor maintains backward compatibility
- If `published_sections` column exists but is empty, system falls back to `sections`
- No data loss should occur during rollback if procedures are followed