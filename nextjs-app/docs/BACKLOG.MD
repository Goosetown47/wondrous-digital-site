# BACKLOG

This is the full backlog of features we keep and add to as we develop. We will organize this by category and type. When something is taken from the backlog, it’s moved up to active sprint. We will constantly add, adjust, remove, and prioritize items in this list as part of backlog grooming.

**Production Version:** v0.1.0 (Released 8/1/2025 @ 11pm)
**Development Version:** v0.1.1 (Active Planning Now)


## FORMAT

---

#### Category or Subcategory
**Goal:** [What are we trying to accomplish]
**Note:** [Anything we need to know about this packet]
**Deliverable:** [What is our deliverable?]

- [ ] 🚀 Task
- [ ] 🪲 Task
  - [ ] 🪲 Sub Task

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

---


## UNDEFINED UPCOMING EPICS

### Scale Content
- Once we have a fully functioning system that is bullet proof and ready to take in new components, we will add more than a thousand new ones.

### Scale Up Existing Features
*To be detailed*

### Final Production Features
*To be detailed*





## BACKLOG ITEMS 


### PRIORITY 1
---------------


#### [Packet] Domain Configuration System
**Goal:** Implement production-ready domain management with white-labeled approach
**Note:** Core functionality is implemented, needs finalization and thorough testing on both dev and production environments.
**Deliverable:** Fully functional white-labeled domain system with preview domains and custom domain support

##### Domain Functionality Finalization
- [ ] 🚀 Add domain usage analytics tracking (track visits per domain)
- [ ] 🚀 Implement domain transfer between projects functionality
- [ ] 🚀 Add bulk domain operations for managing multiple domains
- [ ] 🚀 Create domain history/audit log for tracking changes
- [ ] 🚀 Add support for domain redirects (www to non-www, etc.)
- [ ] 🪲 Fix any edge cases with apex domain handling

##### Development Environment Testing
- [ ] ⚗️ Test preview domain generation for new projects
- [ ] ⚗️ Verify *.localhost:3000 works for local multi-tenant testing
- [ ] ⚗️ Test domain verification flow with mock DNS records
- [ ] ⚗️ Verify middleware correctly routes based on domain
- [ ] ⚗️ Test domain deletion and cleanup processes

##### Production Environment Testing
- [ ] ⚗️ Verify sites.wondrousdigital.com is properly configured in Vercel
- [ ] ⚗️ Test *.sites.wondrousdigital.com wildcard certificate
- [ ] ⚗️ Add a real test domain and verify full flow
- [ ] ⚗️ Test SSL certificate provisioning for custom domains
- [ ] ⚗️ Verify DNS propagation messaging is accurate

##### Vercel API Integration Testing
- [ ] ⚗️ Test domain addition via Vercel API
- [ ] ⚗️ Verify domain removal properly cleans up in Vercel
- [ ] ⚗️ Test API rate limiting and error handling
- [ ] ⚗️ Verify domain verification polling intervals
- [ ] ⚗️ Test handling of Vercel API downtime

##### User Experience Improvements
- [ ] 🚀 Add domain health check dashboard
- [ ] 🚀 Implement email notifications for domain verification
- [ ] 🚀 Create troubleshooting guide for common DNS issues
- [ ] 🚀 Add domain performance metrics (response time, SSL status)
- [ ] ⚗️ Test copy-to-clipboard for all DNS instructions

##### Security & Edge Cases
- [ ] ⚗️ Test domain hijacking prevention (verify ownership)
- [ ] ⚗️ Verify domains can't be added to multiple projects
- [ ] ⚗️ Test subdomain validation (prevent *.example.com)
- [ ] ⚗️ Verify proper cleanup when project is deleted
- [ ] 🪲 Handle international domains (IDN) properly

