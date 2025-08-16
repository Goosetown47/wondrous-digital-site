-- =====================================================
-- TIER FOUNDATION MIGRATION - v0.1.5
-- =====================================================
-- This migration adds the foundation for tier-based feature gating
-- and Stripe payment integration.

-- =====================================================
-- 1. CREATE TIER ENUM TYPE
-- =====================================================
CREATE TYPE public.tier_name AS ENUM ('FREE', 'BASIC', 'PRO', 'SCALE', 'MAX');

-- =====================================================
-- 2. UPDATE ACCOUNTS TABLE
-- =====================================================
-- Add billing and tier fields to accounts table
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS tier tier_name DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS setup_fee_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS setup_fee_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS has_perform_addon BOOLEAN DEFAULT FALSE;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_accounts_tier ON public.accounts(tier);
CREATE INDEX IF NOT EXISTS idx_accounts_stripe_customer_id ON public.accounts(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_subscription_status ON public.accounts(subscription_status);

-- =====================================================
-- 3. CREATE TIER FEATURES TABLE
-- =====================================================
-- Defines what each tier includes
CREATE TABLE IF NOT EXISTS public.tier_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier tier_name NOT NULL UNIQUE,
  max_projects INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  custom_domains BOOLEAN DEFAULT FALSE,
  marketing_platform BOOLEAN DEFAULT FALSE,
  seo_platform BOOLEAN DEFAULT FALSE,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tier configurations
INSERT INTO public.tier_features (tier, max_projects, max_users, custom_domains, marketing_platform, seo_platform, features)
VALUES 
  ('FREE', 1, 1, false, false, false, '{"watermark": true, "support": "community"}'),
  ('BASIC', 3, 1, true, false, false, '{"watermark": false, "support": "email"}'),
  ('PRO', 5, 3, true, true, false, '{"watermark": false, "support": "priority", "smart_sections": true}'),
  ('SCALE', 10, 5, true, true, false, '{"watermark": false, "support": "priority", "smart_sections": true, "advanced_analytics": true}'),
  ('MAX', 25, 10, true, true, false, '{"watermark": false, "support": "dedicated", "smart_sections": true, "advanced_analytics": true, "white_label": true}')
ON CONFLICT (tier) DO NOTHING;

-- =====================================================
-- 4. CREATE BILLING HISTORY TABLE
-- =====================================================
-- Track all payment events and tier changes
CREATE TABLE IF NOT EXISTS public.account_billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'payment', 'tier_change', 'addon_change', 'refund', etc.
  old_tier tier_name,
  new_tier tier_name,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  stripe_event_id TEXT,
  stripe_invoice_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_billing_history_account_id ON public.account_billing_history(account_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_created_at ON public.account_billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_history_event_type ON public.account_billing_history(event_type);

-- =====================================================
-- 5. ADD TIER RESTRICTIONS TO LIBRARY TABLES
-- =====================================================

-- Add tier_restrictions to library_items table
ALTER TABLE public.library_items
  ADD COLUMN IF NOT EXISTS tier_restrictions JSONB;

-- Add tier_restrictions to themes table
ALTER TABLE public.themes
  ADD COLUMN IF NOT EXISTS tier_restrictions JSONB;

-- Add tier_restrictions to types table (for pages/site templates)
ALTER TABLE public.types
  ADD COLUMN IF NOT EXISTS tier_restrictions JSONB;

-- Add tier_restrictions to lab_drafts table
ALTER TABLE public.lab_drafts
  ADD COLUMN IF NOT EXISTS tier_restrictions JSONB;

-- Create indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_library_items_tier_restrictions ON public.library_items USING GIN (tier_restrictions);
CREATE INDEX IF NOT EXISTS idx_themes_tier_restrictions ON public.themes USING GIN (tier_restrictions);
CREATE INDEX IF NOT EXISTS idx_types_tier_restrictions ON public.types USING GIN (tier_restrictions);
CREATE INDEX IF NOT EXISTS idx_lab_drafts_tier_restrictions ON public.lab_drafts USING GIN (tier_restrictions);

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.tier_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_billing_history ENABLE ROW LEVEL SECURITY;

-- Tier features are publicly readable (for pricing pages)
CREATE POLICY "Tier features are publicly readable"
  ON public.tier_features
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can modify tier features
CREATE POLICY "Only admins can modify tier features"
  ON public.tier_features
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.account_users
      WHERE account_users.user_id = auth.uid()
      AND account_users.role = 'admin'
    )
  );

