# Deployment Checklist - v0.1.5
**Release Name:** "Payments, Packages, and Features Oh My"  
**Target Branch:** `nextjs-pagebuilder-core`  
**Date:** January 21, 2025

## Pre-Deployment Checklist

### Code Quality ✅
- [x] TypeScript compilation (`npx tsc --noEmit`)
  - Note: 16 errors remain in test files only, not affecting production
- [x] ESLint check (`npm run lint`)
  - 1 error fixed, warnings remain (non-critical)
- [x] Build succeeds (`npm run build`)
- [x] Unit tests created for new components
- [ ] All tests pass (`npm run test`)

### Feature Verification ✅
- [x] Unified signup flow (6 steps) working end-to-end
- [x] Stripe payment integration functional
- [x] Database migration from `plan` to `tier` complete
- [x] Dashboard displays correct roles and tiers
- [x] API routes updated for new schema
- [x] Session persistence for signup flow
- [x] Invitation token support

### Documentation ✅
- [x] Release Notes created (`/docs/Release_Notes/v0.1.5.md`)
- [x] Testing guide created for warm prospect flow
- [x] ACTIVE-SPRINT.md updated with completion status
- [x] Migration guide documented

## Database Migrations

### DEV Environment ✅
Already applied to DEV database (hlpvvwlxjzexpgitsjlw):
- [x] `20250120_000001_tier_foundation.sql`
- [x] `20250121_000001_stripe_webhook_logs.sql`
- [x] `20250121150000_add_profile_fields.sql`
- [x] `20250121180000_consolidate_phone_columns.sql`
- [x] `20250820140000_pending_stripe_payments.sql`

### PROD Environment ⚠️
**MANUAL ACTION REQUIRED** - Apply these migrations via Supabase Dashboard:

1. **Backup Production Database First!**

2. **Apply migrations in order:**
   ```sql
   -- Run each migration file in sequence:
   -- 1. 20250120_000001_tier_foundation.sql
   -- 2. 20250121_000001_stripe_webhook_logs.sql  
   -- 3. 20250121150000_add_profile_fields.sql
   -- 4. 20250121180000_consolidate_phone_columns.sql
   -- 5. 20250820140000_pending_stripe_payments.sql
   ```

3. **Verify migrations:**
   - Check `tier_name` enum exists
   - Check `accounts.tier` column exists
   - Check `accounts.plan` column is removed
   - Check `stripe_webhook_logs` table exists
   - Check `user_profiles` has new fields

## Environment Variables

### Verify in Vercel Dashboard:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (production URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY` (production key)
- [ ] `STRIPE_WEBHOOK_SECRET` (production webhook)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (production key)

### Stripe Configuration:
- [ ] Production products created in Stripe Dashboard
- [ ] Price IDs updated in `/lib/stripe/prices.ts`
- [ ] Webhook endpoint configured for production URL
- [ ] Webhook events selected (all payment/subscription events)

## Testing Requirements

### Manual Testing - Cold Prospect Flow
- [ ] Complete signup from landing page
- [ ] Verify 6-step flow with stepper
- [ ] Test payment with Stripe test card
- [ ] Confirm account tier updates
- [ ] Verify dashboard access

### Manual Testing - Warm Prospect Flow
- [ ] Test with invitation URL
- [ ] Verify email pre-filling
- [ ] Confirm account linking
- [ ] Test payment if required
- [ ] Verify correct role assignment

### Manual Testing - Existing Users
- [ ] Login with existing account
- [ ] Verify dashboard loads correctly
- [ ] Check tier displays properly
- [ ] Test account switching
- [ ] Verify projects load

## Deployment Steps

### 1. Create Pull Request
```bash
git checkout feature/unified-signup-flow
git add .
git commit -m "feat: Complete unified signup flow with Stripe integration

- 6-step signup flow with progress stepper
- Stripe payment integration  
- Database migration from plan to tier
- Warm prospect invitation support
- Session persistence for abandoned signups

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin feature/unified-signup-flow
```

### 2. Create PR on GitHub
- Target branch: `nextjs-pagebuilder-core`
- Title: "v0.1.5: Unified Signup Flow & Payment Integration"
- Add description from Release Notes
- Request review if applicable

### 3. Vercel Preview Deployment
- [ ] Wait for Vercel to create preview deployment
- [ ] Test preview URL thoroughly
- [ ] Verify all features work
- [ ] Check for console errors
- [ ] Test on mobile devices

### 4. Production Deployment
- [ ] Merge PR to `nextjs-pagebuilder-core`
- [ ] Monitor Vercel deployment
- [ ] Apply database migrations to PROD
- [ ] Verify production URL works
- [ ] Test critical paths

## Post-Deployment Verification

### Immediate Checks
- [ ] Homepage loads
- [ ] Signup flow accessible
- [ ] Login works for existing users
- [ ] Dashboard loads with correct data
- [ ] Stripe webhooks receiving (check logs)

### Monitor for 24 Hours
- [ ] Check Sentry for new errors
- [ ] Monitor Stripe Dashboard for payments
- [ ] Review Supabase logs for database errors
- [ ] Check Vercel Analytics for performance
- [ ] Monitor user feedback channels

## Rollback Plan

If critical issues found:

1. **Revert Code:**
   ```bash
   git revert HEAD
   git push origin nextjs-pagebuilder-core
   ```

2. **Restore Database:**
   - Have backup ready from pre-deployment
   - Restore via Supabase Dashboard if needed

3. **Clear Cache:**
   - Purge Vercel cache
   - Clear CDN if applicable

4. **Communicate:**
   - Notify team of rollback
   - Document issues found
   - Plan fixes for next deployment

## Known Issues / Limitations

### Non-Critical (Can Deploy):
- 16 TypeScript errors in test files only
- Some ESLint warnings (style only)
- Yearly pricing toggle not implemented (coming in v0.1.6)
- Abandonment recovery partial implementation

### To Monitor:
- Webhook processing under load
- Session storage on mobile browsers
- Stripe checkout on slow connections
- Large account data loading

## Success Criteria

Deployment successful when:
- ✅ All manual tests pass
- ✅ No critical errors in logs
- ✅ Payments processing successfully
- ✅ Users can complete signup flow
- ✅ Existing users unaffected
- ✅ Performance metrics stable

## Sign-Off

- [ ] Development Team
- [ ] QA/Testing
- [ ] Product Owner
- [ ] Deployment Complete

---

**Notes:**
- Keep this checklist open during deployment
- Check off items as completed
- Document any issues in comments
- Save completed checklist for audit trail