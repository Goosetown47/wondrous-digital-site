'use client';

import { useState } from 'react';
import { useCreatePage } from '@/hooks/usePages';
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
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PageCreationDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PageCreationDialog({ 
  projectId, 
  open, 
  onOpenChange 
}: PageCreationDialogProps) {
  const createPage = useCreatePage();
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generatePath = (title: string) => {
    return '/' + title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate path if user hasn't manually edited it
    if (!path || path === generatePath(title)) {
      setPath(generatePath(value));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!path.trim()) {
      newErrors.path = 'Path is required';
    } else if (!path.startsWith('/')) {
      newErrors.path = 'Path must start with /';
    } else if (!/^\/[a-z0-9\-\/]*$/.test(path)) {
      newErrors.path = 'Path can only contain lowercase letters, numbers, hyphens, and slashes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    createPage.mutate({
      project_id: projectId,
      title: title.trim(),
      path: path.trim(),
      metadata: {
        description: description.trim(),
        status: 'published'
      }
    }, {
      onSuccess: (page) => {
        // Reset form
        setTitle('');
        setPath('');
        setDescription('');
        setErrors({});
        onOpenChange(false);
      },
      onError: (error) => {
        if (error.message.includes('duplicate key')) {
          setErrors({ path: 'A page with this path already exists' });
        }
      }
    });
  };

  const handleCancel = () => {
    setTitle('');
    setPath('');
    setDescription('');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Add a new page to your website
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                placeholder="About Us"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">URL Path</Label>
              <Input
                id="path"
                placeholder="/about-us"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className={errors.path ? 'border-destructive' : ''}
              />
              {errors.path && (
                <p className="text-sm text-destructive">{errors.path}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The URL where this page will be accessible
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the page content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Used for SEO and internal reference
              </p>
            </div>
          </div>

          {createPage.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createPage.error?.message || 'Failed to create page'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createPage.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPage.isPending}
            >
              {createPage.isPending ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}