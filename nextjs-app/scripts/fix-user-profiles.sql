-- Fixed User Profiles Creation (without email column)
-- The email is stored in auth.users table, not in user_profiles

-- ============================================================================
-- STEP 6: Create User Profiles (FIXED)
-- ============================================================================

-- Platform Admin Profile (Tyler)
INSERT INTO user_profiles (user_id, display_name, avatar_url, phone, metadata, created_at, updated_at)
VALUES (
  '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1',  -- Tyler's user ID
  'Tyler Lahaie',
  NULL,
  NULL,
  '{}',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Tyler Lahaie',
  updated_at = NOW();

-- Staff Profile
INSERT INTO user_profiles (user_id, display_name, avatar_url, phone, metadata, created_at, updated_at)
VALUES (
  '87ebf765-c2c9-4459-bf3d-5e4c4583a496',  -- Staff user ID
  'Platform Staff',
  NULL,
  NULL,
  '{}',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Platform Staff',
  updated_at = NOW();

-- Account Owner Profile
INSERT INTO user_profiles (user_id, display_name, avatar_url, phone, metadata, created_at, updated_at)
VALUES (
  'ec6595d2-f10b-441a-8de6-85f54dab0f6f',  -- Owner user ID
  'Account Owner',
  NULL,
  NULL,
  '{}',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Account Owner',
  updated_at = NOW();

-- Test User Profile
INSERT INTO user_profiles (user_id, display_name, avatar_url, phone, metadata, created_at, updated_at)
VALUES (
  '1b300b6c-1101-4740-bfb7-e97590671696',  -- Test-user ID
  'Test User',
  NULL,
  NULL,
  '{}',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
  display_name = 'Test User',
  updated_at = NOW();

-- ============================================================================
-- Verify User Profiles Were Created
-- ============================================================================
SELECT 
  up.user_id,
  up.display_name,
  up.created_at,
  au.email as user_email,
  a.name as account_name,
  acu.role
FROM user_profiles up
JOIN auth.users au ON au.id = up.user_id
LEFT JOIN account_users acu ON acu.user_id = up.user_id
LEFT JOIN accounts a ON a.id = acu.account_id
ORDER BY a.name, acu.role;