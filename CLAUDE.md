# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on localhost with `--host` flag)
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

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
- **Drag & Drop**: Section templates from sidebar library to canvas
- **Live Editing**: In-place editing of text, buttons, images, and colors
- **Section Management**: Reordering existing sections via drag & drop
- **Template System**: Reusable section templates stored in database

Key components:
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