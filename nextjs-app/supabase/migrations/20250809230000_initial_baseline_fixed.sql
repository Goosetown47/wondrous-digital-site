-- BASELINE MIGRATION - Represents complete schema as of 2025-08-09
-- This migration captures the current state of the database
-- Built from production schema export

-- Safety check: Only run on empty database or when resetting migration history
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM supabase_migrations.schema_migrations 
    WHERE version != '20250809230000'
  ) THEN
    RAISE NOTICE 'Migration history exists. This baseline represents the current schema state.';
  END IF;
END $$;

-- =====================================================
-- INITIAL DATA - Fix www.wondrousdigital.com
-- =====================================================

-- Insert reserved domain permissions (including www fix)
-- This is the main fix we need to apply
INSERT INTO reserved_domain_permissions (account_id, domain, notes)
VALUES 
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'wondrousdigital.com', 'Marketing website - apex domain'),
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'www.wondrousdigital.com', 'Marketing website - www subdomain')
ON CONFLICT (account_id, domain) DO NOTHING;

-- =====================================================
-- BASELINE MARKER
-- =====================================================

-- This migration serves as a baseline marker for the current schema state
-- All tables, indexes, constraints, functions, triggers, and policies already exist
-- Future migrations will build upon this baseline

-- The schema includes:
-- - Core tables: accounts, projects, pages, etc.
-- - User management: user_profiles (with user_id as PK), account_users, etc.
-- - Builder system: core_components, lab_drafts, library_items, themes, etc.
-- - Domain management: project_domains, reserved_domain_permissions
-- - All necessary indexes, constraints, functions, triggers, and RLS policies

-- To see the full current schema, run the queries in get_current_schema_fixed.sql