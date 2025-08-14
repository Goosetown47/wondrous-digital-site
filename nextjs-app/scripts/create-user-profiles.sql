-- Create User Profiles for all test users
-- Run this after Step 5 (account_users) is complete

-- ============================================================================
-- STEP 6: Create User Profiles
-- ============================================================================

-- Platform Admin Profile (Tyler)
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
VALUES (
  '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1',  -- Tyler's user ID
  'Tyler Lahaie',
  'tyler.lahaie@wondrous.gg',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Tyler Lahaie',
  email = 'tyler.lahaie@wondrous.gg',
  updated_at = NOW();

-- Staff Profile
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
VALUES (
  '87ebf765-c2c9-4459-bf3d-5e4c4583a496',  -- Staff user ID
  'Platform Staff',
  'staff@wondrousdigital.com',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Platform Staff',
  email = 'staff@wondrousdigital.com',
  updated_at = NOW();

-- Account Owner Profile
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
VALUES (
  'ec6595d2-f10b-441a-8de6-85f54dab0f6f',  -- Owner user ID
  'Account Owner',
  'owner@example.com',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Account Owner',
  email = 'owner@example.com',
  updated_at = NOW();

-- Test User Profile
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
VALUES (
  '1b300b6c-1101-4740-bfb7-e97590671696',  -- Test-user ID
  'Test User',
  'test-user@example.com',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Test User',
  email = 'test-user@example.com',
  updated_at = NOW();

-- ============================================================================
-- Verify User Profiles Were Created
-- ============================================================================
SELECT 
  up.email,
  up.display_name,
  up.created_at,
  a.name as account_name,
  au.role
FROM user_profiles up
LEFT JOIN account_users au ON au.user_id = up.user_id
LEFT JOIN accounts a ON a.id = au.account_id
ORDER BY a.name, au.role;