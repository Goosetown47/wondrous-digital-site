-- Script to confirm test user emails for E2E testing
-- Run this in Supabase SQL Editor

-- Update email confirmation for test users
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email IN (
  'admin@wondrousdigital.com',
  'staff@wondrousdigital.com', 
  'owner@example.com',
  'test-user@example.com'
);

-- Verify the update
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email IN (
  'admin@wondrousdigital.com',
  'staff@wondrousdigital.com',
  'owner@example.com', 
  'test-user@example.com'
)
ORDER BY email;