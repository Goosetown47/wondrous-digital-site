-- =====================================================
-- Fix DEV Database Test Data for Project Deletion
-- =====================================================
-- This script sets up the necessary test data to enable
-- project deletion testing in the DEV environment
-- =====================================================

-- =====================================================
-- STEP 1: Create Test Account if it doesn't exist
-- =====================================================
INSERT INTO accounts (id, name, slug, created_at, updated_at)
VALUES (
  '12526d99-6878-4b89-be82-dcb1add35c31',
  'Test Account',
  'test-account',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug;

-- Verify account was created
SELECT id, name, slug FROM accounts WHERE id = '12526d99-6878-4b89-be82-dcb1add35c31';

-- =====================================================
-- STEP 2: Get User IDs for Test Users
-- =====================================================
-- First, let's see what users exist
SELECT 
  u.id,
  u.email,
  up.full_name,
  up.display_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email IN (
  'admin@wondrousdigital.com',
  'staff@wondrousdigital.com',
  'owner@example.com',
  'user@example.com',
  'test-user@example.com'
)
ORDER BY u.email;

-- =====================================================
-- STEP 3: Create User Profiles if Missing
-- =====================================================
-- This creates profiles for any test users that don't have them
INSERT INTO user_profiles (user_id, full_name, display_name, avatar_url, onboarding_completed)
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'admin@wondrousdigital.com' THEN 'Admin User'
    WHEN u.email = 'staff@wondrousdigital.com' THEN 'Staff User'
    WHEN u.email = 'owner@example.com' THEN 'Account Owner'
    WHEN u.email = 'user@example.com' THEN 'Regular User'
    WHEN u.email = 'test-user@example.com' THEN 'Test User'
    ELSE SPLIT_PART(u.email, '@', 1)
  END as full_name,
  CASE 
    WHEN u.email = 'admin@wondrousdigital.com' THEN 'Admin'
    WHEN u.email = 'staff@wondrousdigital.com' THEN 'Staff'
    WHEN u.email = 'owner@example.com' THEN 'Owner'
    WHEN u.email = 'user@example.com' THEN 'User'
    WHEN u.email = 'test-user@example.com' THEN 'Test User'
    ELSE SPLIT_PART(u.email, '@', 1)
  END as display_name,
  '',
  true
FROM auth.users u
WHERE u.email IN (
  'admin@wondrousdigital.com',
  'staff@wondrousdigital.com',
  'owner@example.com',
  'user@example.com',
  'test-user@example.com'
)
AND NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.user_id = u.id
);

-- =====================================================
-- STEP 4: Set Up Account Users with Proper Roles
-- =====================================================
-- First, remove any existing incorrect associations
DELETE FROM account_users 
WHERE account_id = '12526d99-6878-4b89-be82-dcb1add35c31'
AND user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('owner@example.com', 'user@example.com', 'test-user@example.com')
);

-- Now add with correct roles
-- Add owner@example.com as account_owner
INSERT INTO account_users (account_id, user_id, role)
SELECT 
  '12526d99-6878-4b89-be82-dcb1add35c31',
  u.id,
  'account_owner'
FROM auth.users u
WHERE u.email = 'owner@example.com'
ON CONFLICT (account_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- Add user@example.com and test-user@example.com as regular users
INSERT INTO account_users (account_id, user_id, role)
SELECT 
  '12526d99-6878-4b89-be82-dcb1add35c31',
  u.id,
  'user'
FROM auth.users u
WHERE u.email IN ('user@example.com', 'test-user@example.com')
ON CONFLICT (account_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- =====================================================
-- STEP 5: Create Test Project for Deletion Testing
-- =====================================================
-- Create a project owned by the test account
INSERT INTO projects (
  name,
  slug,
  account_id,
  theme_id,
  created_at,
  updated_at
)
VALUES (
  'Test Project for Deletion',
  'test-deletion-project',
  '12526d99-6878-4b89-be82-dcb1add35c31',
  1, -- Default theme
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  account_id = EXCLUDED.account_id;

-- =====================================================
-- STEP 6: Verify Setup
-- =====================================================
-- Check account users and their roles
SELECT 
  au.account_id,
  au.user_id,
  au.role,
  u.email,
  up.full_name,
  a.name as account_name
FROM account_users au
JOIN auth.users u ON au.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
JOIN accounts a ON au.account_id = a.id
WHERE au.account_id = '12526d99-6878-4b89-be82-dcb1add35c31'
ORDER BY au.role, u.email;

-- Check projects for the test account
SELECT 
  p.id,
  p.name,
  p.slug,
  p.account_id,
  p.archived_at,
  a.name as account_name
FROM projects p
JOIN accounts a ON p.account_id = a.id
WHERE p.account_id = '12526d99-6878-4b89-be82-dcb1add35c31';

-- =====================================================
-- Expected Results:
-- =====================================================
-- 1. Test Account exists with ID: 12526d99-6878-4b89-be82-dcb1add35c31
-- 2. owner@example.com has 'account_owner' role in test account
-- 3. user@example.com and test-user@example.com have 'user' role
-- 4. At least one project exists for testing deletion
--
-- With this setup:
-- - owner@example.com SHOULD be able to delete projects
-- - user@example.com and test-user@example.com SHOULD NOT be able to delete
-- - admin@wondrousdigital.com SHOULD be able to delete any project
-- =====================================================