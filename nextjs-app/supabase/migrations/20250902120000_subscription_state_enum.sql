-- Add subscription state enum and tracking for better state management
-- This migration replaces subscription_status string with a formal state machine

-- Create enum type for subscription states (excluding trial as per requirements)
DO $$ BEGIN
  CREATE TYPE subscription_state AS ENUM (
    'active',           -- Normal active subscription
    'pending_change',   -- Has a scheduled tier change
    'canceling',        -- Scheduled for cancellation at period end
    'past_due',         -- Payment failed but in grace period
    'incomplete',       -- Initial payment pending
    'incomplete_expired' -- Initial payment window expired
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new column with enum type
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS subscription_state subscription_state;

-- Store original status for rollback capability
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS subscription_status_backup text;

-- Backup existing status before migration
UPDATE accounts 
SET subscription_status_backup = subscription_status
WHERE subscription_status IS NOT NULL 
  AND subscription_status_backup IS NULL;

-- Migrate existing data from subscription_status string to enum
-- Handle existing statuses and map pending changes
UPDATE accounts 
SET subscription_state = 
  CASE 
    -- If has pending change, mark as pending_change
    WHEN subscription_status = 'active' AND pending_tier_change IS NOT NULL THEN 'pending_change'::subscription_state
    -- Standard active state
    WHEN subscription_status = 'active' THEN 'active'::subscription_state
    -- Map canceled to canceling (still active until period end)
    WHEN subscription_status = 'canceled' THEN 'canceling'::subscription_state
    -- Direct mappings
    WHEN subscription_status = 'past_due' THEN 'past_due'::subscription_state
    WHEN subscription_status = 'incomplete' THEN 'incomplete'::subscription_state
    WHEN subscription_status = 'incomplete_expired' THEN 'incomplete_expired'::subscription_state
    -- Map pending to incomplete
    WHEN subscription_status = 'pending' THEN 'incomplete'::subscription_state
    -- Default to null for FREE tier or unknown
    ELSE NULL
  END
WHERE subscription_status IS NOT NULL;

-- Create state transition tracking table for audit trail
CREATE TABLE IF NOT EXISTS subscription_state_transitions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  from_state subscription_state,
  to_state subscription_state NOT NULL,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies for transitions table
ALTER TABLE subscription_state_transitions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own account's transition history
CREATE POLICY "Users can view own account transitions" ON subscription_state_transitions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM account_users
      WHERE account_users.account_id = subscription_state_transitions.account_id
        AND account_users.user_id = auth.uid()
    )
  );

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to transitions" ON subscription_state_transitions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_subscription_state 
  ON accounts(subscription_state) 
  WHERE subscription_state IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_state_transitions_account 
  ON subscription_state_transitions(account_id);

CREATE INDEX IF NOT EXISTS idx_state_transitions_created 
  ON subscription_state_transitions(created_at DESC);

-- Add comments for documentation
COMMENT ON COLUMN accounts.subscription_state IS 'Current subscription state using formal state machine';
COMMENT ON COLUMN accounts.subscription_status_backup IS 'Backup of original status for rollback capability';
COMMENT ON TABLE subscription_state_transitions IS 'Audit trail of all subscription state changes';
COMMENT ON COLUMN subscription_state_transitions.from_state IS 'Previous state (null for initial state)';
COMMENT ON COLUMN subscription_state_transitions.to_state IS 'New state after transition';
COMMENT ON COLUMN subscription_state_transitions.reason IS 'Human-readable reason for state change';
COMMENT ON COLUMN subscription_state_transitions.metadata IS 'Additional context about the state change (includes original_status for rollback)';
COMMENT ON COLUMN subscription_state_transitions.created_by IS 'User who initiated the change (null for system changes)';

-- Create table for logging state transition warnings (instead of blocking)
CREATE TABLE IF NOT EXISTS subscription_state_warnings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  attempted_transition text,
  from_state subscription_state,
  to_state subscription_state,
  warning_message text,
  created_at timestamptz DEFAULT now()
);

-- Add index for warning lookups
CREATE INDEX idx_state_warnings_account ON subscription_state_warnings(account_id);
CREATE INDEX idx_state_warnings_created ON subscription_state_warnings(created_at DESC);

-- Create function to validate state transitions (warning-only mode)
CREATE OR REPLACE FUNCTION validate_subscription_state_transition()
RETURNS TRIGGER AS $$
DECLARE
  v_old_state subscription_state;
  v_new_state subscription_state;
  v_allowed boolean := false;
  v_warning_message text;
