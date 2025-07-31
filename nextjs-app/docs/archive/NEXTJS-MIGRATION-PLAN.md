# Next.js Migration Plan for PageBuilder to Static Site Generation

## Problem Statement

Our current architecture has a fundamental issue: **two completely different rendering systems** that need to produce identical output:

1. **Edit Mode**: React components with Tailwind classes, Lucide icons, and modern tooling
2. **Preview/Deploy Mode**: HTML templates with custom CSS generation and emoji fallbacks

This dual system causes:
- Style mismatches between PageBuilder and deployed sites
- Complex synchronization logic
- Maintenance overhead
- Inconsistent rendering
- Developer friction

## Solution: Next.js with Static Export

Next.js solves our core problem by using **one rendering system** for everything:
- React components render to static HTML at build time
- Tailwind classes are preserved in the output
- Lucide icons render as inline SVGs
- Perfect style parity guaranteed

## Architecture Comparison

### Current Architecture
```
PageBuilder (Edit Mode)
├── React Components (Tailwind + Lucide)
├── Site Styles (CSS Variables)
└── Real-time Supabase

Preview/Deploy
├── HTML Templates (Database)
├── Template Renderer (Handlebars-like)
├── CSS Generator (Custom)
└── Static Export Service

Problems:
- Two rendering pipelines
- HTML structure mismatch
- CSS generation complexity
- Icon system incompatibility
```

### Next.js Architecture
```
PageBuilder App (main app)
├── React Components
├── Supabase Client (Real-time)
└── Live Preview

Next.js Static Generation (/nextjs-poc)
├── App Router Structure
│   └── /app/sites/[projectId]/preview
├── Same React Components (copied)
├── Client Components with 'use client'
├── CSS Variables + Tailwind
└── Static Export to Netlify

Benefits:
- Single rendering pipeline
- Guaranteed style parity (using exact same components)
- Simpler architecture
- Standard tooling
```

## Implementation Phases

### Phase 1: Next.js Setup and Structure ✅

**Goals:**
- Set up Next.js with TypeScript and Tailwind
- Configure for static export
- Establish project structure

**Tasks:**
1. ✅ Initialize Next.js app with proper configuration
2. ✅ Set up App Router structure:
   ```
   /nextjs-poc
   ├── /app
   │   ├── /sites/[projectId]/preview    # Static site preview
   │   └── /test-styled                   # Test page with hardcoded styles
   ├── /components
   │   ├── /sections                      # Section components
   │   ├── /editable                      # Editable components
   │   └── /ui                            # UI components
   └── /contexts                          # React contexts
   ```
3. ✅ Configure static export in `next.config.ts`:
   ```typescript
   const nextConfig: NextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
     trailingSlash: true,
   };
   ```
4. ✅ Set up environment variables for Supabase

### Phase 2: Component Migration 🚧

**Goals:**
- Copy all section components to Next.js
- Ensure components work in both contexts
- Keep using the EXACT same components (including EditableText, EditableButton, etc.)

**Tasks:**
1. ✅ Copy `/components/sections` to Next.js
2. ✅ Copy all `/components/editable` components
3. ✅ Copy contexts (EditModeContext, SiteStylesContext)
4. ✅ Add `'use client'` directives to all interactive components
5. 🚧 Key Discovery: We can use the EXACT same components!
   ```typescript
   // No need for conditional rendering - same component works everywhere!
   <FourFeaturesGrid content={sectionContent} />
   // EditableText, EditableButton work in static context when EditMode is false
   ```
6. ✅ CSS Variables + Tailwind arbitrary values work perfectly:
   ```css
   bg-[var(--primary-button-background-color)]
   text-[var(--primary-button-text-color)]
   ```

### Phase 3: PageBuilder Integration

**Goals:**
- Adapt PageBuilder to work within Next.js
- Maintain all editing functionality
- Update preview system

**Tasks:**
1. Move PageBuilder to `/app/builder/[projectId]/editor`
2. Keep existing contexts and edit functionality
3. Update preview to use Next.js preview API:
   ```typescript
   // Preview mode now just switches route
   const previewUrl = `/sites/${projectId}/preview`;
   ```
4. Ensure Supabase real-time continues working

