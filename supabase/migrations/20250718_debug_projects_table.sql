-- Debug migration to check projects table structure and data
-- This will help us understand what's causing the 400 error

-- Check if global navigation columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current projects data to understand the state
SELECT id, project_name, global_nav_section_id, global_footer_section_id
FROM projects 
LIMIT 10;

-- Check if there are any sections that might be navigation sections
SELECT s.id, s.type, s.created_at, s.content->>'backgroundColor' as bg_color
FROM sections s
WHERE s.type LIKE '%nav%' OR s.type LIKE '%footer%' OR s.type LIKE '%header%'
ORDER BY s.created_at DESC
LIMIT 10;

-- Check for any foreign key constraints on global nav fields
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='projects'
AND (kcu.column_name = 'global_nav_section_id' OR kcu.column_name = 'global_footer_section_id');