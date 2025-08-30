-- Add subscription tracking fields to accounts table
-- These fields help us track billing periods and addon status

-- Add billing period tracking
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS current_billing_period text DEFAULT 'monthly' CHECK (current_billing_period IN ('monthly', 'yearly'));

-- Add next billing date tracking
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS next_billing_date timestamptz;

-- Add PERFORM addon tracking
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS has_perform_addon boolean DEFAULT false;

-- Add PERFORM setup fee tracking  
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS perform_setup_fee_paid boolean DEFAULT false;

-- Add current period start/end for better tracking
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS current_period_start timestamptz;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Add subscription item IDs for easier updates
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS stripe_main_item_id text;

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS stripe_perform_item_id text;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_next_billing_date ON accounts(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_accounts_has_perform_addon ON accounts(has_perform_addon);

-- Add comment documentation
COMMENT ON COLUMN accounts.current_billing_period IS 'Current billing period - monthly or yearly';
COMMENT ON COLUMN accounts.next_billing_date IS 'Next billing date from Stripe subscription';
COMMENT ON COLUMN accounts.has_perform_addon IS 'Whether account has PERFORM SEO addon active';
COMMENT ON COLUMN accounts.perform_setup_fee_paid IS 'Whether one-time PERFORM setup fee has been paid';
COMMENT ON COLUMN accounts.current_period_start IS 'Start of current billing period from Stripe';
COMMENT ON COLUMN accounts.current_period_end IS 'End of current billing period from Stripe';
COMMENT ON COLUMN accounts.stripe_main_item_id IS 'Stripe subscription item ID for main plan';
COMMENT ON COLUMN accounts.stripe_perform_item_id IS 'Stripe subscription item ID for PERFORM addon';

-- Create function to update billing dates from webhook
CREATE OR REPLACE FUNCTION update_account_billing_dates(
  p_account_id uuid,
  p_next_billing_date timestamptz,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_billing_period text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE accounts
  SET 
    next_billing_date = p_next_billing_date,
    current_period_start = p_period_start,
    current_period_end = p_period_end,
    current_billing_period = COALESCE(p_billing_period, current_billing_period),
    updated_at = now()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_account_billing_dates TO service_role;