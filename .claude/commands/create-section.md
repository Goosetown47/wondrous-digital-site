# Create Custom Section Component

  Guide me through creating a production-ready custom section component following our
  Direct Integration system.

  ## Process

  ### Step 1: Review Template & Create Checklist

  First, read `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/Templates/Custom_Component_Template.md` and create a working checklist based on:

  **Required Pattern:**
  - [ ] TypeScript interface with `editable` and `onUpdate` props
  - [ ] Component with inline EditableText/EditableImage/EditableButton wrappers
  - [ ] Config export with `editableFields` and `defaultContent`
  - [ ] Config naming: `[lowercasecomponentname]Config`

  **Production Best Practices:**
  - [ ] Theme CSS variables only (no hardcoded colors)
  - [ ] Mobile-first responsive design
  - [ ] Semantic HTML with proper heading hierarchy
  - [ ] ARIA labels for accessibility
  - [ ] Next.js Image component (not img tag)
  - [ ] Hover/focus/active states with transitions
  - [ ] Tested in both light AND dark mode

  **Pre-Import Testing:**
  - [ ] Component renders without errors
  - [ ] All fields editable in LAB
  - [ ] Light mode works ✅
  - [ ] Dark mode works ✅
  - [ ] Mobile (375px) works ✅
  - [ ] Tablet (768px) works ✅
  - [ ] Desktop (1280px+) works ✅

  ### Step 2: Gather Requirements

  Ask me for:

  1. **Component Description:** What should this section do? What content should it
  display?
     - Example: "A hero section with heading, subtext, CTA button, and background image"

  2. **Inspiration Image (Optional):** Do you have a screenshot or design reference?
     - If yes: Ask me to provide the file path so you can view it
     - If no: Work from the description only

  ### Step 3: Design Confirmation

  Based on my description/image, propose:
  - Component name (PascalCase)
  - Editable fields with types (text, richText, image, button)
  - Layout structure (grid, flex, etc.)
  - Responsive behavior

  Wait for my approval before proceeding.

  ### Step 4: Build Component

  Create the component file in `/src/components/test/[component-name].tsx` following:

  1. **Interface** with all props + editable + onUpdate
  2. **Component** with:
     - Inline Editable* wrappers on all editable elements
     - Theme CSS variables (bg-background, text-foreground, etc.)
     - Mobile-first responsive classes
     - Semantic HTML
     - ARIA labels
     - Next.js Image if applicable
     - Smooth transitions on interactive elements
  3. **Config export** with exact field matching

  ### Step 5: Quality Check

  Before completing, verify against the checklist:
  - Run through each production best practice
  - Confirm all required patterns present
  - Note any limitations or assumptions

  ### Step 6: Testing Instructions

  Provide me with:
  1. Steps to import component via /core/add
  2. How to test in LAB
  3. What to check in light/dark mode
  4. Responsive breakpoints to verify

  ## Important Notes

  - **Always start mobile-first** - Base styles for mobile, enhance for larger screens
  - **Never use hardcoded colors** - Only theme variables (bg-background,
  text-foreground, etc.)
  - **Test dark mode** - Every component must work in both themes
  - **Be semantic** - Use proper HTML elements (section, article, nav, etc.)
  - **Accessibility matters** - ARIA labels, alt text, keyboard navigation

  ## Examples to Reference

  The template includes two production-ready examples:
  1. CTA Section (simple, text + button)
  2. Hero with Image (complex, grid layout + Next.js Image)

  Study these for patterns to follow.