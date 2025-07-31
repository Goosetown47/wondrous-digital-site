# Next.js PageBuilder

A visual website builder with drag-and-drop editing, live preview, and deployment to Netlify.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## 🏗️ Architecture

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


### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── builder/[projectId] # PageBuilder interface
│   ├── preview/[projectId] # Preview mode
│   └── api/               # API routes (coming soon)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── sections/          # Page sections (Hero, etc.)
│   └── builder/           # Builder-specific components
├── stores/                # Zustand stores
├── schemas/               # Zod schemas
├── lib/                   # Utilities
└── types/                 # TypeScript types
```

## ✅ Current Features

See: /nextjs-app/docs/MASTER-TASK-LIST.MD 


## 📋 Next Steps

See: /nextjs-app/docs/MASTER-TASK-LIST.MD 


### Commands
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## 🌟 Why This Architecture?

- **Unified Rendering**: Same components for edit/preview/production
- **Type Safety**: Zod schemas ensure data integrity
- **Performance**: Server components where possible
- **Developer Experience**: Hot reload, TypeScript, great tooling
- **Scalable**: Ready for 250+ section templates

## 🐛 Known Issues

See: /nextjs-app/docs/MASTER-TASK-LIST.MD 