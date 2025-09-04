-- Fix Database Security Issues (Version 2 - Production Safe)
-- This migration addresses 2 ERRORS and 15 WARNINGS identified by Supabase Database Linter
-- Date: 2025-09-03
-- Approach: Preserves existing function signatures to avoid breaking changes

-- ========================================
-- 1. FIX: project_access_view SECURITY DEFINER
-- ========================================
-- The view currently uses SECURITY DEFINER which bypasses RLS policies
-- We need to recreate it with security_invoker = on

-- Drop the existing view
DROP VIEW IF EXISTS public.project_access_view CASCADE;

-- Recreate with SECURITY INVOKER (respects user permissions and RLS)
CREATE VIEW public.project_access_view WITH (security_invoker = on) AS
SELECT 
  pu.id,
  pu.project_id,
  pu.user_id,
  pu.account_id,
  pu.granted_by,
  pu.granted_at,
  pu.access_level,
  p.name AS project_name,
  up.display_name AS user_display_name,
  up.avatar_url AS user_avatar_url,
  gb_up.display_name AS granted_by_display_name
FROM project_users pu
JOIN projects p ON p.id = pu.project_id
LEFT JOIN user_profiles up ON up.user_id = pu.user_id
LEFT JOIN user_profiles gb_up ON gb_up.user_id = pu.granted_by;

-- Grant permissions
GRANT SELECT ON public.project_access_view TO authenticated;
GRANT SELECT ON public.project_access_view TO anon;

-- Add comment for documentation
COMMENT ON VIEW public.project_access_view IS 'View for project access with user details - uses security_invoker to respect RLS';

-- ========================================
-- 2. FIX: Enable RLS on subscription_state_warnings
-- ========================================
-- This table is public but doesn't have RLS enabled

ALTER TABLE public.subscription_state_warnings ENABLE ROW LEVEL SECURITY;

-- The table already has the necessary policies defined in the original migration
-- Just needed to enable RLS

-- ========================================
-- 3. FIX: Add search_path to all functions (preserving signatures)
-- ========================================

-- Function 1: cleanup_old_grace_period_notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_grace_period_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  DELETE FROM grace_period_notifications
  WHERE sent = TRUE
  AND sent_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Function 2: has_sent_grace_period_notification
