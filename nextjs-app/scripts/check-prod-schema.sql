-- Run this in your PRODUCTION Supabase Dashboard to see the actual schema
-- This will help us understand the discrepancy between PROD and DEV

-- ============================================================================
-- Check projects table columns in PRODUCTION
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'projects' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- Check pages table columns
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pages' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- Check library_items table columns (if exists)
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'library_items' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- Check lab_drafts table columns
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'lab_drafts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- Check if 'status' columns exist anywhere
-- ============================================================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE column_name = 'status' 
    AND table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- Check if 'published' columns exist anywhere
-- ============================================================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE column_name = 'published' 
    AND table_schema = 'public'
ORDER BY table_name;