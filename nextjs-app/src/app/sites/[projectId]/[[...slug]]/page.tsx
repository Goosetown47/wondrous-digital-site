import { createAdminClient } from '@/lib/supabase/admin';
import { getSectionComponent } from '@/components/sections/index';
import type { Page } from '@/types/database';
import type { Section } from '@/stores/builderStore';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    projectId: string;
    slug?: string[];
  }>;
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
  
  const page = await getPageData(projectId, path);

  if (!page) {
    notFound();
  }

  // Use published sections for live sites, fallback to draft sections if no published content exists
  const sectionsToRender = page.published_sections && page.published_sections.length > 0 
    ? page.published_sections 
    : page.sections;

  return (
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
  );
}

// This is important for dynamic routes in production
export const dynamic = 'force-dynamic';