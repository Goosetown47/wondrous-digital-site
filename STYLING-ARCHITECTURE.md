# Styling Architecture Reference

This document provides a complete reference for how the styling system works in this website builder application.

## Overview

This is a **website builder application** that allows users to create custom websites with dynamic styling. The app has two distinct UI contexts:

1. **Website Builder Interface** - The dashboard/admin interface (uses its own consistent styling)
2. **Built Website Content** - The actual websites being created (uses dynamic per-project styling)

**Critical Principle**: Project styles should ONLY affect the website being built, never the builder interface itself.

## System Architecture

### High-Level Flow
```
Database (site_styles table) 
  ↓ 
applySiteStyleVariables() sets CSS custom properties
  ↓
React Context (SiteStylesProvider/CSSSiteStylesProvider) 
  ↓
Components read via useSiteStyles() hook or CSS variables
```

### Future Deployment Context
This system is designed to support a full deployment pipeline:
- **8 Project Statuses**: Draft, Template-Internal, Template-Public, Prospect Staging, Live Customer, Pause/Maintenance, Archived, Delete
- **Netlify Deployment**: Each project will deploy as a complete website to its own subdomain
- **Template Marketplace**: Template-Public projects become available for other users
- **Multi-tenant**: Each project gets its own styling, completely isolated

## Core Components

### 1. Database Layer
**Table**: `site_styles`
- Stores per-project styling configuration
- Includes colors, fonts, button styles, typography settings
- Example fields: `primary_font`, `secondary_font`, `button_style`, `primary_button_background_color`

### 2. CSS Variables Application
**Function**: `applySiteStyleVariables()` in `/src/lib/utils.ts`
- Reads database values and sets CSS custom properties on `document.documentElement`
- Smart font fallback detection (serif vs sans-serif)
- Sets variables like `--primary-font`, `--button-style`, `--primary-button-background-color`

### 3. React Context System
**Two Providers Available**:

#### `SiteStylesProvider` (Database-based)
- Fetches styles from database
- Sets CSS variables automatically
- Use in: Settings pages, anywhere that needs to modify styles

#### `CSSSiteStylesProvider` (CSS Variables Reader)
- Reads from CSS variables already applied
- Provides React context without database calls
- Use in: PageBuilder, PagePreview (after CSS variables are set)

### 4. Component Integration
**Components access styles via**:
- `useSiteStyles()` hook - Gets React context values
- CSS variables directly - `var(--primary-font)`
- Component props override context when provided

## Key Files & Locations

### Core System Files
- `/src/lib/utils.ts` - `applySiteStyleVariables()` function
- `/src/contexts/SiteStylesContext.tsx` - React context providers
- `/src/styles/variables.css` - Default CSS variable values
- `/src/styles/section-typography.css` - Typography scoped to `.website-section`

### Main Application Areas
- `/src/pages/dashboard/content/PageBuilderPage.tsx` - Page builder (wrapped with CSSSiteStylesProvider)
- `/src/pages/PagePreview.tsx` - Browser preview (wrapped with CSSSiteStylesProvider)
- `/src/pages/dashboard/content/SiteStyles.tsx` - Style settings interface

### Components
- `/src/components/ui/Button.tsx` - Complex button component with CSS variable support
- `/src/components/editable/EditableButton.tsx` - Uses useSiteStyles() hook
- `/src/components/sections/` - Website sections (HeroSplitLayout, FourFeaturesGrid, etc.)

## Typography System

### Implementation
- **Headings** (H1-H6, .text-xl+): Use `--primary-font` (Abril Fatface)
- **Body Text** (p, div, .text-base-): Use `--secondary-font` (Antic Slab)
- **Scoped Application**: Only applies within `.website-section` class

### Setup
1. Fonts loaded via Google Fonts in `index.html`
2. Section components import `/src/styles/section-typography.css`
3. Section components have `website-section` class applied

## Button System

### Architecture
- **Multi-variant**: primary, secondary, tertiary, text-link
- **Multi-style**: default, floating, brick, modern, offset-background, compact
- **Per-type Settings**: Each button type has individual radius, size, icon, typography settings

### CSS Variables Used
```css
--button-style: 'offset-background'
--primary-button-radius: 'slightly-rounded'
--primary-button-size: 'medium'
--primary-button-font-family: 'Abril Fatface, serif'
--primary-button-background-color: #FF1493
/* ... many more */
```

### Implementation Flow
1. `EditableButton` uses `useSiteStyles()` to get button_style
2. `Button` component reads CSS variables for fonts, colors, sizes
3. CSS variables override component defaults
4. Explicit props override everything

## Critical Implementation Patterns

### 1. Provider Wrapping
**PageBuilder & PagePreview Pattern**:
```tsx
return (
  <CSSSiteStylesProvider>
    {/* Page content with sections */}
    <section className="website-section">
      <EditableButton /> {/* Now has access to useSiteStyles() */}
    </section>
  </CSSSiteStylesProvider>
);
```

### 2. Typography Scoping
**Never apply globally** - only within sections:
```css
.website-section h1, .website-section h2 {
  font-family: var(--primary-font) !important;
}
```

### 3. Font Loading
Add new fonts to Google Fonts link in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Antic+Slab&display=swap" rel="stylesheet">
```

## Common Issues & Solutions

### Issue: Button styles don't work in PagePreview
**Solution**: Ensure PagePreview is wrapped with `CSSSiteStylesProvider`

### Issue: Typography affects entire app
**Solution**: Ensure typography CSS only targets `.website-section` elements

### Issue: New fonts don't load
**Solution**: Add fonts to Google Fonts link AND to `serifFonts` array in `applySiteStyleVariables()`

### Issue: Context provider missing
**Solution**: Components using `useSiteStyles()` need either `SiteStylesProvider` or `CSSSiteStylesProvider` ancestor

## Development Workflow

### To Add New Styling Features:
1. Add database fields to `site_styles` table
2. Update `applySiteStyleVariables()` to set CSS variables
3. Update `SiteStyles` interface in context
4. Add CSS variable usage to components
5. Test in both PageBuilder and PagePreview

### To Debug Styling Issues:
1. Check if CSS variables are set: Inspect element → Computed styles
2. Verify React context: Use React DevTools to check SiteStylesContext
3. Confirm provider wrapping: Ensure page has CSSSiteStylesProvider
4. Check database values: Query `site_styles` table directly

## Testing Requirements

### Before Deployment:
- [ ] PageBuilder shows correct styling
- [ ] PagePreview matches PageBuilder exactly  
- [ ] Website builder interface unaffected by project styles
- [ ] Typography scoped correctly
- [ ] All button variants work in both contexts
- [ ] CSS variables applied correctly
- [ ] React context available to components

## Future Enhancements

### Planned Features:
- **Multi-project Support**: Complete isolation between projects
- **Template System**: Reusable styling configurations
- **Advanced Typography**: More granular font controls
- **Theme Presets**: Quick styling starting points
- **Dark Mode**: Per-project dark/light theme support
- **Responsive Styling**: Breakpoint-specific overrides