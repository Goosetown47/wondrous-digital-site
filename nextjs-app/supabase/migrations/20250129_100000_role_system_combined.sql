-- Combined role system migration
-- This combines all three previous migrations into one that will work

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'account_owner', 'staff', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 3. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create profiles for existing users
INSERT INTO profiles (id, role)
SELECT id, 'user' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Set Tyler as admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'b9c3e24e-c5da-491d-90c5-f733d8bd7c77';

-- 6. Create helper function for role checking
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = ANY(allowed_roles)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Drop existing policies and recreate with proper role checking

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL TO authenticated
  USING (public.has_role(ARRAY['admin']))
  WITH CHECK (public.has_role(ARRAY['admin']));

-- Lab drafts policies
DROP POLICY IF EXISTS "Users can view their own lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Staff and admins can view lab drafts" ON lab_drafts;
CREATE POLICY "Staff and admins can view lab drafts" ON lab_drafts
  FOR SELECT TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']));

DROP POLICY IF EXISTS "Users can create lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Staff and admins can create lab drafts" ON lab_drafts;
CREATE POLICY "Staff and admins can create lab drafts" ON lab_drafts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

DROP POLICY IF EXISTS "Users can update their own lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Staff and admins can update lab drafts" ON lab_drafts;
CREATE POLICY "Staff and admins can update lab drafts" ON lab_drafts
  FOR UPDATE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

DROP POLICY IF EXISTS "Users can delete their own lab drafts" ON lab_drafts;
DROP POLICY IF EXISTS "Staff and admins can delete lab drafts" ON lab_drafts;
CREATE POLICY "Staff and admins can delete lab drafts" ON lab_drafts
  FOR DELETE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']));

-- Library items policies
DROP POLICY IF EXISTS "Admins can manage library items" ON library_items;
DROP POLICY IF EXISTS "Staff and admins can manage library items" ON library_items;
CREATE POLICY "Staff and admins can manage library items" ON library_items
  FOR ALL TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

-- Library versions policies
DROP POLICY IF EXISTS "Admins can manage library versions" ON library_versions;
DROP POLICY IF EXISTS "Staff and admins can manage library versions" ON library_versions;
CREATE POLICY "Staff and admins can manage library versions" ON library_versions
  FOR ALL TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

-- Core components policies
CREATE POLICY IF NOT EXISTS "Staff and admins can insert core components" ON core_components
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY IF NOT EXISTS "Staff and admins can update core components" ON core_components
  FOR UPDATE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

CREATE POLICY IF NOT EXISTS "Staff and admins can delete core components" ON core_components
  FOR DELETE TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']));

-- Themes policies
DROP POLICY IF EXISTS "Admins can manage themes" ON themes;
DROP POLICY IF EXISTS "Staff and admins can manage themes" ON themes;
CREATE POLICY "Staff and admins can manage themes" ON themes
  FOR ALL TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

-- Create trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;