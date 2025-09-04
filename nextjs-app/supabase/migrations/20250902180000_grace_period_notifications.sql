-- Grace Period Notifications Table
-- Tracks scheduled and sent notifications for grace period events

CREATE TABLE IF NOT EXISTS grace_period_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'grace_period_day_0',
    'grace_period_day_7', 
    'grace_period_day_13',
    'account_downgraded'
  )),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_grace_period_notifications_account_id ON grace_period_notifications(account_id);
CREATE INDEX idx_grace_period_notifications_scheduled ON grace_period_notifications(scheduled_for, sent);
CREATE INDEX idx_grace_period_notifications_type ON grace_period_notifications(notification_type, sent);

-- Unique constraint to prevent duplicate notifications
CREATE UNIQUE INDEX idx_grace_period_notifications_unique 
  ON grace_period_notifications(account_id, notification_type, sent) 
  WHERE sent = FALSE;

-- RLS Policies
ALTER TABLE grace_period_notifications ENABLE ROW LEVEL SECURITY;

-- Only service role can manage notifications (webhooks and cron jobs)
CREATE POLICY "Service role manages grace period notifications" 
  ON grace_period_notifications
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Account owners can view their own notifications
CREATE POLICY "Account owners can view their notifications"
  ON grace_period_notifications
  FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT account_id FROM account_users 
      WHERE user_id = auth.uid() 
      AND role = 'account_owner'
    )
  );

-- Function to clean up old sent notifications (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_grace_period_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM grace_period_notifications
  WHERE sent = TRUE
  AND sent_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Function to check if a notification has been sent
CREATE OR REPLACE FUNCTION has_sent_grace_period_notification(
  p_account_id UUID,
  p_notification_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_grace_period_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grace_period_notifications_updated_at_trigger
  BEFORE UPDATE ON grace_period_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_grace_period_notifications_updated_at();

-- Grant necessary permissions
GRANT SELECT ON grace_period_notifications TO authenticated;
GRANT ALL ON grace_period_notifications TO service_role;

-- Add comment for documentation
COMMENT ON TABLE grace_period_notifications IS 'Tracks scheduled and sent notifications for payment grace periods';
COMMENT ON COLUMN grace_period_notifications.notification_type IS 'Type of notification: day 0 (initial), day 7 (reminder), day 13 (urgent), downgraded (final)';
COMMENT ON COLUMN grace_period_notifications.scheduled_for IS 'When this notification should be sent';
COMMENT ON COLUMN grace_period_notifications.sent IS 'Whether this notification has been sent';
COMMENT ON COLUMN grace_period_notifications.metadata IS 'Additional data like tier, grace period end date, etc.';

-- Sample data for testing (commented out for production)
-- INSERT INTO grace_period_notifications (account_id, notification_type, scheduled_for, metadata)
-- VALUES 
--   ('test-account-id', 'grace_period_day_0', NOW(), '{"tier": "PRO", "grace_period_ends_at": "2025-09-16T10:00:00Z"}'),
--   ('test-account-id', 'grace_period_day_7', NOW() + INTERVAL '7 days', '{"tier": "PRO", "grace_period_ends_at": "2025-09-16T10:00:00Z"}'),
--   ('test-account-id', 'grace_period_day_13', NOW() + INTERVAL '13 days', '{"tier": "PRO", "grace_period_ends_at": "2025-09-16T10:00:00Z"}'),
--   ('test-account-id', 'account_downgraded', NOW() + INTERVAL '14 days', '{"old_tier": "PRO", "new_tier": "FREE"}');