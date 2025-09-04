-- Add is_unlocked column to accounts table
-- This allows admins to give accounts full features regardless of tier
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS is_unlocked BOOLEAN DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN accounts.is_unlocked IS 'When true, account has access to all features regardless of tier. Used for Wondrous accounts and trial accounts.';

-- Create index for faster lookups of unlocked accounts
CREATE INDEX IF NOT EXISTS idx_accounts_is_unlocked ON accounts(is_unlocked) WHERE is_unlocked = true;