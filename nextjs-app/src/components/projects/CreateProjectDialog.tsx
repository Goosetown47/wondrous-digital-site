'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useCreateProject } from '@/hooks/useProjects';
import { useThemes } from '@/hooks/useThemes';
import { useHasPermission } from '@/hooks/usePermissions';
import { updateProject } from '@/lib/services/projects';
import { validateSlug } from '@/lib/services/slug-validation';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, AlertCircle, AlertTriangle } from 'lucide-react';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const router = useRouter();
  const { currentAccount, setCurrentProject } = useAuth();
  const { data: themes, isLoading: themesLoading } = useThemes();
  const { mutate: createProject, isPending } = useCreateProject();
  const { data: isAdmin } = useHasPermission('system:admin');
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [themeId, setThemeId] = useState('none');
  const [customSlug, setCustomSlug] = useState(false);
  const [slugValidation, setSlugValidation] = useState<ReturnType<typeof validateSlug> | null>(null);

  // Auto-generate slug from name
  useEffect(() => {
    if (!customSlug && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug || 'untitled-project');
    }
  }, [name, customSlug]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setName('');
      setSlug('');
      setThemeId('none');
      setCustomSlug(false);
      setSlugValidation(null);
    }
  }, [open]);

  // Validate slug whenever it changes
  useEffect(() => {
    if (slug) {
      const validation = validateSlug(slug, isAdmin || false);
      setSlugValidation(validation);
    } else {
      setSlugValidation(null);
    }
  }, [slug, isAdmin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !slug || !currentAccount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check slug validation
    if (slugValidation && !slugValidation.isValid && !isAdmin) {
      toast.error(slugValidation.message || 'Invalid slug');
      return;
    }

    createProject(
      {
        name: name.trim(),
        account_id: currentAccount.id,
        slug: slug.trim(),
      },
      {
        onSuccess: async (project) => {
          // If a theme was selected, update the project with the theme
          if (themeId && themeId !== 'none') {
            try {
              await updateProject(project.id, { theme_id: themeId });
              toast.success('Project created with theme applied!');
            } catch (error) {
              console.error('Theme update error:', error);
              toast.error('Project created but theme failed to apply');
            }
          } else {
            toast.success('Project created successfully!');
          }
          
          // Set as current project and navigate to builder
          setCurrentProject(project);
          onOpenChange(false);
          router.push(`/builder/${project.id}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project in {currentAccount?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Website"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-slug">
                URL Slug
                {!customSlug && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (auto-generated)
                  </span>
                )}
              </Label>
              <Input
                id="project-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setCustomSlug(true);
                }}
                placeholder="my-awesome-website"
                pattern="[a-z0-9\-]+"
                title="Only lowercase letters, numbers, and hyphens"
                required
                className={cn(
                  slugValidation && !slugValidation.isValid && !isAdmin && "border-red-500"
                )}
              />
              <p className="text-sm text-muted-foreground">
                This will be used in the project URL
              </p>
              
              {/* Validation feedback */}
              {slugValidation && slug && (
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-theme">Theme (Optional)</Label>
              <Select value={themeId} onValueChange={setThemeId}>
                <SelectTrigger id="project-theme">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No theme</SelectItem>
                  {themesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading themes...
                    </SelectItem>
                  ) : (
                    themes?.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                You can change the theme later in project settings
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !!(slugValidation && !slugValidation.isValid && !isAdmin)}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}