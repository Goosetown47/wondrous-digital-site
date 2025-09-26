'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import { TierBadge } from '@/components/ui/tier-badge';
import { useAccountProjects } from '@/hooks/useProjects';

interface AccountProjectSelectorProps {
  isCollapsed?: boolean;
}

export function AccountProjectSelector({ isCollapsed = false }: AccountProjectSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentAccount, currentProject, accounts, setCurrentAccount, setCurrentProject } = useAuth();
  const [accountSearch, setAccountSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch projects for current account - must be called before any conditional returns
  const { data: projects = [] } = useAccountProjects(currentAccount?.id, false);

  // Auto-select first project when account changes
  useEffect(() => {
    // Only run when we have an account and projects loaded
    if (currentAccount && projects.length > 0) {
      // If no project selected or project doesn't belong to account, select first
      if (!currentProject || currentProject.account_id !== currentAccount.id) {
        setCurrentProject(projects[0]);
      }
    }
    // Only depend on account ID and projects changing to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount?.id, projects]);

  if (isCollapsed) {
    return null;
  }

  const filteredAccounts = accounts?.filter(account =>
    account.name.toLowerCase().includes(accountSearch.toLowerCase())
  ) || [];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase())
  );


  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-3 bg-[#F8F8F6] hover:bg-[#F8F8F6]"
          >
            <div className="flex flex-col items-start gap-0.5">
              {/* Account name */}
              <span className="text-sm font-semibold text-[#404040]">
                {currentAccount?.name || 'Select Account'}
              </span>
              {/* Project name */}
              {currentProject && (
                <span className="text-xs text-[#818181]">
                  {currentProject.name}
                </span>
              )}
            </div>
            <ChevronDown className={cn(
              "h-5 w-5 text-[#404040] transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="p-0 w-[640px]">
          <div className="flex">
            {/* Accounts Column */}
            <div className="w-1/2 border-r border-gray-200">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search Accounts"
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              
              <div className="py-2">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-[#818181] uppercase tracking-wider">
                    Accounts
                  </h3>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredAccounts.map((account) => (
                    <button
                      key={account.id}
                      className={cn(
                        "w-full px-3 py-2 text-left hover:bg-[#F8F8F6] flex items-center justify-between group",
                        currentAccount?.id === account.id && "bg-[#F8F8F6]"
                      )}
                      onClick={() => {
                        setCurrentAccount(account);
                        setCurrentProject(null); // Reset project when switching accounts - will auto-select first via useEffect
                        // Keep dropdown open so user can select a project
                        // setIsOpen(false); // REMOVED - don't auto-close
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={cn(
                            'w-4 h-4',
                            currentAccount?.id === account.id ? 'text-[#404040]' : 'text-transparent'
                          )}
                        />
                        <span className="text-sm font-medium text-[#404040]">
                          {account.name}
                        </span>
                      </div>
                      {account.tier && (
                        <TierBadge tier={account.tier} size="sm" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects Column */}
            <div className="w-1/2">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search Projects"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              
              <div className="py-2">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-[#818181] uppercase tracking-wider">
                    Projects
                  </h3>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      className={cn(
                        "w-full px-3 py-2 text-left hover:bg-[#F8F8F6] flex items-center justify-between group",
                        currentProject?.id === project.id && "bg-[#F8F8F6]"
                      )}
                      onClick={() => {
                        setCurrentProject(project);
                        setIsOpen(false);

                        // Navigate to new project if we're in Builder
                        if (pathname.includes('/builder/')) {
                          router.push(`/builder/${project.id}`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={cn(
                            'w-4 h-4',
                            currentProject?.id === project.id ? 'text-[#404040]' : 'text-transparent'
                          )}
                        />
                        <span className="text-sm font-medium text-[#404040]">
                          {project.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}