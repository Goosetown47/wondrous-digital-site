'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject, useUpdateProject, useArchiveProject, useRestoreProject, useDeleteProject } from '@/hooks/useProjects';
import { useThemes } from '@/hooks/useThemes';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, ExternalLink, Archive, ArchiveRestore, Trash2, Copy, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Handle async params for Next.js 15
  const [projectId, setProjectId] = useState<string | null>(null);
  
  React.useEffect(() => {
    // Params is always a Promise in Next.js 15
    params.then(p => setProjectId(p.id));
  }, [params]);
  
  const { data: project, isLoading } = useProject(projectId || undefined);
  const { data: themes } = useThemes();
  const { mutate: updateProject } = useUpdateProject(projectId || '');
  const { mutate: archiveProject } = useArchiveProject();
  const { mutate: restoreProject } = useRestoreProject();
  const { mutate: deleteProject } = useDeleteProject();
  
  const [name, setName] = useState(project?.name || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [themeId, setThemeId] = useState(project?.theme_id || 'none');
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState(false);

  // Update local state when project loads
  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setSlug(project.slug);
      setThemeId(project.theme_id || 'none');
    }
  }, [project]);

  // Check for changes
  React.useEffect(() => {
    if (project) {
      const changed = 
        name !== project.name || 
        slug !== project.slug || 
        themeId !== (project.theme_id || 'none');
      setHasChanges(changed);
    }
  }, [name, slug, themeId, project]);

  const handleSave = () => {
    updateProject({
      name,
      slug,
      theme_id: themeId === 'none' ? null : themeId,
    });
    setHasChanges(false);
  };

  const handleArchive = () => {
    if (!projectId) return;
    archiveProject(projectId, {
      onSuccess: () => {
        setArchiveDialog(false);
      },
    });
  };

  const handleRestore = () => {
    if (!projectId) return;
    restoreProject(projectId);
  };

  const handleDelete = () => {
    if (!projectId) return;
    deleteProject(projectId, {
      onSuccess: () => {
        router.push('/tools/projects');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 pt-6">
        <div className="text-center">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 p-8 pt-6">
        <div className="text-center">Project not found</div>
      </div>
    );
  }

  return (
    <PermissionGate permission="projects:read">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
              <div className="flex items-center gap-4 mt-1">
                <Badge variant="outline">{project.accounts?.name}</Badge>
                {project.archived_at && (
                  <Badge variant="secondary">Archived</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/builder/${project.id}`)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Builder
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/builder/${project.id}/pages`)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Pages
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/tools/projects/new?template=${project.id}`)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Clone
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <p className="text-lg font-medium mt-1">
                  {format(new Date(project.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Created By
                </div>
                <p className="text-lg font-medium mt-1">
                  {project.creator?.display_name || 'System'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Plan</div>
                <p className="text-lg font-medium mt-1 capitalize">
                  {project.accounts?.tier || 'FREE'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Theme</div>
                <p className="text-lg font-medium mt-1">
                  {project.theme_id ? themes?.find(t => t.id === project.theme_id)?.name || 'Unknown' : 'None'}
                </p>
              </div>
            </div>

            {project.template_id && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm">
                  <strong>Cloned from template:</strong> Project ID {project.template_id}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  pattern="[a-z0-9\-]+"
                  title="Only lowercase letters, numbers, and hyphens"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={themeId} onValueChange={setThemeId}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No theme</SelectItem>
                    {themes?.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={!hasChanges}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setName(project.name);
                    setSlug(project.slug);
                    setThemeId(project.theme_id || 'none');
                  }}
                  disabled={!hasChanges}
                >
                  Cancel
                </Button>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                {project.archived_at ? (
                  <div className="flex items-center justify-between rounded-lg border border-green-200 p-4">
                    <div>
                      <p className="font-medium">Restore this project</p>
                      <p className="text-sm text-muted-foreground">
                        Make this project active again
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-green-600 text-green-600"
                      onClick={handleRestore}
                    >
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Restore Project
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-orange-200 p-4">
                    <div>
                      <p className="font-medium">Archive this project</p>
                      <p className="text-sm text-muted-foreground">
                        Hide this project from active views
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-orange-600 text-orange-600"
                      onClick={() => setArchiveDialog(true)}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Project
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between rounded-lg border border-red-200 p-4">
                  <div>
                    <p className="font-medium">Delete this project</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently remove this project and all its data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600"
                    onClick={() => setDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="domains" className="space-y-4">
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              Domain management coming soon
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              Activity logs coming soon
            </div>
          </TabsContent>
        </Tabs>

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={archiveDialog} onOpenChange={setArchiveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive "{project.name}"? 
                This will hide the project from active views but can be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive} className="bg-orange-600">
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete "{project.name}"? 
                This action cannot be undone and will remove all project data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGate>
  );
}