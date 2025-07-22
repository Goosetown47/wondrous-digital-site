# How to Build New Sections for PageBuilder

This comprehensive guide ensures we can efficiently create new sections for our page builder system. Follow these patterns exactly to maintain consistency and enable rapid scaling to 100-300+ sections.

## Overview

Our page builder uses a **type-based drag & drop system** where:
1. **Section Types** are draggable cards in the sidebar
2. **Section Templates** are variations of each type with different layouts/styles
3. **Section Components** render the actual content on the page
4. **Staging System** allows testing before publishing
5. **Database Templates** store configuration when admin publishes

## Development Workflow

1. **Create** the component in `/src/components/sections/`
2. **Add to Staging** in `StagingPage.tsx` for testing
3. **Integrate** with PageBuilder in `renderSection` method
4. **Test** in staging area (Admin > Staging)
5. **Use** the unpublished section (appears grayed out in library)
6. **Publish** manually by admin when ready (adds to database)

---

## Section Architecture Pattern

### Required Components for Each Section Type:

1. **React Component** (`/src/components/sections/[SectionName].tsx`)
2. **Staging Integration** (add to StagingPage.tsx)
3. **PageBuilder Integration** (add to renderSection method)
4. **Manual Publishing** (admin adds to `section_templates` table when ready)

---

## Step 1: Create the Section Component

### File Location:
```
/src/components/sections/[SectionName].tsx
```

### Container Architecture:
Our sections use a **full-width architecture** where:
- **Section container** (`<section>`) spans full browser width for backgrounds
- **Content container** (`.section-content-container`) constrains content to max-width 1280px with responsive padding
- **PageBuilder** keeps sections contained for editing usability
- **PagePreview & Production** display full-width sections with proper backgrounds

