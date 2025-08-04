# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Project Overview

This is a **Next.js 15 multi-tenant website builder platform**. All active development is in the `/nextjs-app/` directory. The legacy React/Vite app exists but is not in use.

**Production Version:** v0.1.0 (Released 8/1/2025 @ 11pm)
**Development Version:** v0.1.1 (Active Planning Now)
**Deployment Branch:** `nextjs-pagebuilder-core` (NOT master/main!)

## 📋 Essential Reading

**IMPORTANT**: Before making any code changes, read these documents in `/nextjs-app/docs/`:

### CONTEXT DOCS
**[PRD Design & Build System](./nextjs-app/docs/PRD%20Design%20%26%20Build%20System.md)** - Product vision, architecture, and implementation phases
**[STARTUP-PROMPT.md](./nextjs-app/docs/prompts/STARTUP-PROMPT.md)** - Quick context for new development sessions


### DEVELOPMENT DOCS
1. **[CODE-CHECKLIST.md](./nextjs-app/docs/OPERATIONS/CODE-CHECKLIST.md)** - This document serves as a **MANDATORY** checklist that must be followed for every feature, fix, or code change. It was created after spending multiple days fixing 452 TypeScript errors, 304+ ESLint errors, and numerous build/deployment issues.
2. **[DEV-LIFECYCLE.md](./nextjs-app/docs/OPERATIONS/DEV-LIFECYCLE.md)** - This is our development lifecycle. This is how we process the items in our active sprint. These steps are **MANDATORY** to complete before a sprint can be finished.
3. **[DEV-TOOLS.md](./nextjs-app/docs/OPERATIONS/DEV-TOOLS.md)** - This document outlines what our platform is, what tools are available, and a guide for what to use, when, and how. It should contain every single command, and Claude user stories on when to use what, mapped to each part of our DEV-LIFECYCLE.


### OPERATIONAL DOCS
#### We are using 4 documents to manage our tasks, in a modified agile development process.
1. **[BACKLOG] (./nextjs-app/docs/BACKLOG.md)** - This is our full list of tasks and things we pull from into our active-sprint. Whenever we have new things to add we put them here. This is arranged in priority sections P1, P2, P Low.
2. **[ACTIVE-SPRINT] (./nextjs-app/docs/ACTIVE-SPRINT.md)** - We pull from our backlog document into our ACTIVE_SPRINT, which maps to a release number. 
3. **[STATUS-LOG] (./nextjs-app/docs/STATUS-LOG.md)** - This is an ongoing log of everything we do across the application, from bug fixes to whatever. Every time we do a work segment this should be updated.
4. **[RELEASE NOTES] (.nextjs-app/docs/Release_Notes/)** - This is where we create a release notes for each release. 
  **Release Notes Format**
  Identify which version this is and set up a “Release Notes” document add to Release_Notes folder.
    1. Identify which versions dev is on, which version production is on. The Release will be what we are deploying to production.
    2. This will have a list of features added, bugs fixed, etc. 
    3. It should be in a “customer facing” format that non technical people can read and understand. It will be public facing information. 
    4. It should NOT contain any critical or sensitive information. Just new features and bug fixes.


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



# 🏗️ Architecture Overview

## Multi-Tenant Platform
- Single Next.js application serving thousands of customer websites
- Domain-based routing via middleware
- Deployed on Vercel with automatic SSL for custom domains
- Following the proven architecture of Webflow, Shopify, etc.

## Key Components
1. **Core** - Raw component library from shadcn/ui
2. **Lab** - Internal workspace for creating templates
3. **Library** - Published templates (sections, pages, sites, themes)
4. **Builder** - User-facing drag-and-drop interface
5. **Projects** - Individual customer websites

## 🚀 Deployment Process

**CRITICAL**: Our deployment branch is `nextjs-pagebuilder-core` (NOT master/main!)
- All PRs must target `nextjs-pagebuilder-core`
- Vercel automatically deploys from `nextjs-pagebuilder-core`
- Never create PRs against `master` branch

## 💻 Development Commands

**IMPORTANT**: Always work in the `/nextjs-app/` directory!

```bash
cd nextjs-app
```

