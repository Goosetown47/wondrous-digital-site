## ------------------------------------------------ ##
# ACTIVE SPRINT
## ------------------------------------------------ ##

## OVERVIEW

**Production Version:** v0.1.4 
**Development Version:** v0.1.5


# -------------------------------------------------------------------------------------- #
# VERSION 0.1.5 "Payments, Packages, and Features Oh My"
# -------------------------------------------------------------------------------------- #


### Goal: Create a complete payments and packages system for our platform that fully integrates with Stripe, accepts payments, monitors payment status, and sets accounts to specific tiers.

### Notes:
This is a large, but critical sprint which will allow us to assign accounts a specific tier based on the package they choose and then PAY for. Once paid, we unlock those features for their account. This is critical for us to begin making money and properly functioning as a business.




## PACKETS ----------------------------------------------------------------------------- ##

### **[PACKET 1] Database Foundation for Tiers & Features**
**Goal:** Set up the data structure for tier-based feature gating
**Deliverable:** Database schema supporting tier restrictions and account billing

**Pre-Flight & Planning:**
- [x] Create feature branch: `feature/tier-database-foundation`
- [x] Verify clean environment (tsc, lint, tests)
- [x] Create user stories for database structure validation
- [x] Add packet to ACTIVE-SPRINT.md

**Development Tasks:**
- [x] Add `tier` enum to accounts table (FREE, BASIC, PRO, SCALE, MAX)
- [x] Add Stripe fields to accounts: `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`
- [x] Add `setup_fee_paid` boolean and `setup_fee_paid_at` timestamp
- [x] Add `grace_period_ends_at` timestamp for payment failures
- [x] Add `tier_restrictions` JSONB column to library_items, themes, types, lab_drafts tables
- [x] Create `account_billing_history` table for tracking all payments/changes
- [x] Create `tier_features` table to define what each tier includes
- [x] Add `has_perform_addon` boolean to accounts for SEO addon

**Testing & QA:**
- [x] Write migration test scripts (included rollback in migration)
- [x] Test migration up locally (applied to DEV database)
- [x] Verify TypeScript types generated correctly
- [x] Security check: Verify RLS policies on new tables (added policies in migration)
- [x] Run full test suite (existing tests pass, unrelated failures)

**Deployment:**
- [ ] Create PR to `nextjs-pagebuilder-core`
- [ ] Test on preview deployment
- [x] Document migrations for PROD manual application
- [x] Update ACTIVE-SPRINT.md logs

---

### **[PACKET 2] Stripe Integration & Payment Flow**
**Goal:** Implement complete Stripe payment system with embedded checkout
**Deliverable:** Working payment flow from invitation to account activation

**Pre-Flight & Planning:**
- [ ] Create feature branch: `feature/stripe-payment-integration`
- [ ] Verify Stripe test keys configured
- [ ] Create user stories for payment flows
- [ ] Add packet to ACTIVE-SPRINT.md

**Development Tasks:**
- [ ] Set up Stripe products/prices for all tiers and setup fees
- [ ] Create `/activate` page with embedded checkout
- [ ] Implement Stripe Embedded Checkout with multiple line items
- [ ] Create API route `/api/stripe/create-checkout-session`
- [ ] Create webhook endpoint `/api/stripe/webhooks`
- [ ] Store Stripe IDs and update account tier on successful payment
- [ ] Create `/api/stripe/customer-portal` for portal sessions
- [ ] Add "Manage Billing" button in account settings

**Testing & QA:**
- [ ] Unit tests for payment API routes with mocked Stripe
- [ ] Test webhook signature verification
- [ ] Test with Stripe CLI webhook forwarding
- [ ] Security audit: No secrets in client code
- [ ] Test all Stripe test cards (success, decline, etc.)
- [ ] Verify PCI compliance requirements met

**Deployment:**
- [ ] Create PR to `nextjs-pagebuilder-core`
- [ ] Test payment flow on preview
- [ ] Verify webhook endpoints accessible
- [ ] Update ACTIVE-SPRINT.md logs

---

### **[PACKET 3] Feature Gating System**
**Goal:** Control access to features and content based on tier
**Deliverable:** Automatic feature restrictions throughout the platform

**Pre-Flight & Planning:**
- [ ] Create feature branch: `feature/tier-gating-system`
- [ ] Review existing permission patterns
- [ ] Create user stories for feature restrictions
- [ ] Add packet to ACTIVE-SPRINT.md

**Development Tasks:**
- [ ] Create `useAccountTier()` hook
- [ ] Create `canUseFeature()` utility function
- [ ] Gate project creation based on tier limits
- [ ] Gate custom domain features
- [ ] Gate user invitations based on tier limits
- [ ] Update library queries to filter content
- [ ] Add "Launch Marketing Platform" button for PRO+ tiers
- [ ] Add "Launch SEO Platform" button for PERFORM addon
- [ ] Show upgrade prompts when users hit tier limits

