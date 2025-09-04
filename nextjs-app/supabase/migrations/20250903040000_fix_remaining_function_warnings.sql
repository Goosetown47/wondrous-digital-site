-- Fix Remaining 4 Function Search Path Warnings
-- Date: 2025-09-03
-- These functions have different signatures than initially assumed

-- Function 1: is_in_cooldown (single parameter version)
CREATE OR REPLACE FUNCTION public.is_in_cooldown(account_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
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
  
  -- Check if less than 24 hours since last change
  RETURN (NOW() - v_last_change) < INTERVAL '24 hours';
END;
$$;

-- Function 2: get_cooldown_end_time (single parameter version)
CREATE OR REPLACE FUNCTION public.get_cooldown_end_time(account_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_last_change timestamptz;
  v_override boolean;
BEGIN
  SELECT last_plan_change_at, cooldown_override
  INTO v_last_change, v_override
  FROM accounts
  WHERE id = account_id;
  
  -- If override is enabled or no previous change, return NULL
  IF v_override = true OR v_last_change IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return when cooldown period ends (24 hours after last change)
  RETURN v_last_change + INTERVAL '24 hours';
END;
$$;

-- Function 3: has_sent_billing_notification (3 parameter version)
CREATE OR REPLACE FUNCTION public.has_sent_billing_notification(
  p_account_id UUID,
  p_notification_type TEXT,
  p_change_date TIMESTAMPTZ
) 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM billing_notification_log 
    WHERE account_id = p_account_id 
    AND notification_type = p_notification_type 
    AND change_date = p_change_date
    AND success = true
  );
END;
$$;

-- Function 4: record_billing_notification (7 parameter version)
CREATE OR REPLACE FUNCTION public.record_billing_notification(
  p_account_id UUID,
  p_notification_type TEXT,
  p_change_date TIMESTAMPTZ,
  p_email_sent_to TEXT,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
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
    change_date,
    email_sent_to,
    success,
    error_message,
    metadata
  ) VALUES (
    p_account_id,
    p_notification_type,
    p_change_date,
    p_email_sent_to,
    p_success,
    p_error_message,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Fixed remaining 4 function search_path warnings:';
  RAISE NOTICE '- is_in_cooldown(account_id)';
  RAISE NOTICE '- get_cooldown_end_time(account_id)';
  RAISE NOTICE '- has_sent_billing_notification(account_id, type, date)';
  RAISE NOTICE '- record_billing_notification(account_id, type, date, email, success, error, metadata)';
END $$;