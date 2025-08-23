-- Consolidate duplicate phone columns in user_profiles table
-- This migration merges the old 'phone' column into 'phone_number' and drops the old column

-- Step 1: Copy any existing phone data to phone_number where it's null
UPDATE user_profiles 
SET phone_number = phone
WHERE phone IS NOT NULL 
  AND phone_number IS NULL;

-- Step 2: Drop the old phone column
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS phone;

-- Add a comment to document the consolidated column
COMMENT ON COLUMN user_profiles.phone_number IS 'User phone number (digits only) - consolidated from old phone column';