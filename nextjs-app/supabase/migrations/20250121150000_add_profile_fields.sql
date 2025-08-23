-- Add new columns to user_profiles table for signup flow
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS user_handle text UNIQUE,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Create an index on user_handle for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_handle ON user_profiles(user_handle);

-- Update display_name for existing records that have first_name and last_name
UPDATE user_profiles 
SET display_name = CONCAT(first_name, ' ', last_name)
WHERE first_name IS NOT NULL 
  AND last_name IS NOT NULL 
  AND (display_name IS NULL OR display_name = '');

-- Add a comment to document the purpose of these fields
COMMENT ON COLUMN user_profiles.first_name IS 'User first name for personalization';
COMMENT ON COLUMN user_profiles.last_name IS 'User last name';
COMMENT ON COLUMN user_profiles.user_handle IS 'Optional unique username/handle';
COMMENT ON COLUMN user_profiles.phone_number IS 'Phone number (digits only)';
COMMENT ON COLUMN user_profiles.job_title IS 'User job title or role';
COMMENT ON COLUMN user_profiles.timezone IS 'User timezone for scheduling';
COMMENT ON COLUMN user_profiles.location IS 'User location (city, state, country)';
COMMENT ON COLUMN user_profiles.notes IS 'User bio or notes about themselves';
COMMENT ON COLUMN user_profiles.profile_completed IS 'Whether user has completed their profile setup';