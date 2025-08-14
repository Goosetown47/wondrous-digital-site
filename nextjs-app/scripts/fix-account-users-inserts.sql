-- Fixed SQL for account_users table (without created_at column)
-- The account_users table only has: account_id, user_id, role

-- ============================================================================
-- STEP 5: Assign Users to Accounts (FIXED)
-- ============================================================================

-- Platform Admin (tyler.lahaie@wondrous.gg)
INSERT INTO account_users (account_id, user_id, role)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee',  -- Platform account
  '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1',  -- Tyler's user ID
  'admin'
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'admin';

-- Staff User
INSERT INTO account_users (account_id, user_id, role)
VALUES (
  '19519371-1db4-44a1-ac70-3d5c5cfc32ee',  -- Platform account
  '87ebf765-c2c9-4459-bf3d-5e4c4583a496',  -- Staff user ID
  'staff'
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'staff';

-- Account Owner for Test Company 1
INSERT INTO account_users (account_id, user_id, role)
VALUES (
  '975ebd75-5fef-4aaa-a492-2be6551e5c4a',  -- Test Company 1 account ID
  'ec6595d2-f10b-441a-8de6-85f54dab0f6f',  -- Owner user ID
  'account_owner'
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'account_owner';

-- Regular User for Test Company 1
INSERT INTO account_users (account_id, user_id, role)
VALUES (
  '975ebd75-5fef-4aaa-a492-2be6551e5c4a',  -- Test Company 1 account ID
  '1b300b6c-1101-4740-bfb7-e97590671696',  -- Test-user ID
  'user'
) ON CONFLICT (account_id, user_id) DO UPDATE SET role = 'user';

-- Verify the inserts
SELECT 
  au.account_id,
  au.user_id,
  au.role,
  a.name as account_name
FROM account_users au
JOIN accounts a ON a.id = au.account_id
ORDER BY a.name, au.role;