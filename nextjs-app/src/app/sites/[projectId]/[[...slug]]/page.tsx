import { createAdminClient } from '@/lib/supabase/admin';
import { ComponentRegistry } from '@/lib/register-components';
import { ThemeProvider } from '@/components/builder/ThemeProvider';
import type { Page, Project } from '@/types/database';
import type { Theme } from '@/types/builder';
import type { Section, ProjectSection } from '@/stores/builderStore';
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

async function getProjectSections(projectId: string): Promise<ProjectSection[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('project_sections')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as ProjectSection[];
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

  // Fetch global sections for this project
  const projectSections = await getProjectSections(projectId);

  // Organize global sections by placement
  const globalHeaders = projectSections.filter(s => s.section_placement === 'global_header');
  const globalFooters = projectSections.filter(s => s.section_placement === 'global_footer');
  const aboveContent = projectSections.filter(s => s.section_placement === 'above_content');
  const belowContent = projectSections.filter(s => s.section_placement === 'below_content');

  // Use published sections for live sites, fallback to draft sections if no published content exists
  const sectionsToRender = page.published_sections && page.published_sections.length > 0
    ? page.published_sections
    : page.sections;

  // Helper function to render a section (works for both page and project sections)
  const renderSection = (section: Section | ProjectSection, key: string) => {
    const componentName = section.component_name || 'HeroTwoColumn';
    const registryEntry = ComponentRegistry.get(componentName);

    if (!registryEntry) {
      return (
        <div key={key} className="py-12 px-4 bg-gray-100 border-2 border-dashed border-gray-300">
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

    const filteredContent = Object.entries(content).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    return (
      <Component
        key={key}
        {...filteredContent}
        editable={false}
        projectId={projectId}
      />
    );
  };

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
          {/* Global Headers */}
          {globalHeaders.map((section) => renderSection(section, `header-${section.id}`))}

          {/* Above Content Global Sections */}
          {aboveContent.map((section) => renderSection(section, `above-${section.id}`))}

          {/* Page-Specific Sections */}
          {sectionsToRender.map((section: Section) => renderSection(section, section.id))}

          {/* Below Content Global Sections */}
          {belowContent.map((section) => renderSection(section, `below-${section.id}`))}

          {/* Global Footers */}
          {globalFooters.map((section) => renderSection(section, `footer-${section.id}`))}
        </div>
      </main>
    </ThemeProvider>
  );
}

// This is important for dynamic routes in production
export const dynamic = 'force-dynamic';