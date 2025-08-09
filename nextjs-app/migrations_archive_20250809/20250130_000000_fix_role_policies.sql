-- Fix role-based policies after partial migration

-- First, ensure Tyler is set as admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'b9c3e24e-c5da-491d-90c5-f733d8bd7c77';

-- Create helper function if it doesn't exist
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

-- Fix library items policies to use the has_role function
DROP POLICY IF EXISTS "Admins can manage library items" ON library_items;
DROP POLICY IF EXISTS "Staff and admins can manage library items" ON library_items;

CREATE POLICY "Staff and admins can manage library items" ON library_items
  FOR ALL TO authenticated
  USING (public.has_role(ARRAY['staff', 'admin']))
  WITH CHECK (public.has_role(ARRAY['staff', 'admin']));

-- Verify the admin role was set
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count 
  FROM profiles 
  WHERE id = 'b9c3e24e-c5da-491d-90c5-f733d8bd7c77' 
  AND role = 'admin';
  
  IF admin_count = 0 THEN
    RAISE EXCEPTION 'Failed to set admin role for user';
  ELSE
    RAISE NOTICE 'Admin role successfully set for Tyler';
  END IF;
END $$;