-- Billing history is only visible to account owners and admins
CREATE POLICY "Account owners can view their billing history"
  ON public.account_billing_history
  FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT account_id FROM public.account_users
      WHERE user_id = auth.uid()
      AND role IN ('account_owner', 'admin')
    )
  );

-- Only system can insert billing history (via service role)
-- No INSERT policy for authenticated users

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to check if an account has access to a tier-restricted item
CREATE OR REPLACE FUNCTION public.has_tier_access(
  account_tier tier_name,
  restrictions JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If no restrictions, everyone has access
  IF restrictions IS NULL OR restrictions = '[]'::jsonb THEN
    RETURN TRUE;
  END IF;
  
  -- Check if the account's tier is in the allowed tiers
  RETURN restrictions ? account_tier::text;
END;
$$;

-- Function to filter library items by tier
CREATE OR REPLACE FUNCTION public.filter_by_tier(
  user_tier tier_name
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  tier_restrictions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    li.id,
    li.name,
    li.type,
    li.tier_restrictions
  FROM public.library_items li
  WHERE has_tier_access(user_tier, li.tier_restrictions);
END;
$$;

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

-- Update updated_at timestamp for tier_features
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tier_features_updated_at
  BEFORE UPDATE ON public.tier_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.tier_features IS 'Defines features and limits for each subscription tier';
COMMENT ON TABLE public.account_billing_history IS 'Audit log of all billing events and tier changes';
COMMENT ON COLUMN public.accounts.tier IS 'Current subscription tier for the account';
COMMENT ON COLUMN public.accounts.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.accounts.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN public.accounts.subscription_status IS 'Current subscription status (active, past_due, canceled, etc.)';
COMMENT ON COLUMN public.accounts.setup_fee_paid IS 'Whether the one-time setup fee has been paid';
COMMENT ON COLUMN public.accounts.grace_period_ends_at IS 'End of grace period for failed payments';
COMMENT ON COLUMN public.accounts.has_perform_addon IS 'Whether account has the SEO/GEO PERFORM addon';

-- =====================================================
-- ROLLBACK SCRIPT (commented out for safety)
-- =====================================================
-- To rollback this migration, uncomment and run:
/*
-- Drop policies
DROP POLICY IF EXISTS "Tier features are publicly readable" ON public.tier_features;
DROP POLICY IF EXISTS "Only admins can modify tier features" ON public.tier_features;
DROP POLICY IF EXISTS "Account owners can view their billing history" ON public.account_billing_history;

-- Drop functions
DROP FUNCTION IF EXISTS public.has_tier_access(tier_name, JSONB);
DROP FUNCTION IF EXISTS public.filter_by_tier(tier_name);
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS update_tier_features_updated_at ON public.tier_features;

-- Drop indexes
DROP INDEX IF EXISTS idx_library_items_tier_restrictions;
DROP INDEX IF EXISTS idx_themes_tier_restrictions;
DROP INDEX IF EXISTS idx_types_tier_restrictions;
DROP INDEX IF EXISTS idx_lab_drafts_tier_restrictions;
DROP INDEX IF EXISTS idx_billing_history_account_id;
DROP INDEX IF EXISTS idx_billing_history_created_at;
DROP INDEX IF EXISTS idx_billing_history_event_type;
DROP INDEX IF EXISTS idx_accounts_tier;
DROP INDEX IF EXISTS idx_accounts_stripe_customer_id;
DROP INDEX IF EXISTS idx_accounts_subscription_status;

-- Remove columns from library tables
ALTER TABLE public.library_items DROP COLUMN IF EXISTS tier_restrictions;
ALTER TABLE public.themes DROP COLUMN IF EXISTS tier_restrictions;
ALTER TABLE public.types DROP COLUMN IF EXISTS tier_restrictions;
ALTER TABLE public.lab_drafts DROP COLUMN IF EXISTS tier_restrictions;

-- Drop tables
DROP TABLE IF EXISTS public.account_billing_history;
DROP TABLE IF EXISTS public.tier_features;

-- Remove columns from accounts
ALTER TABLE public.accounts
  DROP COLUMN IF EXISTS tier,
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS setup_fee_paid,
  DROP COLUMN IF EXISTS setup_fee_paid_at,
  DROP COLUMN IF EXISTS grace_period_ends_at,
  DROP COLUMN IF EXISTS has_perform_addon;

-- Drop enum type
DROP TYPE IF EXISTS public.tier_name;
*/