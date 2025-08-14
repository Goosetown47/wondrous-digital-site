-- Check what columns exist in DEV database tables
-- Run this to see actual schema

-- Check projects table columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'projects' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check library_items table columns (if exists)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'library_items' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check which tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;