import { createAdminClient } from '@/lib/supabase/admin';
import { getSectionComponent } from '@/components/sections/index';
import { ThemeProvider } from '@/components/builder/ThemeProvider';
import type { Page, Project, Theme } from '@/types/database';
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
            // Get the appropriate component based on component_name
            const SectionComponent = getSectionComponent(section.component_name);
            return (
              <SectionComponent
                key={section.id}
                content={section.content || {}}
                isEditing={false}
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