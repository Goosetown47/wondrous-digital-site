# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## 🚀 Project Overview

This is a **Next.js 15 multi-tenant website builder platform**. All active development is in the `/nextjs-app/` directory. The legacy React/Vite app exists but is not in use.

**Production Version:** v0.1.6 
**Development Version:** v0.1.7 
**Deployment Branch:** `nextjs-pagebuilder-core` (NOT master/main!)


## 📋 Essential Reading

**IMPORTANT**: Before making any code changes, read these documents:
- `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/PRINCIPLES.md` - Learn about our most important principles
- `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/PROCESS.md` - Learn about our process
- `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/CODE-CHECKLIST.md` - Learn about our code standards
- `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/Release_Notes/v#.#.#.md` - Find the latest release notes & log 


## CURRENT PROJECT
READ THESE before moving forward:
- `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/In_Progress/SYSTEM_Editable_Sections.md`
- `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/In_Progress/SYSTEM_Section_Analyzers.md`
`/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/In_Progress/TEST_REPORT_Editable_Fields_10-1-25_420pm.md`


## PROCESS OVERVIEW

### Overview
This system is designed to maintain a searchable system of "live" documents based at the feature/system/bug level that we can use as reference or to build on when we're working on our application.

We manage our architecture, systems, features, and bugs as individual markdown files. 
- Each file contains everything you need to know about that particular item.
  - Overview
  - Tasks (In Progress, Planned, Completed)
  - Technical Documentation: Covers how the system works for future reference
  - Log: Everything we do, we should create a log, titled with the date (day, month, year) and a list of what we did.

#### Document Formatting

  **Titles**
  When creating a document use the following:
  - Architecture: `ARCHITECTURE_Title_Case_Name.md` 
  - System: `SYSTEM_Title_Case_Name.md`
  - Feature: `Title_Case_Name.md`
  - Bug: `BUG_Title_Case_Name.md`

### `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/Backlog/`
- Things we haven't worked on yet go into this folder. 
- We use the @docs/Templates/Feature_Doc.md template to structure each file.
- We pull features from here and place them into our @docs/In_Progress/ folder to work on them for the sprint

### `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/In_Progress/`
- These are the things we're currently working on in the sprint.
- Can pull from @docs/Tech_Docs (which is completed features, that need more work) or @docs/Backlog/ to bring in new features.
- Found Work: Create a new file for the system, feature, or bug and figure out what to do with it (put it in the Backlog folder to work on it later, or keep it in the In_Progress folder to get to it eventually)

### `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/Tech_Docs/` 
- This is where all completed features, systems, and bugs go when we're done with them.
- We can continue to work on them, by bringing them back into the In_Progress folder.
- When we need to learn about how something works, this should be the first folder we look in.
- Serves as technical documentation for the whole project.

### `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/Release_Notes/v#.#.#.md`
- We keep a record of the things we work on and the release notes.
- This is how we identify what major epics we're working on.
- Intended to be very succinct. Details go in each feature file.


## PROCESS

### SPRINT Planning
1. User will create a list of things to work on in a Release file.
2. ONLY the User will move items from `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/Backlog/` into `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/In_Progress`
3. User will create any missing documents for the sprint
4. Everything should have its own file.

### SPRINT Start Development
1. CLAUDE checks our Release file for an overview of what we're working on
2. CLAUDE finds and reads files in @docs/In_Progress to ensure everything matches
3. CLAUDE asks user to start server on port 3000 (waits for confirmation)
4. CLAUDE follows `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/PROCESS.md` checklist

### SPRINT Complete Development
1. We deploy to staging to test it manually
2. Once tested and working, we merge with PROD.
3. Have user apply applicable migrations to PROD.
4. Assist user by writing Release Notes in release file.


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

**CRITICAL**: Our deployment flow is:
```
Feature Branch → staging branch → nextjs-pagebuilder-core
      ↓              ↓                    ↓
   DEV Local    STAGING Site         PROD Site
```

- Feature branches merge to `staging` for testing
- `staging` branch deploys to https://staging.wondrousdigital.com
- After staging verification, merge `staging` → `nextjs-pagebuilder-core`
- `nextjs-pagebuilder-core` deploys to https://wondrousdigital.com (PRODUCTION)
- Never create PRs directly against `master` branch

