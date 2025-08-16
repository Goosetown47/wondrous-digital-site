# Session Log: v0.1.5 Sprint Planning - Complete Monetization System
**Date:** January 20, 2025
**Sprint:** v0.1.5 "Payments, Packages, and Features Oh My"
**Status:** Sprint Planned and Ready to Begin

## Session Summary
Completed v0.1.4 deployment and planned comprehensive v0.1.5 sprint focused on building a complete monetization system with Stripe integration, tier-based feature gating, and payment management.

## Critical Context for v0.1.5 Implementation

### Business Model Context
- **Sales Model:** High-touch B2B - We build websites upfront as proof of value, then offer them free if they sign up for marketing packages
- **Target:** First 25 customers will ALL be on $397+ smart tiers (PRO/SCALE/MAX)
- **Payment Flow:** Invitation → Payment wall → $1500 setup + first month → Account activated
- **No public signup yet** - Only invited users who have verbally agreed to work with us

### Pricing Tiers Decided
1. **FREE** - Retention tool (1 project, no domains, 1 user) - Not advertised
2. **BASIC ($29/mo)** - Fallback option (3 projects, domains, 1 user) - Not advertised  
3. **PRO ($397/mo)** - 5 projects, 3 users, marketing platform access
4. **SCALE ($697/mo)** - 10 projects, 5 users, enhanced marketing
5. **MAX ($997/mo)** - 25 projects, 10 users, full marketing suite
6. **PERFORM Addon ($459/mo)** - SEO/GEO optimization addon

All smart tiers (PRO/SCALE/MAX) have $1500 one-time setup fee.

### Key Technical Decisions Made

#### Stripe Implementation
- **Use Stripe Embedded Checkout** (not redirects) - Keeps users on our site, looks professional
- **Separate line items** for setup fee and subscription (not bundled)
- **Stripe Customer Portal** for self-service billing management
- **Webhooks** for payment events and tier updates

#### Database Design
- Add `tier` enum to accounts table
- Use `tier_restrictions` JSONB column on content tables (not many-to-many)
  - `null` or `[]` = available to everyone
  - `['PRO', 'SCALE', 'MAX']` = smart tiers only
- Simple and queryable with PostgreSQL JSONB operators

#### Feature Gating Strategy
- FREE/BASIC users get most content, just not "smart" sections requiring GoHighLevel
- Smart sections will have embedded iframes from GoHighLevel (forms, calendars)
- "Launch Marketing Platform" button for PRO+ (opens GoHighLevel in new tab)
- "Launch SEO Platform" button for PERFORM addon (opens Search Atlas)

#### Grace Period & Downgrades
- 10-day grace period for failed payments (Stripe handles retries)
- During grace period: Show banner but keep features active
- Email sequence: Day 1, 3, 7, 10 + admin notification
- Downgrade migration: 
  - Limit to 1 user (account owner only)
  - Archive excess projects (keep newest)
  - Remove smart sections from sites
  - Disable custom domains (unless going to BASIC)

#### Feature Management UI
- Matrix grid: Features/content (rows) × Tiers (columns) with checkboxes
- Tabs for: Features | Sections | Themes | Pages | Templates
- Preview mode: "View Library as [TIER]" for testing
- Bulk actions for quick updates

### Implementation Order (7 Packets)
1. **Database Foundation** - Schema, migrations, tier structure
2. **Stripe Integration** - Payment flow, webhooks, customer portal
3. **Feature Gating** - Hooks, utilities, restrictions
4. **Management UI** - Admin tools for tier configuration
5. **Grace Period** - Email automation, payment failure handling
6. **Tier Migration** - Upgrade/downgrade logic
7. **Testing & Polish** - E2E testing, security, performance

### Sprint Process Notes
- Each packet gets its own feature branch and PR
- Deploy to preview after each packet for incremental testing
- Follow FULL FEATURE MODE from DEV-LIFECYCLE.md
- User will manually apply migrations to PROD database
- Final merge to `nextjs-pagebuilder-core` at sprint end

### Important Implementation Details

#### Payment Activation Flow
```
1. User accepts invitation
2. Redirected to /activate page (payment wall)
3. Choose tier (PRO/SCALE/MAX)
4. Embedded checkout shows: $1500 + $397 (example)
5. Pay → Webhook updates account → Access granted
```

#### Webhook Events to Handle
- `checkout.session.completed` - Activate account
- `invoice.payment_failed` - Start grace period
- `customer.subscription.updated` - Track changes
- `customer.subscription.deleted` - Handle cancellation

#### Environment Variables Needed
- `STRIPE_PUBLISHABLE_KEY` (test mode)
- `STRIPE_SECRET_KEY` (test mode)
- `STRIPE_WEBHOOK_SECRET` (from webhook creation)

### Testing Requirements
- Use Stripe CLI for local webhook testing
- Test all tier upgrade/downgrade paths
- Verify smart content filtering
- Test payment failure scenarios
- Load test with 500+ library items
- Security audit payment endpoints

### What's NOT in This Sprint
- GoHighLevel API integration (just buttons to their portal)
- Search Atlas integration (just button to their portal)
- Public signup flow (invitation-only for now)
- Complex subscription modifications (use Stripe Portal)

### Next Session Starting Point
Begin with PACKET 1: Database Foundation
1. Create feature branch: `feature/tier-database-foundation`
2. Run pre-flight checks
3. Create database migrations for tier system
4. Focus on getting schema right before moving to payments

### Questions Resolved
- ✅ Payment before access (no free trial period)
- ✅ $1500 charged with first month (separate line items)
- ✅ Customers choose their tier (from 3 smart options)
- ✅ 10-day grace period with email reminders
- ✅ Industry-standard approach using Stripe's built-in features

### References
- Vercel's nextjs-subscription-payments template (archived but useful reference)
- Stripe Embedded Checkout docs
- Stripe Customer Portal for self-service
- Our existing Resend integration for emails

---

**Ready to begin implementation of v0.1.5 monetization system!**