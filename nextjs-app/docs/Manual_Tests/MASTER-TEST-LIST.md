# Production Test Checklist - User Stories

## 1. Authentication & Account Setup

### As a new user:
- [x] I can sign up with email and password
- [x] I see real-time validation errors for invalid email formats
- [x] I see "email already registered" error for duplicate emails
- [x] I see password requirements (uppercase, lowercase, number, symbol)
- [x] I receive email verification after signup
- [x] I can click the verification link and confirm my email
- [x] I am redirected to login after verification

### As an existing user:
- [x] I can log in with my email and password
- [x] I see an error for incorrect credentials
- [x] I am redirected to dashboard after successful login
- [x] I can log out and my session is cleared
- [x] I cannot access protected pages when logged out

### As a new user after verification:
- [x] I see the account setup/onboarding page
- [x] I can create my first account with a name
- [x] I am assigned as account owner of my new account
- [x] I am redirected to dashboard after setup

## 2. Dashboard & Navigation

### As an account owner:
- [FAIL] When I refresh the page in the browser, the same account and project stay selected in the drop downs.
  - The account remains selected, the project deselects.
- [x] I see my account name in the Current Account card
- [x] I see "No project selected" or my current project
- [x] I see "Create New Project" button in the header
- [x] I see "Create New Project" button in Quick Actions when no project selected
- [x] I can click account dropdown and see only my accounts
- [x] I can click project dropdown and see only my account's projects
- [x] I do NOT see "Admin Tools" in the sidebar

### As a platform admin:
- [x] I see "Admin Tools" section in the sidebar
- [x] I can access Tools > Accounts
- [x] I can access Tools > Users  
- [x] I can access Tools > Projects
- [x] I can access Admin Management
- [x] I can see ALL accounts in the account dropdown
- [x] I can see ALL projects in the project dropdown

## 3. Project Management

### As an account owner:
- [x] I can click "Create New Project" and see the dialog
- [x] I can enter a project name and see auto-generated slug
- [x] I can manually edit the slug if desired
- [x] I can select a theme from the dropdown (optional)
- [x] I can submit the form and project is created
- [x] I am redirected to the builder after creation
- [x] The new project appears in my project dropdown

### As an account owner with projects:
- [x] I can select a project from the dropdown
- [x] I see "Open Builder" button in Quick Actions
- [x] I see "Project Settings" button in Quick Actions
- [x] I can click Project Settings and access settings page
- [x] I can update project name in General tab
- [x] I can see and edit the project slug
- [x] I see the active project selected in the project drop down change when I rename it.
- [x] I can archive and delete my own projects
- [x] I see "Danger Zone" tab in project settings
- [x] I see clear warnings about archiving (site goes offline, domains stop working)
- [x] I can click "Archive Project" and see confirmation dialog
- [x] After archiving, I'm redirected to dashboard
- [x] Archived projects no longer appear in project dropdown
- [x] I can see archived projects in the Account Management area under "Archived Projects"
- [x] I can restore an archived project
- [x] I can permanently delete an archived project
- [x] I see clear warnings about permanent deletion
- [x] I can click "Delete Project Forever" and see confirmation dialog
- [x] The delete dialog warns about losing all data permanently
- [x] I can delete a project permanently
- [x] After deletion, I see the project get removed from the archived projects tab
- [x] Deleted projects are gone forever

### Domain Management

### As an account owner with a project:
- [x] I can see my project's preview domain (project-slug.sites.wondrousdigital.com) in Domains tab
- [x] I can click on my preview domain to open it in a new tab
- [x] I can copy my preview domain with one click
- [x] I see "Add Custom Domain" section below preview domain
- [x] I can enter a custom domain (e.g., mybusiness.com)
- [x] I see validation errors for invalid domain formats
- [x] I can submit the domain and see it added to the list
- [x] I see "Pending Verification" status for new domains
- [x] I see clear DNS instructions pointing to sites.wondrousdigital.com
- [x] I can copy the CNAME value with one click
- [x] I see different instructions for root domains vs subdomains
- [x] I see links to guides for common DNS providers
- [x] I can check verification status with a refresh button
- [ ] I see "Verified" status once DNS propagates
- [ ] I see SSL status indicator (Pending → Active)
- [ ] I can access my site via the custom domain
- [x] I get an error if I try to add a domain already in use
- [x] I can see if the project slug I am trying to use is already in use via error states.
- [x] When I change the project slug, it will automatically try to change the project preview URL.
- [ ] I can remove a custom domain with confirmation
- [x] I see helpful error messages for common issues

### As a developer testing domains:
- [ ] Preview domains route correctly via middleware
- [ ] Custom domains route correctly via middleware
- [ ] Non-existent domains return 404
- [ ] Reserved domains (localhost, app.wondrousdigital.com) don't route to projects
- [ ] Domain verification checks work with Vercel API
- [ ] SSL provisions automatically via Vercel
- [ ] Domain removal cleans up Vercel and database
- [ ] Both apex and www versions of domains work
- [ ] Invalid domain formats are rejected before saving
- [ ] Duplicate domains across projects are prevented

### As a platform admin in Tools > Projects:
- [x] I can see ALL projects across ALL accounts
- [ ] I can search projects by name
- [ ] I can filter by active/archived status
- [ ] I can click "New Project" to create for any account
- [ ] I can click a project row to view details
- [ ] I can use the actions menu to:
  - [ ] Edit project
  - [ ] Clone project
  - [ ] Archive project
  - [ ] Delete project (with confirmation)
