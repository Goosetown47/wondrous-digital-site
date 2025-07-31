/*
  # Fix User Signup Triggers
  
  This migration resolves the conflict between old and new user creation triggers.
  The system was migrated from using a 'profiles' table to a 'user_profiles' table,
  but the old trigger was still active, causing database errors during signup.
  
  Changes:
  - Drop the old 'handle_new_user' function and its trigger
  - Ensure only the new 'create_user_profile' trigger is active
  - Clean up any orphaned profile records
*/

-- Drop the old trigger that's causing conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the old function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure the new trigger exists (it should already exist from previous migration)
-- This is just a safety check
DO $$
BEGIN
  -- Check if the new trigger exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'create_user_profile_on_signup' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    -- If it doesn't exist, create it
    CREATE TRIGGER create_user_profile_on_signup
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_user_profile();
  END IF;
END $$;

-- Ensure all existing users have a user_profile entry
-- This handles any users that might have been created while triggers were broken
INSERT INTO user_profiles (user_id, display_name)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email)
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Migration complete - triggers fixed