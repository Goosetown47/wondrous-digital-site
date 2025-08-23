# Staging Environment Setup Guide

## Overview
This guide walks through setting up a dedicated staging environment with:
- Fixed URL for reliable webhook delivery
- DEV database (separate from production)
- Stripe Test Mode (no real charges)

## Step 1: Create Staging Branch

```bash
# Create staging branch from current feature branch
git checkout feature/unified-signup-flow
git checkout -b staging
git push origin staging
```

## Step 2: Configure Vercel

1. Go to your Vercel project dashboard
2. Settings → Git → Add staging branch for automatic deployments
3. Note your staging URL (usually `staging-[project-name].vercel.app`)

### Optional: Custom Domain
Add a custom domain like `staging.wondrousdigital.com`:
1. Settings → Domains → Add Domain
2. Add `staging.wondrousdigital.com`
3. Configure DNS with your provider

## Step 3: ✅ Stripe Test Price IDs (Already Configured)

The test price IDs have been configured in `/lib/stripe/prices.ts`:
- PRO, SCALE, MAX tiers with monthly/yearly pricing
- Marketing Platform setup fee ($1,500)
- SEO Platform setup fee ($750)
- PERFORM addon (for future use)

## Step 4: Configure Environment Variables in Vercel

Go to Settings → Environment Variables and add for **Preview** deployments:

### Database (DEV)
```
NEXT_PUBLIC_SUPABASE_URL=https://hlpvvwlxjzexpgitsjlw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your DEV anon key]
SUPABASE_SERVICE_ROLE_KEY=[Your DEV service role key]
```

### Stripe (Test Mode)
```
STRIPE_SECRET_KEY=sk_test_[Your test secret key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[Your test publishable key]
STRIPE_WEBHOOK_SECRET=[Will get this in Step 5]
STRIPE_MODE=test
```

### Environment Flag
```
NEXT_PUBLIC_ENV=staging
```

## Step 5: Configure Stripe Test Webhook

1. Go to Stripe Dashboard → **Switch to Test Mode**
2. Developers → Webhooks → Add Endpoint
3. Endpoint URL: `https://staging-[your-project].vercel.app/api/stripe/webhooks`
   Or if using custom domain: `https://staging.wondrousdigital.com/api/stripe/webhooks`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.paid`
5. Copy the Signing Secret (starts with `whsec_`)
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 6: Deploy and Test

1. Push any change to staging branch to trigger deployment
2. Visit your staging URL
3. Test the full signup flow with test credit cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry, any CVC, any ZIP

## Environment Detection

The app automatically detects which environment it's in:

- **Production**: Uses live Stripe + PROD database
- **Staging**: Uses test Stripe + DEV database
- **Preview**: Uses test Stripe + DEV database
- **Local**: Uses test Stripe + DEV database

## Monitoring

Check webhook logs in:
1. Vercel Functions logs: `https://vercel.com/[team]/[project]/functions`
2. Stripe Dashboard: Developers → Webhooks → [Your endpoint] → Webhook Attempts

## Troubleshooting

### Webhook not firing?
- Check endpoint URL is correct
- Verify webhook is enabled in Stripe
- Check signing secret matches

### Database not updating?
- Check service role key has correct permissions
- Verify you're using DEV database
- Check Vercel function logs for errors

### Wrong price IDs?
- Ensure TEST_PRICE_IDS are updated in prices.ts
- Verify STRIPE_MODE=test is set
- Check you're in Test Mode in Stripe Dashboard

## Test Scenarios

1. **Cold Signup**: New user → Create account → Pay → Verify tier updated
2. **Warm Prospect**: Receive invitation → Sign up → Pay → Verify added to account
3. **Failed Payment**: Use decline card → Verify grace period starts
4. **Webhook Recovery**: Disable webhook → Make payment → Re-enable → Verify reconciliation

## Notes

- Test payments won't appear in production Stripe
- DEV database can be reset without affecting production
- All test customers have "TEST MODE" indicator in Stripe
- Webhook logs show environment info for debugging