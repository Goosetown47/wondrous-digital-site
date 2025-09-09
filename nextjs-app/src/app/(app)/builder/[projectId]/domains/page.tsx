'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { DomainSettings } from '@/components/DomainSettings';
import { Globe } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DomainsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Domains</h1>
            </div>
            <p className="text-muted-foreground">
              Manage custom domains for your website
            </p>
          </div>

          {/* Domain Settings Component */}
          <DomainSettings projectId={projectId} projectSlug={project.slug} />
        </div>
      </div>
    </div>
  );
}