##### Documentation & Support
- [ ] 📌 Create video tutorial for domain setup
- [ ] 📌 Document common DNS provider settings (GoDaddy, Namecheap, Cloudflare)
- [ ] 📌 Create internal runbook for domain troubleshooting
- [ ] 📌 Add domain FAQ section to help docs
- [ ] 📌 Create customer-facing domain setup guide


---

#### [Packet] Database Isolation (Supabase) 
**Goal:** Create proper isolation for our production and development databases. 
**Notes:** We currently have one single database powering development and production, which is not ideal and can cause serious issues down the road. We need to have both a development and production database that are completely in sync structurally, but utilize their own content. We need proper processes in place to handle this complexity.

##### Initial Planning & Assessment
- [ ] 📌 Document current database structure and dependencies
- [ ] 📌 Audit all environment variables across dev and production
- [ ] 📌 Create backup of current production database
- [ ] 📌 Map out all services that connect to the database
- [ ] 📌 Identify any hardcoded database connections

##### Supabase Project Setup
- [ ] ⚙️ Create new Supabase project for production
- [ ] ⚙️ Configure production project settings to match current setup
- [ ] ⚙️ Set up production authentication providers
- [ ] ⚙️ Configure production RLS policies
- [ ] ⚙️ Set up production Edge Functions (if any)

##### Migration Strategy Development
- [ ] 📌 Create migration script to copy schema from dev to prod
- [ ] 📌 Document which tables need data migration vs. fresh start
- [ ] 📌 Create data migration plan for essential data (accounts, users, etc.)
- [ ] 📌 Plan cutover strategy with minimal downtime
- [ ] 📌 Create rollback plan in case of issues

##### Environment Configuration
- [ ] ⚙️ Update .env.local with development database credentials
- [ ] ⚙️ Create .env.production with production database credentials
- [ ] ⚙️ Update Vercel environment variables for production
- [ ] ⚙️ Create environment switching mechanism for local development
- [ ] ⚙️ Update all service configurations to use correct env vars

##### Schema Synchronization Process
- [ ] 🚀 Set up migration tracking system (version control)
- [ ] 🚀 Create CI/CD pipeline for automatic migration deployment
- [ ] 🚀 Implement pre-deployment migration validation
- [ ] 🚀 Create migration rollback procedures
- [ ] 🚀 Document migration naming conventions and process

##### Data Management Procedures
- [ ] 📌 Create seed data scripts for development
- [ ] 📌 Implement data anonymization for dev database
- [ ] 📌 Set up regular production → dev sync process (schema only)
- [ ] 📌 Create data cleanup scripts for development
- [ ] 📌 Document data refresh procedures

##### Testing & Validation
- [ ] ⚗️ Test all migrations on development first
- [ ] ⚗️ Verify RLS policies work identically in both environments
- [ ] ⚗️ Test authentication flows in both environments
- [ ] ⚗️ Validate all API endpoints with new database
- [ ] ⚗️ Performance test with production-like data volume

##### Monitoring & Maintenance
- [ ] 🚀 Set up database monitoring for both environments
- [ ] 🚀 Configure backup schedules for production
- [ ] 🚀 Implement database health checks
- [ ] 🚀 Create alerts for schema drift detection
- [ ] 🚀 Set up query performance monitoring

##### Documentation & Training
- [ ] 📌 Document environment setup for new developers
- [ ] 📌 Create runbook for common database operations
- [ ] 📌 Document emergency procedures
- [ ] 📌 Create troubleshooting guide
- [ ] 📌 Update CLAUDE.md with new database setup


--- 


#### [Packet] Service Layer & API Updates
**Goal:** Update all services to be account-aware  
**Deliverable:** Account-aware service layer

- [ ] 🚀 Update service layers:
  - [ ] 🚀 Add account context to all queries
  - [ ] 🚀 Implement permission checks
  - [ ] 🚀 Add audit logging
  - [ ] 🚀 Handle multi-account scenarios
