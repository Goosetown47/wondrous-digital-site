-- =====================================================
-- Test User Setup Script for E2E Tests
-- =====================================================
-- This script creates the required test users for E2E testing
-- Run this in your Supabase SQL Editor
-- 
-- Test Users:
-- 1. admin@wondrousdigital.com (Platform Admin)
-- 2. staff@wondrousdigital.com (Platform Staff)
-- 3. owner@example.com (Account Owner)
-- 4. user@example.com (Regular User)
--
-- IMPORTANT: Run each section one at a time and follow the instructions
-- =====================================================

-- =====================================================
-- STEP 1: Temporarily disable the trigger
-- =====================================================
-- This prevents the create_user_profile trigger from interfering
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =====================================================
-- STEP 2: Create the test users
-- =====================================================
-- This creates users with proper metadata to avoid trigger issues
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated', 
    'admin@wondrousdigital.com',
    crypt('test-admin-password', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Test Admin User", "avatar_url": ""}'::jsonb,
    false,
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'staff@wondrousdigital.com',
    crypt('test-staff-password', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Test Staff User", "avatar_url": ""}'::jsonb,
    false,
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'owner@example.com',
    crypt('test-owner-password', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Test Account Owner", "avatar_url": ""}'::jsonb,
    false,
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'user@example.com',
    crypt('test-user-password', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Test Regular User", "avatar_url": ""}'::jsonb,
    false,
    ''
  )
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- STEP 3: Get the user IDs
-- =====================================================
-- Run this query and note down the IDs for each user
-- You'll need these for the next step
SELECT id, email 
FROM auth.users 
WHERE email IN (
  'admin@wondrousdigital.com', 
  'staff@wondrousdigital.com', 
  'owner@example.com', 
  'user@example.com'
)
ORDER BY email;

-- =====================================================
-- STEP 4: Create user profiles
-- =====================================================
-- IMPORTANT: Replace the ID placeholders with actual IDs from Step 3
-- 
-- Replace these placeholders:
-- 'REPLACE_WITH_ADMIN_ID' -> ID for admin@wondrousdigital.com
-- 'REPLACE_WITH_STAFF_ID' -> ID for staff@wondrousdigital.com  
-- 'REPLACE_WITH_OWNER_ID' -> ID for owner@example.com
-- 'REPLACE_WITH_USER_ID'  -> ID for user@example.com

INSERT INTO user_profiles (user_id, full_name, avatar_url, display_name, onboarding_completed)
VALUES 
  ('REPLACE_WITH_ADMIN_ID', 'Test Admin User', '', 'Admin User', true),
  ('REPLACE_WITH_STAFF_ID', 'Test Staff User', '', 'Staff User', true),
  ('REPLACE_WITH_OWNER_ID', 'Test Account Owner', '', 'Account Owner', true),
  ('REPLACE_WITH_USER_ID', 'Test Regular User', '', 'Regular User', true)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- =====================================================
-- STEP 5: Add users to test account
-- =====================================================
-- This assigns the owner and regular user to the test account
-- IMPORTANT: Replace the ID placeholders with actual IDs from Step 3

INSERT INTO account_users (account_id, user_id, role)
VALUES 
  ('12526d99-6878-4b89-be82-dcb1add35c31', 'REPLACE_WITH_OWNER_ID', 'account_owner'),
  ('12526d99-6878-4b89-be82-dcb1add35c31', 'REPLACE_WITH_USER_ID', 'user')
ON CONFLICT (account_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- =====================================================
-- STEP 6: Re-create the trigger
-- =====================================================
-- This restores the trigger for future user creations
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION create_user_profile();

-- =====================================================
-- STEP 7: Verify the setup
-- =====================================================
-- Run this to confirm all users were created correctly
SELECT 
  u.email,
  u.id as user_id,
  up.full_name,
  up.display_name,
  up.onboarding_completed,
  au.role as account_role,
  a.name as account_name,
  CASE 
    WHEN u.email LIKE '%@wondrousdigital.com' THEN 'Platform Admin/Staff'
    ELSE 'Regular User'
  END as platform_role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN account_users au ON u.id = au.user_id
LEFT JOIN accounts a ON au.account_id = a.id
WHERE u.email IN (
  'admin@wondrousdigital.com', 
  'staff@wondrousdigital.com', 
  'owner@example.com', 
  'user@example.com'
)
ORDER BY u.email;

-- =====================================================
-- Expected Results:
-- =====================================================
-- admin@wondrousdigital.com - Platform Admin (no account assignment needed)
-- staff@wondrousdigital.com - Platform Staff (no account assignment needed)
-- owner@example.com - Account Owner in "Test Account"
-- user@example.com - Regular User in "Test Account"
--
-- All users should have:
-- - user_profiles entries
-- - onboarding_completed = true
-- - Passwords: test-{role}-password
-- =====================================================

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================
-- If user creation fails:
-- 1. Check if the emails already exist:
--    SELECT email FROM auth.users WHERE email LIKE '%@wondrousdigital.com' OR email LIKE '%@example.com';
--
-- 2. If they exist, delete them first:
--    DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('admin@wondrousdigital.com', 'staff@wondrousdigital.com', 'owner@example.com', 'user@example.com'));
--    DELETE FROM account_users WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('owner@example.com', 'user@example.com'));
--    DELETE FROM auth.users WHERE email IN ('admin@wondrousdigital.com', 'staff@wondrousdigital.com', 'owner@example.com', 'user@example.com');
--
-- 3. Then run this script again from the beginning
-- =====================================================