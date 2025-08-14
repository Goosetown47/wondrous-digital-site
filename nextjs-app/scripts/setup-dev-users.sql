-- Setup DEV Database Users
-- Run this in Supabase Dashboard after creating users in Authentication

-- ============================================================================
-- STEP 1: Create Users in Supabase Authentication Dashboard
-- ============================================================================
-- Go to Authentication > Users > Add User > Create new user
-- 
-- 1. Platform Admin:
--    Email: tyler.lahaie@wondrous.gg
--    Password: atz_dek-nky2WBU_jav
--    Auto Confirm Email: ✅
--
-- 2. Staff User:
--    Email: staff@wondrousdigital.com
--    Password: tvt*gdy5aka-UTF2zfu
--    Auto Confirm Email: ✅
--
-- 3. Account Owner (Test Company 1):
--    Email: owner@example.com
--    Password: afq!HXC7pqk3fgv4rym
--    Auto Confirm Email: ✅
--
-- 4. Regular User (Test Company 1):
--    Email: test-user@example.com
--    Password: ukc-zbr5DZT4pfb3yvf
--    Auto Confirm Email: ✅

-- ============================================================================
-- STEP 2: Get User IDs
-- ============================================================================
-- After creating users, run this to get their IDs:
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- ============================================================================
-- STEP 3: Create Platform Account (if not exists)
-- ============================================================================
INSERT INTO accounts (id, name, slug, settings, created_at, updated_at)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee',
  'Wondrous Digital',
  'wondrous-digital',
  '{}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: Create Test Accounts
-- ============================================================================
INSERT INTO accounts (name, slug, settings) VALUES
  ('Test Company 1', 'test-company-1', '{}'),
  ('Test Company 2', 'test-company-2', '{}'),
  ('Demo Agency', 'demo-agency', '{}')
ON CONFLICT (slug) DO NOTHING;

-- Get the test account IDs
SELECT id, name, slug FROM accounts WHERE slug IN ('test-company-1', 'test-company-2', 'demo-agency');

-- ============================================================================
-- STEP 5: Assign Users to Accounts
-- ============================================================================
-- Replace USER_ID_HERE with actual user IDs from Step 2
-- Replace ACCOUNT_ID_HERE with actual account IDs from Step 4

-- Platform Admin (tyler.lahaie@wondrous.gg)
INSERT INTO account_users (account_id, user_id, role, created_at)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee',  -- Platform account
  '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1',  -- Replace with tyler's user ID
  'admin',
  NOW()
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'admin';

-- Staff User
INSERT INTO account_users (account_id, user_id, role, created_at)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee',  -- Platform account
  '87ebf765-c2c9-4459-bf3d-5e4c4583a496',  -- Replace with staff user ID
  'staff',
  NOW()
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'staff';

-- Account Owner for Test Company 1
INSERT INTO account_users (account_id, user_id, role, created_at)
VALUES (
  '975ebd75-5fef-4aaa-a492-2be6551e5c4a',  -- Replace with Test Company 1 account ID
  'ec6595d2-f10b-441a-8de6-85f54dab0f6f',  -- Replace with owner user ID
  'account_owner',
  NOW()
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'account_owner';

-- Regular User for Test Company 1
INSERT INTO account_users (account_id, user_id, role, created_at)
VALUES (
  '975ebd75-5fef-4aaa-a492-2be6551e5c4a',  -- Replace with Test Company 1 account ID
  '1b300b6c-1101-4740-bfb7-e97590671696',  -- Replace with test-user ID
  'user',
  NOW()
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'user';

-- ============================================================================
-- STEP 6: Create User Profiles
-- ============================================================================
-- Platform Admin Profile
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
VALUES (
  '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1',  -- Replace with tyler's user ID
  'Tyler Lahaie',
  'tyler.lahaie@wondrous.gg',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Tyler Lahaie',
  email = 'tyler.lahaie@wondrous.gg';

-- Staff Profile
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
VALUES (
  '87ebf765-c2c9-4459-bf3d-5e4c4583a496',  -- Replace with staff user ID
  'Platform Staff',
  'staff@wondrousdigital.com',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Platform Staff',
  email = 'staff@wondrousdigital.com';

-- Account Owner Profile
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
VALUES (
  'ec6595d2-f10b-441a-8de6-85f54dab0f6f',  -- Replace with owner user ID
  'Account Owner',
  'owner@example.com',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Account Owner',
  email = 'owner@example.com';

-- Test User Profile
INSERT INTO user_profiles (user_id, display_name, email, created_at, updated_at)
VALUES (
  '1b300b6c-1101-4740-bfb7-e97590671696',  -- Replace with test-user ID
  'Test User',
  'test-user@example.com',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Test User',
  email = 'test-user@example.com';

-- ============================================================================
-- STEP 7: Create Sample Projects (Optional)
-- ============================================================================
INSERT INTO projects (account_id, name, slug, created_by, settings, status)
SELECT 
  a.id,
  'Sample Website',
  'sample-website-' || LEFT(MD5(RANDOM()::TEXT), 6),
  au.user_id,
  '{}',
  'active'
FROM accounts a
JOIN account_users au ON au.account_id = a.id
WHERE a.slug = 'test-company-1'
  AND au.role = 'account_owner'
LIMIT 1;

-- ============================================================================
-- STEP 8: Verify Setup
-- ============================================================================
-- Check all users and their roles
SELECT 
  up.email,
  up.display_name,
  a.name as account_name,
  au.role
FROM account_users au
JOIN user_profiles up ON up.user_id = au.user_id
JOIN accounts a ON a.id = au.account_id
ORDER BY a.name, au.role;

-- Check platform admins specifically
SELECT 
  up.email,
  up.display_name,
  au.role
FROM account_users au
JOIN user_profiles up ON up.user_id = au.user_id
WHERE au.account_id = '19519371-1db4-44a1-ac70-3d5c5cfc32ee'
ORDER BY au.role;