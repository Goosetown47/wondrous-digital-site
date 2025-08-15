-- Fix user profiles: create missing entries and add trigger for new users

-- Create user_profiles for all existing users who don't have one
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.user_metadata->>'full_name', au.email),
  au.email,
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN user_profiles up ON up.user_id = au.id
WHERE up.user_id IS NULL;

-- Create or replace function to automatically create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO user_profiles (
    user_id,
    display_name,
    email,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Also handle updates to ensure profile stays in sync
CREATE OR REPLACE FUNCTION update_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE user_profiles
  SET 
    email = NEW.email,
    display_name = COALESCE(NEW.raw_user_meta_data->>'full_name', user_profiles.display_name),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', user_profiles.avatar_url),
    updated_at = NOW()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create trigger to update user profile when auth user is updated
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, authenticated;
GRANT SELECT ON auth.users TO postgres, authenticated;