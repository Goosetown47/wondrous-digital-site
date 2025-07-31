# Wondrous Digital Platform

A multi-tenant website builder platform built with Next.js 15, enabling users to create, customize, and deploy professional websites through an intuitive drag-and-drop interface.

## 🚀 Current Architecture

This project has migrated from a React/Vite application to a Next.js 15 multi-tenant platform. The active development is now in the `/nextjs-app/` directory.

### Key Features
- **Multi-Tenant Architecture**: Single application serving multiple customer websites via domain-based routing
- **Visual Page Builder**: Drag-and-drop interface for building websites
- **Template System**: Pre-built sections, pages, and complete site templates
- **Theme Engine**: CSS variable-based theming system for site-wide styling
- **Real-time Preview**: Instant visual feedback while building
- **Supabase Backend**: PostgreSQL database with real-time capabilities

## 📁 Project Structure

```
/wondrous-digital-site/
├── /nextjs-app/          # ⭐ Main Next.js application (ACTIVE DEVELOPMENT)
│   ├── /src/             # Application source code
│   ├── /docs/            # All project documentation
│   ├── /supabase/        # Database migrations
│   └── package.json      # Next.js dependencies
├── /src/                 # Legacy React app (archived, not in use)
├── /docs/                # Legacy documentation (being migrated)
└── /scripts/             # Utility scripts
```

## 🏃‍♂️ Quick Start

```bash
# Navigate to the Next.js app
cd nextjs-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Or use PM2 (recommended)
npm run dev:start
```

The application will be available at `http://localhost:3000`

## 📚 Documentation

All documentation is located in `/nextjs-app/docs/`:

- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and coding standards
- **[PRD Design & Build System](./nextjs-app/docs/PRD%20Design%20%26%20Build%20System.md)** - Product vision and architecture
- **[MASTER-TASK-LIST.MD](./nextjs-app/docs/MASTER-TASK-LIST.MD)** - Current development tasks and progress
- **[STARTUP-PROMPT.md](./nextjs-app/docs/STARTUP-PROMPT.md)** - Quick context for new development sessions
- **[Deployment Guide](./nextjs-app/docs/guides/VERCEL-DEPLOYMENT-GUIDE.md)** - Production deployment instructions

## 🌐 Production

The platform is deployed on Vercel:
- **Main Application**: https://app.wondrousdigital.com
- **Customer Sites**: Custom domains via multi-tenant routing

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Data Fetching**: React Query
- **Deployment**: Vercel
- **Animation**: Framer Motion

## 🔄 Development Status

Currently in **Phase 1: Foundation** - Building the core platform architecture including:
- Core component system
- Lab environment for template creation
- Library for template management
- Theme engine with CSS variables
- Enhanced builder interface

See [MASTER-TASK-LIST.MD](./nextjs-app/docs/MASTER-TASK-LIST.MD) for detailed progress.

## ⚠️ Important Notes

1. **Active Development**: All new development happens in `/nextjs-app/`
2. **Legacy Code**: The React/Vite app in `/src/` is archived and not in active use
3. **Documentation Migration**: We're consolidating all docs into `/nextjs-app/docs/`
4. **Multi-Tenant Focus**: This is a SaaS platform, not individual site deployments

## 🤝 Contributing

When starting a new development session:
1. Review [`/nextjs-app/docs/STARTUP-PROMPT.md`](./nextjs-app/docs/STARTUP-PROMPT.md) for context
2. Check current tasks in [`/nextjs-app/docs/MASTER-TASK-LIST.MD`](./nextjs-app/docs/MASTER-TASK-LIST.MD)
3. Follow guidelines in [`CLAUDE.md`](./CLAUDE.md)

---

For detailed information about the architecture and development approach, see the [Product Requirements Document](./nextjs-app/docs/PRD%20Design%20%26%20Build%20System.md).