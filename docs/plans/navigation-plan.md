# Navigation System Implementation Plan

## Overview
This document outlines the complete implementation plan for adding a navigation system to the Wondrous Digital PageBuilder. The system will allow users to create and manage website navigation bars and footers with full drag-and-drop support, link management, and global navigation capabilities.

## Current Status
- **Created**: 2025-01-15
- **Current Phase**: Planning Complete, Ready for Phase 1
- **Last Updated**: 2025-01-15

## Design References
- **Desktop Navigation**: https://www.figma.com/design/lpLvxuJ51nNUAZM5OWEeYv/Relume-Figma-Kit--v3.2---Community---Copy-?node-id=4172-6206
- **Mobile Navigation**: https://www.figma.com/design/lpLvxuJ51nNUAZM5OWEeYv/Relume-Figma-Kit--v3.2---Community---Copy-?node-id=4172-6222

## Instructions for New Claude Sessions

### Getting Started
1. Read this entire document first
2. Check the "Current Status" section to see which phase we're on
3. Review completed phases to understand what's already built
4. Read `/docs/HOW-TO-BUILD-SECTIONS.md` for section architecture patterns
5. Follow the established patterns from `HeroSplitLayout.tsx` and `FourFeaturesGrid.tsx`

### Key Files to Review
- `/src/pages/dashboard/content/PageBuilderPage.tsx` - Main page builder
- `/src/components/sections/` - Existing section components
- `/src/components/editable/` - Editable component patterns
- `/src/contexts/EditModeContext.tsx` - Edit mode management
- `/docs/HOW-TO-BUILD-SECTIONS.md` - Section building guide

### Testing Approach
- Complete each phase fully before moving to the next
- Test in both edit mode and preview mode
- Verify mobile responsiveness
- Check data persistence after page refresh

---

## Phase 1: Database Schema Updates

### 1.1 Create Navigation Storage
Add columns to the `projects` table to store global navigation references:

```sql
-- Migration: Add global navigation references to projects
ALTER TABLE projects 
ADD COLUMN global_nav_section_id uuid,
ADD COLUMN global_footer_section_id uuid;

-- Add comments for clarity
COMMENT ON COLUMN projects.global_nav_section_id IS 'References the section used as global navigation';
COMMENT ON COLUMN projects.global_footer_section_id IS 'References the section used as global footer';
```

### 1.2 Create Navigation Links Table
This table stores all navigation links with support for hierarchical structure:

```sql
CREATE TABLE navigation_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL, -- References the section containing this navigation
  parent_link_id uuid REFERENCES navigation_links(id) ON DELETE CASCADE,
  link_type VARCHAR NOT NULL CHECK (link_type IN ('page', 'external', 'dropdown')),
  link_text VARCHAR NOT NULL,
  link_url VARCHAR, -- For external links
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE, -- For internal page links
  external_new_tab BOOLEAN DEFAULT false,
  show_external_icon BOOLEAN DEFAULT false,
  external_icon_color VARCHAR DEFAULT '#666666',
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX navigation_links_section_id_idx ON navigation_links(section_id);
CREATE INDEX navigation_links_parent_link_id_idx ON navigation_links(parent_link_id);
CREATE INDEX navigation_links_position_idx ON navigation_links(position);

-- Create trigger for updated_at
CREATE TRIGGER update_navigation_links_updated_at
BEFORE UPDATE ON navigation_links
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 1.3 Update Section Templates
Add navigation section templates to the database:

```sql
-- Desktop Navigation Template
INSERT INTO section_templates (
  section_type, 
  template_name, 
  preview_image_url, 
  customizable_fields, 
  category, 
  status
) VALUES (
  'navigation-desktop',
  'Standard Navigation',
  '/previews/nav-desktop-standard.jpg',
  '{
    "logo": {"type": "image", "src": "", "alt": "Logo", "text": ""},
    "backgroundColor": "#FFFFFF",
    "textColor": "#000000",
    "ctaButton": {
      "text": "Get Started",
      "href": "#",
      "variant": "primary"
    }
  }',
  'navigation',
  'testing' -- Start in testing mode
);

-- Mobile Navigation Template
INSERT INTO section_templates (
  section_type, 
  template_name, 
  preview_image_url, 
  customizable_fields, 
  category, 
  status
) VALUES (
  'navigation-mobile',
  'Mobile Navigation',
  '/previews/nav-mobile-standard.jpg',
  '{
    "logo": {"type": "image", "src": "", "alt": "Logo", "text": ""},
    "backgroundColor": "#FFFFFF",
    "hamburgerColor": "#000000"
  }',
  'navigation',
  'testing'
);

