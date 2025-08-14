-- Add missing RLS policies matching the ACTUAL database schema
-- Both PROD and DEV use archived_at instead of status column
-- Run this in DEV Supabase Dashboard SQL Editor

-- ============================================================================
-- ACCOUNTS TABLE POLICIES
-- ============================================================================

-- Users can view accounts they belong to
CREATE POLICY IF NOT EXISTS "Users can view their own accounts"
ON public.accounts FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT account_id FROM account_users WHERE user_id = auth.uid()
  )
);

-- Platform admins can view all accounts
CREATE POLICY IF NOT EXISTS "Platform admins can view all accounts"
ON public.accounts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Account owners can update their accounts
CREATE POLICY IF NOT EXISTS "Account owners can update their accounts"
ON public.accounts FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT account_id FROM account_users 
    WHERE user_id = auth.uid() AND role = 'account_owner'
  )
)
WITH CHECK (
  id IN (
    SELECT account_id FROM account_users 
    WHERE user_id = auth.uid() AND role = 'account_owner'
  )
);

-- ============================================================================
-- ACCOUNT_USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own account memberships
CREATE POLICY IF NOT EXISTS "Users can view their own account memberships"
ON public.account_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can view other members of accounts they belong to
CREATE POLICY IF NOT EXISTS "Users can view members of their accounts"
ON public.account_users FOR SELECT
TO authenticated
USING (
  account_id IN (
    SELECT account_id FROM account_users WHERE user_id = auth.uid()
  )
);

-- Platform admins can view all account memberships
CREATE POLICY IF NOT EXISTS "Platform admins can view all account memberships"
ON public.account_users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Account owners and platform admins can manage account users
CREATE POLICY IF NOT EXISTS "Account owners can manage account users"
ON public.account_users FOR ALL
TO authenticated
USING (
  account_id IN (
    SELECT account_id FROM account_users 
    WHERE user_id = auth.uid() AND role IN ('account_owner', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  account_id IN (
    SELECT account_id FROM account_users 
    WHERE user_id = auth.uid() AND role IN ('account_owner', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- ============================================================================
-- PROJECT_DOMAINS TABLE POLICIES
-- ============================================================================

-- Public can view domains for non-archived projects (FIXED: using archived_at)
CREATE POLICY IF NOT EXISTS "Public can view active project domains"
ON public.project_domains FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_id AND archived_at IS NULL
  )
);

-- Project owners can manage their domains
CREATE POLICY IF NOT EXISTS "Project owners can manage their domains"
ON public.project_domains FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = project_id
      AND au.user_id = auth.uid()
      AND au.role IN ('account_owner', 'admin', 'user')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN account_users au ON au.account_id = p.account_id
    WHERE p.id = project_id
      AND au.user_id = auth.uid()
      AND au.role IN ('account_owner', 'admin', 'user')
  )
);

-- ============================================================================
-- RESERVED_DOMAIN_PERMISSIONS TABLE POLICIES
-- ============================================================================

-- Platform admins can view all reserved domains
CREATE POLICY IF NOT EXISTS "Platform admins can view reserved domains"
ON public.reserved_domain_permissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Platform admins can manage reserved domains
CREATE POLICY IF NOT EXISTS "Platform admins can manage reserved domains"
ON public.reserved_domain_permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role = 'admin'
  )
);

-- ============================================================================
-- CORE_COMPONENTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view core components
CREATE POLICY IF NOT EXISTS "Authenticated users can view core components"
ON public.core_components FOR SELECT
TO authenticated
USING (true);

-- Only platform admins/staff can manage core components
CREATE POLICY IF NOT EXISTS "Platform admins can manage core components"
ON public.core_components FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- ============================================================================
-- LAB_DRAFTS TABLE POLICIES
-- ============================================================================

-- Users can view their own lab drafts
CREATE POLICY IF NOT EXISTS "Users can view their own lab drafts"
ON public.lab_drafts FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Platform admins/staff can view all lab drafts
CREATE POLICY IF NOT EXISTS "Platform admins can view all lab drafts"
ON public.lab_drafts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Users can manage their own lab drafts
CREATE POLICY IF NOT EXISTS "Users can manage their own lab drafts"
ON public.lab_drafts FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- LIBRARY_ITEMS TABLE POLICIES (checking for published column)
-- ============================================================================

