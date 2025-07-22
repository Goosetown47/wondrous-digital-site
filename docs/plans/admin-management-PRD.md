# Admin Management System

Status: Phase 1 Complete - Phase 2 Ready
Assignee: Tyler LaHaie
Priority: High
Created: July 13, 2025 4:37 PM
Updated: January 18, 2025
EPIC: Wondrous Digital Application
Global Tags: Wondrous Digital (https://www.notion.so/Wondrous-Digital-21dcc315289f802188d7e2024ce78342?pvs=21)
Sub-task: Accounts Management Page Created (https://www.notion.so/Accounts-Management-Page-Created-22fcc315289f80008bd0c661716cee46?pvs=21), Set status of project status in bulk from one page, which contains tabs for projects and the ability to set the project status within the project cell. Three tabs: draft, active, archive. (https://www.notion.so/Set-status-of-project-status-in-bulk-from-one-page-which-contains-tabs-for-projects-and-the-ability-22fcc315289f80aaa694f1dd6b5f8897?pvs=21), Project mapping to different actions (https://www.notion.so/Project-mapping-to-different-actions-22fcc315289f80bda94ce1fe1ec09989?pvs=21), I can create a new project (https://www.notion.so/I-can-create-a-new-project-22fcc315289f80588d35e426e3a852cf?pvs=21), I can choose an account to assign that project to (https://www.notion.so/I-can-choose-an-account-to-assign-that-project-to-22fcc315289f80ad945ae545cff89a46?pvs=21), I can remove projects from accounts (https://www.notion.so/I-can-remove-projects-from-accounts-22fcc315289f80098dbeebcefed2e0b4?pvs=21), Our admin tools must be able to automate the process of creating the subdomain and pushing a project to the subdomain so it can be viewed live. This should happen when the "deploy" button is pressed. Which may open a modal with some information that needs to be filled out or set, before it propagates to Netlify. (https://www.notion.so/Our-admin-tools-must-be-able-to-automate-the-process-of-creating-the-subdomain-and-pushing-a-project-22fcc315289f80c19095d89d11c8f646?pvs=21), I can import a template into the new project (https://www.notion.so/I-can-import-a-template-into-the-new-project-22fcc315289f806a8548cb662e0fe56d?pvs=21), I can delete drafts or projects set to archive status (https://www.notion.so/I-can-delete-drafts-or-projects-set-to-archive-status-22fcc315289f80878714e7054c8a75fb?pvs=21), I must set a template or staging site to archive before I can delete it (https://www.notion.so/I-must-set-a-template-or-staging-site-to-archive-before-I-can-delete-it-22fcc315289f806db525ef25b2c9faa0?pvs=21), I must set a live customer site to paused/maintenance and then archive before I can delete it (2 step process) (https://www.notion.so/I-must-set-a-live-customer-site-to-paused-maintenance-and-then-archive-before-I-can-delete-it-2-ste-22fcc315289f802ea88ffc0114866372?pvs=21), I can bulk delete archived projects (but I see a modal anytime I delete asking me to confirm the action, be it single or multiple) (https://www.notion.so/I-can-bulk-delete-archived-projects-but-I-see-a-modal-anytime-I-delete-asking-me-to-confirm-the-act-22fcc315289f800ab4e6f6974dd1edf8?pvs=21), I can set the project status in the project cell, within the list (https://www.notion.so/I-can-set-the-project-status-in-the-project-cell-within-the-list-22fcc315289f80348489ea2c9f8a88c5?pvs=21), I can perform bulk actions on projects in the list (https://www.notion.so/I-can-perform-bulk-actions-on-projects-in-the-list-22fcc315289f80e5bbbddf2c5302e373?pvs=21), I can see a list of all the projects in each tab (draft, active, archive) with their corresponding feature buttons. (https://www.notion.so/I-can-see-a-list-of-all-the-projects-in-each-tab-draft-active-archive-with-their-corresponding-f-22fcc315289f80a9a283d71baaee1004?pvs=21), We have a maintenance page which draws customer data/info to populate its fields. Simple things like "Customer Business Name, Phone Number, Email" to populate a "We'll be right back" page that looks simple, clean and professional. (https://www.notion.so/We-have-a-maintenance-page-which-draws-customer-data-info-to-populate-its-fields-Simple-things-like-22fcc315289f80c7a9dfd5686f02c81d?pvs=21), We can version projects and be able to revert to a previous version if need be. (https://www.notion.so/We-can-version-projects-and-be-able-to-revert-to-a-previous-version-if-need-be-22fcc315289f8092added3d3b760c588?pvs=21)
Type: Feature

## 📝 Documentation Policy
**IMPORTANT**: This PRD is the single source of truth for the Admin Management System. All updates, progress tracking, and planning should be documented HERE only. Do not create separate progress documents.

# Current Implementation Status (January 18, 2025)

## Phase 1: Foundation - ✅ COMPLETE

### ✅ Completed Items:
- **Accounts Dashboard**: Enhanced page with tabbed view (Prospects, Customers, Inactive)
  - Bulk selection with checkboxes for all accounts
  - Bulk actions dropdown with account-type specific operations
  - Bulk status change (prospect/customer/inactive) with converted_at timestamp
  - Bulk delete for inactive accounts only (with DELETE confirmation)
  - Success/error notifications for bulk operations
- **Projects Dashboard**: Enhanced tabbed view with 5 tabs:
  - Draft (for work in progress)
  - Templates (for template-internal and template-public projects)
  - Active (for prospect-staging and live-customer projects)
  - Paused/Maintenance (for paused-maintenance projects)
  - Archive (for archived projects)
- **Project Status Management**: 
  - Dropdown status selector with all 8 statuses
  - Real-time status updates with success notifications
  - Status history tracking in database
  - Proper tab sorting based on project status
- **UI/UX Improvements**:
  - Manual toast dismissal for better readability
  - Flexible dropdown width for long status names
  - Search functionality across projects
  - Tab counts showing number of projects per tab
  - Action buttons for each project (View/Edit, Clone, Deploy, Archive, Delete)
  - Maintenance button available for both prospect-staging and live-customer projects
- **Bulk Operations**:
  - Bulk selection with checkboxes for all projects
  - Bulk actions dropdown with allowed actions based on selection
  - Bulk status change with confirmation modal
  - Bulk archive functionality
  - Bulk delete for archived projects only (with DELETE confirmation)
  - Success/error notifications for bulk operations
- **Delete Functionality**:
  - Single project deletion with business rule enforcement
  - Draft projects: Simple confirmation required
  - Other statuses: Must be archived first (with informative warnings)
  - Archived projects: Strong confirmation (type project name)
  - Status-aware delete modal with appropriate warnings
  - Automatic list refresh and selection cleanup after deletion
- **Create New Project Modal**:
  - Full project creation form with validation
  - Project type selection (main_site, landing_page, template)
  - Customer assignment dropdown (filtered by prospects/customers)
  - Industry/niche selection with predefined options
  - Automatic draft status assignment for new projects
  - Real-time form validation and error handling
  - Integration with existing project list refresh and tab counts
- **Action Button Enhancements**:
  - Fixed maintenance button availability for prospect-staging projects
  - Maintenance mode now accessible for both prospect-staging and live-customer statuses
  - Improved administrative flexibility for project lifecycle management
- **Customer Account Management**: (January 17, 2025)
  - Delete customer functionality with double confirmation modal
  - Type-in business name requirement for deletion
  - Only inactive accounts with no projects can be deleted
  - Comprehensive validation and error handling

### ✅ Phase 1 Completion Items (January 18, 2025):
- **View/Edit Project Navigation**:
  - Created ProjectPage component for project overview
  - Lists all pages within a project with edit/preview options
  - Added route `/dashboard/content/project` with sidebar navigation
  - Fixed "Failed to open project editor" error
- **Clone Project Functionality**:
  - Created CloneProjectModal with full form validation
  - Clones project settings, site styles, and all pages
  - Assigns cloned project to selected customer
  - Sets cloned project to 'draft' status automatically
- **Deploy Placeholder Modal**:
  - Created DeployPlaceholderModal for Phase 3 preparation
  - Shows "Coming Soon" message with feature preview
  - Lists upcoming Netlify integration features
- **Navigation Dropdown Updates**:
  - Added refreshData function to ProjectContext
  - Auto-refreshes after creating projects/accounts
  - Ensures new projects/accounts appear in navigation immediately
- **UI Clean-up**:
  - Removed redundant purple "Template" badge from project list
  - Status column already shows template status clearly

### ✅ Final Phase 1 Adjustments (January 18, 2025):
- **Navigation Improvements**:
  - Increased project dropdown width from 16rem to 22rem for better readability
  - Prevents cramped appearance with longer project names
- **Separated View/Edit Actions**:
  - Split single "View/Edit" button into two distinct actions
  - "View Project" - Navigate to customer's project view (/dashboard/content/project)
  - "Edit Project" - Open admin-only settings modal
- **EditProjectModal Component**:
  - Admin can edit project name
  - Admin can reassign project to different customer
  - Admin can set/change domain and subdomain (for future Netlify integration)
  - Form validation and audit logging
  - Auto-refresh navigation after updates

## Phase 1 Status: ✅ COMPLETE

All Phase 1 foundation items have been successfully implemented. The system now provides:
- Complete account and project management capabilities
- Full CRUD operations with business rule enforcement
- Bulk operations with proper safeguards
- Status management with audit trails
- Admin-specific tools and customer view separation

### ❌ Deferred to Later Phases:
- Deploy to Netlify integration (Phase 3)
- Maintenance page system (Phase 5)
- Project versioning (Phase 5)

## Phase 2: Template System - 🔄 IN PROGRESS (January 18, 2025)

### ✅ Completed Items:
- **Template Library Page** (`/dashboard/admin/templates`):
  - Grid and list view modes with toggle
  - Search functionality for templates
  - Filter by status (Internal/Public) and business niche
  - Template cards showing name, description, niche, status
  - Action buttons: View, Edit, Clone, Toggle Status, Delete
  - Responsive design with loading states

- **Database Schema Updates**:
  - Added template-specific fields to projects table
  - `template_description` - Template description text
  - `template_niche` - Business category (veterinarian, chiropractor, etc.)
  - `template_version` - Version tracking (default 1)
  - `template_preview_image` - Placeholder for future preview images
  - Created indexes for performance optimization
  - Updated project_management_view to include template fields

- **Convert to Template Modal**:
  - Select any non-template project from dropdown
  - Choose between Internal (admin-only) or Public visibility
  - Add description (required, 500 char limit)
  - Select business niche from predefined list
  - Form validation and error handling
  - Automatic version 1 assignment

- **Integration with Projects Page**:
  - Added "Convert to Template" action button
  - Only shows for non-template projects
  - Opens modal with project pre-selected
  - Templates continue to show in Templates tab

- **Template Operations**:
  - Toggle between internal/public status
  - Delete templates with confirmation
  - Clone template navigates to Projects page
  - View template opens project page

### ⏳ In Progress / Pending:
- Template preview component for detailed view
- Edit template metadata functionality
- Template preview image upload/generation
- Connect "Create Template" button to conversion modal

# Overview of business process:

- We aim to have 100+ customers eventually with our business, which means potentially 100-200 websites and landing pages.
- We will be creating 4-5 templates that are niche specific that we want to stage on a [wondrousdigital.com](http://wondrousdigital.com/) subdomain so people can check them out. So the formula would be something like "nichetype-#.wondrousdigital.com" where nichetype and # represent the type of niche like "Veterinarian" and the template #.
- We will be cloning the templates to fill in with some customization and prospect data, then re-staging that cloned prospect site on another subdomain, using the customer business name as the subdomain name. E.g., "[raleighveterinarian.wondrousdigita.com](http://raleighveterinarian.wondrousdigita.com/)"
- We will reach out to the business and show them the website we built for them for free, and see if they want to work with us or not.
- At that point we would either delete the customer staged site if they choose not to, or promote it to "Customer" and then set up all their other stuff, at which point we'd need to transfer their site we built for them from our prospect subdomain to their domain name, still within Netlify. We offer all our customers hosting on our singular Netlify account.
- Then we would manage our customer accounts in bulk.

# **Executive Summary**

### **Project Objective**

Build a centralized administrative backend to manage the complete lifecycle of customer websites from template creation through prospect staging to live customer deployment, supporting 100+ customers and 200+ websites.

### **Business Context**

- **Current**: Manual website management, inconsistent deployment processes
- **Target**: Automated workflow management with clear status transitions
- **Scale**: 100+ customers, 200+ websites, niche specific templates
- **Revenue Impact**: Enables systematic prospect conversion and customer retention

### **Key Success Metrics**

- Reduce prospect site creation time from hours to minutes
- Support 100+ concurrent customer projects
- Zero data contamination incidents between accounts
- 90%+ prospect-to-customer conversion tracking accuracy

## **System Architecture Overview**

### **Core Components**

- ✅ **Admin Dashboard** - Central control interface (Already have this, Admin Tools Area)
- **Template Management System** - Template library and cloning from created projects using PageBuilder & SiteBuilder.
- **Account Management System** - Customer and project organization
- **Project Lifecycle Engine** - Status-based automation
- **Netlify Deployment Manager** - Automated domain/subdomain deployment
- **Bulk Operations Interface** - Mass project management

### **Data Flow**

`Website Created in Project using PageBuilder (built) & Website functionality (not built yet) → Template Creation → Template Library → Project Cloning → 
Prospect Customization → Staging Deployment → Customer Conversion → 
Live Deployment → Ongoing Management`

# Feature Requirements

### Website Management

- Ability to manage the “website” at the project level in the content area
- All pages are linked
- The project is “deployable/publishable” as a single website package that can be deployed on Netlify

### **Administrative Interface**

- **Accounts Dashboard/Page:** ✅ Tabbed view (Prospects, Customer, Inactive) with lists of all accounts and corresponding available actions per list item
- **Project Dashboard/Page**: ✅ Enhanced tabbed view (Draft, Templates, Active, Paused/Maintenance, Archive) with lists of all projects and corresponding available actions per list item
    - ✅ Can filter by search term
    - ✅ **Quick Actions**: Status change dropdown, view/edit, clone, deploy, archive, delete buttons
    - ✅ **Bulk Selection**: Multi-project operations (bulk status change, archive, delete with confirmations)
    - ❌ **Deployment Controls**: One-click deployment with configuration (not yet implemented)

### **Template Management System**

- **Create Templates**: Convert any project to "Template-Internal" status
- **Template Library**: Browse and select from available templates
- **Template Deployment**: Auto-deploy "Template-Public" to niche subdomains
- **Template Versioning**: Track template updates and changes

### **Project Lifecycle Management**

- **Status Engine**: Automated actions based on project status
- **Status Transitions**: Controlled workflows between statuses
- **Deployment Automation**: Auto-deploy to appropriate environments
- **Domain Management**: Automated subdomain and custom domain setup

### **Account & Project Organization**

- **Account Creation**: New customer account setup
- **Project Assignment**: Assign projects to specific accounts
- **Data Isolation**: Enforce multi-tenant security
- **Bulk Operations**: Mass status changes and project management

### **Netlify Integration**

- **Subdomain Automation**: Auto-create prospect subdomains
- **Domain Migration**: Move from subdomain to custom domain
- **Maintenance Mode**: Deploy maintenance pages
- **Site Management**: Programmatic site creation/deletion
- **Deployment Queue System**: Handle 50+ simultaneous deployments with rate limiting
- **API Rate Limiting**: Token bucket algorithm to stay under 500 calls/minute
- **Real-time Status Tracking**: Monitor deployment progress and queue position

## Project Statuses & Actions

- **Draft:** This stays local to the admin application/database. Nothing should be deployed to Netlify.
- **Template-Internal:** This also stays local to the admin application/database. This is added to a table of “templates” that I can use and see when creating a new project.
- **Template-Public:** We will clone an internal template and make it live so customers can see it. This is deployed to Netlify on a staging subdomain for wondrousdigital.com. The naming schema for our templates and subdomains will be niche specific. So the “Chiropractor-1” template will be on chiropractor-1.wondrousdigital.com
    - Our admin tools must be able to automate the process of creating the subdomain and pushing the template to the subdomain so it can be viewed live.
- **Prospect Staging:** We will have cloned an internal template, customized it a bit, and filled it with the prospects information and logo. This is then deployed to our Netlify on a staging subdomain for wondrousdigital.com. We will put it in the companies name like “raleighchiropractors.wondrousdigital.com” and then it will be live to show the prospect and share it with them so they can see it.
- **Live Customer**: At this point, we promote the prospect website to live. This is where we will create customer accounts, and give them access to the platform where their website will be. They will be able to edit their pages and the content on them. We will need to MOVE their project in Netlify from our subdomain to their custom domain (on our account). We charge them for hosting, and part of our offering.
- **Pause/Maintenance**: This setting is admin facing only. We can set their website to paused/maintenance mode. Which will keep the domain on Netlify as is, but it will be a maintenance page with the customers contact information on it (we want to be classy and professional). This can be reinstated with a single setting change at anytime if the customer comes back to us or pays their bill.
- **Archived**: This is an “inactive” but not deleted project status. This puts the project files into a folder, and the project shows up in the archived tab. At any point, we can resurrect it, set it to another status, which will then potentially redeploy it.
- **Delete**: This permanently deletes the project file from the admin app. It can not be reinstated, the files are deleted.

## **Technical Implementation Details**

### **Deployment Queue System Architecture**

#### Database Schema
- **deployment_queue**: Stores queued deployments with priority, status, and retry logic
- **deployment_logs**: Tracks build output and deployment progress
- Automatic cleanup of old deployments (30-day retention)

#### Core Services
1. **DeploymentQueueService** (`src/services/deploymentQueueService.ts`)
   - Queue deployment tasks
   - Track queue position
   - Real-time status updates via Supabase subscriptions
   - Cancel queued deployments

2. **NetlifyRateLimiter** (`src/services/netlifyRateLimiter.ts`)
   - Token bucket algorithm (450 tokens/minute)
   - Priority-based request queuing
   - Automatic token refill at 7.5 tokens/second
   - Reserve pool of 50 tokens for critical operations

3. **Supabase Edge Function** (`supabase/functions/process-deployment-queue/index.ts`)
   - Serverless function that runs every 2 minutes via cron
   - Processes up to 3 deployments concurrently
   - Handles all Netlify API interactions
   - Updates deployment status in real-time
   - Manages retries and error handling
   - Deployed and operational as of January 21, 2025

#### UI Components
1. **DeploymentStatusIndicator** - Real-time deployment tracking
2. **DeploymentQueueStatus** - Overall queue health monitoring
3. **Enhanced DeployProjectModal** - Queue-aware deployment interface

#### Rate Limiting Strategy
- Maximum 3 concurrent deployments
- API calls distributed across deployments
- Higher priority for re-deployments
- Automatic queueing when rate limit reached

### **Supabase Edge Function Architecture (COMPLETE - January 21, 2025)**

#### Edge Function Implementation
The deployment processing has been moved from the React client to a serverless Edge Function, providing:
- **Reliable Processing**: Cron-based execution ensures deployments are processed even if users close their browsers
- **Scalability**: Handles multiple deployments concurrently without blocking the UI
- **Cost Efficiency**: Serverless execution only runs when needed
- **Better Error Handling**: Centralized retry logic and error recovery

#### Deployment Flow
1. **User Action**: Click "Deploy Project" in React app
2. **Queue Entry**: DeploymentQueueService adds job to deployment_queue table
3. **Real-time Updates**: React app subscribes to deployment status changes
4. **Edge Function Processing**: 
   - Runs every 2 minutes via cron schedule
   - Fetches up to 3 queued deployments ordered by priority and creation time
   - Marks them as 'processing' to prevent duplicate processing
   - Creates/updates Netlify sites with proper subdomain configuration
   - Generates ZIP files from static HTML export
   - Uploads files to Netlify and monitors deployment
   - Updates deployment status and logs throughout the process
5. **Status Updates**: Edge Function updates deployment_queue with results
6. **User Feedback**: React app shows real-time progress via Supabase subscriptions

#### Edge Function Configuration
- **Environment Variables**:
  - `NETLIFY_ACCESS_TOKEN`: API token for Netlify operations
  - `NETLIFY_TEAM_ID`: Team identifier for site creation
  - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Auto-provided by Supabase
- **Schedule**: Runs every 2 minutes (`*/2 * * * *`)
- **Concurrency**: Processes max 3 deployments per run to respect API limits
- **Retry Logic**: Up to 3 attempts with exponential backoff (2s, 4s, 8s)
- **Logging**: All operations logged to deployment_logs table for debugging
- **Deployment**: Live and operational on Supabase Edge Functions platform

#### React App Integration
1. **DeploymentQueueService**: Manages queue operations and subscriptions
2. **DeploymentStatusIndicator**: Shows real-time deployment progress
3. **DeploymentHistory**: Displays past deployments for each project
4. **Queue Position Updates**: Automatic polling while queued
5. **Subscription Cleanup**: Proper memory management on component unmount

## **User Stories & Acceptance Criteria**

### **Epic 1: Template Management**

- **As an admin**, I can convert any project to a template so I can reuse successful designs
- **As an admin**, I can deploy templates publicly so prospects can view our capabilities
- **As an admin**, I can clone templates with customized prospect data

### **Epic 2: Prospect Management**

- **As an admin**, I can create prospect sites from templates in under 5 minutes
- **As an admin**, I can deploy prospect sites to branded subdomains automatically
- **As an admin**, I can convert prospects to customers with one-click domain migration

### **Epic 3: Customer Management**

- **As an admin**, I can manage 100+ customer projects from a single interface
- **As an admin**, I can perform bulk operations on projects safely
- **As an admin**, I can put customer sites in maintenance mode instantly

### **Epic 4: System Administration**

- **As an admin**, I have complete audit trails of all project changes
- **As an admin**, I can ensure zero data contamination between accounts
- **As an admin**, I can recover from any deployment failures

## Development Phases

### **Phase 1: Foundation** ✅ COMPLETE

- ✅ Update database schema for new status system
- ✅ Build basic account and project dashboard/pages with listings in Admin Tools
- ✅ Implement project status management
- ✅ Create template designation system (backend complete, templates shown in dedicated tab)

**Additional completed items not in original plan:**
- ✅ Enhanced tab system with Templates and Paused/Maintenance tabs
- ✅ Manual toast dismissal for better UX
- ✅ Flexible dropdown width for long status names
- ✅ Real-time tab counts
- ✅ Status history tracking

### **Phase 2: Template System** 🔄 IN PROGRESS

- ✅ Build template library page interface for managing templates in Admin Tools
- ✅ Implement template cloning functionality (via existing clone modal)
- ✅ Add project-to-template conversion
- ⏳ Create template preview system
- ⏳ Create full CRUD functionality for templates (Create/Read done, Update/Delete pending)

### **Phase 3: Netlify Integration** - ✅ DEPLOYMENT SYSTEM COMPLETE (January 21, 2025)

### ✅ Completed Items:
- **Environment Setup**:
  - Added Netlify API token configuration
  - Created netlify configuration file with naming conventions
  - Set up environment variable management

- **Netlify Service Layer**:
  - Built comprehensive API service for Netlify operations
  - Created site management functions (create, update, delete)
  - Implemented subdomain availability checking
  - Added error handling and retry logic

- **Deploy Project Modal**:
  - Replaced placeholder with functional deployment interface
  - Automatic subdomain generation based on project type
  - Real-time URL preview before deployment
  - Deployment progress indicators
  - Success/failure status handling

- **Database Schema Updates**:
  - Added `netlify_site_id` field to projects table
  - Added `subdomain` field with unique constraint
  - Created `deployment_history` table for tracking
  - Added RLS policies for deployment data

- **Flexible Domain Management** (User-requested enhancement):
  - Added `deployment_domain` field to projects table
  - Added `custom_domains` array to customers table
  - Created domain selection dropdown in deploy modal
  - Support for custom domain input (not just wondrousdigital.com)
  - Updated EditProjectModal with deployment configuration
  - Created `get_deployment_url` database function for URL computation
  - Updated project list to show deployment status with clickable links

- **Subdomain Synchronization Fix**:
  - Deploy modal now pulls existing subdomain from project data
  - Auto-generation only happens if no subdomain exists
  - Consistent subdomain/domain data across all modals

- **Website Preview System** ✅ COMPLETE (January 18, 2025):
  - **Full Project Preview**: Created ProjectPreview component for multi-page website preview
  - **Navigation System**: Fixed navigation links and logo navigation functionality
  - **Homepage Designation**: 
    - Added homepage toggle feature to ProjectPage
    - Visual indicators (home icon button, blue badge)
    - Database integration with is_homepage column
    - Auto-assignment for first page created
    - Preview starts with designated homepage
  - **UI Improvements**:
    - Removed redundant Exit Preview button and page counter
    - Centered preview header showing "Previewing: {Project Name} | {Page Name}"
    - Clean, focused preview experience
  - **Technical Foundation**:
    - Fixed navigation link section ID fetching
    - Implemented proper link click handlers for preview context
    - Logo navigates to designated homepage within preview
    - All navigation (dropdowns, internal links, external links) fully functional
    - Foundation ready for static HTML export to Netlify

### ⏳ In Progress / Pending:
- Actual file deployment to Netlify (build pipeline)
- Static HTML generation from preview system
- Re-deploy functionality for already deployed sites
- Domain migration from subdomain to custom domain
- Netlify team ID configuration

### **Phase 4: Bulk Operations**

- Build bulk selection interface
- Implement mass status changes
- Add bulk deployment capabilities
- Create confirmation modals

### **Phase 5: Advanced Features**

- Add maintenance mode functionality
- Build audit trail system
- Implement project archival system
- Create deletion safeguards
- Add versioning functionality for projects

## **Technical Requirements**

### **Performance**

- Support 200+ projects in dashboard without pagination lag
- Project cloning completes within 30 seconds
- Netlify deployments trigger within 60 seconds
- Bulk operations handle 50+ projects simultaneously

### **Security**

- Multi-tenant data isolation enforced at database level
- Admin-only access to template and bulk operations
- Audit logging for all destructive operations
- Secure Netlify API key management

### **Reliability**

- Deployment failure recovery and retry mechanisms
- Data backup before destructive operations
- Transaction rollback for failed bulk operations
- Graceful handling of Netlify API limitations

## **Risk Assessment & Mitigation**

### **High Risk: Data Contamination**

- **Risk**: Customer data mixing between accounts
- **Mitigation**: Comprehensive RLS policies, automated testing

### **Medium Risk: Netlify Rate Limits**

- **Risk**: API limits affecting bulk deployments
- **Mitigation**: Queue system, retry logic, rate limiting

### **Medium Risk: Domain Migration Failures**

- **Risk**: Customer sites going offline during domain transfer
- **Mitigation**: Staging validation, rollback procedures

### **Low Risk: Template Versioning**

- **Risk**: Templates becoming outdated or broken
- **Mitigation**: Template validation, version control

## **Success Criteria**

### **Phase 1 Completion** ✅

- [x]  All 8 project statuses implemented with proper actions
- [x]  Account and project dashboards with full CRUD operations
- [x]  Bulk operations for project management (implemented with confirmations)
- [x]  Multi-tenant security verified (RLS policies in place)
- [x]  Admin tools separated from customer views
- [x]  Create new projects and accounts functionality
- [x]  Delete functionality with business rule enforcement
- [x]  Clone project capability
- [x]  Project settings management (name, customer, domain)

### **MVP Completion** (Phases 1-3)

- [x]  Phase 1: Foundation - COMPLETE
- [~]  Phase 2: Template system (Core functionality complete, polish pending)
- [x]  Phase 3: Netlify Deployment System - COMPLETE (January 21, 2025)

**MVP Status**: The core deployment pipeline is now fully operational with:
- Automated project deployment to Netlify
- Scalable queue system handling 50+ deployments
- Edge Function processing with real-time updates
- Complete deployment history and monitoring

Remaining MVP items:
- Template preview and metadata editing (Phase 2)
- Domain migration and maintenance pages (Phase 3 extras)

### **Production Readiness**

- [ ]  System handles 100+ projects without performance issues
- [ ]  Zero data contamination in testing
- [ ]  All deployment scenarios tested and documented
- [ ]  Admin training completed
- [ ]  Monitoring and alerting in place

# **Production-Quality Testing Strategy for Claude Code**

## **Testing Framework Setup**

### **Initial Claude Code Prompt for Test Environment**

`Set up a comprehensive testing environment with:
- Vitest for unit testing (faster than Jest for Vite projects)
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking
- Supabase test client configuration
- TypeScript strict mode for compile-time error catching
- Test coverage reporting (aim for 90%+ coverage)
- Setup test database utilities for clean test isolation`

## **Critical Testing Categories**

### **1. Multi-Tenant Data Isolation (HIGHEST PRIORITY)**

**Claude Code Prompt:**

`Create comprehensive tests for multi-tenant data isolation:
- Test that customers can only access their own projects
- Test that admin users can access all projects appropriately
- Test RLS policies prevent cross-account data leakage
- Mock different user contexts and verify query results
- Test bulk operations don't affect wrong accounts
- Include negative tests that attempt unauthorized access
- Create helper functions to simulate different user sessions`

**What to test:**

- Project queries filtered by customer_id
- Template access restrictions
- Account switching functionality
- Admin vs customer permission boundaries

### **2. Project Status Transition Logic**

**Claude Code Prompt:**

`Build state machine tests for project status transitions:
- Test valid status transitions (draft → template-internal, etc.)
- Test invalid transitions are blocked with proper errors
- Test side effects of status changes (Netlify deployments, etc.)
- Mock Netlify API responses for deployment testing
- Test rollback scenarios when deployments fail
- Verify database state consistency after each transition
- Test concurrent status changes (race conditions)`

### **3. Template System Integrity**

**Claude Code Prompt:**

`Create template system validation tests:
- Test template creation from existing projects
- Test template cloning with data isolation
- Test template library filtering and search
- Test template versioning and updates
- Mock complex project data structures
- Test template corruption recovery
- Verify cloned projects maintain references correctly`

### **4. Netlify Integration Reliability**

**Claude Code Prompt:**

`Build robust Netlify integration tests:
- Mock Netlify API for all deployment scenarios
- Test subdomain creation and validation
- Test domain migration workflows
- Test deployment failure recovery
- Test rate limiting and retry logic
- Test webhook handling for deployment status
- Include edge cases like invalid domains
- Test maintenance mode deployment`

---

## **Security-Focused Testing**

### **SQL Injection & RLS Testing**

**Claude Code Prompt:**

`Create security-focused database tests:
- Test SQL injection attempts in all input fields
- Verify RLS policies block unauthorized queries
- Test parameter sanitization in all database functions
- Test edge cases with malformed project IDs
- Test concurrent access patterns for race conditions
- Include penetration testing for admin functions
- Test session management and token validation`

### **Input Validation & Sanitization**

**Claude Code Prompt:**

`Build comprehensive input validation tests:
- Test XSS prevention in all text inputs
- Test file upload security (if applicable)
- Test URL validation for custom domains
- Test business name sanitization for subdomains
- Test JSON payload validation for page builder data
- Include fuzzing tests with random invalid inputs
- Test character limits and encoding issues`

---

## **Performance & Scalability Testing**

### **Bulk Operations Testing**

**Claude Code Prompt:**

`Create performance tests for bulk operations:
- Test bulk status changes with 100+ projects
- Test memory usage during large dataset operations
- Test database query optimization with large datasets
- Mock slow network responses and test timeouts
- Test pagination and infinite scroll performance
- Include stress tests for concurrent admin users
- Test cleanup operations for large-scale deletions`

### **Database Performance Testing**

**Claude Code Prompt:**

`Build database performance validation:
- Test query performance with 1000+ projects
- Test index effectiveness with large datasets
- Test complex joins and aggregations
- Mock database connection issues and test recovery
- Test transaction rollback scenarios
- Validate connection pooling under load
- Test backup and recovery procedures`

## **Step-by-Step Development with TDD**

### **Phase 1: Foundation Testing**

**Order of development with testing:**

1. **Database Schema & RLS Tests First**
    
    `Write failing tests for multi-tenant data access
    → Implement RLS policies
    → Make tests pass
    → Refactor for performance`
    
2. **Basic CRUD Operations**
    
    `Write failing tests for project CRUD operations
    → Implement basic project management
    → Make tests pass
    → Add validation and error handling`
    
3. **Status Management**
    
    `Write failing tests for status transitions
    → Implement status change logic
    → Make tests pass
    → Add logging and audit trail`
    

### **Phase 2: Integration Testing**

**Claude Code Prompt for each feature:**

`Before implementing [FEATURE_NAME]:
1. Write integration tests that define expected behavior
2. Include error scenarios and edge cases
3. Mock all external dependencies (Netlify, email, etc.)
4. Test database state before and after operations
5. Verify side effects and cleanup procedures
6. Only then implement the actual feature code`

---

## **Automated Quality Gates**

### **Pre-commit Testing Strategy**

**Claude Code Prompt:**

`Set up automated quality checks:
- TypeScript compilation with strict mode
- ESLint with security rules enabled
- Prettier for code formatting
- Unit test suite must pass (90%+ coverage)
- Integration tests for critical paths
- Security vulnerability scanning
- Performance regression testing
- Database migration testing`

### **Continuous Testing Pipeline**

**Claude Code Prompt:**

`Create automated testing workflow:
- Run full test suite on every code change
- Test against clean database state each time
- Include browser automation tests for critical flows
- Test with different user permission levels
- Run security scans and dependency audits
- Generate coverage reports with trend analysis
- Alert on test failures or coverage drops`

---

## **Error Recovery & Resilience Testing**

### **Failure Scenario Testing**

**Claude Code Prompt:**

`Build comprehensive failure recovery tests:
- Test Netlify API failures during deployment
- Test database connection failures
- Test partial deployment cleanup procedures
- Test user session expiration handling
- Test concurrent modification conflicts
- Test network timeout scenarios
- Include disaster recovery procedures`

### **Data Integrity Testing**

**Claude Code Prompt:**

`Create data consistency validation tests:
- Test transaction rollback scenarios
- Test orphaned record cleanup
- Test referential integrity maintenance
- Test concurrent user modifications
- Test backup and restore procedures
- Validate audit trail completeness
- Test data migration scenarios`

---

## **Development Workflow with Claude Code**

### **Feature Development Prompt Template**

`For implementing [FEATURE_NAME]:

1. FIRST: Write comprehensive tests covering:
   - Happy path scenarios
   - Error conditions and edge cases
   - Security implications
   - Performance requirements
   - Data integrity checks

2. THEN: Implement the feature with:
   - TypeScript strict mode compliance
   - Proper error handling and logging
   - Input validation and sanitization
   - Transaction management where needed
   - Documentation and comments

3. FINALLY: Verify:
   - All tests pass
   - No security vulnerabilities introduced
   - Performance benchmarks met
   - Code coverage maintained above 90%
   - Integration with existing features works`

## **Quality Assurance Checklist**

**Before considering any feature "complete":**

- [ ]  Unit tests cover all code paths
- [ ]  Integration tests verify end-to-end workflows
- [ ]  Security tests prevent unauthorized access
- [ ]  Performance tests validate scalability
- [ ]  Error recovery tests ensure resilience
- [ ]  Documentation updated
- [ ]  Code review completed
- [ ]  No TypeScript errors or warnings
- [ ]  All linting rules pass

**This testing strategy ensures Claude Code builds production-ready code with built-in quality gates. Each feature is thoroughly tested before implementation, preventing technical debt accumulation.**

---

## Recommended Next Steps (January 21, 2025)

**Phase 1 is COMPLETE!** All foundation items have been successfully implemented.
**Phase 3 Deployment System is COMPLETE!** Full deployment pipeline with Edge Function processing.

### Phase 2: Template System (Ready to Continue)
1. **Template Preview Enhancement**
   - Template preview functionality in library
   - Template metadata editing
   - Template versioning system

2. **Template Management Completion**
   - Edit template metadata inline
   - Template usage tracking
   - Template deployment to public subdomains

### Phase 3: Remaining Netlify Features
1. **Domain Management**
   - Domain migration (subdomain to custom)
   - DNS configuration helpers
   - SSL certificate automation

2. **Maintenance Mode**
   - Maintenance page template creation
   - One-click maintenance mode deployment
   - Customer contact info display

3. **Deployment Enhancements**
   - Deployment rollback capabilities
   - Deployment metrics and analytics
   - Performance monitoring integration

### Phase 4: Bulk Operations Enhancement
1. **Enhanced Bulk Actions**
   - Bulk deployment to Netlify
   - Bulk status transitions with validation
   - Bulk template assignment

2. **Reporting & Analytics**
   - Deployment success rates
   - Customer conversion metrics
   - Template performance tracking


### Current Status Summary (January 21, 2025):

#### Major Accomplishments Since Phase 1:
1. **Complete Website Preview System**: Built a full multi-page preview system that serves as the foundation for static site generation
2. **Static HTML Export**: Created a service that converts React components to deployable static HTML with all assets
3. **Netlify Integration**: Full API integration with site creation, updates, and deployment tracking
4. **Deployment Queue System**: Enterprise-grade queue system handling 50+ concurrent deployments with rate limiting
5. **Supabase Edge Function**: Serverless deployment processing that runs independently of the React app
6. **Real-time Status Tracking**: Live updates throughout the deployment process using Supabase subscriptions
7. **Deployment History**: Complete audit trail of all deployments with status, timestamps, and error tracking

#### Current Implementation Status:
- ✅ **Phase 1: Foundation** - COMPLETE
  - All admin dashboards and project management features implemented
  - Full CRUD operations with business rules
  - Bulk operations and safeguards
  - Admin/customer separation
  - Project settings management
- 🔄 **Phase 2: Template System** - IN PROGRESS
  - ✅ Template Library page with grid/list views
  - ✅ Convert projects to templates functionality
  - ✅ Template metadata (description, niche, version)
  - ✅ Toggle between internal/public status
  - ✅ Database migration for template fields
  - ⏳ Template preview system (pending)
  - ⏳ Edit template metadata (pending)
- ✅ **Phase 3: Netlify Integration** - DEPLOYMENT SYSTEM COMPLETE (January 21, 2025)
  - ✅ Netlify API service layer complete
  - ✅ Deploy modal with domain management
  - ✅ Database schema for deployments
  - ✅ Flexible domain support (custom domains)
  - ✅ Website Preview System (COMPLETE - January 18, 2025)
    - Full multi-page preview with navigation
    - Homepage designation feature
    - Fixed all navigation and UI issues
  - ✅ Build pipeline integration (COMPLETE - January 21, 2025)
    - Static HTML generation service created
    - Export functionality for pages and assets
    - ZIP file creation and upload to Netlify
  - ✅ Deployment Queue System (COMPLETE - January 21, 2025)
    - Database tables for queue management
    - Priority-based processing with rate limiting
    - Supabase Edge Function processing every 2 minutes
    - Support for 50+ concurrent deployments
    - Real-time status updates in React app
    - Deployment history component on ProjectPage
    - Queue position tracking and monitoring
    - Re-deploy functionality working
  - ⏳ Domain migration (subdomain to custom) - pending
  - ⏳ Maintenance page deployment - pending
- ❌ **Phase 4: Bulk Operations Enhancement** - After MVP
- ❌ **Phase 5: Advanced Features** - Final phase