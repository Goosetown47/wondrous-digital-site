'use client';

import { useState, useEffect } from 'react';
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
import { getAccountProjects } from '@/lib/permissions';
import { useAccount } from '@/hooks/useAccounts';
import { useProjects } from '@/hooks/useProjects';
import type { Project } from '@/types/database';

export function ProjectDropdown() {
  const { user, currentAccount, currentProject, setCurrentProject } = useAuth();
  const { data: freshAccount } = useAccount(currentAccount?.id);
  const { data: allProjects } = useProjects(currentAccount?.id);
  const [loading, setLoading] = useState(false);

  // Filter projects for current account (excluding archived)
  const projects = allProjects?.filter(p => p.account_id === currentAccount?.id && !p.archived_at) || [];

  useEffect(() => {
    // If current project is not in the list, clear it
    if (currentProject && !projects.some(p => p.id === currentProject.id)) {
      setCurrentProject(null);
    }
  }, [projects, currentProject, setCurrentProject]);

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
                onSelect={() => setCurrentProject(project)}
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