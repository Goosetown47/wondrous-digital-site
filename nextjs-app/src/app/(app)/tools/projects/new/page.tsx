'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateProject, useProject } from '@/hooks/useProjects';
import { updateProject } from '@/lib/services/projects';
import { useAccounts } from '@/hooks/useAccounts';
import { useThemes } from '@/hooks/useThemes';
import { useHasPermission } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/auth/PermissionGate';
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
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { validateSlug } from '@/lib/services/slug-validation';
import { cn } from '@/lib/utils';

function NewProjectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: themes, isLoading: themesLoading } = useThemes();
  const { data: templateProject } = useProject(templateId || undefined);
  const { mutate: createProject, isPending } = useCreateProject();
  const { data: isAdmin } = useHasPermission('system:admin');
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [accountId, setAccountId] = useState('');
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

  // Pre-fill from template
  useEffect(() => {
    if (templateProject) {
      setName(`${templateProject.name} Copy`);
      if (templateProject.theme_id) {
        setThemeId(templateProject.theme_id);
      }
    }
  }, [templateProject]);

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
    
    if (!name || !accountId || !slug) {
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
        account_id: accountId,
        slug: slug.trim(),
        template_id: templateId || null,
      },
      {
        onSuccess: async (project) => {
          console.log('🎨 [NewProject] Project created successfully:', project.id);
          
          // If a theme was selected, update the project with the theme
          if (themeId && themeId !== 'none') {
            console.log('🎨 [NewProject] Setting theme:', themeId);
            try {
              await updateProject(project.id, { theme_id: themeId });
              console.log('✅ [NewProject] Theme set successfully');
              toast.success('Project created with theme applied!');
              router.push('/tools/projects');
            } catch (error) {
              console.error('❌ [NewProject] Theme update error:', error);
              toast.error('Project created but theme failed to apply');
              router.push('/tools/projects');
            }
          } else {
            // No theme selected, just navigate
            toast.success('Project created successfully!');
            router.push('/tools/projects');
          }
        },
      }
    );
  };

  return (
    <PermissionGate permission="projects:create">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {templateId ? 'Clone Project' : 'Create New Project'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Website"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              URL Slug *
              {!customSlug && (
                <span className="text-sm text-muted-foreground ml-2">
                  (auto-generated from name)
                </span>
              )}
            </Label>
            <Input
              id="slug"
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
            <Label htmlFor="account">Account *</Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accountsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading accounts...
                  </SelectItem>
                ) : accounts?.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No accounts available
                  </SelectItem>
                ) : (
                  accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.plan})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme (Optional)</Label>
            <Select value={themeId} onValueChange={setThemeId}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select a theme (optional)" />
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

          {templateId && templateProject && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm">
                <strong>Template:</strong> {templateProject.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This project will be cloned with all its pages and settings
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isPending || !!(slugValidation && !slugValidation.isValid && !isAdmin)}
            >
              {isPending ? 'Creating...' : 'Create Project'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PermissionGate>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <NewProjectPageContent />
    </Suspense>
  );
}