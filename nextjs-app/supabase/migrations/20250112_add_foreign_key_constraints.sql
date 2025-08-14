-- Add all missing foreign key constraints
-- These are required for PostgREST to understand table relationships

-- Account Users
ALTER TABLE account_users
    ADD CONSTRAINT account_users_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT account_users_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT account_users_invited_by_fkey 
    FOREIGN KEY (invited_by) REFERENCES auth.users(id);

-- Audit Logs
ALTER TABLE audit_logs
    ADD CONSTRAINT audit_logs_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Lab Drafts
ALTER TABLE lab_drafts
    ADD CONSTRAINT lab_drafts_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id),
    
    ADD CONSTRAINT lab_drafts_type_id_fkey 
    FOREIGN KEY (type_id) REFERENCES types(id);

-- Library Items
ALTER TABLE library_items
    ADD CONSTRAINT library_items_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id),
    
    ADD CONSTRAINT library_items_source_draft_id_fkey 
    FOREIGN KEY (source_draft_id) REFERENCES lab_drafts(id),
    
    ADD CONSTRAINT library_items_theme_id_fkey 
    FOREIGN KEY (theme_id) REFERENCES themes(id),
    
    ADD CONSTRAINT library_items_type_id_fkey 
    FOREIGN KEY (type_id) REFERENCES types(id);

-- Library Versions
ALTER TABLE library_versions
    ADD CONSTRAINT library_versions_library_item_id_fkey 
    FOREIGN KEY (library_item_id) REFERENCES library_items(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT library_versions_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Pages
ALTER TABLE pages
    ADD CONSTRAINT pages_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Profiles (legacy table)
ALTER TABLE profiles
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Project Domains
ALTER TABLE project_domains
    ADD CONSTRAINT project_domains_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Projects (most important for fixing the API errors)
ALTER TABLE projects
    ADD CONSTRAINT projects_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT projects_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id),
    
    ADD CONSTRAINT projects_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES library_items(id),
    
    ADD CONSTRAINT projects_theme_id_fkey 
    FOREIGN KEY (theme_id) REFERENCES themes(id);

-- Reserved Domain Permissions
ALTER TABLE reserved_domain_permissions
    ADD CONSTRAINT reserved_domain_permissions_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT reserved_domain_permissions_granted_by_fkey 
    FOREIGN KEY (granted_by) REFERENCES auth.users(id);

-- Roles
ALTER TABLE roles
    ADD CONSTRAINT roles_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

-- Staff Account Assignments
ALTER TABLE staff_account_assignments
    ADD CONSTRAINT staff_account_assignments_staff_user_id_fkey 
    FOREIGN KEY (staff_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT staff_account_assignments_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT staff_account_assignments_assigned_by_fkey 
    FOREIGN KEY (assigned_by) REFERENCES auth.users(id);

-- Themes
ALTER TABLE themes
    ADD CONSTRAINT themes_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- User Profiles
ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;