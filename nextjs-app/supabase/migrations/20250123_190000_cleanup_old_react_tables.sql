/*
  # Clean Up Old React App Tables

  This migration removes all tables from the old React app that are no longer needed
  for the Next.js multi-tenant architecture.

  ## Tables Being Removed:
  
  ### Blog System
  - posts - Old blog system (Phase 5 in new PRD)
  
  ### User Management (Old Architecture)
  - customers - Replaced by Next.js multi-tenant approach
  - users - Will rebuild with proper auth later
  - external_links - Not needed yet
  
  ### Page Builder (Old Version)
  - pages (old) - CONFLICTS with Next.js pages table!
  - site_styles - Too simplistic for new theme engine
  - section_templates - Not aligned with Core/Lab/Library architecture
  - website_templates - Not aligned with new architecture
  - prospect_sites - Old demo system
  
  ### Deployment System (Netlify-based)
  - deployment_queue - Old Netlify deployment system
  - deployment_logs - Old deployment tracking
  - netlify_site_cache - No longer using Netlify
  
  ### Views
  - project_details_view - Based on old schema
  - project_stats_view - Based on old schema

  ## Tables Being Kept:
  - projects (Next.js version)
  - pages (Next.js version) 
  - project_domains
*/

-- First, drop views that depend on tables we're removing
DROP VIEW IF EXISTS project_details_view CASCADE;
DROP VIEW IF EXISTS project_stats_view CASCADE;

-- Drop old blog system
DROP TABLE IF EXISTS posts CASCADE;

-- Drop old user management
DROP TABLE IF EXISTS external_links CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Drop old page builder tables
-- Note: The old 'pages' table has a different structure than our Next.js one
-- We need to be careful here. Let's check if there's an old pages table first
DO $$ 
BEGIN
  -- Check if pages table has 'sections' column (Next.js version) or 'page_sections' (old version)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pages' 
    AND column_name = 'page_sections'
  ) THEN
    -- This is the old pages table, drop it
    DROP TABLE pages CASCADE;
  END IF;
END $$;

DROP TABLE IF EXISTS site_styles CASCADE;
DROP TABLE IF EXISTS section_templates CASCADE;
DROP TABLE IF EXISTS website_templates CASCADE;
DROP TABLE IF EXISTS prospect_sites CASCADE;

-- Drop old deployment system
DROP TABLE IF EXISTS deployment_queue CASCADE;
DROP TABLE IF EXISTS deployment_logs CASCADE;
DROP TABLE IF EXISTS netlify_site_cache CASCADE;

-- Drop any orphaned functions related to old tables
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Clean up any RLS policies on dropped tables (they should cascade, but being thorough)
-- These will already be gone due to CASCADE, but documenting what was cleaned up

-- Verify our Next.js tables still exist and have correct structure
DO $$ 
BEGIN
  -- Verify projects table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    RAISE EXCEPTION 'Critical: projects table is missing!';
  END IF;
  
  -- Verify pages table exists and has correct structure
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pages' 
    AND column_name = 'sections'
  ) THEN
    RAISE EXCEPTION 'Critical: pages table is missing or has wrong structure!';
  END IF;
  
  -- Verify project_domains table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_domains') THEN
    RAISE EXCEPTION 'Critical: project_domains table is missing!';
  END IF;
  
  RAISE NOTICE 'Database cleanup completed successfully. Only Next.js tables remain.';
END $$;