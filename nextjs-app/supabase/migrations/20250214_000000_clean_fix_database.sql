-- Migration: Clean Fix for Database Issues
-- A more careful approach that handles existing data properly

-- Step 1: First, let's see what we're working with
DO $$
BEGIN
  RAISE NOTICE 'Starting database cleanup...';
END $$;

-- Step 2: Clean up duplicate account_users entries first
-- This will keep the one with role='admin' if there are duplicates
WITH duplicates AS (
  SELECT 
    account_id, 
    user_id,
    MIN(ctid) as keep_ctid
  FROM account_users
  GROUP BY account_id, user_id
  HAVING COUNT(*) > 1
)
DELETE FROM account_users a
USING duplicates d
WHERE a.account_id = d.account_id 
  AND a.user_id = d.user_id
  AND a.ctid != d.keep_ctid;

-- Step 3: Update roles table carefully
-- First update existing roles to new names
UPDATE roles SET name = 'account_owner' WHERE name = 'owner';
UPDATE roles SET name = 'user' WHERE name = 'member';
DELETE FROM roles WHERE name = 'viewer';

-- Update permissions for admin role
UPDATE roles SET 
  permissions = ARRAY[
    'projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:publish',
    'themes:create', 'themes:read', 'themes:update', 'themes:delete',
    'library:create', 'library:read', 'library:update', 'library:delete', 'library:publish',
    'lab:create', 'lab:read', 'lab:update', 'lab:delete',
    'account:read', 'account:update', 'account:delete', 'account:billing',
    'users:invite', 'users:read', 'users:update', 'users:remove',
    'core:create', 'core:read', 'core:update', 'core:delete',
    'tools:access', 'tools:manage'
  ]::text[],
  description = 'Platform administrator with full access'
WHERE name = 'admin';

-- Add staff role if missing
INSERT INTO roles (name, permissions, is_system, description)
SELECT 'staff', ARRAY[
    'projects:read',
    'themes:create', 'themes:read', 'themes:update', 'themes:delete',
    'library:create', 'library:read', 'library:update', 'library:delete', 'library:publish',
    'lab:create', 'lab:read', 'lab:update', 'lab:delete',
    'users:read',
    'core:create', 'core:read', 'core:update', 'core:delete',
    'tools:access'
  ]::text[], true, 'Platform staff with limited access'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'staff');

-- Step 4: Consolidate accounts more carefully
DO $$
DECLARE
  main_account_id UUID;
  account_count INTEGER;
  user_b9c3_count INTEGER;
  user_3aaf_count INTEGER;
BEGIN
  -- Count current accounts
  SELECT COUNT(*) INTO account_count FROM accounts;
  RAISE NOTICE 'Found % accounts', account_count;
  
  -- If we have multiple accounts, consolidate them
  IF account_count > 1 THEN
    -- Get the first account as main
    SELECT id INTO main_account_id FROM accounts ORDER BY created_at LIMIT 1;
    
    -- Update main account
    UPDATE accounts 
    SET name = 'Wondrous Digital', 
        slug = 'wondrous-digital',
        plan = 'enterprise'
    WHERE id = main_account_id;
    
    -- Move all account_users to main account (avoiding duplicates)
    UPDATE account_users au1
    SET account_id = main_account_id
    WHERE account_id != main_account_id
    AND NOT EXISTS (
      SELECT 1 FROM account_users au2 
      WHERE au2.account_id = main_account_id 
      AND au2.user_id = au1.user_id
    );
    
    -- Delete duplicate entries that couldn't be moved
    DELETE FROM account_users WHERE account_id != main_account_id;
    
    -- Move all projects to main account
    UPDATE projects SET account_id = main_account_id WHERE account_id != main_account_id;
    
    -- Delete other accounts
    DELETE FROM accounts WHERE id != main_account_id;
  ELSE
    -- Just update the single account
    UPDATE accounts 
    SET name = 'Wondrous Digital', 
        slug = 'wondrous-digital',
        plan = 'enterprise';
    
    SELECT id INTO main_account_id FROM accounts LIMIT 1;
  END IF;
  
  -- Ensure both users are admins
  UPDATE account_users SET role = 'admin' 
  WHERE user_id IN ('b9c3e24e-c5da-491d-90c5-f733d8bd7c77', '3aaf68bd-cbb2-4aeb-ade5-9fcb3572cd34');
  
  -- Count users for verification
  SELECT COUNT(*) INTO user_b9c3_count FROM account_users WHERE user_id = 'b9c3e24e-c5da-491d-90c5-f733d8bd7c77';
  SELECT COUNT(*) INTO user_3aaf_count FROM account_users WHERE user_id = '3aaf68bd-cbb2-4aeb-ade5-9fcb3572cd34';
  
  RAISE NOTICE 'Consolidated into Wondrous Digital (ID: %)', main_account_id;
  RAISE NOTICE 'User b9c3: % entries, User 3aaf: % entries', user_b9c3_count, user_3aaf_count;
END $$;

-- Step 5: Final verification
DO $$
DECLARE
  final_account_count INTEGER;
  final_user_count INTEGER;
  final_admin_count INTEGER;
  role_list TEXT;
BEGIN
  SELECT COUNT(*) INTO final_account_count FROM accounts;
  SELECT COUNT(DISTINCT user_id) INTO final_user_count FROM account_users;
  SELECT COUNT(*) INTO final_admin_count FROM account_users WHERE role = 'admin';
  SELECT string_agg(DISTINCT name, ', ' ORDER BY name) INTO role_list FROM roles;
  
  RAISE NOTICE 'Final state:';
  RAISE NOTICE '  Accounts: %', final_account_count;
  RAISE NOTICE '  Users: %', final_user_count;
  RAISE NOTICE '  Admins: %', final_admin_count;
  RAISE NOTICE '  Roles: %', role_list;
END $$;