## 💻 Development Commands


### CRITICAL: Preventing Port Conflicts
- **NEVER** start servers on ports 3001, 3002 (corrupts `.next/routes-manifest`)
- Server runs on port 3000 ONLY
- Choose either direct method (`npm run dev`) OR PM2 method - don't mix them

**IMPORTANT**: Always work in the `/nextjs-app/` directory!

```bash
cd nextjs-app
```

### Development Server (Two Methods)

#### Method 1: Direct Development (Recommended for Active Development)
```bash
# Start development server with live logs in terminal
npm run dev

# Stop with Ctrl+C
# Restart by stopping (Ctrl+C) and running npm run dev again
```
**Best for:** Active development when you want to see logs immediately in terminal

#### Method 2: PM2 Background Process (Optional)
```bash
# Start as background daemon
npm run pm2:start

# Stop server
npm run pm2:stop

# Restart server
npm run pm2:restart

# View logs
npm run pm2:logs

# Check status
npm run pm2:status
```
**Best for:** Running server in background while using terminal for other tasks

### When Server Needs Restart:
- **If using direct method:** Stop with Ctrl+C and run `npm run dev` again
- **If using PM2:** Run `npm run pm2:restart`

### Other Commands
```bash
# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

### If Routes Manifest Corrupted:
```bash
# If using PM2:
npm run pm2:stop
rm -rf .next
npm run pm2:start

# If using direct method:
# Stop server with Ctrl+C, then:
rm -rf .next
npm run dev
```


# 🗄️ Database Management

## Three-Tier Environment Architecture

### 🖥️ DEV (Local Development)
- **URL**: http://localhost:3000
- **Database**: DEV Supabase (`hlpvvwlxjzexpgitsjlw`)
- **Migrations**: USER applies manually via Supabase Dashboard

### 🔍 STAGING (Preview Environment)  
- **URL**: https://staging.wondrousdigital.com
- **Database**: DEV Supabase (`hlpvvwlxjzexpgitsjlw`) - Shared with DEV
- **Purpose**: Preview testing before production

### 🚀 PROD (Production)
- **URL**: https://wondrousdigital.com
- **Database**: PROD Supabase (`bpdhbxvsguklkbusqtke`)
- **Migrations**: USER applies manually via Supabase Dashboard

## ⚠️ CRITICAL: Migration Process

**USER APPLIES ALL MIGRATIONS MANUALLY - NO CLI USAGE**

### Migration Workflow
1. **Create Migration**: Write SQL file in `/nextjs-app/supabase/migrations/`
2. **Provide to USER**: Claude provides migration SQL for manual application
3. **USER applies to DEV**: Via Supabase Dashboard (NOT CLI)
4. **Test in DEV/STAGING**: Verify migration works correctly
5. **USER applies to PROD**: Via Supabase Dashboard after staging verification

### Creating Migration Files
```bash
# Create new migration file (MUST use 14-digit timestamp)
echo "-- Your SQL here" > supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql
```

**Important Rules:**
- ✅ USER manually applies ALL migrations
- ❌ NEVER use `npx supabase db push` or CLI commands
- ❌ NEVER sync databases between environments
- ✅ Test in DEV/STAGING before PROD

### Migration Naming Convention
```
# ALWAYS use full timestamp format to avoid conflicts:
YYYYMMDDHHMMSS_descriptive_name.sql

# Examples:
20250820140000_pending_stripe_payments.sql  # Aug 20, 2025 at 2:00 PM
20250820143000_fix_user_permissions.sql     # Aug 20, 2025 at 2:30 PM

# IMPORTANT: Use 14 digits (no underscores in timestamp)
# This allows multiple migrations per day without conflicts
```

### Environment Variables
- **DEV** (.env.local):
  - `NEXT_PUBLIC_SUPABASE_URL=https://hlpvvwlxjzexpgitsjlw.supabase.co`
  - Database Password: MsDH6QjUsf6vXD3nCeYkBNiF
- **PROD** (.env.production.local):
  - `NEXT_PUBLIC_SUPABASE_URL=https://bpdhbxvsguklkbusqtke.supabase.co`
  - Database Password: Controlled by user


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

