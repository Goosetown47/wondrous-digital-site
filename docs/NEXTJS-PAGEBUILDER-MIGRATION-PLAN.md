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

## Phase 1: Core PageBuilder with Database Integration ✅
**Status**: Completed
**Goal**: Build the foundational PageBuilder with drag-and-drop and inline editing

### Completed:
- Next.js app with TypeScript, Tailwind, shadcn/ui
- Drag-and-drop section management with Framer Motion
- Inline editing capabilities
- Hero section component
- Zustand for state management
- Basic preview functionality

### Tech Stack:
- **Next.js 15** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** for state management
- **React Query** for data fetching
- **Zod** for validation
- **Framer Motion** for animations

## Phase 2: Supabase Integration & Persistence
**Goal**: Save all PageBuilder data to Supabase for multi-tenant support

### Implementation:
1. **Save sections to Supabase**
   ```typescript
   // When user edits, save to database
   await supabase.from('pages').upsert({
     project_id: projectId,
     sections: sections,
     updated_at: new Date()
   });
   ```

2. **Database Schema**
   ```sql
   projects (id, name, customer_id, created_at)
   pages (id, project_id, path, sections, metadata)
   project_domains (id, project_id, domain, is_primary, verified)
   site_styles (id, project_id, theme_config)
   ```

3. **Real-time sync**
   - Save on edit with debouncing
   - Optimistic updates with React Query
   - Conflict resolution for collaborative editing

## Phase 3: Multi-Tenant Routing System
**Goal**: Single app serves all customer sites based on domain

### Implementation:

1. **Middleware for Domain Routing**
   ```typescript
   // middleware.ts
   export async function middleware(request: NextRequest) {
     const hostname = request.headers.get('host');
     
     // Lookup project by domain
     const project = await getProjectByDomain(hostname);
     
     if (project) {
       // Rewrite to project-specific route
       return NextResponse.rewrite(
         new URL(`/sites/${project.id}${request.nextUrl.pathname}`, request.url)
       );
     }
   }
   ```

2. **Dynamic Site Rendering Route**
   ```
   /app/sites/[projectId]/[[...slug]]/page.tsx
   ```
   - Fetches project data from Supabase
   - Renders appropriate page based on slug
   - Applies project-specific styling
   - Handles 404s gracefully

3. **Development Testing**
   - Use subdomains: `project1.localhost:3000`
   - Map domains to projects in database
   - Test multiple sites from one app

## Phase 4: Production Deployment on Vercel
**Goal**: Deploy the multi-tenant platform with automatic SSL and custom domains

### Why Vercel?
- **Automatic SSL**: For all custom domains
- **Edge Network**: Global performance
- **Domain Management**: Built-in custom domain support
- **Next.js Optimization**: Best platform for Next.js apps

### Implementation:
1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

2. **Configure Domain Routing**
   - Wildcard domain: `*.wondrousdigital.com`
   - Custom domain API integration
   - Automatic SSL provisioning

3. **Customer Domain Flow**
   - Customer adds domain in settings
   - Show: "Point your domain to cname.wondrousdigital.com"
   - Verify DNS propagation
   - Enable SSL automatically

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
- [ ] Single Next.js app serves multiple projects
- [ ] Custom domains working with SSL
- [ ] Sub-second page loads globally
- [ ] 99.9% uptime for all sites
- [ ] Instant updates across all sites

## Current Status
- ✅ Core PageBuilder built and working
- ✅ Drag-and-drop with inline editing
- ✅ Basic preview functionality
- 🚧 Need to integrate Supabase persistence
- 📋 Ready to implement multi-tenant architecture

## Next Steps
1. Connect PageBuilder to save to Supabase
2. Implement domain-based routing middleware
3. Create dynamic site rendering
4. Deploy to Vercel with custom domain
5. Test with multiple projects/domains

## Long-term Vision
Build a platform that can serve millions of websites from a single, maintainable codebase - following the proven path of Webflow, Squarespace, and other successful website builders.