# Startup Prompt for New Claude Chats

## Quick Context Prompt

Copy and paste this into new Claude chats to get up to speed quickly:

---

We're working on our Next.js 15 multi-tenant website builder platform. The project has pivoted from React/Vite to Next.js and is now successfully deployed on Vercel.

**Project Location**: `/nextjs-app/` directory (ignore the legacy React app in `/src/`)

**Current State**:
- Multi-tenant architecture with domain-based routing is working
- Basic page builder with drag-and-drop sections implemented
- Multi role system implemented and tested
- Deployed to Vercel at app.wondrousdigital.com
- Using Supabase for database (PostgreSQL)

**Key Documents to Review**:
1. `/nextjs-app/docs/CLAUDE.md` - Development guidelines and architecture
2. `/nextjs-app/docs/PRD Design & Build System.md` - Product vision and implementation phases
3. `/nextjs-app/docs/MASTER-TASK-LIST.MD` - Current tasks and progress

**Current Focus**: 
- We are developing our domain system and testing it


**Important Architecture**:
- **Core** → Raw components from shadcn/ui
- **Lab** → Internal workspace for creating templates
- **Library** → Published templates (sections/pages/sites/themes)
- **Builder** → User-facing drag-and-drop interface
- **Projects** → Individual customer websites


**Tech Stack**:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Query (data fetching)
- Supabase (database)
- Vercel (deployment)
- Resend

**MCP Tools**:
- Firecrawl
- Sentry
- Playwright
- Supabase CLI
- Vitest

**Development Principles**:
- Follow KISS, DRY, and SOLID principles
- No throwaway work / no hack - everything must be production-ready
- Clear separation between app code and project code
- Always work in `/nextjs-app/` directory

**Quick Start**:
```bash
cd nextjs-app
npm run dev
```

**Please review the PRD:**
"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\docs\PRD Design & Build System.md"

**Please review the PRD architecture diagram at:**
`/nextjs-app/images/ProductArchitecture-DesignAndBuild.png`

**Please review our current progress:**
`/nextjs-app/docs/MASTER-TASK-LIST.MD`

**Please review our current manual/collaborative test doc:**
"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\docs\MASTER-TEST-LIST.md"

**Please review our Migration Management System:**
"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\docs\guides\MIGRATION-RECOVERY-GUIDE.md"
"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\docs\guides\SUPABASE-MIGRATION-WORKFLOW.md"
"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\docs\guides\HOW-TO-USE-SUPABASE.md"

**Please review our Domains Overview doc:**
"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\docs\guides\DOMAINS-OVERVIEW.MD"

**Please review our accounts system doc:**
"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\docs\guides\ACCOUNTS-SYSTEM-GUIDE.md"

**Review how to deploy to Vercel:**
"\\wsl$\Ubuntu-24.04\home\goosetown\Claude\Projects\wondrous-digital-site\nextjs-app\docs\guides\VERCEL-DEPLOYMENT-GUIDE.md"

---

## Additional Context (if needed)

### Database Access
```bash
# Supabase credentials are in .env.local
# Migration password: aTR9dv8Q7J2emyMD
npx supabase db push --password 'aTR9dv8Q7J2emyMD'
```

### Multi-Tenant Architecture
- Single Next.js app serves all customer websites
- Middleware handles domain-based routing
- Customer domains point to Vercel via CNAME
- Content fetched based on domain → project mapping

### Key Files to Understand
- `/nextjs-app/src/middleware.ts` - Domain routing logic
- `/nextjs-app/src/app/builder/[projectId]/page.tsx` - Page builder interface
- `/nextjs-app/src/app/sites/[projectId]/[[...slug]]/page.tsx` - Customer site rendering
- `/nextjs-app/src/stores/builderStore.ts` - Builder state management

### Common Tasks
- Check current tasks: Review MASTER-TASK-LIST.MD
- Check current tests: Review MASTER-TEST-LIST.MD
- Add new component: Manual process for now (automation coming)
- Test multi-tenant: Use *.localhost:3000 subdomains
- Deploy changes: Push to `nextjs-pagebuilder-core` branch

Remember: This is building a scalable SaaS platform like Webflow/Shopify, not individual site deployments!