### Phase 4: Static Generation Pipeline

**Goals:**
- Implement build-time data fetching
- Create static page generation
- Set up deployment pipeline

**Tasks:**
1. Implement static generation functions:
   ```typescript
   // app/sites/[projectId]/[...slug]/page.tsx
   export async function generateStaticParams() {
     const { data: pages } = await supabase
       .from('pages')
       .select('project_id, slug')
       .eq('status', 'published');
     
     return pages.map(page => ({
       projectId: page.project_id,
       slug: page.slug.split('/').filter(Boolean),
     }));
   }

   export default async function Page({ params }) {
     const { data: page } = await supabase
       .from('pages')
       .select(`
         *,
         sections (
           id,
           type,
           content,
           order
         )
       `)
       .eq('project_id', params.projectId)
       .eq('slug', params.slug.join('/'))
       .single();
     
     const { data: siteStyles } = await supabase
       .from('site_styles')
       .select('*')
       .eq('project_id', params.projectId)
       .single();
     
     return (
       <SiteStylesProvider styles={siteStyles}>
         {page.sections
           .sort((a, b) => a.order - b.order)
           .map(section => (
             <SectionRenderer
               key={section.id}
               type={section.type}
               content={section.content}
             />
           ))}
       </SiteStylesProvider>
     );
   }
   ```

2. Create build script:
   ```typescript
   // scripts/build-static-site.ts
   async function buildStaticSite(projectId: string) {
     // Set environment variable for specific project
     process.env.BUILD_PROJECT_ID = projectId;
     
     // Run Next.js build
     await exec('next build');
     
     // Output is in /out directory
     return '/out';
   }
   ```

3. Update deployment queue to use new build process

### Phase 5: Migration and Testing

**Goals:**
- Safely migrate existing projects
- Ensure no regressions
- Document new workflow

**Tasks:**
1. Create migration utilities:
   - Export existing pages/sections
   - Validate data structure
   - Test render output

2. Visual regression testing:
   - Screenshot comparison tool
   - Style validation
   - Cross-browser testing

3. Performance benchmarks:
   - Build time comparison
   - Output size analysis
   - Loading performance

4. Update documentation:
   - Developer guide
   - Deployment process
   - Troubleshooting

## Progress Log

### 2025-01-21: POC Implementation
- ✅ Set up Next.js with App Router, TypeScript, and Tailwind v4
- ✅ Created `/nextjs-poc` directory with proper configuration
- ✅ Successfully migrated FourFeaturesGrid component
- ✅ Copied all editable components (EditableText, EditableButton, EditableIcon, etc.)
- ✅ Copied contexts (EditModeContext, SiteStylesContext, ProjectContext)
- ✅ Verified CSS variables system works with hardcoded styles
- ✅ Created test page at `/test-styled` showing pink themed section
- 🚧 Visual parity status:
  - Structure: ✅ Perfect match
  - Colors: ✅ Working correctly (pink buttons showing)
  - Typography: ⚠️ Close but fonts not loading properly
  - Icons: ❌ Wrong icons (boxes) and wrong colors (black)
  - Spacing: ✅ Very close
- ❌ Supabase fetch failing in preview page (SSL/environment issue)
- 💡 Key Discovery: We can use the EXACT same components, no modifications needed!