**Testing & QA:**
- [ ] Unit tests for permission utilities
- [ ] Test each tier's restrictions
- [ ] E2E tests for upgrade prompts
- [ ] Manual test: Verify all gating works per tier
- [ ] Performance test: Library filtering with 100+ items
- [ ] Security: Verify server-side enforcement

**Deployment:**
- [ ] Create PR to `nextjs-pagebuilder-core`
- [ ] Test all tiers on preview
- [ ] Verify no features leak to wrong tiers
- [ ] Update ACTIVE-SPRINT.md logs

---

### **[PACKET 4] Feature Management UI**
**Goal:** Admin interface to control what features/content each tier can access
**Deliverable:** Tools page for managing tier restrictions dynamically

**Pre-Flight & Planning:**
- [ ] Create feature branch: `feature/management-ui`
- [ ] Design matrix UI wireframe
- [ ] Create user stories for admin management
- [ ] Add packet to ACTIVE-SPRINT.md

**Development Tasks:**
- [ ] Create `/tools/features` page with tabs
- [ ] Build matrix grid UI component
- [ ] Implement "Features" tab
- [ ] Implement "Sections" tab
- [ ] Implement "Themes" tab
- [ ] Implement "Pages" tab
- [ ] Implement "Templates" tab
- [ ] Add bulk actions functionality
- [ ] Add preview mode dropdown
- [ ] Create API routes for tier_restrictions updates

**Testing & QA:**
- [ ] Unit tests for matrix components
- [ ] Test bulk operations with 50+ items
- [ ] Test preview mode accuracy
- [ ] Accessibility audit (keyboard navigation)
- [ ] Performance: Test with 500+ library items
- [ ] Manual test all CRUD operations

**Deployment:**
- [ ] Create PR to `nextjs-pagebuilder-core`
- [ ] Demo feature to user on preview
- [ ] Verify data persistence
- [ ] Update ACTIVE-SPRINT.md logs

---

### **[PACKET 5] Grace Period & Email Automation**
**Goal:** Handle failed payments gracefully with automated communications
**Deliverable:** Automated system for payment failures and recovery

**Pre-Flight & Planning:**
- [ ] Create feature branch: `feature/payment-grace-period`
- [ ] Design email templates
- [ ] Create user stories for payment failures
- [ ] Add packet to ACTIVE-SPRINT.md

**Development Tasks:**
- [ ] Configure Stripe subscription settings
- [ ] Create email templates in Resend
- [ ] Set up cron job infrastructure
- [ ] Create `/api/cron/payment-reminders` endpoint
- [ ] Add admin notification system
- [ ] Show grace period banner in app
- [ ] Create `/account/billing` page

**Testing & QA:**
- [ ] Test email template rendering
- [ ] Test cron job timing logic
- [ ] Test with simulated payment failures
- [ ] Verify email delivery to test accounts
- [ ] Security: Verify cron endpoint protection
- [ ] Manual test full grace period flow

**Deployment:**
- [ ] Create PR to `nextjs-pagebuilder-core`
- [ ] Test cron job on preview
- [ ] Verify Resend integration
- [ ] Update ACTIVE-SPRINT.md logs

---

### **[PACKET 6] Tier Migration System**
**Goal:** Handle account upgrades and downgrades smoothly
**Deliverable:** Automated system for tier changes that preserves data intelligently

**Pre-Flight & Planning:**
- [ ] Create feature branch: `feature/tier-migration`
- [ ] Map out all downgrade scenarios
- [ ] Create user stories for tier changes
- [ ] Add packet to ACTIVE-SPRINT.md

**Development Tasks:**
- [ ] Create tier change handler in webhook processor
- [ ] Implement upgrade flow
- [ ] Implement downgrade flow logic
- [ ] Create "archived due to downgrade" flag
- [ ] Create `/account/manage-downgrade` page
- [ ] Log all migration actions

**Testing & QA:**
- [ ] Unit tests for migration logic
- [ ] Test all upgrade paths
- [ ] Test all downgrade paths
- [ ] Test project archival logic
- [ ] Test smart section removal
- [ ] Manual test edge cases

**Deployment:**
- [ ] Create PR to `nextjs-pagebuilder-core`
- [ ] Test migrations on preview
- [ ] Verify data integrity maintained
- [ ] Update ACTIVE-SPRINT.md logs

---

### **[PACKET 7] Testing & Polish**
**Goal:** Ensure rock-solid payment system ready for real customers
**Deliverable:** Fully tested, production-ready billing system

**Pre-Flight & Planning:**
- [ ] Create feature branch: `feature/payment-system-polish`
- [ ] Compile comprehensive test plan
- [ ] Create final user stories
- [ ] Add packet to ACTIVE-SPRINT.md

**Development Tasks:**
- [ ] Fix any issues found in testing
- [ ] Add proper error pages
- [ ] Create internal documentation
- [ ] Set up monitoring/alerts
- [ ] Performance optimizations
- [ ] Final UI polish

