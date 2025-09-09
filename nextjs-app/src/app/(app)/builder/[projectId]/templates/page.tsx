'use client';

import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { FileCode, Layout, Grid } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function TemplatesPage() {
  const params = useParams();
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Templates</h1>
            <p className="text-muted-foreground">
              Browse and apply pre-built templates to your pages
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-24 px-8 bg-muted/20 rounded-lg border-2 border-dashed">
            <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Template Library</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Choose from our collection of professionally designed page templates to quickly build your website.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span>Page Layouts</span>
              </div>
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                <span>Section Templates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}