### Development Server
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

### PM2 Commands (Recommended)
```bash
# Start as background daemon
npm run dev:start

# Stop server
npm run dev:stop

# Restart server
npm run dev:restart

# View logs
npm run dev:logs

# Check status
npm run dev:status
```

# 🗄️ Database Management

### Supabase Configuration
- Database migrations are in `/nextjs-app/supabase/migrations/`
- Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Migration Commands
```bash
# From nextjs-app directory
cd nextjs-app

# Apply migrations
npx supabase db push --password 'aTR9dv8Q7J2emyMD'

# Check migration status
npx supabase migration list --password 'aTR9dv8Q7J2emyMD'
```

### Migration Naming Convention
```
YYYYMMDD_HHMMSS_descriptive_name.sql
```

## 🎨 Current Implementation

See /nextjs-app/docs/MASTER-TASK-LIST.MD 

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
  - Docs: https://nextjs.org/docs
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Data Fetching**: React Query
- **Deployment**: Vercel
- **Validation**: Zod
- **Testing**: Vitest & Playwright (use the MCPs)
  - Playwright Docs: https://playwright.dev/docs/intro
  - Vitest Docs: https://vitest.dev/guide/
- **Web Search**: Firecrawl (use the MCP)
  - Docs: https://docs.firecrawl.dev/introduction
- **Versioning**: Github (use the CLI)
- **UI Libraries**: Shadcn UI
  - Docs: https://ui.shadcn.com/docs/
- **Debugging**: Sentry
- **Platform Email Service**: Resend
  - Docs: https://resend.com/docs/introduction


## 📁 Project Structure

```
/nextjs-app/
├── /src/
│   ├── /app/           # Next.js app router pages
│   ├── /components/    # React components
│   ├── /hooks/         # Custom React hooks
│   ├── /lib/           # Utilities and helpers
│   ├── /schemas/       # Zod schemas
│   ├── /stores/        # Zustand stores
│   └── /types/         # TypeScript types
├── /docs/              # All documentation
├── /supabase/          # Database migrations
└── /public/            # Static assets
```

## ⚠️ Important Guidelines

1. **Follow KISS, DRY, and SOLID principles**
2. **No throwaway work** - Everything must be production-ready
3. **Maintain clear separation** between app code and project code
4. **Test thoroughly** before marking tasks complete
5. **Update documentation** as you make changes
- ✅ DO tell me if we're doing something that rubs against the grain for the tech stack we are using. If we're doing something VERY atypical that could cause us headaches down the road, SOUND THE ALARM!
- ✅ Everything we do must be work that is saved and critical to our production environment.
- ✅ DO tell me what you really think. Don't agree with me just to agree. Disagree with me if you disagree.
- ✅ Do review your assumptions
- ✅ DO collaborate with me along the way to test things (anything non-code that I can do, you should ask me to)
- ✅ Do have conversations with me vs defaulting to plans right away
- ✅ DO interview me before responding if needed to clarify missing data or thoughts.


## 🚨 Common Pitfalls to Avoid

1. Don't work in the root `/src/` directory (that's the old React app)
2. Don't create temporary hardcoded examples
3. Don't mix project-level code with app-level code
4. Don't skip updating the task list when completing work
- 🚫 Do not be destructive in our build process, meaning our work unless specified, must not break functionality we’ve built.
- 🚫 Don't start the project on a new port if the main port isn't working. Verify WHY it isn't working and work to resolve that issue first.
- 🚫 Do not mix project level code with app level code. Our application must remain independent from the projects and themes contained within it. Users will be building websites with themes and templates. Our app will use Core components and themes, but the projects being created must be their own independent websites.
- 🚫 DO NOT let us spin our wheels trying to solve something over and over. Always step back and look at the macro and micro and think deeply about what we’re doing.


## 📚 Additional Resources

For specific implementation details, see:
- [Vercel Deployment Guide](./nextjs-app/VERCEL-DEPLOYMENT-GUIDE.md)
- [How to Use Supabase](./nextjs-app/docs/HowTo/HOW-TO-USE-SUPABASE.md)

---

**Remember**: This is a production system building a scalable SaaS platform. Quality and architecture matter!