BEGIN
  v_old_state := OLD.subscription_state;
  v_new_state := NEW.subscription_state;
  
  -- Allow setting initial state
  IF v_old_state IS NULL THEN
    -- Log initial state setting
    INSERT INTO subscription_state_transitions (
      account_id,
      from_state,
      to_state,
      reason,
      metadata
    ) VALUES (
      NEW.id,
      NULL,
      v_new_state,
      'Initial state set',
      jsonb_build_object('original_status', OLD.subscription_status)
    );
    RETURN NEW;
  END IF;
  
  -- Allow if state hasn't changed
  IF v_old_state = v_new_state OR v_new_state IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Define allowed transitions
  CASE v_old_state
    WHEN 'active' THEN
      v_allowed := v_new_state IN ('pending_change', 'canceling', 'past_due');
    WHEN 'pending_change' THEN
      v_allowed := v_new_state IN ('active', 'canceling');
    WHEN 'canceling' THEN
      v_allowed := v_new_state = 'active'; -- Reactivation
    WHEN 'past_due' THEN
      v_allowed := v_new_state IN ('active', 'canceling');
    WHEN 'incomplete' THEN
      v_allowed := v_new_state IN ('active', 'incomplete_expired');
    WHEN 'incomplete_expired' THEN
      v_allowed := false; -- Terminal state
    ELSE
      v_allowed := false;
  END CASE;
  
  -- Log the transition attempt
  INSERT INTO subscription_state_transitions (
    account_id,
    from_state,
    to_state,
    reason,
    metadata,
    created_by
  ) VALUES (
    NEW.id,
    v_old_state,
    v_new_state,
    CASE WHEN v_allowed THEN 'Valid state transition' ELSE 'WARNING: Invalid transition allowed' END,
    jsonb_build_object(
      'allowed', v_allowed,
      'original_status', OLD.subscription_status,
      'trigger_source', TG_OP
    ),
    auth.uid()
  );
  
  -- If not allowed, log warning but don't block
  IF NOT v_allowed THEN
    v_warning_message := format('Invalid state transition from %s to %s - allowed but logged as warning', v_old_state, v_new_state);
    
    INSERT INTO subscription_state_warnings (
      account_id,
      attempted_transition,
      from_state,
      to_state,
      warning_message
    ) VALUES (
      NEW.id,
      format('%s -> %s', v_old_state, v_new_state),
      v_old_state,
      v_new_state,
      v_warning_message
    );
    
    -- Log to system but don't block
    RAISE WARNING '%', v_warning_message;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for state transition validation (non-blocking)
DROP TRIGGER IF EXISTS validate_subscription_state_change ON accounts;
CREATE TRIGGER validate_subscription_state_change
  BEFORE UPDATE OF subscription_state ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION validate_subscription_state_transition();

-- Create helper function to check if action is allowed in current state
CREATE OR REPLACE FUNCTION can_perform_billing_action(
  p_account_id uuid,
  p_action text
) RETURNS boolean AS $$
DECLARE
  v_state subscription_state;
BEGIN
  -- Get current state
  SELECT subscription_state INTO v_state
  FROM accounts
  WHERE id = p_account_id;
  
  -- If no subscription state, only allow initial setup
  IF v_state IS NULL THEN
    RETURN p_action IN ('create_subscription', 'start_trial');
  END IF;
  
  -- Check allowed actions per state
  CASE v_state
    WHEN 'active' THEN
      RETURN p_action IN ('upgrade', 'downgrade', 'cancel', 'add_addon', 'remove_addon', 'change_billing_period');
    WHEN 'pending_change' THEN
      RETURN p_action IN ('cancel_pending_change', 'cancel');
    WHEN 'canceling' THEN
      RETURN p_action = 'reactivate';
    WHEN 'past_due' THEN
      RETURN p_action IN ('update_payment', 'cancel');
    WHEN 'incomplete' THEN
      RETURN p_action = 'update_payment';
    WHEN 'incomplete_expired' THEN
      RETURN false; -- No actions allowed
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current state with details
CREATE OR REPLACE FUNCTION get_subscription_state_details(p_account_id uuid)
RETURNS TABLE (
  state subscription_state,
  can_upgrade boolean,
  can_downgrade boolean,
  can_cancel boolean,
  can_add_addon boolean,
  needs_payment_update boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.subscription_state,
    can_perform_billing_action(a.id, 'upgrade'),
    can_perform_billing_action(a.id, 'downgrade'),
    can_perform_billing_action(a.id, 'cancel'),
    can_perform_billing_action(a.id, 'add_addon'),
    a.subscription_state IN ('past_due', 'incomplete')
  FROM accounts a
  WHERE a.id = p_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON TYPE subscription_state TO authenticated, service_role;
GRANT SELECT, INSERT ON subscription_state_transitions TO authenticated, service_role;
GRANT SELECT ON subscription_state_warnings TO authenticated, service_role;
GRANT INSERT ON subscription_state_warnings TO service_role;
GRANT EXECUTE ON FUNCTION can_perform_billing_action TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION validate_subscription_state_transition TO service_role;
GRANT EXECUTE ON FUNCTION get_subscription_state_details TO authenticated, service_role;

-- Add notification for monitoring invalid transitions
CREATE OR REPLACE FUNCTION notify_invalid_state_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.warning_message IS NOT NULL THEN
    PERFORM pg_notify(
      'subscription_state_warning',
      json_build_object(
        'account_id', NEW.account_id,
        'transition', NEW.attempted_transition,
        'message', NEW.warning_message,
        'timestamp', NEW.created_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_state_warning
  AFTER INSERT ON subscription_state_warnings
  FOR EACH ROW
  EXECUTE FUNCTION notify_invalid_state_transition();