-- Migration: Create billing notification log table for tracking sent notifications
-- Purpose: Track which billing change notifications have been sent to prevent duplicates

-- Create billing_notification_log table
CREATE TABLE IF NOT EXISTS billing_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('30_days', '14_days', '7_days', '1_day')),
  change_date TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email_sent_to TEXT NOT NULL,
  success BOOLEAN DEFAULT true NOT NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent duplicate notifications for the same account, type, and change date
  CONSTRAINT unique_notification UNIQUE(account_id, notification_type, change_date)
);

-- Add indexes for performance
CREATE INDEX idx_billing_notifications_account 
  ON billing_notification_log(account_id);

CREATE INDEX idx_billing_notifications_date 
  ON billing_notification_log(change_date);

CREATE INDEX idx_billing_notifications_sent_at 
  ON billing_notification_log(sent_at);

CREATE INDEX idx_billing_notifications_type 
  ON billing_notification_log(notification_type);

-- Add RLS policies
ALTER TABLE billing_notification_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert notifications (webhooks/cron jobs)
CREATE POLICY "Service role can insert notifications"
  ON billing_notification_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Account owners can view their own notification history
CREATE POLICY "Account owners can view their notifications"
  ON billing_notification_log
  FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT account_id 
      FROM account_users 
      WHERE user_id = auth.uid() 
      AND role = 'account_owner'
    )
  );

-- Policy: Service role has full access
CREATE POLICY "Service role has full access"
  ON billing_notification_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE billing_notification_log IS 'Tracks sent billing change notification emails to prevent duplicates and provide audit trail';
COMMENT ON COLUMN billing_notification_log.notification_type IS 'Type of reminder: 30_days, 14_days, 7_days, or 1_day before change';
COMMENT ON COLUMN billing_notification_log.change_date IS 'The date when the billing change is scheduled to occur';
COMMENT ON COLUMN billing_notification_log.sent_at IS 'When the notification email was sent';
COMMENT ON COLUMN billing_notification_log.email_sent_to IS 'Email address the notification was sent to';
COMMENT ON COLUMN billing_notification_log.success IS 'Whether the email was sent successfully';
COMMENT ON COLUMN billing_notification_log.error_message IS 'Error details if the email failed to send';
COMMENT ON COLUMN billing_notification_log.metadata IS 'Additional data about the notification (e.g., email ID, retry count)';

-- Create function to check if notification was already sent
CREATE OR REPLACE FUNCTION has_sent_billing_notification(
  p_account_id UUID,
  p_notification_type TEXT,
  p_change_date TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record notification sent
CREATE OR REPLACE FUNCTION record_billing_notification(
  p_account_id UUID,
  p_notification_type TEXT,
  p_change_date TIMESTAMPTZ,
  p_email_sent_to TEXT,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
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
  )
  ON CONFLICT (account_id, notification_type, change_date) 
  DO UPDATE SET
    sent_at = NOW(),
    email_sent_to = EXCLUDED.email_sent_to,
    success = EXCLUDED.success,
    error_message = EXCLUDED.error_message,
    metadata = EXCLUDED.metadata
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION has_sent_billing_notification TO service_role;
GRANT EXECUTE ON FUNCTION record_billing_notification TO service_role;