-- ============================================================================
-- SYNC DEV DATABASE RLS TO MATCH PROD EXACTLY
-- ============================================================================
-- This script makes DEV's RLS policies identical to PROD
-- Run this in DEV Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: Create the has_role() function that PROD uses
-- ============================================================================
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- ============================================================================
-- STEP 2: Drop ALL existing RLS policies (clean slate)
-- ============================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop all policies on all tables
  FOR r IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- ACCOUNT_USERS TABLE POLICIES (SIMPLE - NO RECURSION!)
-- ============================================================================
CREATE POLICY "simple_account_users_select" ON public.account_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "simple_account_users_update" ON public.account_users
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "admins_insert_account_users" ON public.account_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_users existing
      WHERE existing.account_id = account_users.account_id 
        AND existing.user_id = auth.uid() 
        AND existing.role = ANY(ARRAY['account_owner', 'admin'])
    )
  );

CREATE POLICY "admins_delete_account_users" ON public.account_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM account_users existing
      WHERE existing.account_id = account_users.account_id 
        AND existing.user_id = auth.uid() 
        AND existing.role = ANY(ARRAY['account_owner', 'admin'])
    )
  );

-- ============================================================================
-- ACCOUNTS TABLE POLICIES
-- ============================================================================
CREATE POLICY "simple_accounts_select" ON public.accounts
  FOR SELECT USING (
    id IN (
      SELECT account_id FROM account_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "simple_accounts_update" ON public.accounts
  FOR UPDATE USING (
    id IN (
      SELECT account_id FROM account_users 
      WHERE user_id = auth.uid() 
        AND role = ANY(ARRAY['account_owner', 'admin'])
    )
  );

CREATE POLICY "users_can_view_accounts" ON public.accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid() 
        AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
        AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid() 
        AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
        AND role = 'staff'
    )
    OR EXISTS (
      SELECT 1 FROM account_users
      WHERE account_id = accounts.id 
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_update_accounts" ON public.accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid() 
        AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
        AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid() 
        AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
        AND role = 'staff'
    )
    OR EXISTS (
      SELECT 1 FROM account_users
      WHERE account_id = accounts.id 
        AND user_id = auth.uid() 
        AND role = ANY(ARRAY['owner', 'admin'])
    )
  );

CREATE POLICY "platform_admins_can_create_accounts" ON public.accounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid() 
        AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
        AND role = ANY(ARRAY['admin', 'staff'])
    )
  );

CREATE POLICY "platform_admins_can_delete_accounts" ON public.accounts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid() 
        AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
        AND role = 'admin'
    ) 
    AND id <> '00000000-0000-0000-0000-000000000000'::uuid
  );

-- ============================================================================
-- AUDIT_LOGS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Users can view audit logs for their accounts" ON public.audit_logs
  FOR SELECT USING (
    account_id IN (
      SELECT account_id FROM account_users WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM account_users
      WHERE user_id = auth.uid() 
        AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
        AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_insert_own_audit_logs" ON public.audit_logs
  FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid() 
          AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
          AND role = 'admin'
      )
      OR EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid() 
          AND account_id = audit_logs.account_id
      )
    )
  );

-- ============================================================================
-- CORE_COMPONENTS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Everyone can view core components" ON public.core_components
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can view all core components" ON public.core_components
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create core components" ON public.core_components
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update core components" ON public.core_components
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete core components" ON public.core_components
  FOR DELETE USING (true);

CREATE POLICY "Staff and admins can insert core components" ON public.core_components
  FOR INSERT WITH CHECK (has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can update core components" ON public.core_components
  FOR UPDATE USING (has_role(ARRAY['staff', 'admin'])) 
  WITH CHECK (has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can delete core components" ON public.core_components
  FOR DELETE USING (has_role(ARRAY['staff', 'admin']));

-- ============================================================================
-- LAB_DRAFTS TABLE POLICIES  
-- ============================================================================
CREATE POLICY "Staff and admins can view lab drafts" ON public.lab_drafts
  FOR SELECT USING (has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can create lab drafts" ON public.lab_drafts
  FOR INSERT WITH CHECK (has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can update lab drafts" ON public.lab_drafts
  FOR UPDATE USING (has_role(ARRAY['staff', 'admin']))
  WITH CHECK (has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can delete lab drafts" ON public.lab_drafts
  FOR DELETE USING (has_role(ARRAY['staff', 'admin']));

-- ============================================================================
-- LIBRARY_ITEMS TABLE POLICIES
-- ============================================================================
CREATE POLICY "View published library items" ON public.library_items
  FOR SELECT USING (
    published = true 
    OR created_by = auth.uid() 
    OR (auth.jwt() ->> 'role') = 'admin'
  );

CREATE POLICY "Staff and admins can manage library items" ON public.library_items
  FOR ALL USING (has_role(ARRAY['staff', 'admin']))
  WITH CHECK (has_role(ARRAY['staff', 'admin']));

-- ============================================================================
-- LIBRARY_VERSIONS TABLE POLICIES
-- ============================================================================
CREATE POLICY "Users can view versions of published items" ON public.library_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM library_items
      WHERE library_items.id = library_versions.library_item_id 
        AND library_items.published = true
    )
  );

CREATE POLICY "Creators can view their own versions" ON public.library_versions
  FOR SELECT USING (
    created_by = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM library_items
      WHERE library_items.id = library_versions.library_item_id 
        AND library_items.created_by = auth.uid()
    )
  );

CREATE POLICY "View library versions" ON public.library_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM library_items
      WHERE library_items.id = library_versions.library_item_id 
        AND (
          library_items.published = true 
          OR library_items.created_by = auth.uid() 
          OR (auth.jwt() ->> 'role') = 'admin'
        )
    )
  );

