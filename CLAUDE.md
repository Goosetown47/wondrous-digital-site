# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Project Overview

This is a **Next.js 15 multi-tenant website builder platform**. All active development is in the `/nextjs-app/` directory. The legacy React/Vite app exists but is not in use.

## 📋 Essential Reading

**IMPORTANT**: Before making any code changes, read these documents in `/nextjs-app/docs/`:

1. **[PRD Design & Build System](./nextjs-app/docs/PRD%20Design%20%26%20Build%20System.md)** - Product vision, architecture, and implementation phases
2. **[MASTER-TASK-LIST.MD](./nextjs-app/docs/MASTER-TASK-LIST.MD)** - Current development tasks and progress tracking
3. **[STARTUP-PROMPT.md](./nextjs-app/docs/STARTUP-PROMPT.md)** - Quick context for new development sessions

## 🏗️ Architecture Overview

### Multi-Tenant Platform
- Single Next.js application serving thousands of customer websites
- Domain-based routing via middleware
- Deployed on Vercel with automatic SSL for custom domains
- Following the proven architecture of Webflow, Shopify, etc.

### Key Components
1. **Core** - Raw component library from shadcn/ui
2. **Lab** - Internal workspace for creating templates
3. **Library** - Published templates (sections, pages, sites, themes)
4. **Builder** - User-facing drag-and-drop interface
5. **Projects** - Individual customer websites

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

## 🗄️ Database Management

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