- [ ] I can see account name for each project
- [ ] I can reassign a project to a different account
- [ ] I can restore archived projects (admin-only feature)

## 4. Page Management

### As an account owner with a project:
- [x] I can access Pages from the project settings
- [FAIL] I see the homepage (/) is auto-created
  - The "set as homepage" toggle is greyed out
  - When a project is created, no home page is auto generated
  - When I open the canvas for the first time, THEN the Homepage is autogenerated. This is a weird pattern. It should be generated immediately when the project is created.
  - Also it forces you to use this created page instead of being able to change it to another page. This is a UX anti pattern. 
  - I expect a toggle on the card/list surface that can just be set easily.
- [x] I can click "Create New Page" button
- [x] I can enter page title and see auto-generated path
- [?] I can set SEO metadata (description, OG image)
  - The path for setting an image URL is there, but we should allow users to upload images to supabase.
- [x] I can save and the page is created
- [x] I see all pages in a grid/list view
- [x] I can toggle between grid and list views
- [x] I can edit page settings (title, path, SEO)
- [x] I can duplicate a page
- [FAIL] I can delete pages (except homepage)
  - Delete doesn't remove the page from the list
- [x] I get confirmation dialog before deletion

## 5. Builder & Content Editing

### As an account owner in the builder:
- [x] I can see the canvas with my page content
- [x] I can see the page selector dropdown in toolbar
- [x] I can switch between pages using the dropdown
- [x] I can toggle the section library sidebar
- [x] I can see Sections tab in the library
- [x] I can search for sections
- [x] I can drag sections onto the canvas
- [x] I can see sections added to the page
- [FAIL] I can click text to edit inline
  - This doesn't work currently
- [x] I can see save status indicator
- [x] Changes auto-save as I edit
- [FAIL] I can preview at different screen sizes
  - We need to replicate the controls and structure in the LAB
- [x] I can see current theme applied
- [x] I can change the theme 
- [x] I can see the available themes in the drop down

## 6. Admin Tools - Account Management

### As a platform admin in Tools > Accounts:
- [x] I can see all accounts in a data table
- [x] I can search accounts by name
- [x] I can filter by plan type
- [FAIL] I can filter by status (active/suspended)
  - This is broken.
- [x] I can select multiple accounts for bulk actions
- [x] I can click "New Account" to create account
- [x] I can enter account name and see auto-generated slug
- [x] I can select a plan type
  - I need to update this with our real plans and functionality
- [x] I can save and account is created
- [?] Pressing cancel button in Create New Account takes me back to the accounts page.
  - This just keeps you on the create account screen. It should take you back to accounts.

### As a platform admin viewing account details:
- [x] I can click an account to see details page
- [x] I see Overview tab with account info
- [x] I see Settings tab where I can:
  - [x] Update account name
  - [FAIL] Change plan type
    - No method to upgrade plan
  - [x] Update settings
- [FAIL] I see Users tab listing account members
  - This tab is there, but it's placeholder
- [?] I see Activity tab (placeholder for now)
  - I can see the tab, but we need to implement functionality
- [x] I can suspend/activate the account
- [x] I can delete account (with confirmation)

## 7. Admin Tools - User Management

### As a platform admin in Tools > Users:
- [x] I can see ALL users across the platform
- [x] I can search users by email or name
- [x] I can see user's email and display name
- [x] I can see user's platform role (admin/staff/user)
- [x] I can click a user to see details
- [x] I can see all their account memberships
- [x] I can see their role in each account

### As a platform admin in Admin Management:
- [x] I can see all platform admins
- [x] I can promote a regular user to admin
- [x] I can demote an admin (except last admin)
- [?] I see error if trying to demote last admin
  - This just doesn't allow me to demote the last admin, buttons are greyed out. Probably ok!
- [x] Changes take effect immediately

## 8. Team Management

### As an account owner in Account > Team:
- [ ] I can see all users in my account
- [ ] I can see their roles (owner/user)
- [ ] I can click "Invite User" button
- [ ] I can enter email address
- [ ] I can select role (user only, not admin)
- [ ] I can send invitation
- [ ] I see success message
- [ ] I see pending invitations section
- [ ] I can resend an invitation
- [ ] I can cancel an invitation
- [ ] I can remove a user from my account

## 9. Core Platform Features

### As a staff member:
- [x] I can access Lab to create templates
- [x] I can access Library to manage templates
- [x] I can access Core to manage components
- [x] I can create themes in Theme Builder
- [x] I can promote lab drafts to library
- [x] I can publish/unpublish library items

### As an account owner:
- [x] I cannot access Lab
- [x] I cannot access Library management
- [x] I cannot access Core
- [x] I can only use published themes
- [x] I can only use published sections

## 10. Security & Permissions

### Data Isolation:
- [x] Account owners cannot see other accounts' data
- [x] Account owners cannot access admin tools
- [x] Users cannot see projects from other accounts
- [ ] API requests enforce proper authentication
- [ ] Unauthorized access returns 403 errors
- [ ] Cross-account requests are blocked

### Permission Boundaries:
- [ ] Only account owners can create projects
- [ ] Only account owners can invite users
- [ ] Only admins can access tools section
- [ ] Only admins can promote/demote admins
- [ ] Only project members can edit content
- [ ] Public cannot access builder or settings

---

## Not Yet Implemented (Future)
- Email queue and notifications
- Billing and subscription management
- Custom domain configuration
- Site publishing and hosting
- Analytics and usage tracking
- Advanced user permissions
- Project templates marketplace
- Asset/media management
- SEO settings and sitemaps
- Form submissions