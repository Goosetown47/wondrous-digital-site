# Next.js PageBuilder

A visual website builder with drag-and-drop editing, live preview, and deployment to Netlify.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## 🏗️ Architecture

### Tech Stack
- **Next.js 15** - App Router, Server Components
- **TypeScript** - Strict mode for type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Zustand** - State management
- **React Query** - Data fetching (ready for Supabase)
- **Framer Motion** - Animations
- **Zod** - Schema validation
- **React Hook Form** - Form management (coming soon)

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── builder/[projectId] # PageBuilder interface
│   ├── preview/[projectId] # Preview mode
│   └── api/               # API routes (coming soon)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── sections/          # Page sections (Hero, etc.)
│   └── builder/           # Builder-specific components
├── stores/                # Zustand stores
├── schemas/               # Zod schemas
├── lib/                   # Utilities
└── types/                 # TypeScript types
```

## ✅ Current Features

### PageBuilder (`/builder/[projectId]`)
- Drag and drop sections from library
- Inline text editing (click to edit)
- Delete sections on hover
- Persistent state with Zustand
- Visual feedback for selected sections

### Preview (`/preview/[projectId]`)
- Shows edited content without edit controls
- Client-side rendering (temporary)
- Back to builder navigation

### Sections
- **Hero Section**: Customizable headline, subheadline, button
  - Inline text editing
  - Color customization (coming soon)
  - Background images (coming soon)

## 🎯 Core Concept Proven

The PageBuilder → Preview pipeline works! You can:
1. Drag sections to build pages
2. Edit content inline
3. Preview the result
4. All with the same component code

## 📋 Next Steps

1. **Enhanced Editing**
   - Add React Hook Form for better inline editing
   - Color pickers for backgrounds/text
   - Image upload support

2. **Persistence**
   - Connect to Supabase
   - Save sections to database
   - Load projects from database

3. **Deployment**
   - Implement static export
   - Netlify API integration
   - One-click deploy

4. **More Sections**
   - Features grid
   - Navigation
   - Footer
   - Custom sections

## 🔧 Development

### Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NETLIFY_AUTH_TOKEN=
```

### Commands
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## 🌟 Why This Architecture?

- **Unified Rendering**: Same components for edit/preview/production
- **Type Safety**: Zod schemas ensure data integrity
- **Performance**: Server components where possible
- **Developer Experience**: Hot reload, TypeScript, great tooling
- **Scalable**: Ready for 250+ section templates

## 🐛 Known Issues

- Preview uses client-side rendering (temporary)
- No persistence yet (refresh loses data)
- Only Hero section implemented
- Deploy button not functional yet

These are all planned improvements, not fundamental issues!