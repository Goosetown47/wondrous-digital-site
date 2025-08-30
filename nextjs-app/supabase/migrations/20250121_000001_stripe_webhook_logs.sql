-- Create stripe_webhook_logs table for tracking all Stripe webhook events
CREATE TABLE IF NOT EXISTS public.stripe_webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_event_id ON public.stripe_webhook_logs(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_type ON public.stripe_webhook_logs(type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_processed ON public.stripe_webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_created_at ON public.stripe_webhook_logs(created_at DESC);

-- Add RLS policies
ALTER TABLE public.stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Webhook logs are admin only" ON public.stripe_webhook_logs;

-- Only system/admin can view webhook logs (no user access)
CREATE POLICY "Webhook logs are admin only" ON public.stripe_webhook_logs
  FOR ALL
  TO authenticated
  USING (FALSE);

-- Add helpful comment
COMMENT ON TABLE public.stripe_webhook_logs IS 'Stores all Stripe webhook events for debugging and audit purposes';
COMMENT ON COLUMN public.stripe_webhook_logs.stripe_event_id IS 'Unique ID from Stripe for this event';
COMMENT ON COLUMN public.stripe_webhook_logs.type IS 'Stripe event type (e.g., checkout.session.completed)';
COMMENT ON COLUMN public.stripe_webhook_logs.data IS 'Full event data from Stripe';
COMMENT ON COLUMN public.stripe_webhook_logs.processed IS 'Whether this event has been successfully processed';
COMMENT ON COLUMN public.stripe_webhook_logs.error IS 'Error message if processing failed';