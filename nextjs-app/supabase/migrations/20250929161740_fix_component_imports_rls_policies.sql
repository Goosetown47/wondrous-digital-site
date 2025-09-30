-- ============================================================================
-- Fix component_imports RLS policies to use database-based admin checking
-- ============================================================================
-- Problem: Original policies check auth.users.raw_user_meta_data which doesn't exist
-- Solution: Check account_users table with platform account ID like other tables

-- Drop all existing incorrect policies
DROP POLICY IF EXISTS "Admin users can view all component imports" ON component_imports;
DROP POLICY IF EXISTS "Admin users can insert component imports" ON component_imports;
DROP POLICY IF EXISTS "Admin users can update component imports" ON component_imports;
DROP POLICY IF EXISTS "Admin users can delete component imports" ON component_imports;

-- Platform admin check: user has 'admin' role in platform account
-- Platform account ID: 00000000-0000-0000-0000-000000000000

-- SELECT policy: Platform admins can view all component imports
CREATE POLICY "Platform admins can view all component imports"
  ON component_imports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'
      AND role = 'admin'
    )
  );

-- INSERT policy: Platform admins can insert component imports
CREATE POLICY "Platform admins can insert component imports"
  ON component_imports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'
      AND role = 'admin'
    )
  );

-- UPDATE policy: Platform admins can update component imports
CREATE POLICY "Platform admins can update component imports"
  ON component_imports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'
      AND role = 'admin'
    )
  );

-- DELETE policy: Platform admins can delete component imports
CREATE POLICY "Platform admins can delete component imports"
  ON component_imports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE user_id = auth.uid()
      AND account_id = '00000000-0000-0000-0000-000000000000'
      AND role = 'admin'
    )
  );

-- Add helpful comments
COMMENT ON POLICY "Platform admins can view all component imports" ON component_imports IS
  'Allows platform admins (users with admin role in platform account) to view all component imports';

COMMENT ON POLICY "Platform admins can insert component imports" ON component_imports IS
  'Allows platform admins to register discovered components and track new imports';

COMMENT ON POLICY "Platform admins can update component imports" ON component_imports IS
  'Allows platform admins to update component metadata and tracking information';

COMMENT ON POLICY "Platform admins can delete component imports" ON component_imports IS
  'Allows platform admins to remove component import records';