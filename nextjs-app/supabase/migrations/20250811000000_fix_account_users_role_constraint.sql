-- Fix account_users role constraint to match actual role system
-- Old constraint had legacy values: owner, member, viewer
-- New constraint has actual values: admin, staff, account_owner, user

-- Drop the old constraint
ALTER TABLE account_users DROP CONSTRAINT IF EXISTS account_users_role_check;

-- Add the new constraint with correct roles
ALTER TABLE account_users ADD CONSTRAINT account_users_role_check 
CHECK (role IN ('admin', 'staff', 'account_owner', 'user'));

-- Add comment to document the allowed roles
COMMENT ON CONSTRAINT account_users_role_check ON account_users IS 'Ensures role is one of: admin (platform admin), staff (platform staff), account_owner (owns the account), user (regular account user)';