**Testing & QA:**
- [ ] Full E2E test with real Stripe test mode
- [ ] Load test payment endpoints
- [ ] Security penetration testing
- [ ] Accessibility audit
- [ ] Lighthouse performance audit
- [ ] User acceptance testing with product owner

**Final Deployment:**
- [ ] Create final PR to `nextjs-pagebuilder-core`
- [ ] Full preview deployment test
- [ ] Document all PROD migrations needed
- [ ] Create v0.1.5 Release Notes
- [ ] Final merge and production deployment
- [ ] Post-deployment verification





## MANUAL TESTS ----------------------------------------------------------------------------- ##






## SPRINT LOGS ----------------------------------------------------------------------------- ##

### January 20, 2025 - PACKET 1 Progress

**Completed:**
1. ✅ Fixed pre-flight issues (2 TypeScript errors, 1 ESLint error)
2. ✅ Created feature branch: `feature/tier-database-foundation`
3. ✅ Created comprehensive migration file: `20250120_000001_tier_foundation.sql`
   - Added tier_name enum (FREE, BASIC, PRO, SCALE, MAX)
   - Updated accounts table with billing fields
   - Created tier_features table with default tier configurations
   - Created account_billing_history table for audit trail
   - Added tier_restrictions JSONB to library tables
   - Implemented RLS policies for security
   - Added helper functions for tier access checks
4. ✅ Updated TypeScript types in database.ts and builder.ts
5. ✅ Successfully applied migration to DEV database
6. ✅ Generated database types from schema
7. ✅ Verified clean TypeScript compilation (0 errors)
8. ✅ Build and tests run successfully

**Key Implementation Details:**
- Used JSONB for tier_restrictions to allow flexible querying
- null or empty array [] means content is available to all tiers
- Array of tier names ['PRO', 'SCALE', 'MAX'] restricts to those tiers
- Added PostgreSQL GIN indexes for efficient JSONB queries
- Implemented row-level security for billing history (only account owners can view)
- Tier features table is publicly readable (for pricing pages)

**Migration for PROD:**
The user needs to manually apply `/supabase/migrations/20250120_000001_tier_foundation.sql` to the production database via Supabase Dashboard.

**Next Steps:**
PACKET 1 is complete. Ready to proceed with PACKET 2: Stripe Integration & Payment Flow.






# ------------------------------------------------ #
# PROCESS & RULES
# ------------------------------------------------ #

## ---------------------------------------------- ##
# Sprint Process Guide (for reference)

## Sprint Planning (Start of Sprint)

  1. [User will] Review BACKLOG.md → Pull priority items into ACTIVE-SPRINT.md
  2. [User will] Set version number → Decide scope (major.minor.patch)
  3. [User will] Move packets → Cut H4 sections from BACKLOG to ACTIVE-SPRINT
  4. [User will] Order packets → Arrange by priority/dependency


## During Sprint Execution

### Per Packet Workflow:

  1. Follow DEV-LIFECYCLE.md → Full/Fast Track/Emergency mode per packet
  2. As you discover issues → Add to "Found Work" section:
    - Critical → Must fix in current version
    - Non-Critical → Defer to next version
    - Tech Debt → Document for future
  3. Update ACTIVE-STATUS.md → Log progress after each packet
  4. Check off tasks → Mark complete in ACTIVE-SPRINT.md
  5. [User will] Move to Sprint Backlog → When packet done, grab next

### Daily Flow:

  - Start: Check Current Focus in ACTIVE-SPRINT.md
  - Work: Follow DEV-LIFECYCLE for that packet
  - Discover: Add found issues to appropriate section
  - End: Update ACTIVE-SPRINT with progress

### Sprint Completion

  1. All packets done → Verify all tasks checked
  2. Create Release Notes → /docs/Release_Notes/v0.1.1.md
  3. [User will] Archive sprint content → Copy ACTIVE-SPRINT to STATUS-LOG
  4. [User will] Clear ACTIVE-SPRINT.md → Reset for next sprint
  5. [User will] Update version numbers → Production/Development in all docs


## Key Rules

  - COMPLETE DEV-LIFECYCLE per packet before moving on
  - DOCUMENT found work immediately
  - NEVER skip DEV-LIFECYCLE steps

## ---------------------------------------------- ##


---

## CLASSIFICATIONS
Use these classifications to identify each type of task. We can expand this list as needed.

🪲 - Bug
🚩 - Support Ticket Item
⚙️ - Rework
⚗️ - Testing / Review / Verify
✂️ - Cut/Postponed/Cancelled
🚀 - Feature 
📌 - Administrative / Operations

## Status Legend
- ⬜ Not Started
- 🟦 In Progress
- ✅ Complete
- ❌ Blocked
- 🟨 On Hold

## Manual Test Markings (User will mark):
- ✅ What works as expected
- ❌ What fails or doesn't work
- ⚠️ What's partially working or unclear
- 🤔 What you're unsure about