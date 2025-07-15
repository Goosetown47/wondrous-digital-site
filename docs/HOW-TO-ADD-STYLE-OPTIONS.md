# How to Add New Style Options

This comprehensive guide ensures we can add new CSS style options (like text-align, image properties, spacing, etc.) to both Site Styles and PageBuilder modals without spinning our wheels.

## Overview

Our styling system has a **two-tier architecture**:
1. **Site Defaults**: CSS variables from Site Styles apply globally
2. **Individual Overrides**: Inline styles override CSS variables with higher specificity

**Follow the proven pattern used by `color` and `lineHeight` - never deviate from this pattern.**

---

## Complete Implementation Checklist

### Phase 1: Database & Context Setup

#### ✅ 1. Add Database Columns (if needed for Site Styles)
```sql
-- Example for text alignment
ALTER TABLE site_styles ADD COLUMN h1_text_align VARCHAR DEFAULT 'left';
ALTER TABLE site_styles ADD COLUMN h2_text_align VARCHAR DEFAULT 'left';
ALTER TABLE site_styles ADD COLUMN p_text_align VARCHAR DEFAULT 'left';
```

#### ✅ 2. Update SiteStyles Interface
**File**: `/src/contexts/SiteStylesContext.tsx`
```typescript
export interface SiteStyles {
  // ... existing properties
  
  // Add new style properties
  h1_text_align: string;
  h2_text_align: string;
  p_text_align: string;
}
```

#### ✅ 3. Update DEFAULT_STYLES
**File**: `/src/contexts/SiteStylesContext.tsx`
```typescript
const DEFAULT_STYLES: Partial<SiteStyles> = {
  // ... existing defaults
  
  // Add defaults for new properties
  h1_text_align: 'left',
  h2_text_align: 'left', 
  p_text_align: 'left',
};
```

#### ✅ 4. Update CSS Variable Reading
**File**: `/src/contexts/SiteStylesContext.tsx` - in `readCSSVariables()`
```typescript
const cssStyles: Partial<SiteStyles> = {
  // ... existing CSS variable reads
  
  // Add new CSS variable reads
  h1_text_align: getCSSVar('--h1-text-align') || DEFAULT_STYLES.h1_text_align,
  h2_text_align: getCSSVar('--h2-text-align') || DEFAULT_STYLES.h2_text_align,
  p_text_align: getCSSVar('--p-text-align') || DEFAULT_STYLES.p_text_align,
};
```

### Phase 2: CSS Variable Application

#### ✅ 5. Update applySiteStyleVariables()
**File**: `/src/lib/utils.ts`
```typescript
export function applySiteStyleVariables(styles: Record<string, any>) {
  // ... existing CSS variable setting
  
  // Add new CSS variables
  target.style.setProperty('--h1-text-align', styles.h1_text_align || 'left');
  target.style.setProperty('--h2-text-align', styles.h2_text_align || 'left');
  target.style.setProperty('--p-text-align', styles.p_text_align || 'left');
}
```

### Phase 3: CSS Rules (Site Defaults)

#### ✅ 6. Update CSS Rules - **CRITICAL: No !important for override properties**
**File**: `/src/styles/section-typography.css`
```css
.website-content .website-section h1 {
  font-family: var(--h1-font-family) !important;
  font-size: var(--h1-font-size) !important;
  font-weight: var(--h1-font-weight) !important;
  line-height: var(--h1-line-height); /* No !important */
  text-align: var(--h1-text-align); /* No !important - allows inline style override */
}
```

**⚠️ CRITICAL RULE: Only use `!important` for properties that DON'T need individual overrides (font-family, font-size, font-weight). Never use `!important` for properties users can override individually.**

### Phase 4: Site Styles UI (if applicable)

#### ✅ 7. Add to Site Styles Typography Section
**File**: `/src/pages/dashboard/content/SiteStyles.tsx`
```typescript
// Add options array
const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right', 'justify'];

// Add to component render
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    H1 Text Alignment
  </label>
  <select
    value={styles.h1_text_align || 'left'}
    onChange={(e) => updateStyle('h1_text_align', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  >
    {TEXT_ALIGN_OPTIONS.map(option => (
      <option key={option} value={option}>
        {option.charAt(0).toUpperCase() + option.slice(1)}
      </option>
    ))}
  </select>
</div>
```

### Phase 5: Component Interface Updates

#### ✅ 8. Update Section Component Interfaces
**Files**: `/src/components/sections/HeroSplitLayout.tsx`, etc.
```typescript
interface HeroSplitLayoutProps {
  content: {
    headline?: {
      text?: string;
      color?: string;
      lineHeight?: string;
      textAlign?: string; // Add new property
    };
    // ... other content properties
  };
}
```

### Phase 6: Modal/Tooltip Updates

#### ✅ 9. Update EditTextTooltip Interface
**File**: `/src/components/editable/tooltips/EditTextTooltip.tsx`
```typescript
interface EditTextTooltipProps {
  text: string;
  color?: string;
  lineHeight?: string;
  textAlign?: string; // Add new property
  // ... other props
  onUpdate: (value: { 
    text: string; 
    color?: string; 
    lineHeight?: string;
    textAlign?: string; // Add to update interface
  }) => void;
}
```

