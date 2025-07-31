# PRD: Design & Build System

# Overview

Key definitions and details for our product. It’s important that our application has a clear separation of concerns, but enables a seamless, scalable content creation process that empowers users to craft compelling, unique websites that stand above the rest.

### ⭐ Workflow Diagram (Critical to Review!)

"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\images\ProductArchitecture-DesignAndBuild.png”

### CRITICAL RULES:

- ⭐ Utilize KISS method
- ⭐ Utilize DRY principle
- ⭐ Utilize SOLID principles
- 🚫 Absolutely no throw away work; do not take unnecessary detours or build temporary hard coded examples just to pass a test. No weird tangents or side quests.
- 🚫 Do not be destructive in our build process, meaning our work unless specified, must not break functionality we’ve built.
- 🚫 Do not mix project level code with app level code. Our application must remain independent from the projects and themes contained within it. Users will be building websites with themes and templates. Our app will use Core components and themes, but the projects being created must be their own independent websites.
- 🚫 DO NOT let us spin our wheels trying to solve something over and over. Always step back and look at the macro and micro and think deeply about what we’re doing.
- ✅ DO tell me if we’re doing something that rubs against the grain for the tech stack we are using. If we’re doing something VERY atypical that could cause us headaches down the road, SOUND THE ALARM!
- ✅ Everything we do must be work that is saved and critical to our production environment.
- ✅ DO tell me what you really think. Don’t agree with me just to agree. Disagree with me if you disagree.
- ✅ Do review your assumptions
- ✅ DO collaborate with me along the way to test things (anything non-code that I can do, you should ask me to)
- ✅ Do have conversations with me vs defaulting to plans right away
- ✅ DO interview me before responding if needed to clarify missing data or thoughts.

## Wondrous Application (app.wondrousdigital.com)

This is the main product interface.  Users will interface with our product and work on projects. Admins will work on projects and create content and features for use by users. The main view of the app is the project dashboard.

Our application will be built with out of the box CORE components which can also utilize our themes. with our own core components and utilize a theming mechanism to be able to change the theme of the application. Users will be able to set dark or light mode in the app. The application itself must be mobile optimized.