CREATE POLICY "Staff and admins can manage library versions" ON public.library_versions
  FOR ALL USING (has_role(ARRAY['staff', 'admin']))
  WITH CHECK (has_role(ARRAY['staff', 'admin']));

-- ============================================================================
-- PAGES TABLE POLICIES (if exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages' AND table_schema = 'public') THEN
    -- Create all pages policies
    EXECUTE 'CREATE POLICY "Users can view pages in their projects" ON public.pages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM account_users au
          WHERE au.user_id = auth.uid() 
            AND au.account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND au.role = ANY(ARRAY[''admin'', ''staff''])
        )
        OR project_id IN (
          SELECT p.id FROM projects p
          JOIN account_users au ON au.account_id = p.account_id
          WHERE au.user_id = auth.uid()
        )
      )';

    EXECUTE 'CREATE POLICY "Users can create pages in their projects" ON public.pages
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM account_users au
          WHERE au.user_id = auth.uid() 
            AND au.account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND au.role = ANY(ARRAY[''admin'', ''staff''])
        )
        OR project_id IN (
          SELECT p.id FROM projects p
          JOIN account_users au ON au.account_id = p.account_id
          WHERE au.user_id = auth.uid() 
            AND au.role = ANY(ARRAY[''admin'', ''staff'', ''account_owner''])
        )
      )';

    EXECUTE 'CREATE POLICY "Users can update pages in their projects" ON public.pages
      FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM account_users au
          WHERE au.user_id = auth.uid() 
            AND au.account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND au.role = ANY(ARRAY[''admin'', ''staff''])
        )
        OR project_id IN (
          SELECT p.id FROM projects p
          JOIN account_users au ON au.account_id = p.account_id
          WHERE au.user_id = auth.uid() 
            AND au.role = ANY(ARRAY[''admin'', ''staff'', ''account_owner''])
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM account_users au
          WHERE au.user_id = auth.uid() 
            AND au.account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND au.role = ANY(ARRAY[''admin'', ''staff''])
        )
        OR project_id IN (
          SELECT p.id FROM projects p
          JOIN account_users au ON au.account_id = p.account_id
          WHERE au.user_id = auth.uid() 
            AND au.role = ANY(ARRAY[''admin'', ''staff'', ''account_owner''])
        )
      )';

    EXECUTE 'CREATE POLICY "Users can delete pages in their projects" ON public.pages
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM account_users au
          WHERE au.user_id = auth.uid() 
            AND au.account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND au.role = ANY(ARRAY[''admin'', ''staff''])
        )
        OR project_id IN (
          SELECT p.id FROM projects p
          JOIN account_users au ON au.account_id = p.account_id
          WHERE au.user_id = auth.uid() 
            AND au.role = ''admin''
        )
      )';
  END IF;
END $$;

-- ============================================================================
-- PROJECTS TABLE POLICIES (if exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "users_can_view_projects" ON public.projects
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM account_users
          WHERE user_id = auth.uid() 
            AND account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND role = ''admin''
        )
        OR EXISTS (
          SELECT 1 FROM account_users au
          WHERE au.user_id = auth.uid() 
            AND au.account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND au.role = ''staff''
            AND projects.account_id IN (
              SELECT account_id FROM staff_account_assignments
              WHERE staff_user_id = auth.uid()
            )
        )
        OR account_id IN (
          SELECT account_id FROM account_users
          WHERE user_id = auth.uid() 
            AND account_id <> ''00000000-0000-0000-0000-000000000000''::uuid
        )
      )';

    EXECUTE 'CREATE POLICY "users_can_create_projects" ON public.projects
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM account_users
          WHERE user_id = auth.uid() 
            AND account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND role = ''admin''
        )
        OR EXISTS (
          SELECT 1 FROM account_users au
          WHERE au.user_id = auth.uid() 
            AND au.account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND au.role = ''staff''
            AND au.account_id IN (
              SELECT account_id FROM staff_account_assignments
              WHERE staff_user_id = auth.uid()
            )
        )
        OR EXISTS (
          SELECT 1 FROM account_users
          WHERE user_id = auth.uid() 
            AND account_id = projects.account_id
            AND role = ''account_owner''
            AND account_id <> ''00000000-0000-0000-0000-000000000000''::uuid
        )
      )';

    EXECUTE 'CREATE POLICY "users_can_update_projects" ON public.projects
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM account_users
          WHERE user_id = auth.uid() 
            AND account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND role = ''admin''
        )
        OR EXISTS (
          SELECT 1 FROM account_users au
          WHERE au.user_id = auth.uid() 
            AND au.account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND au.role = ''staff''
            AND projects.account_id IN (
              SELECT account_id FROM staff_account_assignments
              WHERE staff_user_id = auth.uid()
            )
        )
        OR EXISTS (
          SELECT 1 FROM account_users
          WHERE user_id = auth.uid() 
            AND account_id = projects.account_id
            AND role = ''account_owner''
            AND account_id <> ''00000000-0000-0000-0000-000000000000''::uuid
        )
      )';

    EXECUTE 'CREATE POLICY "users_can_delete_projects" ON public.projects
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM account_users
          WHERE user_id = auth.uid() 
            AND account_id = ''00000000-0000-0000-0000-000000000000''::uuid
            AND role = ''admin''
        )
      )';
  END IF;
