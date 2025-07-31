/*
  # Comprehensive Signup Fix
  
  This migration fixes ALL issues with user signup by:
  1. Dropping all conflicting triggers and functions
  2. Creating only the correct trigger
  3. Handling both old and new table structures
  4. Ensuring idempotency (safe to run multiple times)
*/

-- Step 1: Drop ALL triggers on auth.users that could conflict
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Find and drop all non-internal triggers on auth.users
  FOR r IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'auth.users'::regclass 
    AND NOT tgisinternal
    AND tgname IN ('on_auth_user_created', 'on_auth_user_created_profile', 'create_user_profile_on_signup')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', r.tgname);
    RAISE NOTICE 'Dropped trigger: %', r.tgname;
  END LOOP;
END $$;

-- Step 2: Drop all potentially conflicting functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;

-- Step 3: Create the correct user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_metadata ON user_profiles USING gin(metadata);

-- Step 5: Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create the correct function with proper error handling
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  display_name_value TEXT;
BEGIN
  -- Extract display name from metadata or use email
  display_name_value := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );

  -- Try to insert, update if exists
  INSERT INTO public.user_profiles (user_id, display_name, metadata)
  VALUES (
    NEW.id,
    display_name_value,
    jsonb_build_object(
      'email', NEW.email,
      'created_via', 'signup_trigger',
      'created_at', NOW()
    )
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    display_name = COALESCE(user_profiles.display_name, EXCLUDED.display_name),
    metadata = user_profiles.metadata || EXCLUDED.metadata,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'create_user_profile error for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create the ONE correct trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_profile();

-- Step 8: Migrate data from old profiles table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Migrate data from old profiles to user_profiles
    INSERT INTO user_profiles (user_id, display_name, metadata)
    SELECT 
      p.id,
      COALESCE(au.raw_user_meta_data->>'display_name', au.email),
      jsonb_build_object(
        'migrated_from', 'profiles_table',
        'old_role', p.role,
        'migration_date', NOW()
      )
    FROM profiles p
    JOIN auth.users au ON p.id = au.id
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      metadata = user_profiles.metadata || EXCLUDED.metadata;
    
    RAISE NOTICE 'Migrated data from old profiles table';
  END IF;
END $$;

-- Step 9: Ensure all existing users have profiles
INSERT INTO user_profiles (user_id, display_name, metadata)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    au.email
  ),
  jsonb_build_object(
    'email', au.email,
    'created_via', 'migration',
    'migration_date', NOW()
  )
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Step 10: Create or replace RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin and staff can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin and staff can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin and staff can insert profiles" ON user_profiles;

-- Basic policies that should always work
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 11: Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Step 12: Final verification
DO $$
DECLARE
  trigger_count INTEGER;
  profile_count INTEGER;
  user_count INTEGER;
BEGIN
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger 
  WHERE tgrelid = 'auth.users'::regclass 
  AND NOT tgisinternal;
  
  -- Count profiles
  SELECT COUNT(*) INTO profile_count FROM user_profiles;
  
  -- Count users
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  RAISE NOTICE 'Setup complete:';
  RAISE NOTICE '  - Triggers on auth.users: %', trigger_count;
  RAISE NOTICE '  - User profiles: %', profile_count;
  RAISE NOTICE '  - Total users: %', user_count;
  RAISE NOTICE '  - Missing profiles: %', user_count - profile_count;
END $$;