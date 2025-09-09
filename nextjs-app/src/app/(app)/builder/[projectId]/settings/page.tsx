'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useThemes } from '@/hooks/useThemes';
import { useHasPermission } from '@/hooks/usePermissions';
import { validateSlug } from '@/lib/services/slug-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Palette, AlertTriangle, Loader2, AlertCircle, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useArchiveProject } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

export default function BuilderSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, setCurrentProject } = useAuth();
  const projectId = params.projectId as string;
  const { data: project, isLoading } = useProject(projectId);
  const { data: themes } = useThemes();
  const updateProject = useUpdateProject(projectId);
  const archiveProject = useArchiveProject();
  const { data: isAdmin } = useHasPermission('system:admin');

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [themeId, setThemeId] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [slugValidation, setSlugValidation] = useState<ReturnType<typeof validateSlug> | null>(null);

  // Dialog state
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  // Initialize form with project data and sync current project
  useEffect(() => {
    if (project) {
      setName(project.name);
      setSlug(project.slug);
      setDescription(project.description || '');
      setThemeId(project.theme_id || 'none');
      
      // Sync current project in auth context
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  // Check for changes
  useEffect(() => {
    if (project) {
      const changed = 
        name !== project.name || 
        slug !== project.slug || 
        description !== (project.description || '') ||
        themeId !== (project.theme_id || 'none');
      setHasChanges(changed);
    }
  }, [name, slug, description, themeId, project]);

  // Validate slug whenever it changes
  useEffect(() => {
    if (slug && slug !== project?.slug) {
      const validation = validateSlug(slug, isAdmin || false);
      setSlugValidation(validation);
    } else {
      setSlugValidation(null);
    }
  }, [slug, isAdmin, project?.slug]);

  const handleSave = () => {
    // Check slug validation before saving
    if (slugValidation && !slugValidation.isValid && !isAdmin) {
      toast.error(slugValidation.message || 'Invalid slug');
      return;
    }
    
    updateProject.mutate({
      name,
      slug,
      description: description || null,
      theme_id: themeId === 'none' ? null : themeId,
    }, {
      onSuccess: (updatedProject) => {
        setHasChanges(false);
        toast.success('Project settings saved');
        
        // Update the current project in auth context if it's the one being edited
        if (currentProject?.id === projectId) {
          setCurrentProject(updatedProject);
        }
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to update project');
        }
      },
    });
  };

  const handleArchive = () => {
    archiveProject.mutate(projectId, {
      onSuccess: () => {
        router.push('/dashboard');
      },
    });
  };

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
              <Settings className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Settings</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your project configuration and preferences
            </p>
          </div>

          {/* General Settings Section */}
          <div className="space-y-8">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-6">General Settings</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Project"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is your project's display name. Changing this won't affect your URL slug or preview domain.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setSlug(newSlug);
                    }}
                    pattern="[a-z0-9\-]+"
                    placeholder="my-awesome-project"
                    className={cn(
                      slugValidation && !slugValidation.isValid && !isAdmin && "border-red-500"
                    )}
                  />
                  
                  {/* Validation feedback */}
                  {slugValidation && slug !== project.slug && (
                    <>
                      {!slugValidation.isValid && !isAdmin && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {slugValidation.message}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {slugValidation.isReserved && isAdmin && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-yellow-600">
                            {slugValidation.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                  
                  {slug && (
                    <div className="rounded-md bg-muted px-3 py-2 text-sm">
                      <p className="font-medium">Preview domain:</p>
                      <code className="text-xs">{slug}.wondrousdigital.com</code>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    The slug determines your preview domain URL. It must be unique across all projects.
                  </p>
                  {hasChanges && slug !== project.slug && !slugValidation && (
                    <p className="text-sm text-yellow-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Warning: Changing the slug will break existing preview domain links
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your project..."
                    rows={3}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Created on {format(new Date(project.created_at), 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            {/* Design Settings Section */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design & Templates
              </h2>
              
              <div className="space-y-6">
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
                  <p className="text-sm text-muted-foreground">
                    Choose a theme to style your entire site
                  </p>
                </div>

                <div className="rounded-lg border border-dashed p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">Site Templates</h3>
                  <p className="text-muted-foreground mb-4">
                    Coming soon! Apply complete site templates with pages, sections, and content.
                  </p>
                  <Button variant="outline" disabled>
                    Browse Templates
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone Section */}
            <div className="bg-card rounded-lg border border-orange-200 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-orange-900">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h2>
              
              <div className="rounded-lg bg-orange-50/50 p-4">
                <h3 className="font-semibold mb-2 text-orange-900">Archive Project</h3>
                <p className="text-sm text-orange-800 mb-4">
                  Archiving will take your site offline immediately. You can restore it later from the Archived Projects section.
                </p>
                <div className="text-sm text-orange-700 space-y-1 mb-4">
                  <p>⚠️ Your site will no longer be accessible</p>
                  <p>⚠️ Custom domains will stop working</p>
                  <p>⚠️ Preview domain will show 404</p>
                  <p>✓ You can restore or permanently delete it from Dashboard → Archived Projects</p>
                </div>
                <Button
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  onClick={() => setShowArchiveDialog(true)}
                >
                  Archive Project
                </Button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateProject.isPending || !!(slugValidation && !slugValidation.isValid && !isAdmin)}
              >
                {updateProject.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Archive Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{project.name}"? This will hide it from your dashboard,
              but you can restore it later from the archived projects section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}