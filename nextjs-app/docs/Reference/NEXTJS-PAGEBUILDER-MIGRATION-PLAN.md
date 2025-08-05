# Next.js PageBuilder Migration Plan - Multi-Tenant Architecture

## Overview
This document outlines our approach to building a scalable, multi-tenant PageBuilder platform using Next.js. Instead of deploying individual sites for each customer, we'll use a single Next.js application that serves all customer websites through domain-based routing - the same architecture used by Webflow, Shopify, and other successful platforms.

## Core Architecture Decision
**Multi-Tenant SaaS Platform**: One Next.js app serving thousands of customer sites via custom domains, not individual deployments per customer.

## Why Multi-Tenant?
- **Industry Standard**: Webflow, Squarespace, Shopify all use this approach
- **Scalable**: Handles thousands of customers without deployment complexity
- **Cost Effective**: One infrastructure serves everyone
- **Instant Updates**: Fix a bug once, all sites benefit
- **Easier Maintenance**: One codebase to manage

## Phase 1: Core PageBuilder Foundation ✅
**Status**: COMPLETED
**Goal**: Build the foundational PageBuilder with drag-and-drop and inline editing

### Completed:
- ✅ Next.js 15 app with TypeScript, Tailwind CSS, shadcn/ui
- ✅ Drag-and-drop section library with visual cards
- ✅ Canvas for arranging sections
- ✅ Inline text editing with click-to-edit
- ✅ Hero section component with customizable content
- ✅ Zustand for local state management
- ✅ Preview page showing rendered content
- ✅ Responsive design for all screen sizes

### Tech Stack:
- **Next.js 15** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** for state management
- **React Query** for data fetching
- **Zod** for validation
- **Framer Motion** for animations

## Phase 2: Supabase Integration & Persistence ✅
**Status**: COMPLETED
**Goal**: Save all PageBuilder data to Supabase for multi-tenant support

### Completed:
- ✅ Database schema created with proper relationships
- ✅ React Query hooks for all CRUD operations
- ✅ Project management UI (create, list, settings)
- ✅ Manual save system with clear user feedback
- ✅ Multi-project support tested and working
- ✅ Page content persists between sessions

### Database Schema Created:
```sql
projects (id, name, customer_id, created_at, updated_at)
pages (id, project_id, path, title, sections, metadata, created_at, updated_at)
project_domains (id, project_id, domain, is_primary, verified, verified_at, created_at)
```

### Key Features:
- **Project Setup Page**: `/setup` for managing projects
- **Save System**: Manual save button with loading states
- **Data Persistence**: All content saved to Supabase
- **Multi-Project**: Each project has isolated content

## Phase 3: Multi-Tenant Routing System ✅
**Status**: COMPLETED
**Goal**: Single app serves all customer sites based on domain

### Completed:
- ✅ Middleware for domain-based routing
- ✅ Dynamic site rendering at `/sites/[projectId]`
- ✅ Domain management UI in project settings
- ✅ Database lookup for custom domains
- ✅ Localhost subdomain testing working
- ✅ Production-ready domain routing

### Implementation Details:

1. **Middleware (`src/middleware.ts`)**
   - Intercepts all requests
   - Checks domain against database
   - Rewrites to `/sites/[projectId]` for custom domains
   - Handles reserved domains (localhost, main app domain)

2. **Dynamic Site Route (`/app/sites/[projectId]/[[...slug]]/page.tsx`)**
   - Server-side rendered for SEO
   - Fetches page content from Supabase
   - Renders sections dynamically
   - Supports multiple pages per project

3. **Domain Management**
   - Settings page at `/project/[projectId]/settings`
   - Add/remove custom domains
   - Automatic verification (for now)
   - Instructions for DNS setup

### Tested & Working:
- ✅ `veterinary-one.localhost:3000` → Veterinarian Template
- ✅ `dentist-one.localhost:3000` → Dentist Template
- ✅ Multiple projects with separate content
- ✅ Domain-based content isolation

## Phase 4: Production Deployment on Vercel 🚧
**Status**: IN PROGRESS - Ready to deploy!
**Goal**: Deploy the multi-tenant platform with automatic SSL and custom domains

### Why Vercel?
- **Automatic SSL**: For all custom domains
- **Edge Network**: Global performance
- **Domain Management**: Built-in custom domain support
- **Next.js Optimization**: Best platform for Next.js apps

### Prerequisites:
- ✅ Vercel account created
- ✅ Next.js app working locally
- ✅ Environment variables ready
- ✅ Domain routing tested

### Deployment Steps:
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   cd nextjs-app
   vercel
   # Follow prompts to link to your Vercel account
   # Set environment variables when prompted
   ```

3. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Set Up Custom Domains**
   - Add your main domain: `nextjs-test-1.wondrousdigital.com`
   - Add wildcard domain: `*.wondrousdigital.com`
   - Vercel handles SSL automatically

5. **Customer Domain Flow**
   - Customer adds domain in project settings
   - Show DNS instructions: "CNAME to cname.vercel-dns.com"
   - Vercel provisions SSL certificate automatically
   - Domain starts working within minutes

## Phase 5: Advanced Features
**Goal**: Build on the solid multi-tenant foundation

1. **Performance Optimization**
   - ISR (Incremental Static Regeneration)
   - Edge caching strategies
   - Image optimization with Next.js Image

2. **Advanced Builder Features**
   - More section types
   - Global styles management
   - Template library
   - Version history

3. **Enterprise Features**
   - Team collaboration
   - White-label options
   - API access
   - Custom code injection

## Architecture Benefits

### Scalability
```
Single Next.js App on Vercel
├── customer1.com → Project 1
├── shop.customer1.com → Project 2
├── customer2.com → Project 3
└── ... thousands more
```

### Cost Comparison
- **Multi-tenant**: ~$20-100/month for thousands of sites
- **Individual deployments**: ~$7-20/month per site

### Performance
- **Edge rendering**: Content served from nearest location
- **Shared caching**: Popular assets cached once
- **Optimized builds**: One build serves all

## Migration Path from Current System

Your existing deployment queue system becomes valuable for:
1. **Scheduled publishing**: Queue content updates
2. **Bulk operations**: Update multiple sites
3. **Export feature**: Premium "export to Netlify" option
4. **Backup system**: Regular snapshots

## Success Metrics
- [x] Single Next.js app serves multiple projects
- [x] Custom domains working (localhost tested, SSL pending)
- [ ] Sub-second page loads globally (pending Vercel deployment)
- [ ] 99.9% uptime for all sites (pending production metrics)
- [x] Instant updates across all sites

## Current Status - July 2025
- ✅ Phase 1: Core PageBuilder complete
- ✅ Phase 2: Supabase integration complete
- ✅ Phase 3: Multi-tenant routing complete
- 🚧 Phase 4: Ready for Vercel deployment
- 📋 Phase 5: Additional features planned

## Achievements So Far
- ✅ Single Next.js app serves multiple projects
- ✅ Custom domains working with localhost testing
- ✅ Projects persist in Supabase database
- ✅ Domain-based content isolation
- ✅ Manual save system with user feedback
- ✅ Project management UI
- ✅ Domain management UI

## Next Immediate Steps
1. Deploy to Vercel using CLI
2. Configure production environment variables
3. Set up custom domain (nextjs-test-1.wondrousdigital.com)
4. Test production domain routing
5. Add wildcard domain support

## Long-term Vision
Build a platform that can serve millions of websites from a single, maintainable codebase - following the proven path of Webflow, Squarespace, and other successful website builders.