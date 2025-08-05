# Current State Before Next.js Migration

**Date**: January 22, 2025  
**Version**: v1.0-pre-nextjs  
**Commit**: 729d0c4

## Working Features

### Core Application
- ✅ User authentication (Supabase)
- ✅ Dashboard with project management
- ✅ Account management system
- ✅ Admin tools and panels

### PageBuilder
- ✅ Drag-and-drop section management
- ✅ Inline editing (text, buttons, images, colors)
- ✅ Multiple section types (Hero, Features, Navigation, Footer)
- ✅ Section templates with visual selector
- ✅ Global navigation settings
- ✅ Site styling system with CSS variables

### Deployment System
- ✅ Netlify integration
- ✅ Deployment queue with status tracking
- ✅ Supabase Edge Function for processing
- ✅ Static site generation
- ✅ Domain management (subdomains and custom domains)

### Templates
- ✅ Hero sections (multiple variants)
- ✅ Features sections (grid layouts)
- ✅ Navigation sections
- ✅ Footer sections

## Known Issues
1. **Next.js POC**: CSS variables not applying correctly in static generation
2. **Hydration errors**: When using dynamic styles in SSR
3. **Deployment**: Some edge cases with template rendering

## Database Schema
- Latest migrations applied up to: `20250722_100000_add_html_template_column.sql`
- All RLS policies configured
- Deployment queue with cron job active

## External Dependencies
- Supabase (database, auth, edge functions)
- Netlify (hosting, deployments)
- Tailwind CSS v3
- React 18
- Vite

## Important Context
- Main app uses Vite + React (CSR)
- Next.js POC exists in `/nextjs-poc` directory
- Decision made to migrate entire app to Next.js
- Focus on proving core PageBuilder → Preview → Deploy pipeline first

## How to Return to This Version
```bash
git checkout v1.0-pre-nextjs
```

## Next Steps
1. Create `nextjs-pagebuilder-core` branch
2. Build minimal PageBuilder in Next.js
3. Prove core functionality
4. Gradually migrate remaining features