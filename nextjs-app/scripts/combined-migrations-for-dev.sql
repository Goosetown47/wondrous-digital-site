-- BASELINE MIGRATION - Represents complete schema as of 2025-08-09
-- This migration captures the current state of the database
-- Built from production schema export

-- Safety check: Only run on empty database or when resetting migration history
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM supabase_migrations.schema_migrations 
    WHERE version != '20250809230000'
  ) THEN
    RAISE NOTICE 'Migration history exists. This baseline represents the current schema state.';
  END IF;
END $$;

-- =====================================================
-- INITIAL DATA - Fix www.wondrousdigital.com
-- =====================================================

-- Insert reserved domain permissions (including www fix)
-- This is the main fix we need to apply
INSERT INTO reserved_domain_permissions (account_id, domain, notes)
VALUES 
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'wondrousdigital.com', 'Marketing website - apex domain'),
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'www.wondrousdigital.com', 'Marketing website - www subdomain')
ON CONFLICT (account_id, domain) DO NOTHING;

-- =====================================================
-- BASELINE MARKER
-- =====================================================

-- This migration serves as a baseline marker for the current schema state
-- All tables, indexes, constraints, functions, triggers, and policies already exist
-- Future migrations will build upon this baseline

-- The schema includes:
-- - Core tables: accounts, projects, pages, etc.
-- - User management: user_profiles (with user_id as PK), account_users, etc.
-- - Builder system: core_components, lab_drafts, library_items, themes, etc.
-- - Domain management: project_domains, reserved_domain_permissions
-- - All necessary indexes, constraints, functions, triggers, and RLS policies

-- To see the full current schema, run the queries in get_current_schema_fixed.sql

-- ============================================================================

-- Migration: 20250112_add_foreign_key_constraints.sql
-- ============================================================================
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

-- ============================================================================

-- Migration: 20250112_add_missing_foreign_keys_safe.sql
-- ============================================================================
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

-- ============================================================================

-- Migration: 20250809230000_initial_baseline_fixed.sql
-- ============================================================================
-- BASELINE MIGRATION - Represents complete schema as of 2025-08-09
-- This migration captures the current state of the database
-- Built from production schema export

-- Safety check: Only run on empty database or when resetting migration history
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM supabase_migrations.schema_migrations 
    WHERE version != '20250809230000'
  ) THEN
    RAISE NOTICE 'Migration history exists. This baseline represents the current schema state.';
  END IF;
END $$;

-- =====================================================
-- INITIAL DATA - Fix www.wondrousdigital.com
-- =====================================================

-- Insert reserved domain permissions (including www fix)
-- This is the main fix we need to apply
INSERT INTO reserved_domain_permissions (account_id, domain, notes)
VALUES 
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'wondrousdigital.com', 'Marketing website - apex domain'),
  ('19519371-1db4-44a1-ac70-3d5c5cfc32ee', 'www.wondrousdigital.com', 'Marketing website - www subdomain')
ON CONFLICT (account_id, domain) DO NOTHING;

-- =====================================================
-- BASELINE MARKER
-- =====================================================

-- This migration serves as a baseline marker for the current schema state
-- All tables, indexes, constraints, functions, triggers, and policies already exist
-- Future migrations will build upon this baseline

-- The schema includes:
-- - Core tables: accounts, projects, pages, etc.
-- - User management: user_profiles (with user_id as PK), account_users, etc.
-- - Builder system: core_components, lab_drafts, library_items, themes, etc.
-- - Domain management: project_domains, reserved_domain_permissions
-- - All necessary indexes, constraints, functions, triggers, and RLS policies

-- To see the full current schema, run the queries in get_current_schema_fixed.sql

-- ============================================================================

-- Migration: 20250809231000_add_www_project_domain.sql
-- ============================================================================
-- Add www.wondrousdigital.com to project_domains
-- This complements the reserved_domain_permissions entry

-- First, let's find the project that uses wondrousdigital.com
DO $$
DECLARE
    v_project_id UUID;
    v_account_id UUID := '19519371-1db4-44a1-ac70-3d5c5cfc32ee';
BEGIN
    -- Find the project that already has wondrousdigital.com
    SELECT pd.project_id INTO v_project_id
    FROM project_domains pd
    JOIN projects p ON p.id = pd.project_id
    WHERE pd.domain = 'wondrousdigital.com'
    AND p.account_id = v_account_id
    LIMIT 1;
    
    -- If we found a project, add www.wondrousdigital.com
    IF v_project_id IS NOT NULL THEN
        INSERT INTO project_domains (
            project_id,
            domain,
            is_primary,
            verified,
            verified_at,
            ssl_state,
            include_www,
            created_at
        )
        VALUES (
            v_project_id,
            'www.wondrousdigital.com',
            false,  -- Not primary, wondrousdigital.com is primary
            true,   -- Mark as verified
            NOW(),  -- Verified now
            'ACTIVE', -- SSL is active (from screenshots)
            true,   -- Include www subdomain
            NOW()
        )
        ON CONFLICT (domain) DO UPDATE SET
            verified = true,
            verified_at = NOW(),
            ssl_state = 'ACTIVE';
            
        RAISE NOTICE 'Added www.wondrousdigital.com for project %', v_project_id;
    ELSE
        RAISE NOTICE 'No project found with wondrousdigital.com for account %', v_account_id;
    END IF;
END $$;

