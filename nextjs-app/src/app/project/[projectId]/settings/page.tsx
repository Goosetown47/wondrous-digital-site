'use client';

import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { DomainSettings } from '@/components/DomainSettings';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project } = useProject(projectId);

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
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/sites/${projectId}`} target="_blank">
                    View Live
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}