-- Check if published column exists and create appropriate policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'library_items' AND column_name = 'published'
  ) THEN
    -- If published column exists, use it
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can view published library items"
    ON public.library_items FOR SELECT
    TO authenticated
    USING (published = true)';
  ELSE
    -- If no published column, allow all authenticated users to view
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can view library items"
    ON public.library_items FOR SELECT
    TO authenticated
    USING (true)';
  END IF;
END $$;

-- Platform admins/staff can view all library items
CREATE POLICY IF NOT EXISTS "Platform admins can view all library items"
ON public.library_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Platform admins/staff can manage library items
CREATE POLICY IF NOT EXISTS "Platform admins can manage library items"
ON public.library_items FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- ============================================================================
-- LIBRARY_VERSIONS TABLE POLICIES
-- ============================================================================

-- Check if library_versions has access through library_items
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'library_items' AND column_name = 'published'
  ) THEN
    -- If published column exists, use it
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can view versions of published items"
    ON public.library_versions FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM library_items 
        WHERE id = library_item_id AND published = true
      )
    )';
  ELSE
    -- If no published column, allow all authenticated users to view
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can view library versions"
    ON public.library_versions FOR SELECT
    TO authenticated
    USING (true)';
  END IF;
END $$;

-- Platform admins/staff can manage versions
CREATE POLICY IF NOT EXISTS "Platform admins can manage library versions"
ON public.library_versions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- ============================================================================
-- TYPES TABLE POLICIES
-- ============================================================================

-- All authenticated users can view types
CREATE POLICY IF NOT EXISTS "Users can view types"
ON public.types FOR SELECT
TO authenticated
USING (true);

-- Only platform admins can manage types
CREATE POLICY IF NOT EXISTS "Platform admins can manage types"
ON public.types FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'::uuid
      AND role = 'admin'
  )
);

-- ============================================================================
-- Handle optional tables that may or may not exist
-- ============================================================================

-- ROLES TABLE POLICIES (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
    -- All authenticated users can view roles
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can view roles"
    ON public.roles FOR SELECT
    TO authenticated
    USING (true)';
    
    -- Only platform admins can manage roles
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Platform admins can manage roles"
    ON public.roles FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''19519371-1db4-44a1-ac70-3d5c5cfc32ee''::uuid
          AND role = ''admin''
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''19519371-1db4-44a1-ac70-3d5c5cfc32ee''::uuid
          AND role = ''admin''
      )
    )';
  END IF;
END $$;

-- PERMISSIONS TABLE POLICIES (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
    -- Users can view permissions
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can view permissions"
    ON public.permissions FOR SELECT
    TO authenticated
    USING (true)';
    
    -- Platform admins can manage permissions
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Platform admins can manage permissions"
    ON public.permissions FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''19519371-1db4-44a1-ac70-3d5c5cfc32ee''::uuid
          AND role = ''admin''
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''19519371-1db4-44a1-ac70-3d5c5cfc32ee''::uuid
          AND role = ''admin''
      )
    )';
  END IF;
END $$;

-- PROFILES TABLE POLICIES (if different from user_profiles)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- Users can view and update their own profile
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid())';
    
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid())';
  END IF;
END $$;

-- STAFF_ACCOUNT_ASSIGNMENTS TABLE POLICIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_account_assignments') THEN
    -- Staff can view their own assignments
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Staff can view their assignments"
    ON public.staff_account_assignments FOR SELECT
    TO authenticated
    USING (staff_user_id = auth.uid())';
    
    -- Platform admins can manage all assignments
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Platform admins can manage staff assignments"
    ON public.staff_account_assignments FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''19519371-1db4-44a1-ac70-3d5c5cfc32ee''::uuid
          AND role = ''admin''
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''19519371-1db4-44a1-ac70-3d5c5cfc32ee''::uuid
          AND role = ''admin''
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- Verify all policies were created
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'accounts', 'account_users', 'core_components', 'lab_drafts',
    'library_items', 'library_versions', 'permissions', 'profiles',
    'project_domains', 'reserved_domain_permissions', 'roles',
    'staff_account_assignments', 'types'
  )
ORDER BY tablename, policyname;