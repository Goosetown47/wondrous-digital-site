'use client';

import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { useDomains } from '@/hooks/useDomains';
import { DomainSettings } from '@/components/DomainSettings';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project } = useProject(projectId);
  const { data: domains } = useDomains(projectId);
  
  // Get the primary domain or first available domain
  const primaryDomain = domains?.find(d => d.is_primary) || domains?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Project Settings
            </h1>
            <Button variant="outline" size="sm" asChild>
              <Link href="/setup">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </div>
          <p className="text-gray-600">
            Configure settings for {project?.name || 'Loading...'}
          </p>
        </div>

        {/* Settings sections */}
        <div className="space-y-8">
          {/* Domain settings */}
          <DomainSettings projectId={projectId} />

          {/* Quick links */}
          <div className="p-6 bg-white rounded-lg border">
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Page Builder</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/builder/${projectId}`}>
                    Open Builder
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Preview Site</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/preview/${projectId}`}>
                    Preview
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Live Site</span>
                {primaryDomain ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://${primaryDomain.domain}`} target="_blank" rel="noopener noreferrer">
                      View Live
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-gray-500">No domain configured</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}