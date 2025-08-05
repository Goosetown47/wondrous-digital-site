'use client';

import { getSectionComponent } from '@/components/sections/index';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { usePageById } from '@/hooks/usePages';
import { useDomains } from '@/hooks/useDomains';
import { useTheme } from '@/hooks/useThemes';
import { ThemeProvider } from '@/components/builder/ThemeProvider';
import type { Section } from '@/stores/builderStore';

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const pageId = params.pageId as string;
  const { data: project } = useProject(projectId);
  const { data: page, isLoading } = usePageById(pageId);
  const { data: domains } = useDomains(projectId);
  const { data: theme } = useTheme(project?.theme_id);
  
  // Get the primary domain or first available domain
  const primaryDomain = domains?.find(d => d.is_primary) || domains?.[0];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Page not found</p>
          <Button variant="outline" asChild>
            <Link href={`/builder/${projectId}/${pageId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builder
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const sections = page.sections || [];

  return (
    <div className="min-h-screen">
      {/* Preview toolbar */}
      <div className="bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/builder/${projectId}/${pageId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Builder
              </Link>
            </Button>
            <span className="text-sm opacity-75">
              Preview Mode - {project?.name || 'Loading...'} - {page.title || page.path}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {primaryDomain ? (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://${primaryDomain.domain}${page.path}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live
                </a>
              </Button>
            ) : (
              <span className="text-sm text-gray-500">No domain configured</span>
            )}
          </div>
        </div>
      </div>

      {/* Render sections from database with theme */}
      <ThemeProvider theme={theme} className="min-h-screen">
        <div 
          className="w-full @container"
          style={{ containerType: 'inline-size' }}
        >
          {sections.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No sections to preview</p>
                <Button variant="outline" asChild>
                  <Link href={`/builder/${projectId}/${pageId}`}>
                    Go back to builder
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            sections.map((section: Section) => {
              // Get the appropriate component based on component_name
              const SectionComponent = getSectionComponent(section.component_name);
              return (
                <SectionComponent
                  key={section.id}
                  content={section.content || {}}
                  isEditing={false}
                />
              );
            })
          )}
        </div>
      </ThemeProvider>
    </div>
  );
}