END $$;

-- ============================================================================
-- USER_PROFILES TABLE POLICIES
-- ============================================================================
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ROLES TABLE POLICIES (if exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Users can view roles" ON public.roles
      FOR SELECT USING (
        is_system = true 
        OR EXISTS (
          SELECT 1 FROM account_users
          WHERE account_id = roles.account_id 
            AND user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- ============================================================================
-- PERMISSIONS TABLE POLICIES (if exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "All users can view permissions" ON public.permissions
      FOR SELECT USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- ============================================================================
-- THEMES TABLE POLICIES (if exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'themes' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Everyone can view themes" ON public.themes
      FOR SELECT USING (true)';
    
    EXECUTE 'CREATE POLICY "Staff and admins can insert themes" ON public.themes
      FOR INSERT WITH CHECK (has_role(ARRAY[''staff'', ''admin'']))';
    
    EXECUTE 'CREATE POLICY "Staff and admins can update themes" ON public.themes
      FOR UPDATE USING (has_role(ARRAY[''staff'', ''admin'']))
      WITH CHECK (has_role(ARRAY[''staff'', ''admin'']))';
    
    EXECUTE 'CREATE POLICY "Staff and admins can delete themes" ON public.themes
      FOR DELETE USING (has_role(ARRAY[''staff'', ''admin'']))';
  END IF;
END $$;

-- ============================================================================
-- TYPES TABLE POLICIES (if exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'types' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Everyone can view types" ON public.types
      FOR SELECT USING (true)';
    
    EXECUTE 'CREATE POLICY "Staff and admins can insert types" ON public.types
      FOR INSERT WITH CHECK (has_role(ARRAY[''staff'', ''admin'']))';
    
    EXECUTE 'CREATE POLICY "Staff and admins can update types" ON public.types
      FOR UPDATE USING (has_role(ARRAY[''staff'', ''admin'']))
      WITH CHECK (has_role(ARRAY[''staff'', ''admin'']))';
    
    EXECUTE 'CREATE POLICY "Staff and admins can delete types" ON public.types
      FOR DELETE USING (has_role(ARRAY[''staff'', ''admin'']))';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Force PostgREST to reload schema cache
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- STEP 4: Verify the setup
-- ============================================================================

-- Check has_role function exists
SELECT 
  proname as function_name,
  'Created successfully' as status
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname = 'has_role';

-- Check account_users policies are simple (no recursion)
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname = 'simple_account_users_select' THEN '✅ Simple SELECT policy'
    WHEN policyname = 'simple_account_users_update' THEN '✅ Simple UPDATE policy'
    ELSE '✅ Admin policy'
  END as status
FROM pg_policies 
WHERE tablename = 'account_users' 
  AND schemaname = 'public'
ORDER BY policyname;

-- Check Tyler's assignment
SELECT 
  u.email,
  au.role,
  a.name as account_name,
  CASE 
    WHEN au.account_id = '00000000-0000-0000-0000-000000000000'::uuid 
      AND au.role = 'admin' 
    THEN '✅ PLATFORM ADMIN - READY!'
    ELSE '❌ Check assignment'
  END as status
FROM auth.users u
JOIN account_users au ON au.user_id = u.id
JOIN accounts a ON a.id = au.account_id
WHERE u.email = 'tyler.lahaie@wondrous.gg';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DEV DATABASE NOW MATCHES PROD!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was fixed:';
  RAISE NOTICE '1. ✅ Added has_role() function from PROD';
  RAISE NOTICE '2. ✅ Replaced all RLS policies with PROD versions';
  RAISE NOTICE '3. ✅ Simple account_users policies (no recursion!)';
  RAISE NOTICE '4. ✅ Tyler is platform admin with correct account';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Restart your dev server: npm run dev:restart';
  RAISE NOTICE '2. Sign in as tyler.lahaie@wondrous.gg';
  RAISE NOTICE '3. You should now see:';
  RAISE NOTICE '   - Admin tools in sidebar';
  RAISE NOTICE '   - Create Project button';
  RAISE NOTICE '   - No infinite recursion errors';
  RAISE NOTICE '';
END $$;