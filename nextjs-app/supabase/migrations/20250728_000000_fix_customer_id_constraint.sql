-- Migration: Fix customer_id constraint for multi-tenant architecture
-- This migration updates the customer_id field to work with the multi-tenant system

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_customer_id_fkey;

-- Step 2: Make customer_id nullable since we're transitioning to account_id
ALTER TABLE projects 
ALTER COLUMN customer_id DROP NOT NULL;

-- Step 3: Add a comment explaining the field
COMMENT ON COLUMN projects.customer_id IS 'Legacy field - maintained for backward compatibility. New projects should use account_id for multi-tenant architecture.';

-- Step 4: Update existing projects to set account_id if not already set
-- This assumes customer_id maps to the default account for that user
UPDATE projects p
SET account_id = (
  SELECT au.account_id 
  FROM account_users au 
  WHERE au.user_id = p.customer_id 
  LIMIT 1
)
WHERE p.account_id IS NULL 
AND p.customer_id IS NOT NULL;

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'customer_id constraint fixed - field is now nullable and foreign key removed';
END $$;