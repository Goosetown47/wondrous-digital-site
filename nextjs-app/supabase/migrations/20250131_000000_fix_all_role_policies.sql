-- Comprehensive fix for role-based access policies
-- This migration ensures all policies work correctly with the role system

-- 1. First, ensure the profiles table exists and has correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'account_owner', 'staff', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure Tyler has admin role (in case the profiles insert failed)
INSERT INTO profiles (id, role) 
VALUES ('b9c3e24e-c5da-491d-90c5-f733d8bd7c77', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 3. Create or replace the has_role function with proper security
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Return true if user's role is in the allowed roles
  RETURN user_role = ANY(allowed_roles);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. Create a debugging function to check user access
CREATE OR REPLACE FUNCTION public.check_user_access()
RETURNS TABLE(
  user_id UUID, 
  user_email TEXT,
  user_role TEXT, 
  has_admin BOOLEAN, 
  has_staff BOOLEAN,
  has_lab_access BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as user_id,
    auth.email() as user_email,
    p.role as user_role,
    public.has_role(ARRAY['admin']) as has_admin,
    public.has_role(ARRAY['staff', 'admin']) as has_staff,
    public.has_role(ARRAY['staff', 'admin']) as has_lab_access
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. Fix lab_drafts policies
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Staff and admins can view lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Users can create lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Staff and admins can create lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Users can update their own lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Staff and admins can update lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Users can delete their own lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Staff and admins can delete lab drafts" ON lab_drafts;

-- Create new consistent policies
CREATE POLICY "Staff and admins can view lab drafts" ON lab_drafts
  FOR SELECT TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can create lab drafts" ON lab_drafts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can update lab drafts" ON lab_drafts
  FOR UPDATE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can delete lab drafts" ON lab_drafts
  FOR DELETE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']));

-- 6. Fix themes policies
DROP POLICY IF EXISTS "Everyone can view published themes" ON themes;
DROP POLICY IF EXISTS "Admins can manage themes" ON themes;
DROP POLICY IF EXISTS "Staff and admins can manage themes" ON themes;

-- Everyone can view themes (needed for theme selector)
CREATE POLICY "Everyone can view themes" ON themes
  FOR SELECT TO authenticated
  USING (true);

-- Only staff and admins can create/update/delete
CREATE POLICY "Staff and admins can insert themes" ON themes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can update themes" ON themes
  FOR UPDATE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can delete themes" ON themes
  FOR DELETE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']));

-- 7. Fix core_components policies
DROP POLICY IF EXISTS "Authenticated users can view core components" ON core_components;
DROP POLICY IF EXISTS "Staff and admins can insert core components" ON core_components;
DROP POLICY IF EXISTS "Staff and admins can update core components" ON core_components;
DROP POLICY IF EXISTS "Staff and admins can delete core components" ON core_components;

-- Everyone can view core components (needed for builder)
CREATE POLICY "Everyone can view core components" ON core_components
  FOR SELECT TO authenticated
  USING (true);

-- Only staff and admins can modify
CREATE POLICY "Staff and admins can insert core components" ON core_components
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can update core components" ON core_components
  FOR UPDATE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY "Staff and admins can delete core components" ON core_components
  FOR DELETE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']));

-- 8. Verify everything is working
DO $$
DECLARE
  access_record RECORD;
BEGIN
  -- Check Tyler's access
  SELECT * INTO access_record FROM public.check_user_access();
  
  IF access_record.user_role != 'admin' THEN
    RAISE EXCEPTION 'User does not have admin role';
  END IF;
  
  IF NOT access_record.has_lab_access THEN
    RAISE EXCEPTION 'User does not have lab access';
  END IF;
  
  RAISE NOTICE 'Role system verified: User % has role % with lab access', 
    access_record.user_email, access_record.user_role;
END $$;