# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Essential Reading

**IMPORTANT**: Before making any code changes, read [`PROJECT-GUIDELINES.md`](./PROJECT-GUIDELINES.md) for comprehensive development principles, security standards, and architectural requirements. These guidelines ensure code quality, customer data protection, and platform reliability.

## Development Commands

### Development Server (PM2 Managed)
- **Start dev server**: `npm run dev:start` (runs as background daemon with PM2)
- **Stop dev server**: `npm run dev:stop`
- **Restart dev server**: `npm run dev:restart`
- **Check server status**: `npm run dev:status`
- **View server logs**: `npm run dev:logs`
- **Remove from PM2**: `npm run dev:delete`

### Legacy/Direct Commands
- **Start development server (direct)**: `npm run dev` (runs on localhost with `--host` flag)
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

**Recommended**: Use PM2 commands (`dev:start`, `dev:stop`, etc.) to prevent server shutdowns when tools timeout.

No test runner is configured - tests would need to be added.

## Application Architecture

### Core Structure
This is a React + TypeScript + Vite application with two distinct UI modes:

1. **Marketing Website** (`MarketingLayout`) - Public-facing pages with navigation/footer
2. **Dashboard Application** (`AppLayout`) - Authenticated user interface for website management

Routes are cleanly separated in `App.tsx` with marketing routes at root level and dashboard routes under `/dashboard/*`.

### Database & Styling System
- **Supabase Backend**: PostgreSQL database with real-time capabilities
- **Per-Project Styling**: Each project has customizable site styles stored in `site_styles` table
- **Dynamic CSS Variables**: Site styles are applied as CSS custom properties via `applySiteStyleVariables()` in `lib/utils.ts`
- **Button System**: Sophisticated per-button-type configuration (primary/secondary/tertiary) with individual radius, size, icon, and typography settings

### Page Builder System
The core feature is a visual page builder (`PageBuilderPage.tsx`) that allows:
- **Type-Based Drag & Drop**: Section type cards from sidebar create default sections on canvas
- **Live Editing**: In-place editing of text, buttons, images, and colors
- **Section Management**: Reordering existing sections via drag & drop
- **Enhanced Template System**: Visual template selection with preview grids

#### Section Library Redesign (2025-01-14)
- **2-Column Grid Layout**: Clean responsive grid without expanders
- **Smart Availability**: Only section types with active templates are draggable (auto-detection)
- **Visual Feedback**: Pink hover states, centered 6-dot drag icons
- **Type-to-Template Flow**: Drag section types → creates default section → settings modal for template switching

Key components:
- `SectionLibrarySidebar`: Type-based section library with active/inactive states
- `SectionTypeCard`: Individual draggable cards with hover states and icons
- `SectionTemplateGrid`: Visual grid for template selection within section settings
- `EnhancedSectionSettingsModal`: Tabbed interface (Design + Templates)
- `EditModeContext`: Controls edit state and content updates
- `SiteStylesContext`: Manages project-specific styling
- Editable components (`EditableText`, `EditableButton`, etc.) with tooltip-based editors

### UI Component System
- **Buttons**: Complex component with multiple variants (primary/secondary/tertiary/text-link) and styles (default/floating/brick/modern/offset-background/compact)
- **CSS Variables**: Buttons use CSS custom properties for theming (e.g., `--primary-button-size`, `--secondary-button-radius`)
- **Responsive Design**: Tailwind CSS with custom breakpoints and mobile-first approach

### Database Migrations
Located in `supabase/migrations/` - use MCP Supabase tools to apply:
```typescript
mcp__supabase-write__apply_migration(name, query)
```

#### Section Templates Status Management
- **Active sections**: `status = 'active'` - appear in user-facing interfaces
- **Testing sections**: `status = 'testing'` - hidden from users, for development
- **Inactive sections**: `status = 'inactive'` - archived/disabled
- Section library auto-detects active templates per type for availability

### Context Providers
Critical contexts that must wrap components requiring their functionality:
- `SiteStylesProvider`: Required for any component using button styling or site colors
- `EditModeProvider`: Required for page builder and editable components
- `ProjectContext`: Manages current project state

### Important Patterns
- **Button Styling**: Never hardcode radius/size props - let Button component read from CSS variables based on variant
- **Icon System**: Uses Lucide React with dynamic icon selection in button editor
- **State Management**: Contexts handle cross-component state, local state for UI interactions
- **Error Boundaries**: Database constraint errors may occur - check for outdated enum constraints when adding new values

### Development Notes
- Remove debug console.logs before production
- Button character limit: 21 characters max
- Section templates support customizable fields for dynamic content
- CSS variables are set on `document.documentElement` and persist across navigation

## Styling System Reference

**IMPORTANT**: For comprehensive understanding of the styling architecture, read `STYLING-ARCHITECTURE.md` first. This document covers:
- Complete styling system flow (Database → CSS Variables → React Context → Components)
- Typography scoping (project styles vs builder interface)
- Button system architecture with CSS variables
- Provider patterns for PageBuilder vs PagePreview
- Common issues and debugging steps
- Future deployment context (Netlify, multi-tenant, templates)

Key principle: Project styles should ONLY affect the website being built, never the builder interface itself.

## 📚 How-to Guides

Essential step-by-step guides for common development tasks:

- **[How to Add New Style Options](./docs/HOW-TO-ADD-STYLE-OPTIONS.md)** - Comprehensive guide for adding CSS properties (text-align, spacing, etc.) to Site Styles and PageBuilder modals. Includes complete checklist to avoid common pitfalls and follows proven patterns.

- **[How to Build New Sections](./docs/HOW-TO-BUILD-SECTIONS.md)** - Complete guide for creating new PageBuilder sections. Covers component architecture, image container patterns, database templates, staging workflow, and section library integration. Essential for scaling to 100-300+ sections efficiently.

- **[How to Use Supabase](./docs/HOW-TO-USE-SUPABASE.md)** - Complete reference for Supabase database operations. Includes connection details, CLI commands, migration management, troubleshooting, and MCP configuration. Essential when working with database schema, pushing migrations, or debugging connection issues.