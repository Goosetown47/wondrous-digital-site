/*
  # Clean Up Remaining Old React App Tables

  This migration removes the remaining tables from the old React app that were missed
  in the first cleanup.

  ## Tables Being Removed:
  
  ### Maintenance & Logging
  - maintenance_pages - Old maintenance mode feature
  - audit_logs - Old activity logging system
  
  ### Project Management
  - project_status_history - Old project state tracking
  - project_versions - Old version control system
  
  ### Section Organization (Old System)
  - section_types - Old section categorization
  - section_categories - Old section grouping
  
  ### Navigation & Structure
  - navigation_links - Old navigation system
  - page_sections - Old page structure (different from Next.js 'pages' table)

  ## Final State:
  After this migration, only 3 tables will remain:
  - projects (Next.js version)
  - pages (Next.js version) 
  - project_domains
*/

-- Drop maintenance and logging tables
DROP TABLE IF EXISTS maintenance_pages CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Drop project management tables
DROP TABLE IF EXISTS project_status_history CASCADE;
DROP TABLE IF EXISTS project_versions CASCADE;

-- Drop old section organization tables
DROP TABLE IF EXISTS section_types CASCADE;
DROP TABLE IF EXISTS section_categories CASCADE;

-- Drop navigation and structure tables
DROP TABLE IF EXISTS navigation_links CASCADE;
DROP TABLE IF EXISTS page_sections CASCADE;

-- Final verification that only our Next.js tables remain
DO $$ 
DECLARE
  table_count INTEGER;
  extra_tables TEXT[];
BEGIN
  -- Count tables that aren't our expected ones
  SELECT COUNT(*), ARRAY_AGG(tablename) INTO table_count, extra_tables
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename NOT IN ('projects', 'pages', 'project_domains', 'schema_migrations');
  
  IF table_count > 0 THEN
    RAISE WARNING 'Found % unexpected tables: %', table_count, extra_tables;
  ELSE
    RAISE NOTICE 'Database cleanup complete! Only Next.js tables remain.';
  END IF;
END $$;