-- Footer Template
INSERT INTO section_templates (
  section_type, 
  template_name, 
  preview_image_url, 
  customizable_fields, 
  category, 
  status
) VALUES (
  'footer',
  'Multi-Column Footer',
  '/previews/footer-multi-column.jpg',
  '{
    "logo": {"type": "image", "src": "", "alt": "Logo", "text": ""},
    "backgroundColor": "#1F0943",
    "textColor": "#FFFFFF",
    "copyrightText": "© 2024 Your Company. All rights reserved."
  }',
  'navigation',
  'testing'
);
```

---

## Phase 2: Navigation Section Components

### 2.1 NavigationDesktop Component (`/src/components/sections/NavigationDesktop.tsx`)

Key Features:
- Full-width background with contained content (max-width 1280px)
- Logo on the left (image or text)
- Horizontal navigation links in center
- CTA button on the right
- Dropdown support for multi-level navigation
- Fixed positioning with proper z-index

Structure:
```typescript
interface NavigationDesktopProps {
  content: {
    logo?: {
      type?: 'image' | 'text';
      src?: string;
      alt?: string;
      text?: string;
    };
    backgroundColor?: string;
    textColor?: string;
    ctaButton?: {
      text?: string;
      href?: string;
      variant?: ButtonVariant;
      icon?: string;
    };
  };
  navigationLinks?: NavigationLink[];
  isGlobal?: boolean;
  isMobilePreview?: boolean;
}
```

### 2.2 NavigationMobile Component (`/src/components/sections/NavigationMobile.tsx`)

Key Features:
- Hamburger menu icon
- Slide-out or overlay menu
- Logo in center or left
- Vertical link layout in menu
- Smooth animations

### 2.3 FooterNavigation Component (`/src/components/sections/FooterNavigation.tsx`)

Key Features:
- Multi-column layout (responsive grid)
- Column headers with vertical link lists
- Logo and description area
- Social media links
- Copyright text
- Newsletter signup (optional)

---

## Phase 3: New Editable Components

### 3.1 EditableNavLink Component (`/src/components/editable/EditableNavLink.tsx`)

Features:
- Renders individual navigation link
- Shows hover state in edit mode
- Click to open link configuration modal
- Supports dropdown parent links
- Handles active state based on current page

### 3.2 EditableNavPlus Component (`/src/components/editable/EditableNavPlus.tsx`)

Features:
- Circular plus icon with background
- Only visible in edit mode
- Positioned inline with navigation flow
- Opens LinkConfigModal on click
- Different styles for horizontal vs vertical layouts

### 3.3 EditableLogo Component (`/src/components/editable/EditableLogo.tsx`)

Features:
- Supports both image and text logos
- Image upload on click (in edit mode)
- Text editing inline
- Auto-sizing to fit container
- Link configuration

---

## Phase 4: Link Configuration Modal

### 4.1 LinkConfigModal Component (`/src/components/admin/LinkConfigModal.tsx`)

Three-tab interface:

**Tab 1: Link to Page**
- Dropdown of all pages in project
- Search functionality
- Shows page path/slug
- Auto-fills link text with page name

**Tab 2: External Link**
- URL input field
- Link text input
- "Open in new tab" toggle
- "Show external icon" toggle
- Icon color picker
- URL validation

**Tab 3: Create New Page**
- Page name input
- Auto-generated slug (editable)
- Page type selection
- Creates page and links to it

Common Features:
- Link text override
- Delete link button
- Save/Cancel actions
- Real-time preview

---

## Phase 5: PageBuilder Integration

### 5.1 Update PageBuilderPage.tsx

Add to `renderSection` method:
```typescript
case 'navigation-desktop':
  return (
    <NavigationDesktop
      content={/* ... */}
      navigationLinks={/* fetch from navigation_links table */}
      isGlobal={section.id === project.global_nav_section_id}
      isMobilePreview={mobileView}
    />
  );

case 'navigation-mobile':
  return (
    <NavigationMobile
      content={/* ... */}
      navigationLinks={/* fetch from navigation_links table */}
      isGlobal={section.id === project.global_nav_section_id}
      isMobilePreview={mobileView}
    />
  );

case 'footer':
  return (
    <FooterNavigation
      content={/* ... */}
      navigationLinks={/* fetch from navigation_links table */}
      isGlobal={section.id === project.global_footer_section_id}
      isMobilePreview={mobileView}
    />
  );
