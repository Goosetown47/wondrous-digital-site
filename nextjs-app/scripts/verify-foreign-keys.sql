-- Verify and fix foreign key relationships for DEV database
-- Run this in Supabase Dashboard SQL Editor

-- ============================================================================
-- Check existing foreign key constraints
-- ============================================================================
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint 
WHERE contype = 'f' 
    AND conrelid::regclass::text IN ('projects', 'account_users', 'pages')
ORDER BY conrelid::regclass::text, conname;

-- ============================================================================
-- Drop and recreate foreign keys (if needed)
-- ============================================================================

-- Projects foreign keys
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_account_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_created_by_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Account Users foreign keys
ALTER TABLE account_users DROP CONSTRAINT IF EXISTS account_users_account_id_fkey;
ALTER TABLE account_users ADD CONSTRAINT account_users_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

ALTER TABLE account_users DROP CONSTRAINT IF EXISTS account_users_user_id_fkey;
ALTER TABLE account_users ADD CONSTRAINT account_users_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Pages foreign keys
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_project_id_fkey;
ALTER TABLE pages ADD CONSTRAINT pages_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_created_by_fkey;
ALTER TABLE pages ADD CONSTRAINT pages_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- ============================================================================
-- Notify PostgREST to reload schema cache
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Verify the constraints were created
-- ============================================================================
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint 
WHERE contype = 'f' 
    AND conrelid::regclass::text IN ('projects', 'account_users', 'pages')
ORDER BY conrelid::regclass::text, conname;