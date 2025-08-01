'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useAccountRole } from '@/hooks/useRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, FolderOpen, Sparkles, Plus } from 'lucide-react';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';

export default function DashboardPage() {
  const router = useRouter();
  const { currentAccount, currentProject } = useAuth();
  const { data: accountRole } = useAccountRole();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Check if user can create projects (account owner or admin)
  const canCreateProjects = accountRole === 'account_owner' || accountRole === 'admin';

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Wondrous Digital
          </h1>
          <p className="text-muted-foreground mt-2">
            Build beautiful websites with our visual builder
          </p>
        </div>
        {currentAccount && canCreateProjects && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        )}
      </div>

      {/* Current Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Account</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentAccount?.name || 'No account selected'}
            </div>
            {currentAccount && (
              <p className="text-xs text-muted-foreground">
                {currentAccount.plan} plan
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Project</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentProject?.name || 'No project selected'}
            </div>
            {currentProject && (
              <p className="text-xs text-muted-foreground">
                Ready to build
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Builder Status</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentProject ? 'Available' : 'Select a project'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentProject ? 'Click Builder in the menu' : 'Use the dropdown above'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {currentAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!currentProject ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No project selected. {canCreateProjects ? 'Create a new project or select an existing one from the dropdown above.' : 'Select a project from the dropdown above to get started.'}
                </p>
                {canCreateProjects && (
                  <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Project
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => router.push(`/builder/${currentProject.id}`)}
                >
                  Open Builder
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push(`/project/${currentProject.id}/settings`)}
                >
                  Project Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}