'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Check, ChevronsUpDown, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/auth-provider';
import { useAccount } from '@/hooks/useAccounts';
import { useProjects } from '@/hooks/useProjects';

export function ProjectDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentAccount, currentProject, setCurrentProject } = useAuth();
  const { data: freshAccount } = useAccount(currentAccount?.id);
  const { data: allProjects } = useProjects(false);

  // Filter projects for current account (excluding archived)
  const projects = useMemo(() => 
    allProjects?.filter(p => p.account_id === currentAccount?.id && !p.archived_at) || [],
    [allProjects, currentAccount?.id]
  );

  // Extract project ID from URL if on project-specific page
  const projectIdFromUrl = useMemo(() => {
    // Check if we're on a project-specific route
    const matches = pathname.match(/\/(builder|project)\/([a-f0-9-]+)/);
    return matches ? matches[2] : null;
  }, [pathname]);

  useEffect(() => {
    // If we have a project ID from the URL, sync it
    if (projectIdFromUrl && projects.length > 0) {
      const urlProject = projects.find(p => p.id === projectIdFromUrl);
      if (urlProject && (!currentProject || currentProject.id !== urlProject.id)) {
        setCurrentProject(urlProject);
        return;
      }
    }
    
    // If current project is not in the list, clear it
    if (currentProject && !projects.some(p => p.id === currentProject.id)) {
      setCurrentProject(null);
    }
    
    // Auto-select first project if none selected and projects are available
    // BUT only if we're not on a project-specific page
    if (!currentProject && !projectIdFromUrl && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [projects, currentProject, setCurrentProject, projectIdFromUrl]);

  // Only show if account is selected
  if (!currentAccount) {
    return null;
  }

  if (!allProjects) {
    return (
      <div className="px-3 py-2">
        <div className="h-8 w-full animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <FolderOpen className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {currentProject?.name || 'No project selected'}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
          <DropdownMenuLabel>
            Projects in {freshAccount?.name || currentAccount.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.length === 0 ? (
            <DropdownMenuItem disabled>
              No projects in this account
            </DropdownMenuItem>
          ) : (
            projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onSelect={async () => {
                  setCurrentProject(project);

                  // Check if we're in the builder with a specific page
                  const builderMatch = pathname.match(/\/builder\/[^/]+\/([^/]+)/);
                  const isInBuilderCanvas = builderMatch !== null;

                  // Navigate based on current context
                  if (isInBuilderCanvas) {
                    // When in builder canvas, we need to navigate to the new project's homepage
                    // The redirect page will handle finding the homepage
                    router.push(`/builder/${project.id}`);
                  } else if (pathname.includes('/builder/')) {
                    // On builder redirect page or other builder pages
                    router.push(`/builder/${project.id}`);
                  } else if (pathname.includes('/project/')) {
                    router.push(`/project/${project.id}/settings`);
                  } else {
                    // Default to builder if we're not in a specific project context
                    router.push(`/builder/${project.id}`);
                  }
                }}
                className="flex items-center justify-between"
              >
                <span>{project.name}</span>
                {currentProject?.id === project.id && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}