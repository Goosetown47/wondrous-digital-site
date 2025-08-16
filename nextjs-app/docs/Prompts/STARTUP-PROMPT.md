# Startup Prompt for New Claude Chats

## Quick Context Prompt

Copy and paste this into new Claude chats to get up to speed quickly:

---

I'm working on the Wondrous Digital platform - a Next.js 15 multi-tenant website builder. We have a rigorous development process after learning from 452 TypeScript errors and multiple deployment failures.

**Environment**: WSL (Windows Subsystem for Linux)
**Project Location**: `/nextjs-app/` directory (ignore legacy `/src/`)
**Versions**: Production v0.1.4 | Development v0.1.5

## 📋 MANDATORY: Read These First

1. **[CLAUDE.md](/nextjs-app/CLAUDE.md)** - Core guidelines and what NOT to do
2. **[DEV-LIFECYCLE.md](/nextjs-app/docs/OPERATIONS/DEV-LIFECYCLE.md)** - Our development process (MUST FOLLOW)
3. **[CODE-CHECKLIST.md](/nextjs-app/docs/OPERATIONS/CODE-CHECKLIST.md)** - Quality standards (ZERO tolerance for TypeScript/ESLint errors)
4. **[DEV-TOOLS.md](/nextjs-app/docs/OPERATIONS/DEV-TOOLS.md)** - WSL commands quick reference

## 🎯 Current Sprint & Tasks

We are beginning development on Sprint v0.1.5. 
Get up to speed by reading our session log here: `/docs/Session_Logs/SESSION-LOG-2025-01-20-v015-sprint-planning.md`
Then take a look at our ACTIVE-SPRINT.md file to look through our packets and let's get ready to tackle our first packet.

It's important you use the right DEV database password when using the CLI: MsDH6QjUsf6vXD3nCeYkBNiF

- **Logs**: Get up to speed on everything we've done [STATUS-LOG.md](/nextjs-app/docs/STATUS-LOG.md)
- **Active Sprint**: Check [ACTIVE-SPRINT.md](/nextjs-app/docs/ACTIVE-SPRINT.md)
- **Backlog**: Check [BACKLOG.md](/nextjs-app/docs/BACKLOG.md) 
- **Progress Log**: Check [STATUS-LOG.md](/nextjs-app/docs/STATUS-LOG.md)
- **Product Vision**: [PRD Design & Build System.md](/nextjs-app/docs/PRDs/PRD%20Design%20%26%20Build%20System.md)

## 🏗️ Architecture Overview

**Multi-Tenant SaaS Platform** (like Webflow/Shopify):
- **Core** → Raw shadcn/ui components
- **Lab** → Template creation workspace
- **Library** → Published templates (sections/pages/sites/themes)
- **Builder** → Drag-and-drop interface
- **Projects** → Customer websites

**Key Features Implemented**:
- ✅ Multi-tenant with domain routing
- ✅ Page builder with sections
- ✅ Theme system
- ✅ Account/user/role management
- ✅ Deployed to app.wondrousdigital.com

## 💻 Development Setup

```bash
# ALWAYS work in WSL filesystem (not /mnt/c/)
cd ~/Claude/Projects/wondrous-digital-site/nextjs-app

# Pre-flight check (MUST PASS)
npx tsc --noEmit        # 0 TypeScript errors required
npm run lint            # 0 ESLint errors required

# Start development
npm run dev             # Or npm run dev:start (PM2 background)

# If port 3000 in use
npx kill-port 3000
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel (branch: nextjs-pagebuilder-core)
- **Email**: Resend
- **Monitoring**: Sentry

## ⚠️ Critical Rules

1. **ZERO TypeScript/ESLint errors** before ANY commit
2. **NO `any` types** without explicit justification
3. **NO temporary/hacky solutions** - production-ready only
4. **ALWAYS test** manually before marking complete
5. **ALWAYS run** `npm run build` before deployment
6. **NEVER skip** the DEV-LIFECYCLE process

## 🗂️ Documentation Structure

```
/nextjs-app/docs/
├── OPERATIONS/          # Dev process docs
│   ├── DEV-LIFECYCLE.md # Development process
│   ├── CODE-CHECKLIST.md # Quality checklist
│   └── DEV-TOOLS.md     # Command reference
├── PRDs/                # Product requirements
├── Guides/              # How-to guides
├── ACTIVE-SPRINT.md     # Current work
├── BACKLOG.md          # Future work
└── STATUS-LOG.md       # Progress tracking
```

## 🚀 Common Tasks

```bash
# Check health
npx tsc --noEmit && npm run lint && echo "✅ All good!"

# Fresh install
rm -rf node_modules package-lock.json && npm install

# Run tests
npm run test          # Unit tests
npm run test:e2e      # E2E tests

# Database
npx supabase db push --password 'aTR9dv8Q7J2emyMD'
npx supabase gen types typescript --local > src/types/database.ts

# Git workflow
git checkout -b feature/your-feature
# ... make changes following DEV-LIFECYCLE ...
gh pr create
```

## 🐛 WSL-Specific

```bash
# Fix common WSL issues
sudo hwclock -s                    # Fix clock drift
sudo chmod -R 755 .               # Fix permissions
npx kill-port 3000                # Free up port

# Access Windows files
cd /mnt/c/Users/YourName          # Slower for git/npm
cd ~                              # Use WSL filesystem (faster)
```

## 📝 Key Files

- **Domain Routing**: `/src/middleware.ts`
- **Builder**: `/src/app/(app)/builder/[projectId]/[pageId]/page.tsx`
- **Customer Sites**: `/src/app/sites/[projectId]/[[...slug]]/page.tsx`
- **Database Types**: `/src/types/database.ts`
- **Builder State**: `/src/stores/builderStore.ts`

## 🎯 Development Workflow

1. Read ACTIVE-SPRINT.md for current tasks
2. Follow DEV-LIFECYCLE.md process (Full Feature/Fast Track/Emergency)
3. Use CODE-CHECKLIST.md to verify quality
4. Reference DEV-TOOLS.md for commands
5. Update ACTIVE-SPRINT.md with progress and notes.

**Remember**: We're building a scalable SaaS platform. Quality > Speed. The process exists because shortcuts led to days of fixing errors.

---

## Additional Context (if needed)

### Process Modes
- **Full Feature Mode**: New features (complete DEV-LIFECYCLE)
- **Fast Track Mode**: Bug fixes (streamlined process)
- **Emergency Mode**: Production issues (fix first, document later)

### Testing Philosophy
- Test critical paths, not coverage percentage
- Manual testing with user before deployment
- Automated tests for business logic and user flows

### Multi-Tenant Details
- Single Next.js app → Thousands of sites
- Middleware maps domains → projects
- RLS policies ensure data isolation
- Preview domains: *.sites.wondrousdigital.com*

### Getting Help
- Check existing guides in `/docs/Guides/`
- Review similar implementations in codebase
- Follow patterns from existing code