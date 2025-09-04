-- ============================================================================
-- COOLDOWN TRACKING FOR BILLING CHANGES
-- ============================================================================
-- 
-- Adds fields to track 24-hour cooldown period between plan changes
-- Includes override flag for testing purposes
--
-- ============================================================================

-- Add cooldown tracking fields to accounts table
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS last_plan_change_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cooldown_override boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN accounts.last_plan_change_at IS 'Timestamp of the last plan change to enforce 24-hour cooldown';
COMMENT ON COLUMN accounts.cooldown_override IS 'Testing flag to bypass cooldown restrictions when true';

-- Create index for efficient cooldown queries
CREATE INDEX IF NOT EXISTS idx_accounts_last_plan_change_at 
ON accounts(last_plan_change_at) 
WHERE last_plan_change_at IS NOT NULL;

-- Create helper function to check if account is in cooldown
CREATE OR REPLACE FUNCTION is_in_cooldown(account_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_change timestamptz;
  v_override boolean;
BEGIN
  SELECT last_plan_change_at, cooldown_override
  INTO v_last_change, v_override
  FROM accounts
  WHERE id = account_id;
  
  -- If override is enabled, never in cooldown
  IF v_override = true THEN
    RETURN false;
  END IF;
  
  -- If no previous change, not in cooldown
  IF v_last_change IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if 24 hours have passed since last change
  RETURN (v_last_change + interval '24 hours') > CURRENT_TIMESTAMP;
END;
$$;

-- Create helper function to get cooldown end time
CREATE OR REPLACE FUNCTION get_cooldown_end_time(account_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_change timestamptz;
BEGIN
  SELECT last_plan_change_at
  INTO v_last_change
  FROM accounts
  WHERE id = account_id;
  
  IF v_last_change IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN v_last_change + interval '24 hours';
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_in_cooldown(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cooldown_end_time(uuid) TO authenticated;