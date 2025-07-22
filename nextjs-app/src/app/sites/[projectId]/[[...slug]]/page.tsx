import { supabase } from '@/lib/supabase';
import { HeroSection } from '@/components/sections/HeroSection';
import type { Page } from '@/types/database';
import type { HeroContent } from '@/schemas/section';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    projectId: string;
    slug?: string[];
  };
}

async function getPageData(projectId: string, path: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', projectId)
    .eq('path', path)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Page;
}

export default async function SitePage({ params }: PageProps) {
  const path = params.slug ? `/${params.slug.join('/')}` : '/';
  const page = await getPageData(params.projectId, path);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {page.sections.map((section) => {
        switch (section.type) {
          case 'hero':
            return (
              <HeroSection
                key={section.id}
                content={section.content as HeroContent}
                isEditing={false}
              />
            );
          // Add more section types here as they're implemented
          default:
            return null;
        }
      })}
    </main>
  );
}

// This is important for dynamic routes in production
export const dynamic = 'force-dynamic';