It should look and function like this: [https://shadcnblocks-admin.vercel.app/](https://shadcnblocks-admin.vercel.app/)

## Wondrous Website (www.wondrousdigital.com)

This is our companies marketing website, facing out to potential customers. It will be built and managed with the wondrous application using our own builder and content. We will treat this as its own project under our own account that we will create, that will have administrative access controls. It will be no different than any other customer project. 

### Later

We will work on this once we have completed the app backend.

## Project (/Account/Project)

This is the primary view where users can see and manage their project. When users sign in they will land on their main project dashboard.

### Users will have:

- **Mission Control:** This has data about the websites performance, pulling key data from Vercel
    - Users will Publish or Unpublish the project here
    - Users can see data in charts
    - Users/admins can print a report of their projects performance
    - Users can launch their marketing and SEO dashboards (just a button that opens a new window) We white label GoHighLevel and SearchAtlas.
- **Builder:** Where they configure the content and website
- **Post:** Where they write and manage their blog posts which deploy to their website if they have blog functions turned on and a page configured.
- **Account:** A place where they can manage their account, change/cancel subscriptions, etc.

### Admins will additionally have:

- **Admin Tools:** We will add a fair amount of tools for managing accounts, projects, etc. which can be handled here later.
    - Account Creation & CRUD
    - Project Creation/CRUD, Assignment to Accounts
- **Lab:** This is our internal workspace that allows us to craft themes, sections, pages, and sites and save them as templates to our library.
- **Core Manager:** This interface allows us to see all our core components and eventually take any needed actions.
- **Library:** This interface allows us to see all themes, sections, pages, and site templates and take actions on them
    - Delete them
    - Edit them in Lab
    - Version them
    - Clone them
    - Rename them

## Core (/Core) “Raw components library”

This is our “out of the box” component library, populated from shadcn UI libraries.

Core is an “out of the box” component library we will build for use in our application. We will pull in components (which are things like accordions, alerts, cards) and sections (which are things like heros, features, FAQs) from existing proven UI kits built on shadcn UI. These are base styled “as is” and something we can pull into our construction lab to build with quickly. 

- E.g., If I want to build a new section with a calendar, we can pull in our prebuilt calendar component, and drop it in.

My intention for CORE is to be comprehensive and populate it with hundreds of prebuilt components we can use.

This base component library will not be user facing ever. It’s our internal “starter kit” to create things that will go into our library.

### **Key Component Libraries for Use:**

- [https://ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)
- [https://shadcnui-expansions.typeart.cc/docs](https://shadcnui-expansions.typeart.cc/docs)
- [https://ui.aceternity.com/components](https://ui.aceternity.com/components)
- [https://pro.aceternity.com/components](https://pro.aceternity.com/components)
- [https://skiper-ui.com/docs/components/](https://skiper-ui.com/docs/components/)

### **Shared Foundation**

- All libraries use Tailwind CSS for styling
- All are React-based components
- Most follow the copy-paste philosophy (not npm packages)
- All work with Next.js out of the box

### **Component Coverage:**

- Base UI (shadcn/ui): ~40+ components (buttons, forms, modals, etc.)
- Extended UI (expansions): ~15+ specialized components
- Interactive/Animated (Aceternity): 70+ premium effects and sections
- Creative Effects (Skiper): Unique 3D and interactive components

### **Integration Approach**

- shadcn/ui & expansions: Direct copy-paste, no conflicts
- Aceternity UI: Uses Framer Motion for animations (additional dependency)
- Skiper UI: Claims shadcn/ui CLI compatibility

### **Required Dependencies**

```
"dependencies": {
// Core (already in your project)
"react": "^19.0.0",
"next": "^15.0.0",
"tailwindcss": "^3.4.0",

// Additional for full compatibility
  "framer-motion": "^11.0.0",  // For Aceternity animations
  "@radix-ui/react-*": "latest", // Various Radix UI primitives
  "class-variance-authority": "^0.7.0", // Already have this
  "clsx": "^2.0.0", // Already have this
  "lucide-react": "latest" // Already have this

```

## Builder (/Builder)

This is our project builder where website projects are configured, content is managed, themes are applied. This is user facing, and admins will use the same interface to manage projects. The library is viewable and interactable both for admins/team members and users. The difference is that admins/team members can view both unpublished and published items in the library.

Users can:

- Apply an existing site template to the project (out of the box, the site is created with default content) → Quickest route to publishing live.
- Build from scratch using page and section templates
- Apply a theme to their project site wide

### Builder Components

**Canvas:** This is where the project is visually configured. 

**BuildBar:** Has 3 tabs (Sites, Pages, Sections) and a drop down element at the top to sort by site, page, and section type. (e.g., I can select “Hero’s” within sections tab, and then all the hero sections show up that can be dragged onto the canvas.)

**ThemeSelector:** This is a drop down in the vertical project navigation bar that allows you to select a prebuilt theme for the entire site, and toggle using a toggle slider whether you want to enable your project to have a dark/light mode toggle on it. This is populated by the themes in our library.

## Lab (/Lab) “Internal construction/development”

This is our internal workspace where admins will:

- Pull from Core components
- Build and test new sections, pages, sites, and themes.
- Publish to Library when ready

The lab should have a full GUI designed to craft and create templates and themes in collaboration with Claude Code. 

This is not meant to be a code environment, it’s meant to use a graphical UI in conjunction with Claude Code to create the various templates and themes. 

### Workflow

- The workflow looks something like:
    - I open the lab AND Claude Code side by side
    - I tell Claude Code things like:
        - “Let’s design a new section that has a booking calendar in it”
        - “Let’s take sections a, b, c, and d and create a new page template”
        - “Let’s take pages x, y, z and create a new site template, with x theme and save it to the library”
    - Then Claude Code gets to work crafting those things with CORE.
    - The output shows up in the Lab Canvas
    - The Lab has robust tools to check for full mobile and tablet optimization, errors, issues, user experience, turning on and off all the possible states.
    - Additionally there is a Theme editor UI that I can open and set manually - google fonts, border radiuses, shadows, colors, and see their effect on any template I want loaded from the library. I can save those themes into the library.
    - Once I am happy with a draft template I am working on, I can promote it to the library.
    - The Lab contains “drafts” which are saved projects I am working on at any given time. These are not in the library yet.

### Bidirectional Flow

The lab can:

- Take from Library → Lab (to modify existing)
- Create in Lab → Library (to publish new)
- Access Core → Lab (for raw materials)

### Theme Creator

We also utilize a robust theme creator to build themes here that allows us to change color schemes, light & dark mode, typography (primary/secondary, headers, paragraphs, links), button styles, and UI graphic styling (things like border radius and shadows)

### What we can Create

There are 4 things we can create in the construction lab that can be added to the library:

- **Sites:** this is a complete website template, which can be constructed of pages and sections.
- **Pages:** this is a full page built with sections.
- **Sections:** This is a full width, fully mobile optimized horizontal section of a page.
- **Theme:** This is a packaged “theme” that can be selected, which affects an entire project. All pages and sections.

All four of these things can be promoted to our library once we’re happy with them.

### Collaboration with Claude Code is Key

The relationship for building in the construction lab will be to work with Claude Code to create one of the 4 things, then be able to press a “save to library” button. The default status is for new things saved to the library is “unpublished”.

## Theme

Create themes in our construction lab that can be added to the library and applied to projects, site wide. These will be preconstructed themes that either we or our users can select to quick apply that theme across the entire site. 

### Interface

There should be a fully manual interface in Lab that I can use to create themes and view them on any template or draft as I create them. This should have granular GUI control of setting CSS settings like border radius, typeface, sizes, colors, fonts, box shadow, everything that can be edited. 

### Feasibility: 100%

shadcn/ui's theming system is built for exactly this use case. It uses CSS variables that
cascade throughout the entire application, making site-wide theme switching trivial.

### Reference

The [tweakcn.com](http://tweakcn.com/) example shows this works beautifully - instant theme switching with
comprehensive visual changes. Your PageBuilder can do the same thing, but with your
custom-built themes.

### What You Can Control with Themes

- ✅ Color Schemes - All colors via CSS variables
- ✅ Light/Dark Mode - Built-in support
- ✅ Typography - Font families, sizes, weights
- ✅ Border Radius - From sharp to rounded
- ✅ Shadows - None to dramatic
- ✅ Sizes - Button heights, padding, spacing
- ✅ Component Variants - Different looks per theme

### Technical Architecture

```
Current shadcn/ui approach:
  /* Twitter Theme */
  [data-theme="twitter"] {
    --primary: 29 155 240;  /* Twitter blue */
    --radius: 9999px;       /* Fully rounded */
    --button-height: 36px;
    /* ... all other variables */
  }

  /* Professional Theme */
  [data-theme="professional"] {
    --primary: 59 130 246;  /* Corporate blue */
    --radius: 0.25rem;      /* Sharp corners */
    --button-height: 44px;
    /* ... */
  
```

### Implementation in Builder

```
// In your database
  themes: {
    twitter: { colors: {...}, radius: "full", ... },
    professional: { colors: {...}, radius: "sm", ... },
    minimal: { colors: {...}, radius: "none", ... }
  }

  2. Theme Application
  // When user selects theme
  function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    // Or inject CSS variables dynamically
  }
```

### What we don’t need

- ❌ No additional plugins required
- ❌ No complex state management
- ❌ No build-time configuration changes

### The only custom work needed

1. Theme Builder Interface in your lab (for you to create themes)
2. Theme Preview component (to show before/after)
3. Database Schema to store theme definitions
4. Apply Function to inject the CSS variables

### Real world example

1. Fetch theme definition from database
2. Apply CSS variables to document.documentElement
3. All shadcn/ui components instantly update
4. Save theme selection to project settings

## Accounts (with multiple user accounts)

- Projects (deployed to their own domains)
- View Project Dashboards
- Change projects in main nav dropdown

## Project

This is an individual website project that deploys to a specific domain.

- It’s comprised of pages with sections, and a theme
- A customer has added their own content to the site and customized it
- This will be live to the public, and have data about performance
- A domain is configured for this project to deploy to

## Library (/Library) “Published, ready-to-use assets”

This is where we store all our templates. Templates can be either “published” or “unpublished” and only published templates show up for users. Unpublished templates can be worked on in our lab.

Templates can be:

- Full sites
- Pages
- Sections
- Themes

### Interface

We will need a management interface that allows admins/team members to manage the status of these things and open them back up for modification in Construction Lab. 

### Versioning

We will need versioning for each thing in the library. A way to roll back versions. A simple flag for unpublished/published which when published is viewable by users. 

# Implementation Overview

### 

## Phase 1: FOUNDATION

### Primary Goal

Establish the core architecture and data models.

We’re not trying to build out every feature, just the permanent foundation we need to complete our test, and then build on top of. 

### Key Tasks:

- **Data:** Design Database Schemas
    - Core components table (source, type, code, dependencies)
    - Lab workspace table (drafts, versions, metadata)
    - Library table (published items, usage stats)
    - Themes table (variables, applicability, inheritance)
- **Core:** Build Core Component Ingestion System
    - Why:  Automated ingestion scales component library efficiently
    - Component parser/normalizer
    - Dependency resolver
    - Metadata extractor
    - Storage pipeline
- **Application Platform Skeleton & Basic UI**
    - Create a list of core components to intake from shadcn ui that we need for our application platform skeleton and basic UI for other screens.
    - Utilize ingestion process to add those components to Core
    - Utilize these components to build our application skeleton based on Overview information
- **Theme:** Engine with Inheritance
    - CSS variable injection system
    - Theme inheritance hierarchy (site → page → section)
    - Real-time preview
    - Theme Builder Interface
        - Visual theme editor in Lab
        - Variable relationship mapping
        - Export/import functionality
    - Theme Application Logic
        - Project-level theme storage
        - Override system for granular control
        - Performance optimization (caching)
    - Link our application skeleton to use themes
- **Lab:** Production Lab Environment
    - Isolated workspace at /lab
    - Component preview system
    - Live editing capabilities
    - Version control for work-in-progress
- **Library:** Set up Library architecture and basic UI
    - Allow for injecting templates from Lab
    - BASIC CRUD interface
    - Architecture properly created with publish/unpublished
- **Builder:** (Pagebuilder is now just “Builder”) Modify Existing Builder:
    - Adjust Pagebuilder UI to access library
        - 3 tabs in the side bar: Sections, Pages, Sites
        - Each tab has a search bar
        - Each tab has a dropdown selector to filter by Template Type
        - Template types will be assigned in library or lab. Do not create dummy types. I will manually create these.
            - E.g., Section Types: Hero, Features
            - E.g., Page Types: Landing, Services
            - E.g., Marketing Landing Page, Full Dentist Website

### Milestone Test:

- This test must pass to complete the phase. Claude Code will work with the user to complete the test collaboratively. The point of the test is to use the UI to complete the test.
    1. Ingest a component to **CORE**
        1. User will identify a component from shadcn ui to Claude code and provide a link
        2. Claude code will use the automated component ingestion process to add it to Core.
    2. User opens **LAB**
        1. Create a new draft section template
        2. Work with Claude to add the ingested component to the section
        3. Create a new theme
            1. User sets font, sizes, colors
            2. User saves the theme template in library (name, description)
        4. User saves draft of section template with name and section type
        5. User promotes saved section draft to Library section template
    3. User opens **LIBRARY**
        1. User can view section template in unpublished / sections area
        2. User can view created theme
        3. User changes section template to published
        4. User changes theme to published
    4. User opens a project in project dashboard
    5. User opens **BUILDER**
        1. User sees newly published section with component
        2. User sees theme drop down with new published theme
        3. User drags section onto canvas
        4. User applies theme to project
            1. Project settings theme dropdown
            2. Live preview in builder
    6. User publishes saves project with new section that contains our core component

## Phase 2: Solidify

Now that we have a working MVP of the design and build system we need to solidify some key parts of the platform.

**Admin Account Creation & Management UI**

- CRUD functions

**Login Data Setup**

- Account types
    - Admin: Access to the full platform
    - Team Member: Staff position with access to some management tools
    - Account Owner: Primary on an account
    - User: Additional user on an account

**Login Screen**

- Create login screen with Core components

[**app.wondrousdigital.com](http://app.wondrousdigital.com) requires login to access**

- The app is protected behind a login screen
- The app is protected by Vercel firewall protections, and secure

**Separation of Access**

- We create hard firewalls related to user roles and permissions on what things they can access
- Account Owners and Users should only be able to access their accounts and the projects associated

**Account Selector & Project Selector in Main Nav**

- Users can select and change project contexts
- Admins can select any account or project from main nav

**Domain Management System Update**

- Solidify setting domains in system
- Make it super easy for users to configure, bullet proof

**Account Management Page**

- Account Owner can access their account level page and change basic information about themselves

### Milestone Test:

1. User can access admin tools
    1. User can create, edit, delete accounts (top level that contains projects and users)
    2. User can add users to an account
    3. User can set the permission level of each user in the account
2. User can’t access [app.wondrousdigital.com](http://app.wondrousdigital.com) without logging in via login screen
3. User has one account set to user on an account, and signs in
    1. User can only see and access user level components in app, not admin controls
4. User signs into admin account and can access all admin levels functionality 
    1. Admin can access all accounts and projects
5. User can select from available accounts in drop down in main nav bar
6. User can select from available project in drop down in main nav bar
7. User can set up a domain for a project and deploy the project to it with one click
8. User can open an account management page and change basic data about myself (name, account name)

## Phase 3: Scale Content

Now that we have a solid foundation that works, we will add a lot of new content into the system to populate it.

**Core Component Integration**

- Ingest shadcn/ui base components
- Add expansions and specialty libraries
- Standardize component interfaces
- Aceternity effects

**Navigation System**

- Basic project navigation system
- Pick from templates: Navigation & Footer
- Automatically global
- Add & Remove links
- Configure dropdowns properly

**Priority Section Templates**

- Create core section templates
- Create multiple variants per type

**Priority Page Templates**

- Create core page templates

**Priority Site Templates**

- Create core site templates

**Core Themes**

- Create core themes

### Milestone Testing

1. Test and deploy each section, page, website, and theme to a public URL to ensure it works
2. Resolve any issues

## Phase 4: Scale Up Existing Features

Now that we have a robust content ecosystem and a solid foundation, we will begin adding lots of features to enhance the experience.

**Lab Upgrades**

- Component preview system
- Proper version control
- Animation applicator
- Dependency management
- Quality assurance checklist
- Automated testing
- Testing results interface
- Metadata enrichment
- Quick actions
- Bulk operations

**Library Upgrades**

- Visual template browser
- Smart search/filtering
- Preview on hover
- Drag-drop improvements
- Category organization
- Templates (only unpublished)
    - Edit them
    - Version them
    - Clone them
    - Rename them

**Theme Upgrades**

- Add more controls to the theme creator in Lab

**Admin Upgrades**

- Template Type interface CRUD manager
- BULK operations

**App Upgrades**

- Light/Dark toggle
- 

**Account Management Page Upgrades**

- Avatar
- Manage account users
- Billing
- Common settings
- Project overview page with statuses

**Core Manager Upgrades:**

- Add / enhance an interface to view core components

## Phase 5: Final Production Features

**Post: Blogging functionality Integration**

- Create a blog management and creation UI called Post
- Users can CRUD posts
- Posts automatically link to blog pages in project

**Mission Control: Interactive, data driven dashboard for projects**

- Create a dashboard which visualizes data we pull in from Vercel to give important traffic and performance data about the website.

**www.wondrousdigital.com: Marketing site built with our app**

- Utilize our builder to create the marketing website for our company.