- [ ] 🚀 Update React hooks:
  - [ ] 🚀 `useAccount()` hook
  - [ ] 🚀 `useAccountProjects()` hook
  - [ ] 🚀 `useAccountUsers()` hook
  - [ ] 🚀 Update existing hooks for account context
- [ ] 🚀 Error handling:
  - [ ] 🚀 Permission denied errors
  - [ ] 🚀 Account not found errors
  - [ ] 🚀 Proper error messages
- [ ] 🚀 Testing utilities:
  - [ ] 🚀 Mock account context
  - [ ] 🚀 Permission testing helpers

---




### PRIORITY 2
---------------


#### [Packet] Page Management System

- **Enhanced Builder Integration:**
  - [ ] 🚀 Add keyboard shortcuts for page switching

- **Page Features:**
  - [ ] 🚀 Implement homepage selection (mark any page as homepage)
  - [ ] 🚀 Create page template selector for new pages
  - [ ] 🚀 Implement page ordering for navigation
  - [ ] 🚀 Add custom 404 page configuration
  - [ ] 🚀 Create page preview functionality


---

#### [Packet] Navigation System
**Goal:** Users can create navigation sections and functionality linking their website together.  
**Deliverable:** Fully functioning WYSIWYG editing and config for 
**Notes:** We need to create an industry standard, highly interactive, usable navigation system for customers to be able to connect their websites navigation, perform CRUD on elements, and select from different navigation sections (eventually) that have different complexities of configuration like super drop downs. We need this to work for nav bars, footers, and side nav bar components/sections.

**Feature Task List:**
- [ ] add  

- [ ] 🚀 Navigation System:
  - [ ] 🚀 Design navigation data structure
  - [ ] 🚀 Create navigation menu builder UI
  - [ ] 🚀 Implement internal page link picker component
  - [ ] 🚀 Add automatic menu generation from pages
  - [ ] 🚀 Support nested navigation items
  - [ ] 🚀 Create breadcrumb component using page hierarchy


---


#### [Packet] Account Management Tools
- [ ] 🚀 Export account data (deferred - can be added later)
- [ ] 🚀 Account features:
  - [ ] 🚀 Subscription plan management
  - [ ] 🚀 Usage statistics dashboard
  - [ ] 🚀 Billing information
  - [ ] 🚀 Account limits/quotas
- [ ] 🚀 Account audit log viewer functional

---

#### [Packet] User Invitation System 
- [ ] ⚗️ VERIFY:
  - [x] ⚗️ Created `account_invitations` table with migration `20250804_000000_add_account_invitations.sql`
  - [x] ⚗️ Built invitation service layer at `/src/lib/services/invitations.ts`
  - [x] ⚗️ Created complete API routes for invitation management
  - [x] ⚗️ Implemented React hooks in `/src/hooks/useInvitations.ts`
  - [x] ⚗️ Built team management UI at `/src/app/(app)/account/users/page.tsx`
  - [x] ⚗️ Added pending invitations management with resend/cancel actions
  - [x] ⚗️ Implemented proper multi-tenant isolation and security
  - [x] ⚗️ Created `account_users_with_details` view for user display

**Remaining Tasks**:
  - [ ] 🚀 Email notification system for invitations
  - [ ] 🚀 Invitation acceptance page UI
  - [ ] 🚀 Staff assignment UI for platform staff
  - [ ] 🚀 Add user profile extensibility features
  - [ ] 🚀 Add inline user profile editing


---

#### [Packet] Site Templates & Project Settings
**Note:** Enables users to quickly start with professional templates and switch templates post-creation with safety controls.
**Deliverable:** Complete site template system with safe application methods and project settings management

- 🚀 Implement Site Templates:
  - [ ] Create Design & Templates tab in settings
  - [ ] Add template browser showing library items (type='site')
  - [ ] Implement template preview functionality
  - [ ] Create template application service
  - [ ] Add application modes (replace/merge/theme-only)
  - [ ] Show clear warnings for destructive actions
  - [ ] Track template_id in projects table