#### ✅ 10. Add Modal Controls
**File**: `/src/components/editable/tooltips/EditTextTooltip.tsx`
```typescript
const EditTextTooltip: React.FC<EditTextTooltipProps> = ({
  text, color, lineHeight, textAlign, // Add to destructuring
  // ... other props
}) => {
  const [editedTextAlign, setEditedTextAlign] = useState(textAlign || '');
  
  // Add options
  const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right', 'justify'];
  
  // Add to render
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Text Alignment
    </label>
    <select
      value={editedTextAlign !== '' ? editedTextAlign : (textAlign || 'left')}
      onChange={(e) => setEditedTextAlign(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
    >
      {TEXT_ALIGN_OPTIONS.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
  
  // Add to handleSave - FOLLOW COLOR PATTERN EXACTLY
  const handleSave = () => {
    const updates = { text: editedText };
    
    // Follow exact same pattern as color and lineHeight
    if (editedTextAlign && editedTextAlign.trim() !== '') {
      updates.textAlign = editedTextAlign;
    } else if (textAlign) {
      updates.textAlign = textAlign; // Preserve original
    }
    
    onUpdate(updates);
  };
};
```

### Phase 7: Component Application

#### ✅ 11. Update EditableText Interface
**File**: `/src/components/editable/EditableText.tsx`
```typescript
interface EditableTextProps {
  fieldName: string;
  defaultValue: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  className?: string;
  children?: React.ReactNode;
  color?: string;
  lineHeight?: string;
  textAlign?: string; // Add new property
}
```

#### ✅ 12. Apply as Inline Style
**File**: `/src/components/editable/EditableText.tsx`
```typescript
const EditableText: React.FC<EditableTextProps> = ({
  fieldName, defaultValue, as = 'p', className = '', children,
  color, lineHeight, textAlign, // Add to destructuring
  ...rest
}) => {
  // Apply in both edit and non-edit modes
  if (!editMode) {
    return (
      <Element 
        className={className} 
        style={{ color, lineHeight, textAlign }} // Add to inline styles
        {...rest}
      >
        {content}
      </Element>
    );
  }
  
  // And in edit mode
  <Element
    className={`${className} ...`}
    style={{ color, lineHeight, textAlign }} // Add to inline styles
    {...rest}
  >
    {content}
  </Element>
  
  // Pass to tooltip
  <EditTextTooltip
    text={typeof content === 'string' ? content : defaultValue}
    color={color}
    lineHeight={lineHeight}
    textAlign={textAlign} // Add to tooltip props
    // ... other props
  />
};
```

### Phase 8: PageBuilder Data Flow - **MOST CRITICAL STEP**

#### ✅ 13. Update PageBuilderPage Content Objects
**File**: `/src/pages/dashboard/content/PageBuilderPage.tsx`

**⚠️ THIS IS THE STEP WE MISSED THAT CAUSED 2 HOURS OF DEBUGGING**

```typescript
// In renderSection() method - ADD TO ALL CONTENT OBJECTS
case 'hero':
  return (
    <HeroSplitLayout
      content={{
        headline: {
          text: section.content?.headline?.text || "Medium length hero headline goes here",
          color: section.content?.headline?.color,
          lineHeight: section.content?.headline?.lineHeight,
          textAlign: section.content?.headline?.textAlign, // ADD THIS LINE
        },
        description: {
          text: section.content?.description?.text || "Lorem ipsum...",
          color: section.content?.description?.color,
          lineHeight: section.content?.description?.lineHeight,  
          textAlign: section.content?.description?.textAlign, // ADD THIS LINE
        },
        // ... other content
      }}
    />
  );
```

**REPEAT FOR ALL SECTION TYPES AND ALL TEXT ELEMENTS**

---

## Testing Checklist

### ✅ Site Styles Testing
1. Go to Site Styles → Typography
2. Change H1 text alignment → Should apply globally
3. Check PageBuilder → All H1s should reflect the change

### ✅ Individual Override Testing  
1. Go to PageBuilder
2. Click on an H1 element → Open modal
3. Change text alignment → Click Save
4. **CRITICAL**: Verify it doesn't revert to site styles
5. Refresh page → Should persist

### ✅ Data Flow Testing
1. Set site default to 'left'
2. Override individual element to 'center'  
3. Check inspector: should see `style="text-align: center"`
4. Element should be visually centered
5. Other H1s should remain left-aligned

---

## Common Pitfalls to Avoid

### ❌ **DON'T**: Add `!important` to override properties
```css
/* WRONG - prevents inline style overrides */
text-align: var(--h1-text-align) !important;

/* CORRECT - allows inline style overrides */  
text-align: var(--h1-text-align);
```

### ❌ **DON'T**: Forget PageBuilderPage content objects
This breaks the data flow and causes save → revert issues.

### ❌ **DON'T**: Use complex CSS variable fallback patterns
Use simple inline styles like color and lineHeight do.

### ❌ **DON'T**: Deviate from the proven color/lineHeight pattern
Every new property should follow this exact same approach.

---

## Pattern Summary

**For any new CSS property, follow this exact pattern:**

1. **Site Defaults**: CSS variables (with no !important)
2. **Individual Overrides**: Inline styles (higher specificity wins)
3. **Complete Data Flow**: Database → Context → CSS Variables → PageBuilder → Component → DOM
4. **Modal Pattern**: Same save logic as color/lineHeight
5. **PageBuilder Integration**: Add to ALL content objects

**Always reference working examples**: `color` (simple) and `lineHeight` (complex with dropdowns)

---

This primer should prevent the 2-hour debugging sessions we just experienced!