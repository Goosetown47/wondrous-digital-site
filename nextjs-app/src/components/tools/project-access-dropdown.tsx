'use client';

import { useMemo } from 'react';
import { useAccountProjectsWithAccess, useUserProjectCount } from '@/hooks/useAccountProjects';
import { useGrantProjectAccess, useRevokeProjectAccess } from '@/hooks/useProjectAccess';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectAccessDropdownProps {
  userId: string;
  accountId: string;
  userRole: 'user' | 'account_owner' | 'admin' | 'staff';
}

export function ProjectAccessDropdown({ userId, accountId, userRole }: ProjectAccessDropdownProps) {
  const { data: projectsWithAccess, isLoading: projectsLoading } = useAccountProjectsWithAccess(accountId, userId);
  const { data: projectCount } = useUserProjectCount(accountId, userId);
  const grantAccess = useGrantProjectAccess();
  const revokeAccess = useRevokeProjectAccess();
  
  // Separate active and available projects
  const activeProjects = useMemo(() => {
    return projectsWithAccess?.filter(p => p.has_access) || [];
  }, [projectsWithAccess]);
  
  const availableProjects = useMemo(() => {
    return projectsWithAccess?.filter(p => !p.has_access) || [];
  }, [projectsWithAccess]);
  
  // Get selector text
  const getSelectorText = () => {
    if (projectsLoading) return 'Loading...';
    
    const { total = 0, accessible = 0 } = projectCount || {};
    
    // Account owners always have access to all projects
    if (userRole === 'account_owner') {
      if (total === 0) return 'No Projects';
      return total === 1 ? '1 Project' : `All ${total} Projects`;
    }
    
    // Regular users
    if (accessible === 0) return 'No Access';
    if (accessible === total && total > 0) return `All ${total} Projects`;
    return accessible === 1 ? '1 Project' : `${accessible} Projects`;
  };
  
  const handleToggleAccess = async (projectId: string, currentlyHasAccess: boolean) => {
    try {
      if (currentlyHasAccess) {
        await revokeAccess.mutateAsync({
          projectId,
          userId,
          accountId,
        });
        toast.success('Project access revoked');
      } else {
        await grantAccess.mutateAsync({
          projectId,
          userId,
          accountId,
          accessLevel: 'viewer', // Default access level
        });
        toast.success('Project access granted');
      }
    } catch (error) {
      console.error('Failed to toggle project access:', error);
      toast.error(currentlyHasAccess ? 'Failed to revoke access' : 'Failed to grant access');
    }
  };
  
  // If account owner, admin, or staff, just show the count (they have implicit access to all)
  if (userRole === 'account_owner' || userRole === 'admin' || userRole === 'staff') {
    return (
      <span className="text-sm text-muted-foreground">
        {getSelectorText()}
      </span>
    );
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 justify-between min-w-[140px]"
        >
          <span className="text-sm">{getSelectorText()}</span>
          <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-4 space-y-4">
            {/* Active Projects Section */}
            {activeProjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Projects
                  </Label>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Access
                  </span>
                </div>
                
                <div className="space-y-1">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30">
                      <span className="text-sm font-medium flex-1">{project.name}</span>
                      <Checkbox
                        id={`active-${project.id}`}
                        checked={true}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            handleToggleAccess(project.id, true);
                          }
                        }}
                        disabled={grantAccess.isPending || revokeAccess.isPending}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Available Projects Section */}
            {availableProjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Projects
                  </Label>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Access
                  </span>
                </div>
                
                <div className="border rounded-md">
                  <ScrollArea className="h-[180px] p-3">
                    {projectsLoading ? (
                      <div className="text-sm text-muted-foreground text-center py-4">Loading projects...</div>
                    ) : availableProjects.length > 0 ? (
                      <div className="space-y-1">
                        {availableProjects.map((project) => (
                          <div key={project.id} className="flex items-center justify-between py-2 px-2 hover:bg-muted/30 rounded">
                            <Label
                              htmlFor={`add-${project.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {project.name}
                            </Label>
                            <Checkbox
                              id={`add-${project.id}`}
                              checked={false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleToggleAccess(project.id, false);
                                }
                              }}
                              disabled={grantAccess.isPending || revokeAccess.isPending}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No available projects
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
            
            {/* No projects at all */}
            {!projectsLoading && projectsWithAccess?.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No projects in this account
              </div>
            )}
          </div>
      </PopoverContent>
    </Popover>
  );
}