
# ---------------------------------------------------------------------------------------- #
# BACKLOG OVERVIEW
# ---------------------------------------------------------------------------------------- #

This is the full backlog of features we keep and add to as we develop. We will organize this by category and type. When something is taken from the backlog, it’s moved up to active sprint. We will constantly add, adjust, remove, and prioritize items in this list as part of backlog grooming.

**Production Version:** v0.1.3 (Released 8/1/2025 @ 11pm)
**Development Version:** v0.1.4 (Active Planning Now)

## CLASSIFICATIONS
Use these classifications to identify each type of task. We can expand this list as needed.

🪲 - Bug
🚩 - Support Ticket Item
⚙️ - Rework
⚗️ - Testing / Review / Verify
✂️ - Cut/Postponed/Cancelled
🚀 - Feature 
📌 - Administrative / Operations


## EPICS ------------------------------------------------------- ##

### Production Platform Ready (v0.1.0) 
*This means that the platform is MVP, but rock solid and completely ready for use by the public. We aren't giving it bells and whistles. It is the minimum amount of features possible we can start with to get customers onboarded and things functioning well.*

#### Production Platform Packets 

**Critical Infrastructure** v0.1.2 ✅
- Service Layer & API Updates
- Database Isolation for Dev/Prod 

**Security** v0.1.3 ✅
- MVP Security Essentials (XSS, Headers, RLS, Auth basics for 25 manual users)

