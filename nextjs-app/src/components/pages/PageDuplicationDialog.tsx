'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/types/database';
import { useDuplicatePage } from '@/hooks/usePages';
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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PageDuplicationDialogProps {
  page: Page | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PageDuplicationDialog({ 
  page, 
  open, 
  onOpenChange 
}: PageDuplicationDialogProps) {
  const duplicatePage = useDuplicatePage();
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when page changes
  useEffect(() => {
    if (page) {
      setTitle(`${page.title || 'Untitled'} (Copy)`);
      setPath(page.path === '/' ? '/copy' : `${page.path}-copy`);
    }
  }, [page]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!path.trim()) {
      newErrors.path = 'Path is required';
    } else if (!path.startsWith('/')) {
      newErrors.path = 'Path must start with /';
    } else if (!/^\/[a-z0-9\-/]*$/.test(path)) {
      newErrors.path = 'Path can only contain lowercase letters, numbers, hyphens, and slashes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !page) return;

    duplicatePage.mutate({
      pageId: page.id,
      newPath: path.trim(),
      newTitle: title.trim()
    }, {
      onSuccess: () => {
        // Reset form
        setTitle('');
        setPath('');
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
    setErrors({});
    onOpenChange(false);
  };

  if (!page) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Duplicate Page</DialogTitle>
            <DialogDescription>
              Create a copy of "{page.title || 'Untitled Page'}"
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">New Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">New URL Path</Label>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className={errors.path ? 'border-destructive' : ''}
              />
              {errors.path && (
                <p className="text-sm text-destructive">{errors.path}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The URL where the duplicated page will be accessible
              </p>
            </div>
          </div>

          {duplicatePage.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {duplicatePage.error?.message || 'Failed to duplicate page'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={duplicatePage.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={duplicatePage.isPending}
            >
              {duplicatePage.isPending ? 'Duplicating...' : 'Duplicate Page'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}