```

### 5.2 Global Navigation Logic

- Fetch global nav/footer sections separately
- Display at top/bottom of page sections
- Prevent deletion of global sections
- Special styling to indicate global status

---

## Phase 6: Navigation Management System

### 6.1 NavigationContext (`/src/contexts/NavigationContext.tsx`)

Manages:
- CRUD operations for navigation links
- Link reordering
- Hierarchy management
- Real-time updates
- Sync with database

### 6.2 Link Management Features

- Drag & drop reordering (using react-beautiful-dnd)
- Multi-level dropdown support
- Link validation
- Bulk operations
- Import/export links

---

## Phase 7: Global Navigation Settings

### 7.1 Project Settings Integration

Add to Site Settings:
- "Global Navigation" section
- Dropdown to select navigation section
- Dropdown to select footer section
- Preview of selected sections

### 7.2 Section Settings Integration

Add to EnhancedSectionSettingsModal:
- "Use as global navigation" checkbox
- "Use as global footer" checkbox
- Warning when changing global sections

---

## Implementation Checklist

### Phase 1: Database ✅
- [x] Create and run migration for projects table
- [x] Create and run migration for navigation_links table
- [x] Insert navigation section templates
- [x] Test migrations with rollback

### Phase 2: Components ✅
- [x] Build NavigationDesktop component
- [x] Build NavigationMobile component (integrated into NavigationDesktop)
- [ ] Build FooterNavigation component
- [x] Test responsive behavior

### Phase 3: Editable Components ✅
- [x] Build EditableNavLink
- [x] Build EditableNavPlus
- [x] Build EditableLogo
- [x] Test edit mode interactions

### Phase 4: Link Modal
- [ ] Build LinkConfigModal
- [ ] Implement page linking
- [ ] Implement external linking
- [ ] Implement page creation
- [ ] Test all link types

### Phase 5: Integration
- [ ] Update PageBuilderPage renderSection
- [ ] Add to section library
- [ ] Implement global nav logic
- [ ] Test drag & drop

### Phase 6: Management
- [ ] Build NavigationContext
- [ ] Implement link CRUD
- [ ] Add drag & drop reordering
- [ ] Test data persistence

### Phase 7: Settings
- [ ] Add to project settings
- [ ] Add to section settings
- [ ] Test global navigation
- [ ] Final testing

---

## Technical Considerations

### Security
- Sanitize all link text to prevent XSS
- Validate URLs before saving
- Check permissions for page access
- Rate limit link creation

### Performance
- Lazy load navigation data
- Cache navigation structure
- Optimize link queries
- Use indexes effectively

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Mobile-First
- Touch-friendly hit targets (min 44px)
- Smooth animations
- Gesture support
- Responsive breakpoints

---

## Testing Plan

### Unit Tests
- Component rendering
- Link CRUD operations
- Modal interactions
- Context state management

### Integration Tests
- Navigation + PageBuilder
- Global navigation display
- Link persistence
- Multi-page navigation

### E2E Tests
- Complete navigation setup flow
- Link management workflow
- Mobile navigation interaction
- Global navigation across pages

---

## Success Metrics

1. **Usability**: Users can add navigation in < 2 minutes
2. **Performance**: Navigation renders in < 100ms
3. **Reliability**: Zero data loss on link updates
4. **Flexibility**: Support 3+ level deep navigation
5. **Mobile**: Perfect experience on all devices

---

## Notes for Implementation

- Follow patterns from existing sections (HeroSplitLayout, etc.)
- Use established Editable components patterns
- Maintain consistent spacing and styling
- Test each phase thoroughly before proceeding
- Document any deviations from plan

---

## Current Implementation Status

### Completed
- ✅ Planning and documentation
- ✅ Phase 1: Database migrations
  - Added `global_nav_section_id` and `global_footer_section_id` to projects table
  - Created `navigation_links` table with full schema
  - Added navigation section templates (desktop, mobile, footer)
  - Implemented RLS policies for navigation_links
- ✅ Phase 2: NavigationDesktop component
  - Created NavigationDesktop.tsx with responsive design
  - Supports both desktop and mobile layouts
  - Mock navigation links for staging
  - Added to PageBuilderPage renderSection
  - Added to StagingPage for testing
  - Fixed mobile view in staging with EditModeProvider
  - Reduced padding from 6rem to 1rem
  - Made logo clickable with configurable href
- ✅ Phase 3: Editable Components
  - Created EditableNavLink with hover states and dropdown support
  - Created EditableNavPlus for adding links (horizontal & vertical layouts)
  - Created EditableLogo supporting image/text switching
  - Integrated all components into NavigationDesktop
  - Components only appear in edit mode as designed
- ✅ Section Library Integration
  - Added 'navigation' to SECTION_TYPES dropdown
  - Published NavigationDesktop to section library
  - Set section status to 'active'

### In Progress
- Phase 4: Build LinkConfigModal

### Upcoming
- Phase 5: Complete navigation integration
- Phase 6: Navigation Management System
- Phase 7: Global Navigation Settings

### Design Details from Figma
Based on the provided navigation design:
- **Desktop**: Logo left, horizontal nav center, dropdown support, 2 CTA buttons right
- **Mobile**: Logo left, hamburger right, full-screen overlay menu, vertical nav items, expandable dropdowns

---

Last updated: 2025-01-15 (Updated progress after publishing NavigationDesktop to section library)