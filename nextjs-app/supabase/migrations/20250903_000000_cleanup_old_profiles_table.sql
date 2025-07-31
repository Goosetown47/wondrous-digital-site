/*
  # Cleanup Old Profiles Table
  
  This migration safely handles the old profiles table if it still exists.
  It migrates any data and then drops the old table to prevent conflicts.
*/

-- Check if old profiles table exists and has data
DO $$
BEGIN
  -- Only proceed if the old profiles table exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    RAISE NOTICE 'Found old profiles table, migrating data...';
    
    -- Migrate any data from old profiles to user_profiles
    INSERT INTO user_profiles (user_id, display_name, metadata)
    SELECT 
      p.id,
      COALESCE(au.raw_user_meta_data->>'display_name', au.email),
      jsonb_build_object('role', p.role, 'migrated_from_profiles', true)
    FROM profiles p
    JOIN auth.users au ON p.id = au.id
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      metadata = user_profiles.metadata || jsonb_build_object('old_role', EXCLUDED.metadata->'role');
    
    -- Drop all policies on old profiles table
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
    
    -- Drop the old profiles table
    DROP TABLE IF EXISTS profiles CASCADE;
    
    RAISE NOTICE 'Old profiles table dropped successfully';
  ELSE
    RAISE NOTICE 'No old profiles table found, skipping cleanup';
  END IF;
END $$;