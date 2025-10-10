'use client';

import { ComponentRegistry } from '@/lib/register-components';
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
import type { Section, ProjectSection } from '@/stores/builderStore';
import { useProjectSections } from '@/hooks/useProjectSections';

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const pageId = params.pageId as string;
  const { data: project } = useProject(projectId);
  const { data: page, isLoading } = usePageById(pageId);
  const { data: domains } = useDomains(projectId);
  const { data: theme } = useTheme(project?.theme_id);
  const { data: projectSections = [] } = useProjectSections(projectId);
  
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

  // Organize global sections by placement
  const globalHeaders = projectSections.filter(s => s.section_placement === 'global_header');
  const globalFooters = projectSections.filter(s => s.section_placement === 'global_footer');
  const aboveContent = projectSections.filter(s => s.section_placement === 'above_content');
  const belowContent = projectSections.filter(s => s.section_placement === 'below_content');

  // Helper function to render a section (works for both page and project sections)
  const renderSection = (section: Section | ProjectSection, key: string) => {
    const componentName = section.component_name || 'HeroTwoColumn';
    const registryEntry = ComponentRegistry.get(componentName);

    if (!registryEntry) {
      return (
        <div key={key} className="py-12 px-4 bg-gray-100 border-2 border-dashed border-gray-300">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500">Component "{componentName}" not found</p>
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
        onUpdate={() => {}}
        projectId={projectId}
      />
    );
  };

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
          {/* Global Headers */}
          {globalHeaders.map((section) => renderSection(section, `header-${section.id}`))}

          {/* Above Content Global Sections */}
          {aboveContent.map((section) => renderSection(section, `above-${section.id}`))}

          {/* Page-Specific Sections */}
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
            previewSections.map((section: Section) => renderSection(section, section.id))
          )}

          {/* Below Content Global Sections */}
          {belowContent.map((section) => renderSection(section, `below-${section.id}`))}

          {/* Global Footers */}
          {globalFooters.map((section) => renderSection(section, `footer-${section.id}`))}
        </div>
      </ThemeProvider>
    </div>
  );
}