### Component Structure Template:
```typescript
import React from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditableText from '../editable/EditableText';
import EditableImage from '../editable/EditableImage';
import EditableButton from '../editable/EditableButton';
import EditableIcon from '../editable/EditableIcon';
import '../../styles/section-typography.css';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface [SectionName]Props {
  content: {
    // Text elements - ALWAYS include color and lineHeight
    headline?: {
      text?: string;
      color?: string;
      lineHeight?: string;
    };
    description?: {
      text?: string;
      color?: string;
      lineHeight?: string;
    };
    
    // Button elements - ALWAYS include variant and icon
    primaryButton?: {
      text?: string;
      href?: string;
      variant?: ButtonVariant;
      icon?: string;
    };
    
    // Image elements - ALWAYS include ALL image properties
    heroImage?: {
      src?: string;
      alt?: string;
      imageScaling?: string;
      containerMode?: 'section-height' | 'fixed-shape';
      containerAspectRatio?: string;
      containerSize?: 'small' | 'medium' | 'large';
    };
    
    // Icon elements
    featureIcon?: {
      icon?: string;
      size?: number;
      color?: string;
    };
    
    // Section styling
    backgroundColor?: string;
  };
  isMobilePreview?: boolean;
}

const [SectionName]: React.FC<[SectionName]Props> = ({
  content = {
    // ALWAYS provide complete default values
    headline: {
      text: "Default headline text",
      color: "#000000"
    },
    description: {
      text: "Default description text",
      color: "#6B7280"
    },
    primaryButton: {
      text: "Button",
      href: "#",
      variant: "primary"
    },
    heroImage: {
      src: "",
      alt: "Hero image"
    },
    backgroundColor: "#FFFFFF"
  },
  isMobilePreview = false
}) => {
  const { editMode, isMobilePreview: contextMobilePreview } = useEditMode();
  
  // Use contextMobilePreview if available, fallback to prop
  const isActuallyMobile = contextMobilePreview !== undefined ? contextMobilePreview : isMobilePreview;

  // Section styling with CSS variables
  const sectionStyle: React.CSSProperties = {
    backgroundColor: content.backgroundColor || '#FFFFFF'
  };

  return (
    <section className="w-full website-section" style={sectionStyle}>
      <div className="section-content-container">
        {/* Responsive layout wrapper */}
        <div className={`${isActuallyMobile ? 'flex flex-col space-y-8' : 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'}`}>
          
          {/* Content Column */}
          <div className="section-content-cell space-y-6">
            <EditableText
              fieldName="headline"
              defaultValue={content.headline?.text || "Default headline"}
              as="h2"
              className="text-4xl font-bold"
              color={content.headline?.color}
              lineHeight={content.headline?.lineHeight}
            />
            
            <EditableText
              fieldName="description"
              defaultValue={content.description?.text || "Default description"}
              as="p"
              className="text-lg"
              color={content.description?.color}
              lineHeight={content.description?.lineHeight}
            />
            
            <EditableButton
              fieldName="primaryButton"
              text={content.primaryButton?.text || "Button"}
              href={content.primaryButton?.href || "#"}
              variant={content.primaryButton?.variant || "primary"}
              icon={content.primaryButton?.icon}
              className="inline-block"
            />
          </div>
          
          {/* Image Column */}
          <div className="section-image-cell w-full">
            <EditableImage
              fieldName="heroImage"
              src={content.heroImage?.src || ''}
              alt={content.heroImage?.alt || 'Section image'}
              imageScaling={content.heroImage?.imageScaling}
              containerMode={content.heroImage?.containerMode || 'section-height'}
              containerAspectRatio={content.heroImage?.containerAspectRatio}
              containerSize={content.heroImage?.containerSize}
              className="w-full h-64 lg:h-80"
            />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default [SectionName];
```

---

## Step 2: Container Architecture Guidelines

### 📦 **Section Content Container**

All sections MUST use the standardized `.section-content-container` CSS class:

```css
.section-content-container {
  max-width: 1280px;           /* Consistent content width */
  margin: 0 auto;              /* Center content */
  /* No padding - cells handle their own padding */
}
```

### 📋 **Cell Padding Classes**

Use specific classes for different types of content cells:

**Content Cell** - For text/button content that needs padding:
```css
.section-content-cell {
  padding: 4rem 1.5rem;        /* Mobile: py-16 px-6 */
}

/* Responsive padding */
@media (min-width: 768px) {
  .section-content-cell {
    padding: 6rem 2rem;         /* Tablet: py-24 px-8 */
  }
}

@media (min-width: 1024px) {
  .section-content-cell {
    padding: 6rem 3rem;         /* Desktop: py-24 px-12 */
  }
}
```

**Image Cell** - For images that should extend to edges:
```css
.section-image-cell {
  padding: 0;                  /* No padding for full-height images */
}
```

### 🎨 **Full-Width Background Benefits**
- Background colors span entire browser width
- Background gradients and images fill full viewport
- Professional appearance with no visual gaps
- Content remains properly contained and readable

---

## Step 3: Image Architecture Guidelines

### 🖼️ **Image Implementation Rules**

#### **ALWAYS include ALL image properties:**
```typescript
heroImage?: {
  src?: string;                    // Image URL
  alt?: string;                    // Accessibility text
  imageScaling?: string;           // fill-height, fit-image, center-crop, auto-height
  containerMode?: 'section-height' | 'fixed-shape';  // Container behavior
  containerAspectRatio?: string;   // 16:9, 4:3, 3:2, 1:1, 9:16
  containerSize?: 'small' | 'medium' | 'large';      // Container size for fixed-shape
};
```

#### **EditableImage Usage Pattern:**
```tsx
<EditableImage
  fieldName="heroImage"
  src={content.heroImage?.src || ''}
  alt={content.heroImage?.alt || 'Descriptive alt text'}
  imageScaling={content.heroImage?.imageScaling}
  containerMode={content.heroImage?.containerMode || 'section-height'}
  containerAspectRatio={content.heroImage?.containerAspectRatio}
  containerSize={content.heroImage?.containerSize}
  className="w-full h-64" // Set minimum dimensions
/>
```

#### **Container Architecture:**
- **Section Height Mode**: Image fills available section space, adapts to content
- **Fixed Shape Mode**: Image uses specific dimensions (e.g., 480x270 for 16:9 medium)
- **Never use hardcoded containers** - let EditableImage handle container logic
- **Always provide fallback className** for minimum dimensions

#### **Image Column Patterns:**
```tsx
{/* For section-height images - use section-image-cell for no padding */}
<div className="section-image-cell w-full min-h-[400px] flex items-center justify-center">
  <EditableImage ... />
</div>

{/* For auto-sizing images - use section-image-cell for edge-to-edge */}
<div className="section-image-cell w-full">
  <EditableImage ... />
</div>

{/* For content that needs padding - use section-content-cell */}
<div className="section-content-cell w-full">
  <EditableText ... />
  <EditableButton ... />
</div>
```

---

## Step 4: Text and Button Guidelines

### 📝 **Text Elements - ALWAYS include:**
```typescript
headline?: {
  text?: string;      // The content
  color?: string;     // Individual color override
  lineHeight?: string; // Individual line height override
};
```

### 🔘 **Button Elements - ALWAYS include:**
```typescript
primaryButton?: {
  text?: string;                              // Button text
  href?: string;                              // Link destination
  variant?: 'primary' | 'secondary' | 'tertiary'; // Button style variant
  icon?: string;                              // Lucide icon name
};
```

### 🎯 **Icon Elements:**
```typescript
featureIcon?: {
  icon?: string;   // Lucide icon name
  size?: number;   // Icon size in pixels
  color?: string;  // Icon color
};
```

---

## Step 5: PageBuilder Integration

### Add to PageBuilderPage.tsx renderSection method:

```typescript
// In /src/pages/dashboard/content/PageBuilderPage.tsx
case '[section-type]':
  return (
    <[SectionName]
      content={{
        headline: {
          text: section.content?.headline?.text || "Default headline",
          color: section.content?.headline?.color,
          lineHeight: section.content?.headline?.lineHeight
        },
        description: {
          text: section.content?.description?.text || "Default description",
          color: section.content?.description?.color,
          lineHeight: section.content?.description?.lineHeight
        },
        primaryButton: {
          text: section.content?.primaryButton?.text || "Button",
          href: section.content?.primaryButton?.href || "#",
          variant: section.content?.primaryButton?.variant || "primary",
          icon: section.content?.primaryButton?.icon
        },
        heroImage: {
          src: section.content?.heroImage?.src || "",
          alt: section.content?.heroImage?.alt || "Section image",
          imageScaling: section.content?.heroImage?.imageScaling,
          containerMode: section.content?.heroImage?.containerMode,
          containerAspectRatio: section.content?.heroImage?.containerAspectRatio,
          containerSize: section.content?.heroImage?.containerSize
        },
        backgroundColor: section.content?.backgroundColor || "#FFFFFF"
      }}
      isMobilePreview={mobileView}
    />
  );
```

**⚠️ CRITICAL**: This data flow step was the root cause of 2+ hour debugging sessions. Every property must be passed through.

---

## Step 6: Staging and Publishing Process

### Development Workflow:
1. **Create Component**: Build new section in `/src/components/sections/`
2. **Automatic Staging**: System detects unpublished components and shows them in staging area
3. **Test in Staging**: Use and refine the component
4. **Manual Publishing**: Admin manually adds to `section_templates` table when ready

### Section Templates Table Structure:
```sql
CREATE TABLE section_templates (
  id SERIAL PRIMARY KEY,
  section_type VARCHAR NOT NULL,     -- e.g., 'hero', 'features', 'testimonials'
  template_name VARCHAR NOT NULL,    -- e.g., 'Split Layout', 'Centered', 'Cards'
  preview_image_url TEXT,            -- Preview image for template selection
  customizable_fields JSONB,         -- Field configuration
  category VARCHAR,                  -- e.g., 'hero', 'content', 'social-proof'
  status VARCHAR DEFAULT 'active'    -- 'active', 'inactive'
);
```

### Publishing Process:
**DO NOT add database entries during development!** Sections are automatically detected in staging.

When ready to publish (manual admin process):
```sql
-- Admin manually publishes section after testing
INSERT INTO section_templates (
  section_type, 
  template_name, 
  preview_image_url, 
  customizable_fields, 
  category, 
  status
) VALUES (
  'new-section-type',
  'Default Layout',
  '/path/to/preview.jpg',
  '{"headline": {"text": "Default headline"}, "description": {"text": "Default description"}}',
  'content',
  'active' -- Published sections are 'active'
);
```

---

## Step 7: Section Library Integration

### Add Section Type to SectionTypeCard:
```typescript
// In /src/components/admin/SectionTypeCard.tsx or related file
export interface SectionType {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'hero' | 'content' | 'social-proof' | 'contact';
}

// Add your new section type:
{
  id: 'new-section-type',
  name: 'New Section',
  description: 'Description of what this section does',
  icon: LayoutIcon, // Choose appropriate Lucide icon
  category: 'content'
}
```

### Add to Staging System:
When creating a new section, you MUST add it to the staging system:

**File**: `/src/pages/admin/StagingPage.tsx`

1. Import your component:
```typescript
import NavigationDesktop from '../../components/sections/NavigationDesktop';
```

2. Add to `scanSectionsFolder` function:
```typescript
{
  name: 'NavigationDesktop',
  path: '/src/components/sections/NavigationDesktop.tsx',
  lastModified: new Date().toISOString(),
  component: NavigationDesktop
}
```

3. Add component-specific props in `renderSectionComponent`:
```typescript
if (currentSection.name === 'NavigationDesktop') {
  componentProps.content = {
    // Your component's default props
  };
}
```

### Section Library Behavior:
- **Unpublished sections** appear grayed out (inactive) in the section library
- Users can still drag and test unpublished sections
- The library automatically detects active templates from the database
- No manual configuration needed for the library itself

---

## Step 8: Responsive Design Patterns

### Mobile-First Approach:
```tsx
// Always use this pattern for responsive layouts
<div className={`${isActuallyMobile ? 'flex flex-col space-y-8' : 'grid grid-cols-1 lg:grid-cols-2 gap-12'}`}>
```

### Common Responsive Patterns:
```tsx
// Two-column to single-column
className={`${isActuallyMobile ? 'flex flex-col' : 'grid grid-cols-2'}`}

// Grid layouts
className={`grid ${isActuallyMobile ? 'grid-cols-1 gap-6' : 'grid-cols-3 gap-8'}`}

// Flexbox layouts
className={`flex ${isActuallyMobile ? 'flex-col space-y-4' : 'flex-row space-x-8'}`}
```

---

## Step 9: Testing Checklist

### ✅ **Staging Testing:**
1. Section appears in Admin > Staging area
2. Preview works in both desktop and mobile viewports
3. Component renders with default props correctly
4. No console errors in staging preview

### ✅ **Component Testing:**
1. Component renders without errors
2. All default values display correctly
3. EditableText, EditableButton, EditableImage work in edit mode
4. Mobile and desktop layouts look correct
5. All props flow through properly

### ✅ **PageBuilder Integration Testing:**
1. Section appears in library as inactive (grayed out)
2. Can still drag inactive section to canvas for testing
3. Drag and drop creates section successfully
4. Content updates save and persist
5. Section settings modal works
6. After publishing: Section appears as active in library

### ✅ **Image Testing (Critical):**
1. Test all 4 image scaling modes: fill-height, fit-image, center-crop, auto-height
2. Test both container modes: section-height, fixed-shape
3. Test all aspect ratios in fixed-shape mode
4. Verify no gray background issues
5. Check mobile responsiveness

### ✅ **Data Flow Testing:**
1. Change text in modal → saves → persists after page refresh
2. Change button settings → saves → persists
3. Change image → saves → persists
4. Change image scaling/container → saves → persists

---

## Common Patterns and Templates

### Hero Sections:
- Large headline, description, 1-2 buttons, hero image
- Usually 2-column layout (content + image)
- Background color customization

### Feature Sections:
- Grid of 2-6 features with icons/images
- Headline, description, feature cards
- Icon or image per feature

### Testimonial Sections:
- Customer quotes, names, photos
- Star ratings, company logos
- Usually 1-3 testimonials per section

### CTA (Call-to-Action) Sections:
- Focused headline, description, primary button
- Often centered layout
- Strong background colors or gradients

---

## File Structure Summary

```
/src/components/sections/
├── [SectionName].tsx          # Main component
├── HeroSplitLayout.tsx        # Example reference
└── FourFeaturesGrid.tsx       # Example reference

/src/pages/
├── admin/
│   └── StagingPage.tsx        # Add component for staging preview
└── dashboard/content/
    └── PageBuilderPage.tsx    # Add to renderSection method

/docs/
├── HOW-TO-BUILD-SECTIONS.md   # This guide
└── HOW-TO-ADD-STYLE-OPTIONS.md # Style customization guide

Database:
└── section_templates table    # Template storage (populated on publish)
```

---

## Quick Reference for New Claude Chats

### Essential Implementation Steps:
1. **Create component** following exact interface pattern
2. **Include ALL properties** for text (color, lineHeight), images (6 properties), buttons (variant, icon)
3. **Use EditableImage properly** with container architecture
4. **Add to PageBuilder renderSection** with complete data flow
5. **Test in both edit and preview modes**
6. **Verify mobile responsiveness**

### Critical Don'ts:
- ❌ Don't hardcode image containers (let EditableImage handle it)
- ❌ Don't forget lineHeight/color properties on text elements
- ❌ Don't skip the PageBuilder integration step
- ❌ Don't use !important CSS on properties that need individual overrides
- ❌ Don't forget to test all image scaling modes

### Success Pattern:
Follow HeroSplitLayout.tsx as the gold standard - it demonstrates all patterns correctly and has been thoroughly tested.

---

## Navigation Sections Guide

Navigation sections are a special category that includes navbars, footers, and other navigation components. Understanding the architecture is crucial for building new navigation sections.

### Key Concepts for Navigation

#### Section Type vs Components:
- **Section Type**: "navigation" - This is what users drag from the sidebar
- **Section Components**: Individual navigation designs (NavigationDesktop, NavigationMinimal, FooterSimple, etc.)
- **Template System**: Users select which navigation component to use via Settings → Templates tab
- **Global Usage**: ANY navigation section can be set as either global navbar OR global footer

#### Architecture Overview:
1. **Single Section Type**: All navigation components use section type "navigation"
2. **Multiple Components**: Each visual design is a separate .tsx file in `/src/components/sections/`
3. **Database Storage**: The selected component is stored in `section_type` (e.g., 'navigation-desktop')
4. **Flexible Usage**: A "footer-style" component can be used as a navbar and vice versa

### Navigation Section Architecture

#### Core Features:
1. **Database-driven links** with parent-child relationships
2. **Drag & drop reordering** with smooth animations  
3. **Link configuration** via tooltip editor
4. **Global navigation settings** (navbar/footer designation)
5. **Responsive mobile menu** with hamburger
6. **Dropdown support** with sub-navigation
7. **Multi-page navigation** when used globally

#### Required Props Interface:
```typescript
interface NavigationSectionProps {
  sectionId?: string; // CRITICAL: Required for database link management
  content: {
    // Logo configuration
    logo?: {
      type?: 'image' | 'text';
      src?: string;
      alt?: string;
      text?: string;
      href?: string;
    };
    
    // Styling
    backgroundColor?: string;
    textColor?: string;
    
    // CTA Buttons (optional)
    ctaButton1?: {
      text?: string;
      href?: string;
      variant?: ButtonVariant;
      icon?: string;
    };
    ctaButton2?: {
      text?: string;
      href?: string;
      variant?: ButtonVariant;
      icon?: string;
    };
  };
  navigationLinks?: NavigationLink[]; // Optional fallback links
  isGlobal?: boolean; // Whether this is a global nav/footer
  isMobilePreview?: boolean;
}
```

#### Navigation Link Database Schema:
```sql
CREATE TABLE navigation_links (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES sections(id),
  link_text VARCHAR NOT NULL,
  link_type VARCHAR CHECK (link_type IN ('page', 'external', 'dropdown')),
  link_url VARCHAR,
  page_id UUID REFERENCES pages(id),
  parent_link_id UUID REFERENCES navigation_links(id),
  position INTEGER DEFAULT 0,
  external_new_tab BOOLEAN DEFAULT false,
  show_external_icon BOOLEAN DEFAULT true,
  external_icon_color VARCHAR,
  dropdown_behavior VARCHAR CHECK (dropdown_behavior IN ('link', 'passthrough'))
);
```

### Implementation Steps for New Navigation Sections

#### 1. Create the Navigation Component:

```typescript
import React, { useState, useEffect } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import { useNavigationLinks, NavigationLink } from '../../hooks/useNavigationLinks';
import EditableNavLink from '../editable/EditableNavLink';
import EditableNavLinkSlot from '../editable/EditableNavLinkSlot';
import LinkConfigTooltip from '../editable/LinkConfigTooltip';
import EditableLogo from '../editable/EditableLogo';
import DraggableNavLink from '../navigation/DraggableNavLink';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  defaultDropAnimation,
  pointerWithin,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import '../../styles/drag-drop.css';

const NavigationFooter: React.FC<NavigationSectionProps> = ({
  sectionId,
  content = { /* defaults */ },
  navigationLinks = [],
  isGlobal = false,
  isMobilePreview = false
}) => {
  // Essential state management
  const { editMode } = useEditMode();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Link tooltip state
  const [isLinkTooltipOpen, setIsLinkTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  
  // Use navigation links hook for database integration
  const { 
    links: dbLinks, 
    loading: linksLoading, 
    createNavigationLink, 
    updateNavigationLink, 
    deleteNavigationLink, 
    reorderNavigationLinks 
  } = useNavigationLinks(sectionId);
  
  // DnD sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // ... implement drag handlers, link management, etc.
};
```

#### 2. Key Implementation Patterns:

**Link Management:**
```typescript
const handleAddLink = (slotIndex: number, parentId?: string, event?: React.MouseEvent) => {
  // Position tooltip near the clicked element
  if (event) {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left, y: rect.bottom + 5 });
  }
  
  setEditingSlotIndex(slotIndex);
  setEditingParentId(parentId || null);
  setEditingLinkId(null);
  setIsLinkTooltipOpen(true);
};