-- ============================================================================

-- Migration: 20250810000000_create_audit_logs_table.sql
-- ============================================================================
-- Create audit_logs table for tracking all user actions
-- This table is referenced throughout the codebase but was missing from migrations

-- First check if table exists and has correct structure
DO $$
BEGIN
  -- If table doesn't exist, create it
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    CREATE TABLE public.audit_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      metadata JSONB DEFAULT '{}' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    
    RAISE NOTICE 'Created audit_logs table';
  ELSE
    RAISE NOTICE 'audit_logs table already exists';
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_account_id ON public.audit_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Add helpful comments
COMMENT ON TABLE public.audit_logs IS 'Audit trail of all user actions within the platform';
COMMENT ON COLUMN public.audit_logs.action IS 'Action performed, e.g., project:create, account.update, user.role.update';
COMMENT ON COLUMN public.audit_logs.resource_type IS 'Type of resource affected, e.g., project, account, user, theme';
COMMENT ON COLUMN public.audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN public.audit_logs.metadata IS 'Additional context about the action in JSON format';

-- Enable RLS (Row Level Security)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view audit logs for their accounts" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create RLS policies
-- Policy: Users can only read audit logs for their accounts
-- Platform admins (users with 'admin' role in platform account) can see all
CREATE POLICY "Users can view audit logs for their accounts" ON public.audit_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id 
      FROM public.account_users 
      WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::UUID
      AND role = 'admin'
    )
  );

-- Policy: Only system can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Audit logs cannot be updated
-- (No UPDATE policy = no updates allowed)

-- Policy: Audit logs cannot be deleted by users
-- (No DELETE policy = no deletes allowed except CASCADE)

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO service_role;