CREATE OR REPLACE FUNCTION public.has_sent_grace_period_notification(
  p_account_id UUID,
  p_notification_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM grace_period_notifications
    WHERE account_id = p_account_id
    AND notification_type = p_notification_type
    AND sent = TRUE
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;

-- Function 3: update_grace_period_notifications_updated_at
CREATE OR REPLACE FUNCTION public.update_grace_period_notifications_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function 4: can_perform_billing_action
CREATE OR REPLACE FUNCTION public.can_perform_billing_action(
  p_account_id uuid,
  p_action text
) 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
$$;

-- Function 5: validate_subscription_state_transition
CREATE OR REPLACE FUNCTION public.validate_subscription_state_transition()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
$$;

-- Function 6: get_subscription_state_details
CREATE OR REPLACE FUNCTION public.get_subscription_state_details(p_account_id uuid)
RETURNS TABLE (
  state subscription_state,
  can_upgrade boolean,
  can_downgrade boolean,
  can_cancel boolean,
  can_add_addon boolean,
  needs_payment_update boolean
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
$$;

-- Function 7: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function 8: notify_invalid_state_transition
CREATE OR REPLACE FUNCTION public.notify_invalid_state_transition()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
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
$$;

-- Function 9: cleanup_old_pending_payments (KEEP ORIGINAL SIGNATURE - returns INTEGER)
CREATE OR REPLACE FUNCTION public.cleanup_old_pending_payments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
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

-- Function 10: process_pending_payment (KEEP ORIGINAL SIGNATURE - different params, returns BOOLEAN)
CREATE OR REPLACE FUNCTION public.process_pending_payment(
  p_email TEXT,
  p_account_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
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

-- Function 11: get_project_access_for_account (KEEP EXISTING SIGNATURE - returns TABLE)
-- Check if this function exists with the correct signature
DO $$
BEGIN
  -- Drop the old version if it exists with wrong return type
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'get_project_access_for_account'
    AND pg_get_function_result(p.oid) = 'SETOF projects'
  ) THEN
    DROP FUNCTION public.get_project_access_for_account(uuid);
  END IF;
END $$;

-- Create or replace with the correct signature
CREATE OR REPLACE FUNCTION public.get_project_access_for_account(
  p_account_id uuid
)
RETURNS TABLE (
  id uuid,
  project_id uuid,
  user_id uuid,
  account_id uuid,
  granted_by uuid,
  granted_at timestamptz,
  access_level text,
  project_name text,
  user_display_name text,
  user_avatar_url text,
  granted_by_display_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pav.id,
    pav.project_id,
    pav.user_id,
    pav.account_id,
    pav.granted_by,
    pav.granted_at,
    pav.access_level::text,
    pav.project_name,
    pav.user_display_name,
    pav.user_avatar_url,
    pav.granted_by_display_name
  FROM project_access_view pav
  WHERE pav.account_id = p_account_id
  AND EXISTS (
    SELECT 1 FROM account_users au
    WHERE au.account_id = p_account_id
      AND au.user_id = auth.uid()
  );
END;
$$;

-- Function 12: update_account_billing_dates (THE FUNCTION VERSION - with parameters)
CREATE OR REPLACE FUNCTION public.update_account_billing_dates(
  p_account_id uuid,
  p_next_billing_date timestamptz,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_billing_period text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE accounts
  SET 
    next_billing_date = p_next_billing_date,
    current_period_start = p_period_start,
    current_period_end = p_period_end,
    billing_period = COALESCE(p_billing_period, billing_period),
    updated_at = NOW()
  WHERE id = p_account_id;
END;
$$;

-- Function 13: is_in_cooldown
CREATE OR REPLACE FUNCTION public.is_in_cooldown(
  p_account_id UUID,
  p_cooldown_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_cooldown_end TIMESTAMPTZ;
BEGIN
  SELECT cooldown_end_at INTO v_cooldown_end
  FROM billing_cooldowns
  WHERE account_id = p_account_id
    AND cooldown_type = p_cooldown_type
    AND is_active = TRUE
    AND cooldown_end_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN v_cooldown_end IS NOT NULL;
END;
$$;

-- Function 14: get_cooldown_end_time
CREATE OR REPLACE FUNCTION public.get_cooldown_end_time(
  p_account_id UUID,
  p_cooldown_type TEXT
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_cooldown_end TIMESTAMPTZ;
BEGIN
  SELECT cooldown_end_at INTO v_cooldown_end
  FROM billing_cooldowns
  WHERE account_id = p_account_id
    AND cooldown_type = p_cooldown_type
    AND is_active = TRUE
    AND cooldown_end_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN v_cooldown_end;
END;
$$;

-- Function 15: has_sent_billing_notification
CREATE OR REPLACE FUNCTION public.has_sent_billing_notification(
  p_account_id UUID,
  p_notification_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM billing_notification_log
    WHERE account_id = p_account_id
    AND notification_type = p_notification_type
    AND sent_successfully = TRUE
    AND created_at > NOW() - INTERVAL '30 days'
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;

-- Function 16: record_billing_notification
CREATE OR REPLACE FUNCTION public.record_billing_notification(
  p_account_id UUID,
  p_notification_type TEXT,
  p_sent_successfully BOOLEAN DEFAULT TRUE,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO billing_notification_log (
    account_id,
    notification_type,
    sent_successfully,
    metadata
  ) VALUES (
    p_account_id,
    p_notification_type,
    p_sent_successfully,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- ========================================
-- 4. Verification Comments
-- ========================================
COMMENT ON COLUMN public.subscription_state_warnings.id IS 'This table now has RLS enabled for security';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Database security fixes applied successfully (v2):';
  RAISE NOTICE '- Fixed project_access_view SECURITY DEFINER issue';
  RAISE NOTICE '- Enabled RLS on subscription_state_warnings table';
  RAISE NOTICE '- Added search_path to all functions (preserving original signatures)';
  RAISE NOTICE '- Kept cleanup_old_pending_payments returning INTEGER';
  RAISE NOTICE '- Kept process_pending_payment with original parameters and BOOLEAN return';
END $$;