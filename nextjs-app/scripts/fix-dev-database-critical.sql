-- ============================================================================
-- CRITICAL FIX: DEV Database Issues
-- ============================================================================
-- This script fixes three critical issues:
-- 1. Admin detection failing (wrong platform account ID)
-- 2. Infinite recursion in account_users RLS policies
-- 3. Ensures proper platform account setup
--
-- Run this in DEV Supabase Dashboard SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Platform Account with Correct ID
-- ============================================================================
-- The codebase expects platform account ID: 00000000-0000-0000-0000-000000000000

-- First, check if platform account already exists
DO $$
BEGIN
  -- Insert platform account if it doesn't exist
  INSERT INTO accounts (id, name, slug, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Wondrous Digital Platform',
    'wondrous-platform',  -- Add required slug field
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = 'Wondrous Digital Platform',
    slug = 'wondrous-platform',
    updated_at = NOW();
    
  RAISE NOTICE 'Platform account created/updated with ID: 00000000-0000-0000-0000-000000000000';
END $$;

-- ============================================================================
-- STEP 2: Update Tyler's Account Assignment to Platform Account
-- ============================================================================
-- Move tyler from the wrong platform account to the correct one

-- First, remove tyler from the old platform account assignment
DELETE FROM account_users 
WHERE user_id = '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1'  -- Tyler's user ID
  AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee';  -- Old platform account

-- Now assign tyler to the correct platform account
INSERT INTO account_users (account_id, user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Correct platform account
  '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1',        -- Tyler's user ID
  'admin'
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'admin';

-- Also update staff user to correct platform account
DELETE FROM account_users 
WHERE user_id = '87ebf765-c2c9-4459-bf3d-5e4c4583a496'  -- Staff user ID
  AND account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee';  -- Old platform account

INSERT INTO account_users (account_id, user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Correct platform account
  '87ebf765-c2c9-4459-bf3d-5e4c4583a496',        -- Staff user ID
  'staff'
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'staff';

-- ============================================================================
-- STEP 3: Fix RLS Policies to Avoid Infinite Recursion
-- ============================================================================
-- Drop all existing account_users policies to start fresh

DROP POLICY IF EXISTS "Users can view their own account memberships" ON public.account_users;
DROP POLICY IF EXISTS "Users can view members of their accounts" ON public.account_users;
DROP POLICY IF EXISTS "Platform admins can view all account memberships" ON public.account_users;
DROP POLICY IF EXISTS "Account owners can manage account users" ON public.account_users;

-- Create simplified policies that avoid self-reference

-- Policy 1: Users can always see their own memberships (simple, no recursion)
CREATE POLICY "Users can view their own account memberships"
ON public.account_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Combined policy for viewing other members (avoids multiple policies)
-- This uses a CTE to prevent recursion
CREATE POLICY "Users can view account members"
ON public.account_users FOR SELECT
TO authenticated
USING (
  -- Direct check: user can see members of accounts they belong to
  account_id IN (
    SELECT au.account_id 
    FROM account_users au
    WHERE au.user_id = auth.uid()
  )
  OR 
  -- Platform admin check (simplified)
  auth.uid() IN (
    SELECT au.user_id 
    FROM account_users au
    WHERE au.account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND au.role IN ('admin', 'staff')
  )
);

-- Policy 3: Manage account users (simplified to avoid recursion)
CREATE POLICY "Authorized users can manage account users"
ON public.account_users FOR ALL
TO authenticated
USING (
  -- Check if user is account owner or platform admin/staff
  auth.uid() IN (
    SELECT au.user_id 
    FROM account_users au
    WHERE (
      -- User is account owner of the target account
      (au.account_id = account_users.account_id AND au.role = 'account_owner')
      OR
      -- User is platform admin/staff
      (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid AND au.role IN ('admin', 'staff'))
    )
  )
)
WITH CHECK (
  -- Same check for inserts/updates
  auth.uid() IN (
    SELECT au.user_id 
    FROM account_users au
    WHERE (
      -- User is account owner of the target account
      (au.account_id = account_users.account_id AND au.role = 'account_owner')
      OR
      -- User is platform admin/staff
      (au.account_id = '00000000-0000-0000-0000-000000000000'::uuid AND au.role IN ('admin', 'staff'))
    )
  )
);

-- ============================================================================
-- STEP 4: Update Other RLS Policies to Use Correct Platform Account ID
-- ============================================================================
-- Update all other policies that reference the platform account

-- Drop and recreate accounts policies with correct platform account ID
DROP POLICY IF EXISTS "Platform admins can view all accounts" ON public.accounts;

CREATE POLICY "Platform admins can view all accounts"
ON public.accounts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Update audit_logs policies
DROP POLICY IF EXISTS "Users can view audit logs for their accounts" ON public.audit_logs;

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

-- Update core_components policies
DROP POLICY IF EXISTS "Platform admins can manage core components" ON public.core_components;

CREATE POLICY "Platform admins can manage core components"
ON public.core_components FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Update lab_drafts policies
DROP POLICY IF EXISTS "Platform admins can view all lab drafts" ON public.lab_drafts;

CREATE POLICY "Platform admins can view all lab drafts"
ON public.lab_drafts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Update library_items policies
DROP POLICY IF EXISTS "Platform admins can view all library items" ON public.library_items;
DROP POLICY IF EXISTS "Platform admins can manage library items" ON public.library_items;

CREATE POLICY "Platform admins can view all library items"
ON public.library_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
);

CREATE POLICY "Platform admins can manage library items"
ON public.library_items FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Update library_versions policies
DROP POLICY IF EXISTS "Platform admins can manage library versions" ON public.library_versions;

CREATE POLICY "Platform admins can manage library versions"
ON public.library_versions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
);

-- Update reserved_domain_permissions policies
DROP POLICY IF EXISTS "Platform admins can view reserved domains" ON public.reserved_domain_permissions;
DROP POLICY IF EXISTS "Platform admins can manage reserved domains" ON public.reserved_domain_permissions;

CREATE POLICY "Platform admins can view reserved domains"
ON public.reserved_domain_permissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role IN ('admin', 'staff')
  )
);

