/*
  # Fix User Signup Triggers (Properly)
  
  This migration properly fixes the conflicting triggers issue by:
  1. Dropping ALL existing triggers on auth.users
  2. Dropping ALL conflicting functions
  3. Recreating only the correct trigger and function
  
  The previous fix didn't work because it was looking for the wrong trigger name.
*/

-- First, drop ALL triggers on auth.users that might be causing conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile_on_signup ON auth.users;

-- Drop all conflicting functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;

-- Recreate the correct function with better error handling
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles, ignore if already exists
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the ONE correct trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile();

-- Ensure all existing users have profiles (cleanup)
INSERT INTO user_profiles (user_id, display_name)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email)
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Verify by listing all triggers on auth.users (for debugging)
DO $$
BEGIN
  RAISE NOTICE 'Triggers on auth.users after migration:';
  FOR r IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'auth.users'::regclass 
    AND tgisinternal = false
  LOOP
    RAISE NOTICE '  - %', r.tgname;
  END LOOP;
END $$;