### Next Immediate Tasks:
1. Fix icon rendering (correct types: Star, Settings, Phone, Heart)
2. Fix icon colors (should be pink #EE0D79)
3. Fix font loading (Sora and Raleway)
4. Fix Supabase connection for dynamic styles
5. Add more section types to POC

## Key Discoveries

### 1. Component Reuse Strategy
We can use the **EXACT same components** from PageBuilder, including all EditableText, EditableButton, etc. components. When EditMode is false (in static generation), they simply render as static elements. This guarantees perfect parity because it's literally the same code.

### 2. Client Components in Next.js 13+
All interactive components need the `'use client'` directive at the top of the file. This includes:
- All components in `/components/editable/`
- All context providers
- Any component using React hooks

### 3. CSS Variables with Tailwind
CSS variables work perfectly with Tailwind's arbitrary value syntax:
```css
bg-[var(--primary-button-background-color)]
text-[var(--primary-button-text-color)]
hover:bg-[var(--primary-button-hover)]
```

### 4. No Template System Needed
Direct React rendering eliminates all template complexity. No more:
- HTML template strings in database
- Handlebars-like templating
- Custom CSS generation
- Icon-to-emoji fallbacks

## Technical Patterns

### Site Styles in Next.js
```typescript
// components/SiteStylesProvider.tsx (Server-side approach)
export function SiteStylesProvider({ styles, children }) {
  const cssVariables = generateCSSVariables(styles || {});
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      {children}
    </>
  );
}

// For client-side with existing contexts
// app/sites/[projectId]/preview/ClientWrapper.tsx
'use client';

export default function ClientWrapper({ siteStyles, children }) {
  return (
    <EditModeProvider initialMode={false}>
      <SiteStylesProvider siteStyles={siteStyles}>
        {children}
      </SiteStylesProvider>
    </EditModeProvider>
  );
}
```

### Image Handling
```typescript
// Use Next.js Image with Supabase URLs
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }) {
  const imageUrl = src.startsWith('http') 
    ? src 
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${src}`;
    
  return <Image src={imageUrl} alt={alt} {...props} unoptimized />;
}
```

### Button Styling with CSS Variables + Tailwind
```typescript
// Our approach: CSS variables with Tailwind arbitrary values
// This allows dynamic theming while keeping Tailwind's utility classes
export function Button({ variant, ...props }) {
  const baseClasses = 'transition-all duration-200 inline-flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-[var(--primary-button-background-color)] text-[var(--primary-button-text-color)]',
    secondary: 'bg-[var(--secondary-button-background-color)] text-[var(--secondary-button-text-color)]',
  };
  
  return <button className={cn(baseClasses, variantClasses[variant])} {...props} />;
}
```

## Migration Strategy

### Parallel Development
1. Keep existing system running
2. Build Next.js version alongside
3. Test with new projects first
4. Gradually migrate existing projects

### Incremental Rollout
1. **Phase A**: Internal testing with dummy projects
2. **Phase B**: Select beta customers
3. **Phase C**: New projects use Next.js by default
4. **Phase D**: Migrate all existing projects
5. **Phase E**: Deprecate old system

### Risk Mitigation
- **Feature flags** to toggle between systems
- **Rollback capability** for first 30 days
- **Data backup** before each migration
- **Monitoring** for performance and errors

## Success Metrics

### Technical Goals
- ✅ 100% style parity between PageBuilder and deployed sites
- ✅ Single rendering pipeline
- ✅ Eliminate HTML templates and template renderer
- ✅ Remove custom CSS generation code
- ✅ Standardize on React + Tailwind

### Performance Goals
- ⚡ < 30 second build time for average site
- ⚡ < 100kb page weight (excluding images)
- ⚡ Perfect Lighthouse scores

### Developer Experience
- 📈 50% reduction in styling-related bugs
- 📈 Faster feature development
- 📈 Easier onboarding for new developers
- 📈 Standard Next.js patterns

## Code to Remove

Once migration is complete, we can remove:
- `/src/lib/templateRenderer.ts`
- `/src/styles/templateStyles.ts`
- `/src/components/template/*`
- `/src/services/staticExportService.ts`
- Database `html_template` columns
- All template-related migrations

## Next Steps

1. ✅ **Proof of Concept**: Built FourFeaturesGrid section in Next.js
2. ✅ **Validation**: Confirmed static export and CSS variables work
3. **Visual Parity**: Fix remaining styling issues
   - Fix icon types and colors
   - Fix font loading
   - Fine-tune button styles
4. **Supabase Integration**: Fix SSL/connection issues
5. **Expand POC**: Add more section types
6. **Architecture Review**: Team alignment on approach

## Open Questions

1. **Deployment**: How to integrate with existing Netlify setup?
2. **Previews**: Real-time preview during editing?
3. **Assets**: Best approach for font/asset optimization?
4. **Analytics**: How to add tracking codes to static sites?
5. **Forms**: Handle form submissions in static context?

---

This document will be updated as we progress through the migration. Each phase completion will be documented with lessons learned and any adjustments to the plan.