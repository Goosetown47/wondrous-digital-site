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
import { useBuilderStore } from '@/stores/builderStore';
import { useEffect, useState } from 'react';
import type { Section } from '@/stores/builderStore';

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const pageId = params.pageId as string;
  const { data: project } = useProject(projectId);
  const { data: page, isLoading } = usePageById(pageId);
  const { data: domains } = useDomains(projectId);
  const { data: theme } = useTheme(project?.theme_id);
  
  // Get sections from builder store - this will be the live preview data
  const builderSections = useBuilderStore((state) => state.sections);
  const builderPageId = useBuilderStore((state) => state.pageId);
  const builderPageTitle = useBuilderStore((state) => state.pageTitle);
  
  // Use builder sections if we're previewing the same page, otherwise use database
  const [previewSections, setPreviewSections] = useState<Section[]>([]);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  
  useEffect(() => {
    // Preview should ALWAYS show draft content
    // If builder store has the same page loaded, use its sections for instant preview
    if (builderPageId === pageId && builderSections.length > 0) {
      setPreviewSections(builderSections);
      setPreviewTitle(builderPageTitle);
    } else if (page) {
      // Otherwise fall back to database draft sections (NOT published)
      setPreviewSections(page.sections || []);
      setPreviewTitle(page.title || page.path);
    }
  }, [builderPageId, pageId, builderSections, builderPageTitle, page]);
  
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
              Preview Mode - {project?.name || 'Loading...'} - {previewTitle}
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

      {/* Render sections with theme */}
      <ThemeProvider theme={theme} className="min-h-screen">
        <div 
          className="w-full @container"
          style={{ containerType: 'inline-size' }}
        >
          {previewSections.length === 0 ? (
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
            previewSections.map((section: Section) => {
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