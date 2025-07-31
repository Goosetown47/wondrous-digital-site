-- Migration: Set Admin Roles for Existing Users
-- This migration makes all existing account_users admins
-- since there are only 2 accounts in the system

-- Update all existing account_users to admin role
UPDATE account_users SET role = 'admin';

-- Verify the update
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count 
  FROM account_users 
  WHERE role = 'admin';
  
  RAISE NOTICE 'Updated % users to admin role', admin_count;
END $$;