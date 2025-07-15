# How to Build New Sections for PageBuilder

This comprehensive guide ensures we can efficiently create new sections for our page builder system. Follow these patterns exactly to maintain consistency and enable rapid scaling to 100-300+ sections.

## Overview

Our page builder uses a **type-based drag & drop system** where:
1. **Section Types** are draggable cards in the sidebar
2. **Section Templates** are variations of each type with different layouts/styles
3. **Section Components** render the actual content on the page
4. **Database Templates** store configuration and determine availability

---

## Section Architecture Pattern

### Required Components for Each Section Type:

1. **React Component** (`/src/components/sections/[SectionName].tsx`)
2. **Database Templates** (stored in `section_templates` table)
3. **Type Definition** (added to SectionTypeCard configurations)
4. **PageBuilder Integration** (renderSection method)

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

## Step 6: Database Templates and Staging

### Section Templates Table Structure:
```sql
CREATE TABLE section_templates (
  id SERIAL PRIMARY KEY,
  section_type VARCHAR NOT NULL,     -- e.g., 'hero', 'features', 'testimonials'
  template_name VARCHAR NOT NULL,    -- e.g., 'Split Layout', 'Centered', 'Cards'
  preview_image_url TEXT,            -- Preview image for template selection
  customizable_fields JSONB,         -- Field configuration
  category VARCHAR,                  -- e.g., 'hero', 'content', 'social-proof'
  status VARCHAR DEFAULT 'testing'   -- 'active', 'testing', 'inactive'
);
```

### Status Management:
- **`status = 'testing'`**: Section available only to developers, hidden from users
- **`status = 'active'`**: Section appears in user-facing section library
- **`status = 'inactive'`**: Section archived/disabled

### Creating Templates:
```sql
-- 1. Create initial testing template
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
  'testing'
);

-- 2. After testing, activate for users
UPDATE section_templates 
SET status = 'active' 
WHERE section_type = 'new-section-type' AND template_name = 'Default Layout';
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

### Section Library Auto-Detection:
The section library automatically detects which section types have active templates and makes only those draggable. No additional configuration needed.

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

### ✅ **Component Testing:**
1. Component renders without errors
2. All default values display correctly
3. EditableText, EditableButton, EditableImage work in edit mode
4. Mobile and desktop layouts look correct
5. All props flow through properly

### ✅ **PageBuilder Integration Testing:**
1. Section appears in library when status = 'active'
2. Drag and drop creates section successfully
3. Content updates save and persist
4. Section settings modal works
5. Template switching works (if multiple templates)

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

/src/pages/dashboard/content/
└── PageBuilderPage.tsx        # Add to renderSection method

/docs/
├── HOW-TO-BUILD-SECTIONS.md   # This guide
└── HOW-TO-ADD-STYLE-OPTIONS.md # Style customization guide

Database:
└── section_templates table    # Template storage and status management
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

This guide ensures consistent, maintainable sections that integrate seamlessly with our page builder architecture. Following these patterns will enable rapid scaling to 100-300+ sections while maintaining code quality and user experience.