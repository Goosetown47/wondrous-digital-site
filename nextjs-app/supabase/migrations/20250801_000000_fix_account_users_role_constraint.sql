-- Fix account_users role constraint to include 'staff' and align with platform architecture
-- This migration updates the role constraint to support the platform's role system

-- First, drop the existing constraint
ALTER TABLE account_users 
DROP CONSTRAINT IF EXISTS account_users_role_check;

-- Add the updated constraint that includes all necessary roles
ALTER TABLE account_users 
ADD CONSTRAINT account_users_role_check 
CHECK (role IN ('owner', 'admin', 'staff', 'member', 'viewer', 'account_owner'));

-- Update any existing 'owner' roles to 'account_owner' for clarity
UPDATE account_users 
SET role = 'account_owner' 
WHERE role = 'owner';

-- Ensure platform account exists
INSERT INTO accounts (id, name, slug, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Wondrous Digital Platform',
  'platform',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Add comment to explain the roles
COMMENT ON COLUMN account_users.role IS 'User role within the account. Platform roles (admin, staff) should only exist in the platform account (00000000-0000-0000-0000-000000000000). Account-specific roles are: account_owner, member, viewer.';