**Account Management** v0.1.4 
- Final Project Management Tools
- Final Account Management Tools
- Final User Management Tools
- User Invitation System (I don't think this work is actually done)

**Payments & Segmentation** v0.1.5
- Paid Tier System & Stripe Integration
- Feature Tagging & Segmentation System

**Final Cleanup** v0.1.6
- Domain Configuration Hardening

---

### Website Builder Ready (v0.2.0)
*This means we have enough content and customization ability seeded into the platform so we can create unique, beautiful websites that wow and delight. This doesn't mean we need hundreds of sections and templates. We need just enough to get started marketing to our first 100 customers and create 3 different themes for vets.*

#### Website Builder Packets

**Navigation** v0.2.1
- Navigation System (needs definition)

**Content Management** v0.2.2
- Page Management System
- Site Templates & Project Settings
- Basic Canvas Builder Improvements

**Basic Performance Metrics** v0.2.3
- Basic project performance metrics in an Analytics area

**Dashboard** v0.2.4
- Clean this up and make it nicer
- Links to marketing and SEO dashboards OR a link to an upgrade page.

**Content** v0.2.5
- 5 sections for each category in the builder
- 5 new, good themes
- Smart Sections (GoHighLevel Integrations)

**Lab: Theme Creator** v0.2.6
- More customization on colors
- Fonts/Typography
- Special Effects


---

### Final Polish v0.3.0
*These are the final things we need to do before launch, which include including our logos, giving the UI a little bit more polish and identity, and small improvements*

#### Final Polish Packets

**Application Design** v0.3.1
- app.wondrousdigital.com Theme
- Light / Dark Mode

**Content** v0.3.2
- Bug Reporting Button & System
- Support Ticket System
- Roadmap / Release Notes Page
- Account Management Page (For customers)

**Marketing Website** v0.3.3
- Construct our marketing website using the builder
- Add all the proper content
- Create login and sign up links

**Final Testing**
- Have others test the experience
- Run some more E2E tests 


---

### LAUNCH v1.0.0
*Once all these epics are complete, we're ready for customers*


#### Veterinarian Themes Packets
*This is about creating our first 3-4 themes we can utilize to get ready to work with customers. This work is not feature work, but actually just using the application to make content*

**Themes**
- Theme 1 created 
- Theme 2 created
- Theme 3 created

**Templates**
- Template 1 created
- Template 2 created
- Template 3 created



# ---------------------------------------------------------------------------------------- #
# VERSION 0.1.0 -------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------- #



## Payments & Segmentation** v0.1.5 ---------------------------------------- ##
- Paid Tier System & Stripe Integration
- Feature Tagging & Segmentation System


### [PACKET] Plan Management for Manual Billing
**Goal:** Allow admins to manually manage customer plans
**Deliverable:** Admin interface for plan assignment

I don't exactly know what we need to do to get our plan management billing properly set up for our service. Here is the existing current plan to charge our customers.


# Here is the pricing tier structure:

We have 3 segments to it Basic Websites, Smart Marketing Platform, and Addons.

## Basic Websites
We have two plans that allow users to create simple websites with basic functionality. Great if you just need static content and no smart functionality.

### FREE 
- Users can create 1 project
- They can utilize the preview domain, but not add custom domains
- Only 1 account_owner user, no extra users
- No data, just the builder
- No customer service/support

### BASIC ($29/month)
- Users can create 3 projects
- They can utilize custom domains
- Only 1 account_owner user, no extra users
- They get data enabled so they can view how their projects are doing
- Basic service/support

## Smart Marketing Platform
This has a $1500 one time setup fee. We handle setting up your platform for your business so you don't have to worry about it.

### PRO ($397/month)
- Users get access to 5 projects
- Unlimited custom domains and subdomains
- 3 users
- They get access to our marketing platform and smart website sections
(We whitelabel a service called GoHighLevel)
  - They get over 50 different features
  - 10,000 emails/month
  - 250 SMS/calls
  - 100 premium automation executions
  - 25 workflow AI executions
  - Unlimited forms/calendar bookings
  - 1 user accounts
- Premium Support

### SCALE ($697/month) 
- Users get access to 10 projects 
- Unlimited custom domains and subdomains
- 5 users
- Smart Marketing Platform Access
  - 20,000 emails
  - 750 SMS/calls
  - 5,000 AI words
  - 500 premium automation executions
  - 150 workflow AI executions
  - Unlimited forms/calendar bookings
- Premium Support

### MAX ($997/month)
- Users get 25 projects
- Unlimited custom domains and subdomains
- 10 users
- Smart Marketing Platform Access
  - 45,000 emails
  - 1,500 SMS/calls
  - 10,000 AI words
  - 1,000 premium automation executions
  - 300 workflow AI executions
  - Unlimited forms/calendar bookings
- Premium Support


*Addons* 
### PERFORM ($459/month)
*This is optimizing your website for SEO and GEO, which helps you rank higher for LLMs and organic searches. This has a one time setup fee of $750*

- We utilize Search Atlas as a whitelable SEO platform which users will get access to that will improve the rankings of their websites over time.



### [PACKET] Feature Tagging System
**Goal:** Create a system where we can segment our features and enable them for different tiered customers.
**Deliverable:** Tag system with template integration that links to paid tiers
**Notes:** We will be enabling certain sections by paid tier and need to create a way for us to store those tags, link them to paid tiers in terms of visibility/usability. 

- [ ] Brainstorm with Claude and write tasks for this

---

### [PACKET] Feature Management System
**Goal:** Create a new page in Tools area that let's me manage which paid tiers get which things.
**Deliverable:** A feature and library content management system
**Notes:** This will enable staff to active set what features are available to each tier dynamically, and as we bring on new features, segment and test them with specific customers.


- [ ] 🚀 New page in tools where we can manage features and library content
  - Should have tabs to segment content like "features" "site templates" "themes" "sections"
  - Within each tab, we should have a grid with the tiers on the top horizontal row and the items on the vertical left column, with a checkbox grid for each row. So for any feature I can check or uncheck it from a specific paid tier/addon and it will enable or disable it for the accounts that are in those tiers automatically/dynamically.

- [ ] Brainstorm with Claude and write tasks for this

---

### [PACKET] Stripe Integration
**Goal:** Finalize the paid tiers for our application and integrate Stripe payments into our app so users can handle their own billing.
**Deliverable:** A set of paid tiers linked to confirmed Stripe payments to enable.
**Notes:** We will have several plans and add ons that need to be configured and tied to features being turned on and off. I already have a Stripe account set up and linked to my bank account. I don't really know what to do to integrate it into our application properly.

- [ ] We need to set up the Stripe Payment system and get it integrated into our application (I need help figuring this one out)

- [ ] Brainstorm with Claude and write tasks for this






---



---



# ---------------------------------------------------------------------------------------- #
# VERSION 0.2.0 -------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------- #



## Navigation** v0.2.1 ---------------------------------------- ##
- Navigation System (needs definition)


### [PACKET] Navigation System
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


## Content Management** v0.2.2 ---------------------------------------- ##
- Page Management System
- Site Templates & Project Settings
- Basic Canvas Builder Improvements


### [PACKET] Page Management System

- **Enhanced Builder Integration:**
  - [ ] 🚀 Add keyboard shortcuts for page switching

- **Page Features:**
  - [ ] 🚀 Implement homepage selection (mark any page as homepage)
  - [ ] 🚀 Create page template selector for new pages
  - [ ] 🚀 Implement page ordering for navigation
  - [ ] 🚀 Add custom 404 page configuration
  - [ ] 🚀 Create page preview functionality



### [PACKET] Canvas Builder Improvements
**Notes:** I want to create an immersive, sleak builder interface that is interactive and really easy to use. I like the way https://www.shadcnblocks.com/blocks structures their blocks and how you can change the format using grid, list, masonry modes. I like that you can click into the block and see it fully. I want to put something like this in a drawer that you can open and close and select to add sections to your pages. I'd like a sidebar on the right side that has a representation of each of the sections on the page that you can hover over to drag and drop, delete, change, lock etc. This is an abstraction of what's on the page for ease of use. Instead of scrolling up and down to drag things which can be clumsy you can just do it in the sidebar. Users should be able to grab an element from the drawer and drag it into place on the sidebar, and then it appears in the canvas and on the sidebar.

- [ ] 🚀 Reorder sections


---


## Basic Performance Metrics** v0.2.3 ---------------------------------------- ##
- Basic project performance metrics in an Analytics area

### [PACKET] Basic Project Performance Data

- [ ] Brainstorm with Claude and write tasks for this


### [PACKET] Presentation of data in Analytics Section

- [ ] Brainstorm with Claude and write tasks for this


---


## Dashboard** v0.2.4 ---------------------------------------- ##
- Clean this up and make it nicer
- Links to marketing and SEO dashboards OR a link to an upgrade page.


### [PACKET] 

- [ ] Brainstorm with Claude and write tasks for this



---


## Content** v0.2.5 ---------------------------------------- ##
- 5 sections for each category in the builder
- 5 new, good themes
- Smart Sections (GoHighLevel Integrations)


### [PACKET] 

- [ ] Brainstorm with Claude and write tasks for this



---


## Lab: Theme Creator** v0.2.6 ---------------------------------------- ##
- More customization on colors
- Fonts/Typography
- Special Effects

### [PACKET] 

- [ ] Brainstorm with Claude and write tasks for this






# ---------------------------------------------------------------------------------------- #
# VERSION 0.3.0 -------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------- #


## Application Design v0.3.1 ---------------------------------------- ##
- app.wondrousdigital.com Theme
- Light / Dark Mode


#### [Packet] app.wondrousdigital.com DESIGN
- [ ] 🚀 Apply theming to app itself (deferred to Phase 1D)

- [ ] Brainstorm with Claude and write tasks for this


### [PACKET] Light/Dark Mode Toggle

- [ ] Brainstorm with Claude and write tasks for this


---


## Content v0.3.2 ---------------------------------------- ##
- Bug Reporting Button & System
- Support Ticket System
- Roadmap / Release Notes Page
- Account Management Page (For customers)


#### [Packet] Account Management Tools
- [ ] 🚀 Export account data (deferred - can be added later)
- [ ] 🚀 Account features:
  - [ ] 🚀 Subscription plan management
  - [ ] 🚀 Usage statistics dashboard
  - [ ] 🚀 Billing information
  - [ ] 🚀 Account limits/quotas
- [ ] 🚀 Account audit log viewer functional



---


## Marketing Website v0.3.3 ---------------------------------------- ##
- Construct our marketing website using the builder
- Add all the proper content
- Create login and sign up links






---


## Final Testing ---------------------------------------- ##
- Have others test the experience 
- Run some more E2E tests 











# ---------------------------------------------------------------------------------------- #
# UNPRIORITIZED -------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------- #



### [PACKET] Domain Configuration System
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
- [ ] ⚗️ Test domain verification flow with mock DNS records
- [ ] ⚗️ Verify middleware correctly routes based on domain
- [ ] ⚗️ Test domain deletion and cleanup processes

##### Vercel API Integration Testing
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


##### UX Improvements
- [ ] 🚀 Add helpful suggestions when slug is reserved during project creation




## Future Account Management Features (Post-MVP)
*Advanced account management features for when we scale beyond 25 manual customers*

### [PACKET] User Activity Logging
**Goal:** Track and display user actions within accounts
**Deliverable:** Complete activity audit trail for users

- [ ] 🚀 Design user activity log schema
- [ ] 🚀 Implement activity tracking middleware
- [ ] 🚀 Create activity log viewer UI
- [ ] 🚀 Add filtering and search capabilities
- [ ] 🚀 Implement retention policies


### [PACKET] Staff Role Management
**Goal:** Enable staff role assignments and permissions
**Deliverable:** Staff assignment system with proper access controls

- [ ] 🚀 Design staff role hierarchy
- [ ] 🚀 Create staff assignment UI
- [ ] 🚀 Implement staff-specific permissions
- [ ] 🚀 Add staff activity tracking
- [ ] ⚗️ Test staff access patterns


### [PACKET] Multiple Account Memberships
**Goal:** Allow users to belong to multiple accounts
**Deliverable:** Account switching and multi-account management

- [ ] 🚀 Implement account switcher UI
- [ ] 🚀 Create account membership management
- [ ] 🚀 Add primary account designation
- [ ] 🚀 Handle cross-account permissions
- [ ] ⚗️ Test multi-account scenarios


### [PACKET] Advanced User Settings
**Goal:** Comprehensive user preferences and settings
**Deliverable:** Full user settings management interface

- [ ] 🚀 Create user preferences schema
- [ ] 🚀 Build settings UI components
- [ ] 🚀 Implement notification preferences
- [ ] 🚀 Add security settings (2FA ready)
- [ ] 🚀 Create API key management


### [PACKET] Invitation System Enhancements
**Goal:** Advanced invitation features for scale
**Deliverable:** Bulk invitations and invitation management

- [ ] 🚀 Add bulk invitation functionality
- [ ] 🚀 Create invitation status dashboard
- [ ] 🚀 Implement invitation reminders
- [ ] 🚀 Add invitation analytics
- [ ] 🚀 Create invitation templates


### [PACKET] Project Activity Logging
**Goal:** Track all project-level changes and actions
**Deliverable:** Complete project audit trail

- [ ] 🚀 Design project activity schema
- [ ] 🚀 Implement project change tracking
- [ ] 🚀 Create activity viewer for projects
- [ ] 🚀 Add activity filtering by type
- [ ] 📌 Document activity types


## Future Security Enhancements (Post-MVP)
*These security features can be implemented after public launch when opening beyond 25 manual users*

### [PACKET] XSS & Input Security Hardening (Advanced)
**Goal:** Implement comprehensive XSS prevention and input sanitization across the platform
**Note:** Advanced features beyond MVP requirements
**Deliverable:** Complete sanitization utilities and CSP implementation

##### XSS Prevention Implementation
- [ ] 🚀 Create centralized sanitization utility functions
- [ ] 🚀 Implement safe HTML rendering component wrapper
- [ ] 🚀 Create sanitization rules for different content types

##### Content Security Policy
- [ ] 🚀 Design CSP rules for the platform
- [ ] 🚀 Implement CSP headers in middleware
- [ ] 🚀 Test CSP with inline styles and scripts
- [ ] 🚀 Create CSP violation reporting endpoint
- [ ] 🚀 Document CSP exceptions and rationale

##### Input Validation Enhancement
- [ ] 🚀 Extend Zod schemas with sanitization transforms
- [ ] 🚀 Implement file upload type restrictions
- [ ] 🚀 Create validation for URLs and external links
- [ ] ⚗️ Test XSS payloads cannot execute


### [PACKET] Security Headers & Middleware (Advanced)
**Goal:** Implement industry-standard security headers and protection middleware
**Note:** Advanced features beyond MVP requirements
**Deliverable:** Comprehensive security headers middleware with CSRF protection

##### Security Headers Implementation
- [ ] 🚀 Create comprehensive security headers middleware
- [ ] 🚀 Set up Referrer-Policy
- [ ] 🚀 Implement Permissions-Policy

##### CSRF Protection
- [ ] 🚀 Implement CSRF token generation
- [ ] 🚀 Add CSRF validation to all state-changing operations
- [ ] 🚀 Create CSRF token refresh mechanism
- [ ] 🚀 Add CSRF tokens to all forms
- [ ] 🚀 Implement double-submit cookie pattern

##### Additional Security Middleware
- [ ] 🚀 Add request size limits
- [ ] 🚀 Create security event logging middleware
- [ ] ⚗️ Test headers with security scanning tools
- [ ] 📌 Document security header configuration


### [PACKET] Authentication Security Enhancements (Advanced)
**Goal:** Implement 2FA, complete password management, and enhance session security
**Note:** Enterprise security features for public launch
**Deliverable:** Full 2FA system, password management features, and hardened authentication

##### Two-Factor Authentication
- [ ] 🚀 Implement TOTP-based 2FA using speakeasy
- [ ] 🚀 Create QR code generation for authenticator apps
- [ ] 🚀 Build 2FA setup flow UI
- [ ] 🚀 Implement backup codes generation
- [ ] 🚀 Add 2FA verification to login flow
- [ ] 🚀 Create 2FA recovery process

##### Password Management Completion
- [ ] 🚀 Implement password change functionality
- [ ] 🚀 Add password strength meter to UI
- [ ] 🚀 Create password history to prevent reuse
- [ ] 🚀 Add password expiry for enterprise accounts
- [ ] 🚀 Create breach detection integration

##### Session Security (Advanced)
- [ ] 🚀 Add concurrent session limits
- [ ] 🚀 Create "remember me" functionality securely
- [ ] 🚀 Implement device tracking and management
- [ ] 🚀 Add suspicious login detection
- [ ] ⚗️ Test session fixation prevention


### [PACKET] API Security & Rate Limiting
**Goal:** Implement comprehensive API security including rate limiting, key management, and request validation
**Note:** Essential for preventing abuse when opening to public
**Deliverable:** Production-ready API security layer with configurable rate limits

##### Rate Limiting Implementation
- [ ] 🚀 Create global rate limiting middleware
- [ ] 🚀 Implement per-endpoint rate limits
- [ ] 🚀 Add user-based rate limiting
- [ ] 🚀 Create IP-based rate limiting
- [ ] 🚀 Implement sliding window algorithm
- [ ] 🚀 Add rate limit headers to responses

##### API Key Management
- [ ] 🚀 Design API key generation system
- [ ] 🚀 Create API key management UI
- [ ] 🚀 Implement key rotation mechanism
- [ ] 🚀 Add API key scoping/permissions
- [ ] 🚀 Create usage tracking per API key
- [ ] 🚀 Build API key revocation system

##### Request Security
- [ ] 🚀 Implement request signing for sensitive operations
- [ ] 🚀 Add request replay attack prevention
- [ ] 🚀 Create webhook signature validation
- [ ] 🚀 Implement API versioning security
- [ ] ⚗️ Test rate limiting under load
- [ ] 📌 Document API security best practices


### [PACKET] Database Security & RLS (Advanced)
**Goal:** Advanced database security features
**Note:** Enhanced security for public launch
**Deliverable:** Complete database security hardening

##### RLS Implementation (Advanced)
- [ ] 🚀 Audit all tables for RLS requirements
- [ ] 🚀 Create RLS policies for each table
- [ ] 🚀 Implement service role patterns where needed
- [ ] 🚀 Create RLS testing framework
- [ ] 🚀 Document RLS policy decisions

##### Multi-Tenant Isolation (Advanced)
- [ ] 🚀 Create tenant isolation monitoring
- [ ] 🚀 Implement data access audit trails

##### Database Security Hardening
- [ ] 🚀 Review and restrict database functions
- [ ] 🚀 Implement sensitive data encryption
- [ ] 🚀 Create database backup encryption
- [ ] 🚀 Add query performance monitoring
- [ ] 📌 Document data access patterns


### [PACKET] Security Monitoring & Compliance
**Goal:** Implement comprehensive security monitoring, audit logging, and compliance features
**Note:** Required for enterprise customers and regulatory compliance
**Deliverable:** Full audit trail system with security event monitoring and compliance tools

##### Audit Logging System
- [ ] 🚀 Extend audit_logs table schema
- [ ] 🚀 Implement comprehensive audit triggers
- [ ] 🚀 Create audit log viewer UI
- [ ] 🚀 Add audit log search and filtering
- [ ] 🚀 Implement audit log retention policies
- [ ] 🚀 Create audit log export functionality

##### Security Event Monitoring
- [ ] 🚀 Create failed login tracking
- [ ] 🚀 Implement brute force detection
- [ ] 🚀 Add anomaly detection for access patterns
- [ ] 🚀 Create security dashboard for admins
- [ ] 🚀 Implement real-time security alerts
- [ ] 🚀 Add integration with security tools

##### Compliance Features
- [ ] 🚀 Implement GDPR data export
- [ ] 🚀 Create GDPR deletion workflows
- [ ] 🚀 Add cookie consent management
- [ ] 🚀 Implement data retention policies
- [ ] 🚀 Create compliance reporting tools
- [ ] 📌 Document compliance procedures


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




### Ungrouped Tasks
- ✅ 🪲 Uses information works properly. (Fixed: API endpoint now properly increments usage count when library items are used)
- [ ] 🚀 I can permanently delete things inside lab
- [ ] ⚗️ Check grid/list view toggle persists preference (Broken, does not remember)
- [ ] ⚗️ Verify version tracking increments properly
- [ ] 🪲 Page switching does not maintain unsaved changes or give a warning.
- [❌] ⚗️ Test page status toggle (published/draft)
  - This function doesn't exist
- [ ] [Code quality issues discovered during investigation]


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

#### [Packet] Domain Tasks
- [ ] ⚗️ Vercel API down → Graceful degradation with queued operations
- [ ] ⚗️ User adds domain but doesn't verify → Reminder system after 24 hours

##### Performance & Monitoring
- [ ] 🚀 Implement domain_verification_logs table for debugging
- [ ] 🚀 Add SSL status tracking to project_domains table
- [ ] 🚀 Create domain health dashboard for platform admins
- [ ] 🚀 Set up alerts for domains losing verification

##### Developer Experience
- [ ] 📌 Document all domain-related error codes and solutions
- [ ] 📌 Create troubleshooting guide for common DNS issues
- [ ] 📌 Add domain system architecture documentation
- [ ] 📌 Create runbook for domain-related support tickets

- [ ] ⚗️ As any other account, I cannot add wondrousdigital.com (get permission error)
- [ ] ⚗️ As platform admin, I can grant reserved domain permissions to specific accounts
- [ ] ⚗️ As a user adding a subdomain, I can add it (sub.example.com) and see CNAME instructions




# ---------------------------------------------------------------------------------------- #
# VAULT ---------------------------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------- #

Items we cut or cancel or postpone will be moved here to this section for future evaluation.







# ---------------------------------------------------------------------------------------- #
# PROCESS & SYSTEM OVERVIEW -------------------------------------------------------------- #
# ---------------------------------------------------------------------------------------- #



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
  - Always use CODE-CHECKLIST

## ---------------------------------------------- ##