const handleSaveLink = async (linkData: Partial<NavigationLink>) => {
  if (!sectionId) {
    console.error('Cannot save link: sectionId is missing');
    return;
  }
  
  if (editingLinkId) {
    await updateNavigationLink(editingLinkId, linkData);
  } else {
    await createNavigationLink({
      ...linkData,
      section_id: sectionId,
      position: editingSlotIndex,
      parent_link_id: editingParentId || null,
    });
  }
};
```

**Drag & Drop Configuration:**
```typescript
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (over && active.id !== over.id) {
    // Reorder logic for parent and child links
    const activeLink = findLinkById(displayLinks, active.id as string);
    const overLink = findLinkById(displayLinks, over.id as string);
    
    if (activeLink && overLink) {
      // Handle reordering...
      await reorderNavigationLinks(reorderedLinks);
    }
  }
  
  setActiveId(null);
};
```

#### 3. Footer-Specific Patterns:

**Multi-Column Footer Layout:**
```typescript
// Footer with link columns
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
  {/* Company Info Column */}
  <div className="space-y-4">
    <EditableLogo ... />
    <EditableText ... />
  </div>
  
  {/* Link Columns with Dropdowns as Categories */}
  {displayLinks.filter(link => !link.parent_link_id).map((categoryLink) => (
    <div key={categoryLink.id} className="space-y-4">
      <h3 className="font-semibold">{categoryLink.link_text}</h3>
      <ul className="space-y-2">
        {categoryLink.children?.map((childLink) => (
          <li key={childLink.id}>
            <EditableNavLink ... />
          </li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

**Card-Based Footer:**
```typescript
// Footer with card sections
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {displayLinks.map((link) => (
    <div key={link.id} className="bg-white p-6 rounded-lg shadow">
      <EditableIcon fieldName={`icon-${link.id}`} ... />
      <h3>{link.link_text}</h3>
      <p>{link.description}</p>
      <EditableNavLink ... />
    </div>
  ))}
</div>
```

#### 4. Navigation Tab Settings:

Ensure navigation sections can be set as global:

```typescript
// In EnhancedSectionSettingsModal.tsx
{((typeof sectionType === 'string' && 
  (sectionType.toLowerCase().includes('navigation') || 
   sectionType.toLowerCase().includes('navbar') || 
   sectionType.toLowerCase().includes('footer'))) ||
  (typeof sectionType === 'object' && 
   (sectionType.id.toLowerCase().includes('navigation') || 
    sectionType.id.toLowerCase().includes('navbar') || 
    sectionType.id.toLowerCase().includes('footer')))) && (
  <NavigationSettingsTab
    sectionId={sectionId}
    sectionType={typeof sectionType === 'string' ? sectionType : sectionType.id}
  />
)}
```

#### 5. Critical Integration Points:

**PageBuilder Integration:**
```typescript
case 'navigation-footer':
  return (
    <NavigationFooter
      sectionId={section.id} // CRITICAL: Pass section ID
      content={{
        logo: section.content?.logo || { type: 'text', text: 'Logo' },
        backgroundColor: section.content?.backgroundColor,
        textColor: section.content?.textColor,
        // ... other content
      }}
      isGlobal={isGlobalNavSection || isGlobalFooterSection}
      isMobilePreview={mobileView}
    />
  );
```

**Global Navigation Rendering:**
```typescript
// In PageBuilderPage.tsx and PagePreview.tsx
{globalNavSection && (
  <div className="sticky top-0 z-50">
    {renderSection(globalNavSection, true)}
  </div>
)}

{/* Page sections */}

{globalFooterSection && (
  <div className="mt-auto">
    {renderSection(globalFooterSection, false, true)}
  </div>
)}
```

### Navigation Testing Checklist:

#### ✅ **Link Management:**
1. Can add links via plus icon
2. Can edit existing links
3. Can delete links (direct deletion, no modal)
4. Link data persists after refresh
5. Dropdown links show children properly

#### ✅ **Drag & Drop:**
1. Main navigation items reorder smoothly
2. Sub-navigation items reorder within parent
3. No duplicate plus icons after drag
4. Visual feedback during drag (shadow, scale)
5. Smooth animations throughout

#### ✅ **Global Settings:**
1. Navigation tab appears in section settings
2. Can set as global navbar
3. Can set as global footer
4. Global sections appear on all pages
5. Only one global nav/footer allowed

#### ✅ **Responsive:**
1. Mobile hamburger menu works
2. Mobile navigation displays correctly
3. Dropdowns work on mobile
4. Desktop layout maintains proper spacing

### Common Navigation Patterns:

#### 1. **Simple Navbar:**
- Logo + 4-6 navigation links + 1-2 CTA buttons
- Horizontal layout with dropdowns
- Sticky positioning

#### 2. **Mega Menu Navbar:**
- Dropdowns contain multi-column layouts
- Include images, descriptions, or cards
- Rich content in dropdown areas

#### 3. **Minimal Footer:**
- Logo + copyright + social links
- Single row layout
- Centered or left-aligned

#### 4. **Enterprise Footer:**
- 4-6 columns of categorized links
- Newsletter signup
- Social media icons
- Legal links row

#### 5. **Card-Based Footer:**
- Feature cards with icons
- Contact information cards
- Location/office cards

### Navigation-Specific CSS:

```css
/* Smooth dropdown animations */
.dropdown-menu {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

/* Mobile menu transitions */
.mobile-menu {
  transition: transform 0.3s ease;
}

/* Hover states for navigation */
.nav-link:hover {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

/* Drag handle visibility */
.drag-handle {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.drag-handle:hover {
  opacity: 1;
}
```

### Key Differences from Content Sections:

1. **Database Integration**: Navigation sections MUST integrate with navigation_links table
2. **Section ID Required**: Always pass sectionId for link management
3. **Drag & Drop**: Built-in support for reordering
4. **Global Settings**: Can be designated as site-wide navigation
5. **Complex State**: Manages tooltips, dropdowns, and drag state
6. **No Image Management**: Focus on links and text, not images

### Building New Navigation Components - Step by Step

#### 1. **Choose Component Name**
Follow naming conventions that describe the style:
- Navbars: `NavigationMinimal`, `NavigationModern`, `NavigationFloating`, `NavigationMega`
- Footers: `FooterSimple`, `FooterMultiColumn`, `FooterMinimal`, `FooterEnterprise`
- Special: `NavigationSidebar`, `NavigationSticky`, etc.

#### 2. **Create Component File**
Create `/src/components/sections/[ComponentName].tsx` following the NavigationDesktop pattern.

#### 3. **Update PageBuilder Integration**
In `/src/pages/dashboard/content/PageBuilderPage.tsx`, add to renderSection:
```typescript
case 'navigation-minimal':  // Match the section_type in database
  return <NavigationMinimal {...commonNavigationProps} />;
```

#### 4. **Update ProjectPreview Integration**
In `/src/pages/ProjectPreview.tsx`, add to renderNavigationSection:
```typescript
case 'navigation-minimal':
  return <NavigationMinimal {...sectionProps} />;
```

#### 5. **Add to Staging System**
Update `/src/pages/admin/StagingPage.tsx` to include your component for testing.

#### 6. **Database Entry (Manual Admin Task)**
After testing, admin creates section_templates entry:
```sql
INSERT INTO section_templates (section_type, template_name, category, status)
VALUES ('navigation-minimal', 'Minimal Navigation', 'navigation', 'active');
```

### Common Navigation Patterns

#### Navbar Variations:
1. **Minimal**: Logo + essential links + CTA
2. **Desktop Standard**: Logo + main nav + dropdowns + 2 CTAs
3. **Floating**: Transparent background, changes on scroll
4. **Mega Menu**: Large dropdown areas with columns
5. **Centered**: Logo in center, links on sides
6. **Sidebar**: Vertical navigation for dashboards

#### Footer Variations:
1. **Simple**: Copyright + social links
2. **Multi-Column**: 3-5 columns of categorized links
3. **Newsletter**: Includes email signup
4. **Enterprise**: Multiple sections, awards, certifications
5. **Minimal**: Single line with essentials

### Testing Navigation Sections

#### Essential Tests:
1. **Link Management**: Add, edit, delete, reorder links
2. **Global Settings**: Test as both navbar and footer
3. **Multi-Page Navigation**: Links work across pages
4. **Mobile Menu**: Hamburger menu functions correctly
5. **Dropdowns**: Parent-child relationships work
6. **ProjectPreview**: Navigation renders in full project preview

### Important Context for Claude Chats

When building navigation sections, remember:

1. **Section Type**: Always use "navigation" as the base type
2. **Component Naming**: The database stores specific types like 'navigation-minimal'
3. **Two Integration Points**: Must update both PageBuilder AND ProjectPreview
4. **Global Functionality**: NavigationSettingsTab handles global nav/footer settings
5. **Link Management**: useNavigationLinks hook provides all CRUD operations
6. **Responsive Design**: Each component must handle desktop and mobile views internally
7. **Future Scale**: System designed for 20+ navbar and 20+ footer variations

### Troubleshooting:

**Links not saving:**
- Verify sectionId is passed to component
- Check useNavigationLinks hook is imported
- Ensure database connection is active

**Drag not working:**
- Import drag-drop.css styles
- Check @dnd-kit packages are installed
- Verify DndContext wraps draggable area

**Global nav not appearing:**
- Check NavigationSettingsTab integration
- Verify global_nav_section_id in projects table
- Ensure renderSection handles global sections

**Navigation not showing in ProjectPreview:**
- Ensure component is imported in ProjectPreview.tsx
- Add case to renderNavigationSection switch statement
- Check section_type matches between database and code

---

This guide ensures consistent, maintainable sections that integrate seamlessly with our page builder architecture. Following these patterns will enable rapid scaling to 100-300+ sections while maintaining code quality and user experience.