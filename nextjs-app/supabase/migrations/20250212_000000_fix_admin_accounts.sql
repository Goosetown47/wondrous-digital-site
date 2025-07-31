-- Fix Admin Accounts Migration
-- This ensures both admin users have proper account associations

-- 1. Create accounts if they don't exist
INSERT INTO accounts (name, slug, plan)
SELECT 'Wondrous Digital Admin', 'wondrous-digital-admin', 'enterprise'
WHERE NOT EXISTS (SELECT 1 FROM accounts LIMIT 1);

-- 2. Get the account ID (use existing or newly created)
DO $$
DECLARE
  target_account_id UUID;
BEGIN
  SELECT id INTO target_account_id FROM accounts LIMIT 1;
  
  -- 3. Add both users as admins to this account
  INSERT INTO account_users (account_id, user_id, role)
  VALUES 
    (target_account_id, 'b9c3e24e-c5da-491d-90c5-f733d8bd7c77', 'admin'),
    (target_account_id, '3aaf68bd-cbb2-4aeb-ade5-9fcb3572cd34', 'admin')
  ON CONFLICT (account_id, user_id) 
  DO UPDATE SET role = 'admin';
  
  RAISE NOTICE 'Added users to account %', target_account_id;
END $$;

-- 4. Add RLS policy so users can read their own account_users records
DROP POLICY IF EXISTS "Users can read own account_users" ON account_users;
CREATE POLICY "Users can read own account_users" ON account_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Verify the setup
DO $$
DECLARE
  user_count INTEGER;
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count 
  FROM account_users 
  WHERE user_id IN ('b9c3e24e-c5da-491d-90c5-f733d8bd7c77', '3aaf68bd-cbb2-4aeb-ade5-9fcb3572cd34');
  
  SELECT COUNT(*) INTO admin_count 
  FROM account_users 
  WHERE user_id IN ('b9c3e24e-c5da-491d-90c5-f733d8bd7c77', '3aaf68bd-cbb2-4aeb-ade5-9fcb3572cd34')
  AND role = 'admin';
  
  RAISE NOTICE 'Found % user records, % are admins', user_count, admin_count;
END $$;