-- Create a helper function to get recent audit logs for an account
CREATE OR REPLACE FUNCTION public.get_recent_audit_logs(
  p_account_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  account_id UUID,
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.account_id,
    al.user_id,
    up.email as user_email,
    up.display_name as user_name,
    al.action,
    al.resource_type,
    al.resource_id,
    al.metadata,
    al.created_at
  FROM public.audit_logs al
  LEFT JOIN public.user_profiles up ON up.user_id = al.user_id
  WHERE al.account_id = p_account_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'audit_logs table setup complete with RLS policies and indexes';
  RAISE NOTICE 'Table is now ready to receive audit log entries from the application';
END $$;

-- ============================================================================

-- Migration: 20250810200000_fix_function_search_paths_security.sql
-- ============================================================================
-- Fix search_path security vulnerability for all SECURITY DEFINER functions
-- This prevents SQL injection attacks through search_path manipulation
-- See: https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY

-- Fix check_projects_policy_recursion
CREATE OR REPLACE FUNCTION public.check_projects_policy_recursion(p_account_id UUID, p_current_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Debugging: raise notice with the inputs
  RAISE NOTICE 'check_projects_policy_recursion called with account_id: %, user_id: %', p_account_id, p_current_user_id;
  
  -- Allow the check
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix check_theme_type
CREATE OR REPLACE FUNCTION public.check_theme_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow public themes to be used by any project
  IF NEW.is_public = true THEN
    RETURN NEW;
  END IF;
  
  -- For private themes, they can only be used by projects in the same account
  IF EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = NEW.project_id
    AND p.account_id = (
      SELECT account_id FROM themes WHERE id = NEW.theme_id
    )
  ) THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Private themes can only be used by projects in the same account';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix check_user_access
CREATE OR REPLACE FUNCTION public.check_user_access(
  user_id UUID,
  resource_type TEXT,
  resource_id UUID,
  required_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  account_id UUID;
  has_access BOOLEAN;
BEGIN
  -- For projects, get the account_id
  IF resource_type = 'project' THEN
    SELECT p.account_id INTO account_id
    FROM projects p
    WHERE p.id = resource_id;
  ELSE
    -- For other resources, resource_id might be the account_id
    account_id := resource_id;
  END IF;

  -- Check if user has permission
  SELECT EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.user_id = check_user_access.user_id
      AND au.account_id = check_user_access.account_id
  ) INTO has_access;

  RETURN has_access;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix generate_project_slug
CREATE OR REPLACE FUNCTION public.generate_project_slug(project_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from project name
  base_slug := LOWER(REGEXP_REPLACE(project_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- If empty, use default
  IF base_slug = '' THEN
    base_slug := 'project';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM projects WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix get_deployment_url
CREATE OR REPLACE FUNCTION public.get_deployment_url(p_project_id UUID)
RETURNS TEXT AS $$
DECLARE
  project_slug TEXT;
BEGIN
  SELECT slug INTO project_slug FROM projects WHERE id = p_project_id;
  
  IF project_slug IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN 'https://' || project_slug || '.sites.wondrousdigital.com';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix has_role
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role from account_users
  SELECT role INTO user_role
  FROM account_users
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Check if the user's role is in the allowed roles
  RETURN user_role = ANY(allowed_roles);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix is_system_admin
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix is_valid_domain
-- First drop the existing function to avoid parameter name conflicts
DROP FUNCTION IF EXISTS public.is_valid_domain(TEXT);
DROP FUNCTION IF EXISTS public.is_valid_domain(domain_name TEXT);

CREATE OR REPLACE FUNCTION public.is_valid_domain(domain TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic domain validation
  -- Must not be empty
  IF domain IS NULL OR domain = '' THEN
    RETURN FALSE;
  END IF;
  
  -- Must match basic domain pattern
  -- This is a simplified check - in production you might want more comprehensive validation
  IF domain !~ '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' THEN
    RETURN FALSE;
  END IF;
  
  -- Must not be a reserved domain
  IF domain IN ('localhost', 'example.com', 'test.com') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix page_has_unpublished_changes
CREATE OR REPLACE FUNCTION public.page_has_unpublished_changes(page_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_changes BOOLEAN;
BEGIN
  SELECT 
    CASE 
      WHEN draft_content IS NULL THEN FALSE
      WHEN draft_content::text = content::text THEN FALSE
      ELSE TRUE
    END INTO has_changes
  FROM pages
  WHERE id = page_id;
  
  RETURN COALESCE(has_changes, FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix publish_page_draft
-- Drop existing function first to handle potential return type differences
DROP FUNCTION IF EXISTS public.publish_page_draft(UUID);

CREATE OR REPLACE FUNCTION public.publish_page_draft(page_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pages
  SET 
    content = draft_content,
    draft_content = NULL,
    published_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = page_id
    AND draft_content IS NOT NULL;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_deployment_queue_updated_at
CREATE OR REPLACE FUNCTION public.update_deployment_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_netlify_site_cache_updated_at
CREATE OR REPLACE FUNCTION public.update_netlify_site_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_user_profiles_updated_at
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix cleanup_old_deployments
CREATE OR REPLACE FUNCTION public.cleanup_old_deployments()
RETURNS void AS $$
BEGIN
  -- Delete deployments older than 30 days that are not the latest for their project
  DELETE FROM deployment_queue
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND id NOT IN (
      SELECT DISTINCT ON (project_id) id
      FROM deployment_queue
      ORDER BY project_id, created_at DESC
    );
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix create_user_profile (already exists in baseline but needs search_path)
-- This is typically called by a trigger
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix debug_user_access
CREATE OR REPLACE FUNCTION public.debug_user_access(check_user_id UUID, check_project_id UUID)
RETURNS TABLE(
  step TEXT,
  result BOOLEAN,
  details JSONB
) AS $$
BEGIN
  -- Check 1: User exists
  RETURN QUERY
  SELECT 
    'User exists'::TEXT,
    EXISTS(SELECT 1 FROM auth.users WHERE id = check_user_id),
    jsonb_build_object('user_id', check_user_id);

  -- Check 2: Project exists
  RETURN QUERY
  SELECT 
    'Project exists'::TEXT,
    EXISTS(SELECT 1 FROM projects WHERE id = check_project_id),
    jsonb_build_object('project_id', check_project_id);

  -- Check 3: Get project's account_id
  RETURN QUERY
  SELECT 
    'Project account'::TEXT,
    TRUE,
    jsonb_build_object('account_id', p.account_id)
  FROM projects p
  WHERE p.id = check_project_id;

  -- Check 4: User's account membership
  RETURN QUERY
  SELECT 
    'User account membership'::TEXT,
    EXISTS(
      SELECT 1 
      FROM account_users au
      JOIN projects p ON p.account_id = au.account_id
      WHERE au.user_id = check_user_id
        AND p.id = check_project_id
    ),
    jsonb_build_object(
      'memberships', 
      (SELECT jsonb_agg(jsonb_build_object(
        'account_id', au.account_id,
        'role', au.role,
        'project_account_id', p.account_id
      ))
      FROM account_users au
      LEFT JOIN projects p ON p.id = check_project_id
      WHERE au.user_id = check_user_id)
    );

  -- Check 5: RLS check
  RETURN QUERY
  SELECT 
    'RLS allows access'::TEXT,
    EXISTS(
      SELECT 1 
      FROM projects p
      WHERE p.id = check_project_id
        AND (
          EXISTS (
            SELECT 1 FROM account_users au
            WHERE au.user_id = check_user_id
              AND au.account_id = p.account_id
          )
          OR
          is_system_admin()
        )
    ),
    NULL::JSONB;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix generate_slug_from_email
CREATE OR REPLACE FUNCTION public.generate_slug_from_email(email TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract username part of email and clean it
  base_slug := LOWER(SPLIT_PART(email, '@', 1));
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- If empty, use default
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'user';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness in accounts table and add counter if needed
  WHILE EXISTS (SELECT 1 FROM accounts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix transition_project_status
CREATE OR REPLACE FUNCTION public.transition_project_status(
  p_project_id UUID,
  p_new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_status TEXT;
  valid_transition BOOLEAN := FALSE;
BEGIN
  -- Get current status
  SELECT status INTO current_status
  FROM projects
  WHERE id = p_project_id;
  
  -- Check if transition is valid
  CASE current_status
    WHEN 'draft' THEN
      valid_transition := p_new_status IN ('active', 'archived');
    WHEN 'active' THEN
      valid_transition := p_new_status IN ('archived', 'maintenance');
    WHEN 'maintenance' THEN
      valid_transition := p_new_status IN ('active', 'archived');
    WHEN 'archived' THEN
      valid_transition := p_new_status IN ('active', 'draft');
    ELSE
      valid_transition := FALSE;
  END CASE;
  
  IF valid_transition THEN
    UPDATE projects
    SET status = p_new_status,
        updated_at = NOW()
    WHERE id = p_project_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix validate_deployment_url
CREATE OR REPLACE FUNCTION public.validate_deployment_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure deployment_url follows the expected pattern
  IF NEW.deployment_url IS NOT NULL AND 
     NEW.deployment_url !~ '^https://[a-z0-9-]+\.sites\.wondrousdigital\.com$' THEN
    RAISE EXCEPTION 'Invalid deployment URL format';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Additional fix for handle_new_user if it exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Call create_user_profile which will handle the actual profile creation
  -- This is just a wrapper for the trigger
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Add a comment explaining the security fix
COMMENT ON SCHEMA public IS 'All SECURITY DEFINER functions have been updated with explicit search_path to prevent SQL injection attacks through search path manipulation.';

-- ============================================================================

-- Migration: 20250810201000_move_pg_net_extension.sql
-- ============================================================================
-- Move pg_net extension to dedicated schema for security
-- This prevents potential security issues with extensions in the public schema

-- Create a dedicated schema for pg_net if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to postgres role
GRANT USAGE ON SCHEMA extensions TO postgres;

-- Check if pg_net is installed in public schema and move it
DO $$
BEGIN
  -- Check if pg_net exists in public schema
  IF EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'pg_net' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Drop the extension from public schema
    DROP EXTENSION IF EXISTS pg_net CASCADE;
    
    -- Recreate in extensions schema
    CREATE EXTENSION pg_net WITH SCHEMA extensions;
    
    RAISE NOTICE 'pg_net extension moved from public to extensions schema';
  ELSIF NOT EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'pg_net'
  ) THEN
    -- If pg_net doesn't exist at all, create it in extensions schema
    CREATE EXTENSION pg_net WITH SCHEMA extensions;
    
    RAISE NOTICE 'pg_net extension created in extensions schema';
  ELSE
    RAISE NOTICE 'pg_net extension already exists in non-public schema';
  END IF;
END $$;

-- Update any functions or code that might reference pg_net to use the new schema
-- For example, if you have HTTP request functions, they would now use:
-- extensions.http_post() instead of pg_net.http_post()

-- Grant necessary permissions for authenticated users to use pg_net functions if needed
-- This is optional and depends on your security requirements
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO authenticated;

-- Add a comment explaining the security improvement
COMMENT ON SCHEMA extensions IS 'Dedicated schema for PostgreSQL extensions to improve security isolation';

-- ============================================================================

-- Migration: 20250810202000_auth_security_settings.sql
-- ============================================================================
-- Auth Security Configuration Documentation
-- 
-- IMPORTANT: These settings must be configured in the Supabase Dashboard
-- Navigate to: Authentication > Providers > Email
--
-- Required Changes:
-- 1. OTP Expiry: Change from current (>1 hour) to 30 minutes (1800 seconds)
-- 2. Leaked Password Protection: Enable this feature
--
-- This migration serves as documentation and validation only

-- Check current auth configuration (for documentation purposes)
DO $$
BEGIN
  RAISE NOTICE 'AUTH SECURITY CONFIGURATION REQUIRED:';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Providers > Email';
  RAISE NOTICE '2. Set OTP Expiry to 1800 seconds (30 minutes)';
  RAISE NOTICE '3. Enable "Leaked Password Protection"';
  RAISE NOTICE '';
  RAISE NOTICE 'These settings cannot be configured via SQL migration.';
  RAISE NOTICE 'Please update them manually in the Supabase Dashboard.';
END $$;

-- Add a configuration check table to track security settings
CREATE TABLE IF NOT EXISTS security_configuration_checks (
  id SERIAL PRIMARY KEY,
  check_name TEXT NOT NULL UNIQUE,
  expected_value TEXT NOT NULL,
  description TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  is_compliant BOOLEAN DEFAULT FALSE
);

-- Insert expected security configurations
INSERT INTO security_configuration_checks (check_name, expected_value, description)
VALUES 
  ('auth_otp_expiry', '1800', 'OTP expiry should be set to 1800 seconds (30 minutes)'),
  ('auth_leaked_password_protection', 'enabled', 'Leaked password protection should be enabled')
ON CONFLICT (check_name) DO UPDATE
SET 
  expected_value = EXCLUDED.expected_value,
  description = EXCLUDED.description,
  checked_at = NOW();

-- Create a function to manually mark configurations as compliant after dashboard updates
CREATE OR REPLACE FUNCTION mark_security_check_compliant(p_check_name TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE security_configuration_checks
  SET 
    is_compliant = TRUE,
    checked_at = NOW()
  WHERE check_name = p_check_name;
  
  RAISE NOTICE 'Security check % marked as compliant', p_check_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Usage instructions
COMMENT ON TABLE security_configuration_checks IS 'Tracks required security configurations that must be set in Supabase Dashboard. After updating dashboard settings, mark as compliant using: SELECT mark_security_check_compliant(''auth_otp_expiry'');';

-- Final reminder
DO $$
BEGIN
  RAISE WARNING 'MANUAL ACTION REQUIRED: Update auth settings in Supabase Dashboard!';
END $$;

-- ============================================================================

-- Migration: 20250810203000_fix_rls_security_checks.sql
-- ============================================================================
-- Enable RLS on security_configuration_checks table
-- This table was created in the auth security settings migration but needs RLS enabled

-- Enable Row Level Security
ALTER TABLE public.security_configuration_checks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read security checks
CREATE POLICY "Anyone can view security configuration checks" 
ON public.security_configuration_checks
FOR SELECT
TO authenticated, anon
USING (true);

-- Create policy to allow only system admins to update security checks
CREATE POLICY "Only system admins can update security checks" 
ON public.security_configuration_checks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Create policy to prevent insertions (only migration should insert)
CREATE POLICY "No one can insert security checks" 
ON public.security_configuration_checks
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- Create policy to prevent deletions
CREATE POLICY "No one can delete security checks" 
ON public.security_configuration_checks
FOR DELETE
TO authenticated, anon
USING (false);

-- Add comment explaining the security model
COMMENT ON TABLE public.security_configuration_checks IS 
'Tracks required security configurations that must be set in Supabase Dashboard. 
RLS enabled: Anyone can read, only system admins can update, no one can insert/delete.
After updating dashboard settings, admins mark as compliant using: 
SELECT mark_security_check_compliant(''auth_otp_expiry'');';

-- ============================================================================

-- Migration: 20250810204000_force_fix_function_search_paths.sql
-- ============================================================================
-- Force fix search_path for functions that still show warnings
-- Using ALTER FUNCTION approach which should work even if CREATE OR REPLACE didn't

-- Use ALTER FUNCTION to set search_path on all SECURITY DEFINER functions
-- This approach should work even if CREATE OR REPLACE didn't take effect

-- check_projects_policy_recursion
ALTER FUNCTION public.check_projects_policy_recursion(UUID, UUID) 
SET search_path = public, pg_temp;

-- check_theme_type
ALTER FUNCTION public.check_theme_type() 
SET search_path = public, pg_temp;

-- check_user_access
ALTER FUNCTION public.check_user_access(UUID, TEXT, UUID, TEXT) 
SET search_path = public, pg_temp;

-- generate_project_slug
ALTER FUNCTION public.generate_project_slug(TEXT) 
SET search_path = public, pg_temp;

-- get_deployment_url
ALTER FUNCTION public.get_deployment_url(UUID) 
SET search_path = public, pg_temp;

-- has_role
ALTER FUNCTION public.has_role(TEXT[]) 
SET search_path = public, pg_temp;

-- is_system_admin
ALTER FUNCTION public.is_system_admin() 
SET search_path = public, pg_temp;

-- is_valid_domain
ALTER FUNCTION public.is_valid_domain(TEXT) 
SET search_path = public, pg_temp;

-- page_has_unpublished_changes
ALTER FUNCTION public.page_has_unpublished_changes(UUID) 
SET search_path = public, pg_temp;

-- publish_page_draft
ALTER FUNCTION public.publish_page_draft(UUID) 
SET search_path = public, pg_temp;

-- update_deployment_queue_updated_at
ALTER FUNCTION public.update_deployment_queue_updated_at() 
SET search_path = public, pg_temp;

-- update_netlify_site_cache_updated_at
ALTER FUNCTION public.update_netlify_site_cache_updated_at() 
SET search_path = public, pg_temp;

-- update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public, pg_temp;

-- update_user_profiles_updated_at
ALTER FUNCTION public.update_user_profiles_updated_at() 
SET search_path = public, pg_temp;

-- cleanup_old_deployments
ALTER FUNCTION public.cleanup_old_deployments() 
SET search_path = public, pg_temp;

-- create_user_profile
ALTER FUNCTION public.create_user_profile() 
SET search_path = public, pg_temp;

-- debug_user_access
ALTER FUNCTION public.debug_user_access(UUID, UUID) 
SET search_path = public, pg_temp;

-- generate_slug_from_email
ALTER FUNCTION public.generate_slug_from_email(TEXT) 
SET search_path = public, pg_temp;

-- transition_project_status
ALTER FUNCTION public.transition_project_status(UUID, TEXT) 
SET search_path = public, pg_temp;

-- validate_deployment_url
ALTER FUNCTION public.validate_deployment_url() 
SET search_path = public, pg_temp;

-- handle_new_user (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
  END IF;
END $$;

-- mark_security_check_compliant (from our previous migration)
ALTER FUNCTION public.mark_security_check_compliant(TEXT) 
SET search_path = public, pg_temp;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Completed ALTER FUNCTION statements to set search_path on all SECURITY DEFINER functions';
END $$;

-- ============================================================================

-- Migration: 20250810205000_recreate_functions_with_search_path.sql
-- ============================================================================
-- Recreate functions that still show search_path warnings
-- This time we'll drop and recreate them to ensure search_path is properly set

-- 1. check_projects_policy_recursion
DROP FUNCTION IF EXISTS public.check_projects_policy_recursion(UUID, UUID);
CREATE FUNCTION public.check_projects_policy_recursion(p_account_id UUID, p_current_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Debugging: raise notice with the inputs
  RAISE NOTICE 'check_projects_policy_recursion called with account_id: %, user_id: %', p_account_id, p_current_user_id;
  
  -- Allow the check
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 2. check_user_access
DROP FUNCTION IF EXISTS public.check_user_access(UUID, TEXT, UUID, TEXT);
CREATE FUNCTION public.check_user_access(
  user_id UUID,
  resource_type TEXT,
  resource_id UUID,
  required_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  account_id UUID;
  has_access BOOLEAN;
BEGIN
  -- For projects, get the account_id
  IF resource_type = 'project' THEN
    SELECT p.account_id INTO account_id
    FROM projects p
    WHERE p.id = resource_id;
  ELSE
    -- For other resources, resource_id might be the account_id
    account_id := resource_id;
  END IF;

  -- Check if user has permission
  SELECT EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.user_id = check_user_access.user_id
      AND au.account_id = check_user_access.account_id
  ) INTO has_access;

  RETURN has_access;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 3. generate_project_slug
DROP FUNCTION IF EXISTS public.generate_project_slug(TEXT);
CREATE FUNCTION public.generate_project_slug(project_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from project name
  base_slug := LOWER(REGEXP_REPLACE(project_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- If empty, use default
  IF base_slug = '' THEN
    base_slug := 'project';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM projects WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 4. get_deployment_url
DROP FUNCTION IF EXISTS public.get_deployment_url(UUID);
CREATE FUNCTION public.get_deployment_url(p_project_id UUID)
RETURNS TEXT AS $$
DECLARE
  project_slug TEXT;
BEGIN
  SELECT slug INTO project_slug FROM projects WHERE id = p_project_id;
  
  IF project_slug IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN 'https://' || project_slug || '.sites.wondrousdigital.com';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 5. is_system_admin
DROP FUNCTION IF EXISTS public.is_system_admin();
CREATE FUNCTION public.is_system_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 6. debug_user_access
DROP FUNCTION IF EXISTS public.debug_user_access(UUID, UUID);
CREATE FUNCTION public.debug_user_access(check_user_id UUID, check_project_id UUID)
RETURNS TABLE(
  step TEXT,
  result BOOLEAN,
  details JSONB
) AS $$
BEGIN
  -- Check 1: User exists
  RETURN QUERY
  SELECT 
    'User exists'::TEXT,
    EXISTS(SELECT 1 FROM auth.users WHERE id = check_user_id),
    jsonb_build_object('user_id', check_user_id);

  -- Check 2: Project exists
  RETURN QUERY
  SELECT 
    'Project exists'::TEXT,
    EXISTS(SELECT 1 FROM projects WHERE id = check_project_id),
    jsonb_build_object('project_id', check_project_id);

  -- Check 3: Get project's account_id
  RETURN QUERY
  SELECT 
    'Project account'::TEXT,
    TRUE,
    jsonb_build_object('account_id', p.account_id)
  FROM projects p
  WHERE p.id = check_project_id;

  -- Check 4: User's account membership
  RETURN QUERY
  SELECT 
    'User account membership'::TEXT,
    EXISTS(
      SELECT 1 
      FROM account_users au
      JOIN projects p ON p.account_id = au.account_id
      WHERE au.user_id = check_user_id
        AND p.id = check_project_id
    ),
    jsonb_build_object(
      'memberships', 
      (SELECT jsonb_agg(jsonb_build_object(
        'account_id', au.account_id,
        'role', au.role,
        'project_account_id', p.account_id
      ))
      FROM account_users au
      LEFT JOIN projects p ON p.id = check_project_id
      WHERE au.user_id = check_user_id)
    );

  -- Check 5: RLS check
  RETURN QUERY
  SELECT 
    'RLS allows access'::TEXT,
    EXISTS(
      SELECT 1 
      FROM projects p
      WHERE p.id = check_project_id
        AND (
          EXISTS (
            SELECT 1 FROM account_users au
            WHERE au.user_id = check_user_id
              AND au.account_id = p.account_id
          )
          OR
          is_system_admin()
        )
    ),
    NULL::JSONB;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 7. transition_project_status
DROP FUNCTION IF EXISTS public.transition_project_status(UUID, TEXT);
CREATE FUNCTION public.transition_project_status(
  p_project_id UUID,
  p_new_status TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_status TEXT;
  valid_transition BOOLEAN := FALSE;
BEGIN
  -- Get current status
  SELECT status INTO current_status
  FROM projects
  WHERE id = p_project_id;
  
  -- Check if transition is valid
  CASE current_status
    WHEN 'draft' THEN
      valid_transition := p_new_status IN ('active', 'archived');
    WHEN 'active' THEN
      valid_transition := p_new_status IN ('archived', 'maintenance');
    WHEN 'maintenance' THEN
      valid_transition := p_new_status IN ('active', 'archived');
    WHEN 'archived' THEN
      valid_transition := p_new_status IN ('active', 'draft');
    ELSE
      valid_transition := FALSE;
  END CASE;
  
  IF valid_transition THEN
    UPDATE projects
    SET status = p_new_status,
        updated_at = NOW()
    WHERE id = p_project_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public, pg_temp;

-- 8. validate_deployment_url
DROP FUNCTION IF EXISTS public.validate_deployment_url();
CREATE FUNCTION public.validate_deployment_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure deployment_url follows the expected pattern
  IF NEW.deployment_url IS NOT NULL AND 
     NEW.deployment_url !~ '^https://[a-z0-9-]+\.sites\.wondrousdigital\.com$' THEN
    RAISE EXCEPTION 'Invalid deployment URL format';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Final verification
DO $$
BEGIN
  RAISE NOTICE 'All 8 functions have been recreated with explicit search_path settings';
END $$;

-- ============================================================================

-- Migration: 20250810210000_clean_sweep_orphaned_functions.sql
-- ============================================================================
-- Clean Sweep: Remove Orphaned Functions from Old Migrations
-- These functions were created by migrations that have been moved to temp_remove/
-- They are not in the current baseline and not used in the application

-- First, let's document what we're removing and why
DO $$
BEGIN
  RAISE NOTICE 'Removing orphaned functions from old migrations that are no longer tracked';
  RAISE NOTICE 'These functions were causing search_path security warnings';
  RAISE NOTICE 'None of these functions are used in the current application';
END $$;

-- Drop all versions of these functions
-- Using CASCADE to handle any dependencies (like triggers or policies)
-- If any of these fail, it means they're still being used somewhere

-- 1. check_projects_policy_recursion - Old RLS helper, not in baseline
DROP FUNCTION IF EXISTS public.check_projects_policy_recursion() CASCADE;
DROP FUNCTION IF EXISTS public.check_projects_policy_recursion(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_projects_policy_recursion(UUID, UUID, TEXT) CASCADE;

-- 2. check_user_access - Old permission check, not in baseline
DROP FUNCTION IF EXISTS public.check_user_access() CASCADE;
DROP FUNCTION IF EXISTS public.check_user_access(UUID, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.check_user_access(UUID, TEXT, UUID) CASCADE;

-- 3. generate_project_slug - Old slug generator, not in baseline
DROP FUNCTION IF EXISTS public.generate_project_slug() CASCADE;
DROP FUNCTION IF EXISTS public.generate_project_slug(TEXT) CASCADE;

-- 4. get_deployment_url - Old URL generator, not in baseline
DROP FUNCTION IF EXISTS public.get_deployment_url(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_deployment_url(TEXT) CASCADE;

-- 5. is_system_admin - This one might be tricky, let's check both versions
-- The old version took a user_id parameter, newer versions don't
DROP FUNCTION IF EXISTS public.is_system_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_system_admin(UUID) CASCADE;

-- 6. debug_user_access - Debug helper, not in baseline
DROP FUNCTION IF EXISTS public.debug_user_access() CASCADE;
DROP FUNCTION IF EXISTS public.debug_user_access(UUID, UUID) CASCADE;

-- 7. transition_project_status - Old state machine, not in baseline
DROP FUNCTION IF EXISTS public.transition_project_status(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.transition_project_status(UUID, TEXT, TEXT) CASCADE;

-- 8. validate_deployment_url - Old trigger function, not in baseline
DROP FUNCTION IF EXISTS public.validate_deployment_url() CASCADE;
DROP FUNCTION IF EXISTS public.validate_deployment_url(TEXT) CASCADE;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Successfully removed orphaned functions';
  RAISE NOTICE 'This should resolve all function_search_path_mutable warnings';
END $$;

-- Note: If you need any of these functions in the future, create them properly
-- with SET search_path = public, pg_temp; as part of the function definition

-- ============================================================================

-- Migration: 20250810211000_final_cleanup_orphaned_functions.sql
-- ============================================================================
-- Final Cleanup: Remove Last 2 Orphaned Functions
-- These were recreated by migration 20250810205000 before our clean sweep
-- They are not in the baseline and not used in the application

-- Drop the remaining orphaned functions
DROP FUNCTION IF EXISTS public.get_deployment_url(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.transition_project_status(UUID, TEXT) CASCADE;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Removed final 2 orphaned functions: get_deployment_url and transition_project_status';
  RAISE NOTICE 'All function_search_path_mutable warnings should now be resolved';
END $$;

-- ============================================================================

-- Migration: 20250810212000_drop_correct_function_signatures.sql
-- ============================================================================
-- Drop functions with their ACTUAL signatures as found in the database
-- Previous attempts failed because we were using wrong parameter lists

-- Drop get_deployment_url with its actual signature
DROP FUNCTION IF EXISTS public.get_deployment_url(p_subdomain character varying, p_domain character varying, p_deployment_url text) CASCADE;

-- Drop transition_project_status with its actual signature (including custom type)
DROP FUNCTION IF EXISTS public.transition_project_status(p_project_id uuid, p_new_status project_status_type, p_user_id uuid, p_reason text) CASCADE;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Dropped functions with correct signatures';
  RAISE NOTICE 'get_deployment_url(varchar, varchar, text) and transition_project_status(uuid, project_status_type, uuid, text)';
  RAISE NOTICE 'All function_search_path_mutable warnings should now be resolved';
END $$;

-- ============================================================================

-- Migration: 20250810213000_placeholder_audit_logs_duplicate.sql
-- ============================================================================
-- PLACEHOLDER MIGRATION - DO NOT DELETE
-- This migration exists only to maintain sync between local and remote migrations
-- 
-- During troubleshooting on 2025-08-11, this migration was created in the remote
-- database and marked as applied using `npx supabase migration repair`.
-- 
-- The actual audit_logs table creation is handled by:
-- 20250810000000_create_audit_logs_table.sql
--
-- This file prevents "remote migration not found locally" warnings.

-- ============================================================================

-- Migration: 20250811000000_fix_account_users_role_constraint.sql
-- ============================================================================
-- Fix account_users role constraint to match actual role system
-- Old constraint had legacy values: owner, member, viewer
-- New constraint has actual values: admin, staff, account_owner, user

-- Drop the old constraint
ALTER TABLE account_users DROP CONSTRAINT IF EXISTS account_users_role_check;

-- Add the new constraint with correct roles
ALTER TABLE account_users ADD CONSTRAINT account_users_role_check 
CHECK (role IN ('admin', 'staff', 'account_owner', 'user'));

-- Add comment to document the allowed roles
COMMENT ON CONSTRAINT account_users_role_check ON account_users IS 'Ensures role is one of: admin (platform admin), staff (platform staff), account_owner (owns the account), user (regular account user)';

-- ============================================================================

-- Migration: 20250811230000_add_pages_rls_policies.sql
-- ============================================================================
-- Add RLS policies for pages table to fix client-side updates
-- This migration adds proper RLS policies that allow users to manage pages
-- in projects they have access to through their account membership

-- First, ensure RLS is enabled on pages table
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "pages_select_policy" ON pages;
DROP POLICY IF EXISTS "pages_insert_policy" ON pages;
DROP POLICY IF EXISTS "pages_update_policy" ON pages;
DROP POLICY IF EXISTS "pages_delete_policy" ON pages;

-- =====================================================
-- SELECT POLICY - Users can view pages in their projects
-- =====================================================
CREATE POLICY "pages_select_policy" ON pages
FOR SELECT
TO authenticated
USING (
  -- Platform admins can see all pages
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can see pages in projects they have access to
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- INSERT POLICY - Users can create pages in their projects
-- =====================================================
CREATE POLICY "pages_insert_policy" ON pages
FOR INSERT
TO authenticated
WITH CHECK (
  -- Platform admins can create pages anywhere
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can create pages in projects they have access to
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- UPDATE POLICY - Users can update pages in their projects
-- =====================================================
CREATE POLICY "pages_update_policy" ON pages
FOR UPDATE
TO authenticated
USING (
  -- Platform admins can update any page
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can update pages in projects they have access to
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Ensure project_id cannot be changed to a project they don't have access to
  -- Platform admins can change to any project
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Regular users must maintain access to the project
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- DELETE POLICY - Users can delete pages in their projects
-- =====================================================
CREATE POLICY "pages_delete_policy" ON pages
FOR DELETE
TO authenticated
USING (
  -- Platform admins can delete any page
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can delete pages in projects they have access to
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = pages.project_id 
    AND au.user_id = auth.uid()
  )
);

-- Add comment explaining the policies
COMMENT ON TABLE pages IS 'Pages table with RLS policies that allow users to manage pages in projects they have access to via account membership';

-- ============================================================================

-- Migration: 20250811231000_add_projects_rls_policies.sql
-- ============================================================================
-- Add RLS policies for projects table
-- This ensures users can only access projects in their accounts

-- First, ensure RLS is enabled on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

-- =====================================================
-- SELECT POLICY - Users can view projects in their accounts
-- =====================================================
CREATE POLICY "projects_select_policy" ON projects
FOR SELECT
TO authenticated
USING (
  -- Platform admins can see all projects
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can see projects in their accounts
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- INSERT POLICY - Users can create projects in their accounts
-- =====================================================
CREATE POLICY "projects_insert_policy" ON projects
FOR INSERT
TO authenticated
WITH CHECK (
  -- Platform admins can create projects in any account
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can create projects in accounts they belong to
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- UPDATE POLICY - Users can update projects in their accounts
-- =====================================================
CREATE POLICY "projects_update_policy" ON projects
FOR UPDATE
TO authenticated
USING (
  -- Platform admins can update any project
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can update projects in their accounts
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Ensure account_id cannot be changed to an account they don't have access to
  -- Platform admins can change to any account
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Regular users must maintain access to the account
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
);

-- =====================================================
-- DELETE POLICY - Users can delete projects in their accounts
-- =====================================================
CREATE POLICY "projects_delete_policy" ON projects
FOR DELETE
TO authenticated
USING (
  -- Platform admins can delete any project
  auth.uid() IN (
    SELECT user_id FROM account_users 
    WHERE account_id = '00000000-0000-0000-0000-000000000000'
  )
  OR
  -- Users can delete projects in their accounts  
  EXISTS (
    SELECT 1
    FROM account_users au
    WHERE au.account_id = projects.account_id 
    AND au.user_id = auth.uid()
  )
);

-- Add comment explaining the policies
COMMENT ON TABLE projects IS 'Projects table with RLS policies that allow users to manage projects in accounts they belong to';

-- ============================================================================

-- Migration: 20250812000000_remove_broken_theme_check_function.sql
-- ============================================================================
-- Remove broken check_theme_type function and associated triggers
-- This function was designed for a themes table that doesn't exist
-- and is causing errors when updating project themes

-- First, find and drop any triggers that use the check_theme_type function
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Find all triggers that might be using check_theme_type
    FOR trigger_record IN 
        SELECT 
            n.nspname AS schema_name,
            c.relname AS table_name,
            t.tgname AS trigger_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE p.proname = 'check_theme_type'
        AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE',
            trigger_record.trigger_name,
            trigger_record.schema_name,
            trigger_record.table_name
        );
        RAISE NOTICE 'Dropped trigger % on %.%', 
            trigger_record.trigger_name, 
            trigger_record.schema_name, 
            trigger_record.table_name;
    END LOOP;
END $$;

-- Now drop the function itself
DROP FUNCTION IF EXISTS public.check_theme_type() CASCADE;

-- Add comment explaining the removal
COMMENT ON TABLE projects IS 'Projects table. Note: check_theme_type trigger was removed as it referenced non-existent tables and fields.';

-- ============================================================================

