-- Clear the conflicting migration entry
-- This allows us to re-run migrations after fixing the duplicate timestamp issue

-- Check what's in the migration history
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version;

-- Remove the conflicting entry (only if it exists)
DELETE FROM supabase_migrations.schema_migrations
WHERE version = '20250112';

-- Verify it's removed
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version;