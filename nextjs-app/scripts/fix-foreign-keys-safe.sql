-- Safely add foreign key relationships for DEV database
-- This version checks if columns exist before adding constraints

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
-- Projects table foreign keys (check columns first)
-- ============================================================================
DO $$
BEGIN
    -- Check if account_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'account_id'
    ) THEN
        -- Drop and recreate account_id foreign key
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_account_id_fkey;
        ALTER TABLE projects ADD CONSTRAINT projects_account_id_fkey 
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added projects_account_id_fkey';
    END IF;

    -- Check if created_by column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'created_by'
    ) THEN
        -- Drop and recreate created_by foreign key
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_created_by_fkey;
        ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey 
            FOREIGN KEY (created_by) REFERENCES auth.users(id);
        RAISE NOTICE 'Added projects_created_by_fkey';
    END IF;
END $$;

-- ============================================================================
-- Account Users table foreign keys
-- ============================================================================
DO $$
BEGIN
    -- Check if account_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'account_users' AND column_name = 'account_id'
    ) THEN
        ALTER TABLE account_users DROP CONSTRAINT IF EXISTS account_users_account_id_fkey;
        ALTER TABLE account_users ADD CONSTRAINT account_users_account_id_fkey 
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added account_users_account_id_fkey';
    END IF;

    -- Check if user_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'account_users' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE account_users DROP CONSTRAINT IF EXISTS account_users_user_id_fkey;
        ALTER TABLE account_users ADD CONSTRAINT account_users_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added account_users_user_id_fkey';
    END IF;
END $$;

-- ============================================================================
-- Pages table foreign keys (if table exists)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
        -- Check if project_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pages' AND column_name = 'project_id'
        ) THEN
            ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_project_id_fkey;
            ALTER TABLE pages ADD CONSTRAINT pages_project_id_fkey 
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added pages_project_id_fkey';
        END IF;

        -- Check if created_by column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pages' AND column_name = 'created_by'
        ) THEN
            ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_created_by_fkey;
            ALTER TABLE pages ADD CONSTRAINT pages_created_by_fkey 
                FOREIGN KEY (created_by) REFERENCES auth.users(id);
            RAISE NOTICE 'Added pages_created_by_fkey';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- Audit logs table foreign keys (if table exists)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Check if account_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'audit_logs' AND column_name = 'account_id'
        ) THEN
            ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_account_id_fkey;
            ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_account_id_fkey 
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added audit_logs_account_id_fkey';
        END IF;

        -- Check if user_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'audit_logs' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
            ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES auth.users(id);
            RAISE NOTICE 'Added audit_logs_user_id_fkey';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- User profiles table foreign keys (if table exists)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- Check if user_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_profiles' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
            ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_profiles_user_id_fkey';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- Project domains table foreign keys (if table exists)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_domains') THEN
        -- Check if project_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'project_domains' AND column_name = 'project_id'
        ) THEN
            ALTER TABLE project_domains DROP CONSTRAINT IF EXISTS project_domains_project_id_fkey;
            ALTER TABLE project_domains ADD CONSTRAINT project_domains_project_id_fkey 
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added project_domains_project_id_fkey';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- Notify PostgREST to reload schema cache (IMPORTANT!)
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Verify the constraints were created
-- ============================================================================
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    'SUCCESS' as status
FROM pg_constraint 
WHERE contype = 'f' 
    AND conrelid::regclass::text IN ('projects', 'account_users', 'pages', 'audit_logs', 'user_profiles', 'project_domains')
ORDER BY conrelid::regclass::text, conname;

-- ============================================================================
-- Check which columns exist in key tables (for debugging)
-- ============================================================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('projects', 'pages', 'account_users')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;