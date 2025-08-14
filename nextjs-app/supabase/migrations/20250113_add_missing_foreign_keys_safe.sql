-- Add missing foreign key constraints safely
-- Only adds constraints that don't already exist

DO $$
BEGIN
    -- Account Users
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_users_account_id_fkey') THEN
        ALTER TABLE account_users ADD CONSTRAINT account_users_account_id_fkey 
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_users_user_id_fkey') THEN
        ALTER TABLE account_users ADD CONSTRAINT account_users_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_users_invited_by_fkey') THEN
        ALTER TABLE account_users ADD CONSTRAINT account_users_invited_by_fkey 
        FOREIGN KEY (invited_by) REFERENCES auth.users(id);
    END IF;

    -- Audit Logs
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_account_id_fkey') THEN
        ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_account_id_fkey 
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_user_id_fkey') THEN
        ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id);
    END IF;

    -- Lab Drafts
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_drafts_created_by_fkey') THEN
        ALTER TABLE lab_drafts ADD CONSTRAINT lab_drafts_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_drafts_type_id_fkey') THEN
        ALTER TABLE lab_drafts ADD CONSTRAINT lab_drafts_type_id_fkey 
        FOREIGN KEY (type_id) REFERENCES types(id);
    END IF;

    -- Library Items
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'library_items_created_by_fkey') THEN
        ALTER TABLE library_items ADD CONSTRAINT library_items_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'library_items_source_draft_id_fkey') THEN
        ALTER TABLE library_items ADD CONSTRAINT library_items_source_draft_id_fkey 
        FOREIGN KEY (source_draft_id) REFERENCES lab_drafts(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'library_items_theme_id_fkey') THEN
        ALTER TABLE library_items ADD CONSTRAINT library_items_theme_id_fkey 
        FOREIGN KEY (theme_id) REFERENCES themes(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'library_items_type_id_fkey') THEN
        ALTER TABLE library_items ADD CONSTRAINT library_items_type_id_fkey 
        FOREIGN KEY (type_id) REFERENCES types(id);
    END IF;

    -- Library Versions
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'library_versions_library_item_id_fkey') THEN
        ALTER TABLE library_versions ADD CONSTRAINT library_versions_library_item_id_fkey 
        FOREIGN KEY (library_item_id) REFERENCES library_items(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'library_versions_created_by_fkey') THEN
        ALTER TABLE library_versions ADD CONSTRAINT library_versions_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;

    -- Pages
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_project_id_fkey') THEN
        ALTER TABLE pages ADD CONSTRAINT pages_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;

    -- Profiles (legacy table)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Project Domains
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_domains_project_id_fkey') THEN
        ALTER TABLE project_domains ADD CONSTRAINT project_domains_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;

    -- Projects (most important for fixing the API errors)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_account_id_fkey') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_account_id_fkey 
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_created_by_fkey') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_template_id_fkey') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_template_id_fkey 
        FOREIGN KEY (template_id) REFERENCES library_items(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_theme_id_fkey') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_theme_id_fkey 
        FOREIGN KEY (theme_id) REFERENCES themes(id);
    END IF;

    -- Reserved Domain Permissions
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reserved_domain_permissions_account_id_fkey') THEN
        ALTER TABLE reserved_domain_permissions ADD CONSTRAINT reserved_domain_permissions_account_id_fkey 
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reserved_domain_permissions_granted_by_fkey') THEN
        ALTER TABLE reserved_domain_permissions ADD CONSTRAINT reserved_domain_permissions_granted_by_fkey 
        FOREIGN KEY (granted_by) REFERENCES auth.users(id);
    END IF;

    -- Roles
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'roles_account_id_fkey') THEN
        ALTER TABLE roles ADD CONSTRAINT roles_account_id_fkey 
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
    END IF;

    -- Staff Account Assignments
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_account_assignments_staff_user_id_fkey') THEN
        ALTER TABLE staff_account_assignments ADD CONSTRAINT staff_account_assignments_staff_user_id_fkey 
        FOREIGN KEY (staff_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_account_assignments_account_id_fkey') THEN
        ALTER TABLE staff_account_assignments ADD CONSTRAINT staff_account_assignments_account_id_fkey 
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_account_assignments_assigned_by_fkey') THEN
        ALTER TABLE staff_account_assignments ADD CONSTRAINT staff_account_assignments_assigned_by_fkey 
        FOREIGN KEY (assigned_by) REFERENCES auth.users(id);
    END IF;

    -- Themes
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'themes_created_by_fkey') THEN
        ALTER TABLE themes ADD CONSTRAINT themes_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;

    -- User Profiles
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_user_id_fkey') THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    RAISE NOTICE 'Foreign key constraints check completed';
END $$;

-- Let's also check which constraints were added
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as references_table
FROM pg_constraint 
WHERE contype = 'f' 
AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;