- 🚀 Template Safety Features:
  - [ ] Backup current state before applying template
  - [ ] Show preview of changes before applying
  - [ ] Add confirmation dialogs with clear messaging
  - [ ] Log template applications in audit_logs
- 🚀 Update Project Creation Flow:
  - [ ] Add template selection step to /tools/projects/new
  - [ ] Show grid of available site templates
  - [ ] Include "Blank Site" option
  - [ ] Apply selected template during creation

---



##### [Packet] Canvas Builder Improvements

- [ ] 🚀 Reorder sections



### PRIORITY LOW
---------------

#### [Packet] Project Management Tools
- **Create project service layer:**
  - [ ] `/tools/projects/[id]/settings` - Project settings page (merged into detail page

- **Project list features:**
  - [ ] 🚀 Bulk actions (archive multiple) - deferred

- **Create project form:**
  - [ ] 🚀 Initial domain setup - deferred

- **Project Detail Page**
  - [ ] 🚀 Users tab showing access - deferred


---

#### [Packet] Library Architecture
- [ ] 🚀 Tags (deferred - basic categories implemented)


---

#### [Packet] app.wondrousdigital.com DESIGN
- [ ] 🚀 Apply theming to app itself (deferred to Phase 1D)


---

#### [Packet] Feature Tagging System
**Goal:** Create a system where we can segment our features and enable them for different tiered customers.
**Deliverable:** Tag system with template integration that links to paid tiers
**Notes:** We will be enabling certain sections by paid tier and need to create a way for us to store those tags, link them to paid tiers in terms of visibility/usability. 

---

#### [Packet] Paid Tier System & Stripe Integration
**Goal:** Finalize the paid tiers for our application and integrate Stripe payments into our app so users can handle their own billing.
**Deliverable:** A set of paid tiers linked to confirmed Stripe payments to enable.
**Notes:** We will have several plans and add ons that need to be configured and tied to features being turned on and off.





## VAULT

Items we cut or cancel or postpone will be moved here to this section for future evaluation.





## ---------------------------------------------- ##
# Sprint Process Guide

## Sprint Planning (Start of Sprint)

  1. Review BACKLOG.md → Pull priority items into ACTIVE-SPRINT.md
  2. Set version number → Decide scope (major.minor.patch)
  3. Move packets → Cut H4 sections from BACKLOG to ACTIVE-SPRINT
  4. Order packets → Arrange by priority/dependency


## During Sprint Execution

### Per Packet Workflow:

  1. Move packet to Current Focus → Work on one packet at a time
  2. Follow DEV-LIFECYCLE.md → Full/Fast Track/Emergency mode per packet
  3. As you discover issues → Add to "Found Work" section:
    - Critical → Must fix in current version
    - Non-Critical → Defer to next version
    - Tech Debt → Document for future
  4. Update STATUS-LOG.md → Log progress after each packet
  5. Check off tasks → Mark complete in ACTIVE-SPRINT.md
  6. Move to Sprint Backlog → When packet done, grab next

### Daily Flow:

  - Start: Check Current Focus in ACTIVE-SPRINT.md
  - Work: Follow DEV-LIFECYCLE for that packet
  - Discover: Add found issues to appropriate section
  - End: Update STATUS-LOG with progress

### Sprint Completion

  1. All packets done → Verify all tasks checked
  2. Create Release Notes → /docs/Release_Notes/v0.1.1.md
  3. Archive sprint content → Copy ACTIVE-SPRINT to STATUS-LOG
  4. Clear ACTIVE-SPRINT.md → Reset for next sprint
  5. Update version numbers → Production/Development in all docs


## Key Rules

  - ONE packet in Current Focus at a time
  - COMPLETE DEV-LIFECYCLE per packet before moving on
  - DOCUMENT found work immediately
  - UPDATE STATUS-LOG per packet completion
  - NEVER skip DEV-LIFECYCLE steps

## ---------------------------------------------- ##