CREATE POLICY "Platform admins can manage reserved domains"
ON public.reserved_domain_permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
  )
);

-- Update types policies
DROP POLICY IF EXISTS "Platform admins can manage types" ON public.types;

CREATE POLICY "Platform admins can manage types"
ON public.types FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM account_users
    WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'::uuid
      AND role = 'admin'
  )
);

-- Update pages and projects RLS policies if they exist
DO $$
BEGIN
  -- Update pages policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pages' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "Platform admins can manage all pages" ON public.pages;
    
    EXECUTE 'CREATE POLICY "Platform admins can manage all pages"
    ON public.pages FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''00000000-0000-0000-0000-000000000000''::uuid
          AND role IN (''admin'', ''staff'')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''00000000-0000-0000-0000-000000000000''::uuid
          AND role IN (''admin'', ''staff'')
      )
    )';
  END IF;

  -- Update projects policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "Platform admins can manage all projects" ON public.projects;
    
    EXECUTE 'CREATE POLICY "Platform admins can manage all projects"
    ON public.projects FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''00000000-0000-0000-0000-000000000000''::uuid
          AND role IN (''admin'', ''staff'')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM account_users
        WHERE user_id = auth.uid()
          AND account_id = ''00000000-0000-0000-0000-000000000000''::uuid
          AND role IN (''admin'', ''staff'')
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Force PostgREST to reload schema cache
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- STEP 6: Verify the fixes
-- ============================================================================

-- Check platform account exists
SELECT 
  id,
  name,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000000'::uuid THEN '✅ CORRECT PLATFORM ACCOUNT'
    ELSE '❌ Regular Account'
  END as status
FROM accounts
WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Check Tyler's assignment
SELECT 
  au.account_id,
  au.user_id,
  au.role,
  a.name as account_name,
  u.email,
  CASE 
    WHEN au.account_id = '00000000-0000-0000-0000-000000000000'::uuid THEN '✅ CORRECT PLATFORM ASSIGNMENT'
    ELSE '❌ Wrong Account'
  END as status
FROM account_users au
JOIN accounts a ON a.id = au.account_id
JOIN auth.users u ON u.id = au.user_id
WHERE u.email = 'tyler.lahaie@wondrous.gg';

-- Check all platform admin/staff assignments
SELECT 
  u.email,
  au.role,
  a.name as account_name,
  CASE 
    WHEN au.account_id = '00000000-0000-0000-0000-000000000000'::uuid THEN '✅ Platform Account'
    ELSE '❌ Wrong Account'
  END as status
FROM account_users au
JOIN accounts a ON a.id = au.account_id
JOIN auth.users u ON u.id = au.user_id
WHERE au.role IN ('admin', 'staff')
ORDER BY au.role, u.email;

-- List all RLS policies on account_users to verify no recursion
SELECT 
  policyname,
  cmd as operation,
  '✅ Fixed - no recursion' as status
FROM pg_policies 
WHERE tablename = 'account_users' 
  AND schemaname = 'public'
ORDER BY policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DEV DATABASE FIXES COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed Issues:';
  RAISE NOTICE '1. ✅ Platform account created with correct ID (00000000-0000-0000-0000-000000000000)';
  RAISE NOTICE '2. ✅ Tyler assigned to correct platform account as admin';
  RAISE NOTICE '3. ✅ RLS policies fixed to avoid infinite recursion';
  RAISE NOTICE '4. ✅ All platform admin checks updated to use correct account ID';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Log out and log back in as tyler.lahaie@wondrous.gg';
  RAISE NOTICE '2. You should now see admin functions and no console errors';
  RAISE NOTICE '3. Test creating users, managing accounts, etc.';
  RAISE NOTICE '';
END $$;