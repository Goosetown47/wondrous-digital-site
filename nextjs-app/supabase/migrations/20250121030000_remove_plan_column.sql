-- Remove deprecated plan column from accounts table
-- We now use the tier column instead

-- Drop the plan column
ALTER TABLE accounts DROP COLUMN IF EXISTS plan;

-- Add comment to tier column for clarity
COMMENT ON COLUMN accounts.tier IS 'Account subscription tier: FREE, PRO, SCALE, or MAX';