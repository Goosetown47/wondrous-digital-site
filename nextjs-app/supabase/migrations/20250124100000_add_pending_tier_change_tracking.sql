-- Add tracking for pending tier changes (for downgrades scheduled at end of billing period)
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS pending_tier_change TEXT,
  ADD COLUMN IF NOT EXISTS pending_tier_change_date TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN public.accounts.pending_tier_change IS 'The tier that will be applied at the end of the current billing period';
COMMENT ON COLUMN public.accounts.pending_tier_change_date IS 'When the pending tier change will take effect';

-- Add check constraint to ensure pending_tier_change is a valid tier
ALTER TABLE public.accounts
  ADD CONSTRAINT check_pending_tier_valid 
  CHECK (pending_tier_change IS NULL OR pending_tier_change IN ('FREE', 'BASIC', 'PRO', 'SCALE', 'MAX'));