import { createAdminClient } from '@/lib/supabase/admin';
import { ComponentRegistry } from '@/lib/register-components';
import { ThemeProvider } from '@/components/builder/ThemeProvider';
import type { Page, Project } from '@/types/database';
import type { Theme } from '@/types/builder';
import type { Section } from '@/stores/builderStore';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    projectId: string;
    slug?: string[];
  }>;
}

async function getProjectData(projectId: string): Promise<Project | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !data) {
    return null;
  }
  
  return data as Project;
}

async function getThemeData(themeId: string): Promise<Theme | null> {
  const supabase = createAdminClient();
  const { data: libraryItem, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('id', themeId)
    .eq('type', 'theme')
    .single();

  if (error || !libraryItem) {
    return null;
  }

  // Transform library item to theme format
  return {
    id: libraryItem.id,
    name: libraryItem.name,
    description: libraryItem.content?.description || '',
    variables: libraryItem.content?.variables || {},
    created_by: libraryItem.created_by,
    created_at: libraryItem.created_at,
    updated_at: libraryItem.updated_at,
  } as Theme;
}

async function getPageData(projectId: string, path: string): Promise<Page | null> {
  // Use admin client to bypass RLS for public site viewing
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pages')
    .select('id, project_id, path, title, sections, published_sections, metadata, created_at, updated_at')
    .eq('project_id', projectId)
    .eq('path', path)
    .single();

  if (error || !data) {
    return null;
  }
  
  return data as Page;
}

export default async function SitePage({ params }: PageProps) {
  const { projectId, slug } = await params;
  const path = slug ? `/${slug.join('/')}` : '/';
  
  // Fetch project data
  const project = await getProjectData(projectId);
  if (!project) {
    notFound();
  }

  // Fetch page data
  const page = await getPageData(projectId, path);
  if (!page) {
    notFound();
  }

  // Fetch theme data if project has a theme
  let theme = null;
  if (project.theme_id) {
    theme = await getThemeData(project.theme_id);
  }

  // Use published sections for live sites, fallback to draft sections if no published content exists
  const sectionsToRender = page.published_sections && page.published_sections.length > 0 
    ? page.published_sections 
    : page.sections;

  return (
    <ThemeProvider 
      theme={theme} 
      overrides={project.theme_overrides}
      className="min-h-screen"
    >
      <main className="min-h-screen">
        <div
          className="w-full @container"
          style={{ containerType: 'inline-size' }}
        >
          {sectionsToRender.map((section: Section) => {
            // Get the component from the unified ComponentRegistry
            const componentName = section.component_name || 'HeroTwoColumn';
            const registryEntry = ComponentRegistry.get(componentName);

            if (!registryEntry) {
              // Show error message for missing components
              return (
                <div key={section.id} className="py-12 px-4 bg-gray-100 border-2 border-dashed border-gray-300">
                  <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-lg font-semibold text-gray-700">Component Not Found</h3>
                    <p className="text-gray-500 mt-2">
                      Component "{componentName}" is not registered in the system.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                      Please ensure the component is properly registered in ComponentRegistry.
                    </p>
                  </div>
                </div>
              );
            }

            const Component = registryEntry.component;
            const content = section.content || {};

            // Filter out empty/null/undefined values to let component defaults work
            const filteredContent = Object.entries(content).reduce((acc, [key, value]) => {
              if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
              }
              return acc;
            }, {} as Record<string, unknown>);

            // NEW PATTERN - matches Preview/Builder/LAB
            // Pass editable=false and spread content props
            // Note: Don't pass onUpdate in Server Components (causes Next.js error)
            return (
              <Component
                key={section.id}
                {...filteredContent}
                editable={false}
                projectId={projectId}
              />
            );
          })}
        </div>
      </main>
    </ThemeProvider>
  );
}

// This is important for dynamic routes in production
export const dynamic = 'force-dynamic';