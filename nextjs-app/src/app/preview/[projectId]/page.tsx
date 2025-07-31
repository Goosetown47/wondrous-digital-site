'use client';

import { getSectionComponent } from '@/components/sections/index';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { usePage } from '@/hooks/usePages';
import { useDomains } from '@/hooks/useDomains';

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project } = useProject(projectId);
  const { data: page, isLoading } = usePage(projectId);
  const { data: domains } = useDomains(projectId);
  
  // Get the primary domain or first available domain
  const primaryDomain = domains?.find(d => d.is_primary) || domains?.[0];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const sections = page?.sections || [];

  return (
    <div className="min-h-screen">
      {/* Preview toolbar */}
      <div className="bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/builder/${projectId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Builder
              </Link>
            </Button>
            <span className="text-sm opacity-75">
              Preview Mode - {project?.name || 'Loading...'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {primaryDomain ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://${primaryDomain.domain}`} target="_blank" rel="noopener noreferrer">
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

      {/* Render sections from database */}
      {sections.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No sections to preview</p>
            <Button variant="outline" asChild>
              <Link href={`/builder/${projectId}`}>
                Go back to builder
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        sections.map((section) => {
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
  );
}