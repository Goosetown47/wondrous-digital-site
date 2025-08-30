-- Add tracking for PERFORM addon setup fee payment
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS perform_setup_fee_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS perform_setup_fee_paid_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN public.accounts.perform_setup_fee_paid IS 'Whether the one-time PERFORM SEO platform setup fee has been paid';
COMMENT ON COLUMN public.accounts.perform_setup_fee_paid_at IS 'When the PERFORM setup fee was paid';