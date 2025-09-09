'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useAccountProjects } from '@/hooks/useProjects';
import { Loader2, Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BuilderRedirectPage() {
  const router = useRouter();
  const { currentAccount, currentProject, setCurrentProject } = useAuth();
  const { data: projects, isLoading } = useAccountProjects(currentAccount?.id);

  useEffect(() => {
    // If there's a current project, redirect to it
    if (currentProject) {
      router.replace(`/builder/${currentProject.id}`);
      return;
    }

    // If there are projects but no current selection, select the first one
    if (projects && projects.length > 0 && !currentProject) {
      const firstProject = projects[0];
      setCurrentProject(firstProject);
      router.replace(`/builder/${firstProject.id}`);
    }
  }, [currentProject, projects, router, setCurrentProject]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  // If no projects exist, show empty state
  if (!projects || projects.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Blocks className="h-6 w-6" />
            </div>
            <CardTitle>No Projects Available</CardTitle>
            <CardDescription>
              You need to create a project before you can use the Builder.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Loading Builder...</p>
      </div>
    </div>
  );
}