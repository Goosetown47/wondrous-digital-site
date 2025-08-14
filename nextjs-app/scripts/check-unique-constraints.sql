-- Check unique constraints on reserved_domain_permissions
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'reserved_domain_permissions'
    AND tc.table_schema = 'public'
    AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position;

-- Check if there's a unique index (not constraint)
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'reserved_domain_permissions'
    AND schemaname = 'public';

-- Check existing data
SELECT * FROM reserved_domain_permissions;