-- Migration: Create pending_stripe_payments table
-- Purpose: Store Stripe payment information for cold visitors who haven't created accounts yet
-- This solves the race condition where webhooks fire before account creation

-- Create pending_stripe_payments table
CREATE TABLE IF NOT EXISTS public.pending_stripe_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  stripe_session_id TEXT UNIQUE NOT NULL,
  tier tier_name NOT NULL,
  amount_paid INTEGER, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE, -- When payment was applied to account
  metadata JSONB DEFAULT '{}', -- Store any additional data from Stripe
  
  -- Indexes for performance
  CONSTRAINT email_not_empty CHECK (email != ''),
  CONSTRAINT session_id_not_empty CHECK (stripe_session_id != '')
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_pending_payments_email 
  ON public.pending_stripe_payments(email);

CREATE INDEX IF NOT EXISTS idx_pending_payments_created 
  ON public.pending_stripe_payments(created_at);

CREATE INDEX IF NOT EXISTS idx_pending_payments_processed 
  ON public.pending_stripe_payments(processed_at) 
  WHERE processed_at IS NULL;

-- Enable RLS
ALTER TABLE public.pending_stripe_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only service role can access this table (webhooks and backend processes)
CREATE POLICY "Service role full access" ON public.pending_stripe_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No public or authenticated access - this is backend only
CREATE POLICY "No public access" ON public.pending_stripe_payments
  FOR ALL
  TO public, authenticated
  USING (false)
  WITH CHECK (false);

-- Function to clean up old pending payments (older than 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_pending_payments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.pending_stripe_payments
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND processed_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to process a pending payment for an account
CREATE OR REPLACE FUNCTION public.process_pending_payment(
  p_email TEXT,
  p_account_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment RECORD;
  v_success BOOLEAN := FALSE;
BEGIN
  -- Find the most recent unprocessed payment for this email
  SELECT * INTO v_payment
  FROM public.pending_stripe_payments
  WHERE email = LOWER(p_email)
    AND processed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_payment IS NOT NULL THEN
    -- Update the account with payment information
    UPDATE public.accounts
    SET 
      tier = v_payment.tier,
      stripe_customer_id = v_payment.stripe_customer_id,
      stripe_subscription_id = v_payment.stripe_subscription_id,
      subscription_status = 'active',
      setup_fee_paid = TRUE,
      setup_fee_paid_at = NOW()
    WHERE id = p_account_id;
    
    -- Log to billing history
    INSERT INTO public.account_billing_history (
      account_id,
      event_type,
      new_tier,
      amount_cents,
      currency,
      stripe_event_id,
      metadata
    ) VALUES (
      p_account_id,
      'payment_processed_from_pending',
      v_payment.tier,
      v_payment.amount_paid,
      v_payment.currency,
      v_payment.stripe_session_id,
      jsonb_build_object(
        'pending_payment_id', v_payment.id,
        'stripe_customer_id', v_payment.stripe_customer_id,
        'stripe_subscription_id', v_payment.stripe_subscription_id,
        'original_created_at', v_payment.created_at
      )
    );
    
    -- Mark payment as processed
    UPDATE public.pending_stripe_payments
    SET processed_at = NOW()
    WHERE id = v_payment.id;
    
    v_success := TRUE;
  END IF;
  
  RETURN v_success;
END;
$$;

-- Add comment for documentation
COMMENT ON TABLE public.pending_stripe_payments IS 
'Stores Stripe payment information for cold visitors who complete payment before creating their account. 
This solves the race condition where the webhook fires before the user completes profile setup.
Payments are processed when the user confirms their email and the account is created.';

COMMENT ON FUNCTION public.process_pending_payment IS 
'Processes a pending Stripe payment for a newly created account. 
Called after email confirmation to apply the payment tier and Stripe IDs to the account.';

COMMENT ON FUNCTION public.cleanup_old_pending_payments IS 
'Removes pending payments older than 30 days that were never processed. 
This prevents the table from growing indefinitely with abandoned payments.';