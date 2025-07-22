# Next.js PageBuilder Migration Plan

## Overview
This document outlines our approach to gradually migrating the PageBuilder to Next.js, focusing on proving the core functionality first: allowing customers to build, preview, and deploy custom websites.

## Core Principle
**Prove the core first**: PageBuilder → Preview → Deploy must work flawlessly before adding any other features. If this pipeline doesn't work, nothing else matters.

## Migration Strategy: Gradual with Isolated Development
- Start in a new branch (`nextjs-pagebuilder-core`)
- Build the minimal viable pagebuilder in Next.js
- Prove the core functionality works
- Then gradually migrate other features

## Why shadcn/ui?
- **Copy-paste architecture**: We own the code, perfect for multi-tenant customization
- **CSS Variables**: Aligns with our existing theming approach
- **Next.js native**: Built for SSR/SSG, no hydration issues
- **Quality components**: Accessible, responsive, professional

## Phase 1: Setup New Next.js Project Structure
**Goal**: Create isolated Next.js environment for pagebuilder development

1. Create new branch `nextjs-pagebuilder-core`
2. Set up fresh Next.js app with:
   - TypeScript
   - Tailwind CSS
   - shadcn/ui for base components
   - Supabase client for data

## Phase 2: Build Core PageBuilder Architecture
**Goal**: Minimal pagebuilder that can create and edit one section type

### File Structure
```
/app
  /builder
    /[projectId]
      page.tsx          # 'use client' - The PageBuilder interface
  /preview
    /[projectId]
      page.tsx          # Server component - Preview rendering
  /api
    /sections
      route.ts          # CRUD for sections
    /deploy
      route.ts          # Trigger Netlify deployment

/components
  /builder
    Canvas.tsx          # Drag-drop surface
    SectionLibrary.tsx  # Available section types (just Hero)
    EditableWrapper.tsx # Makes sections editable
  /sections
    HeroSection.tsx     # First section component
  /ui                   # shadcn components
```

### Minimal First Section (Hero)
- Editable headline
- Editable subtitle  
- Editable button (with our theming)
- Background color picker

### Key Implementation Details
1. **Same component, three modes**:
   - Builder: Wrapped with `EditableWrapper` for inline editing
   - Preview: Server-rendered without edit capabilities
   - Production: Static HTML export

2. **Minimal drag-drop**:
   - Section library with just Hero section
   - Drop zone that adds section to page
   - Save to Supabase on change

3. **Inline editing** (reuse existing patterns):
   - EditableText for text content
   - Color picker for backgrounds
   - Button editor with theme integration

## Phase 3: Preview System
**Goal**: Server-side preview that shows exactly what will be deployed

1. Server component at `/preview/[projectId]`
2. Fetches page data from Supabase
3. Renders sections without edit wrappers
4. Applies project theme via CSS variables
5. No JavaScript required for basic sections

## Phase 4: Deploy to Netlify
**Goal**: One-click deploy from preview to live site

1. API route to trigger static export
2. Use Next.js static generation
3. Deploy to Netlify via API
4. Return live URL to user

## Success Criteria for Core Functionality
- [ ] Can create a hero section with editable text
- [ ] Can see live preview at `/preview/[projectId]`
- [ ] Can deploy to Netlify and access live URL
- [ ] Same component code works in all three modes
- [ ] CSS variables/theming works consistently

## Future Phases (After Core is Proven)
1. **Add more section types** (one at a time)
2. **Migrate drag-and-drop system** from existing app
3. **Add authentication** and project management
4. **Migrate dashboard** and admin features
5. **Full feature parity** with existing app

## Technical Decisions

### Why Server Components for Preview?
- True static generation
- No hydration issues
- Exactly what gets deployed
- Better performance

### Why Client Components for Builder?
- Needed for drag-drop
- Inline editing requires interactivity
- Real-time updates

### Styling Approach
- shadcn/ui components as base
- CSS variables for theming (continues our approach)
- Tailwind for utility classes
- No CSS-in-JS to avoid SSR issues

## Current Status
- Decision made to proceed with gradual migration
- Focus on core pagebuilder functionality first
- Plan created and documented
- Ready to begin implementation

## Next Steps
1. Create branch
2. Initialize Next.js with our stack
3. Build minimal Hero section
4. Implement preview
5. Deploy to Netlify