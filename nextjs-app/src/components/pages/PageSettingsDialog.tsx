'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/types/database';
import { useUpdatePage } from '@/hooks/usePages';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PageSettingsDialogProps {
  page: Page;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PageSettingsDialog({ 
  page, 
  open, 
  onOpenChange 
}: PageSettingsDialogProps) {
  const updatePage = useUpdatePage(page.id);
  const [title, setTitle] = useState(page.title || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Metadata fields
  const metadata = page.metadata as any || {};
  const [description, setDescription] = useState(metadata.description || '');
  const [metaDescription, setMetaDescription] = useState(metadata.metaDescription || '');
  const [ogTitle, setOgTitle] = useState(metadata.ogTitle || '');
  const [ogDescription, setOgDescription] = useState(metadata.ogDescription || '');
  const [ogImage, setOgImage] = useState(metadata.ogImage || '');
  const [isDraft, setIsDraft] = useState(metadata.status === 'draft');
  const [isHomepage, setIsHomepage] = useState(page.path === '/');

  useEffect(() => {
    // Reset form when page changes
    setTitle(page.title || '');
    const meta = page.metadata as any || {};
    setDescription(meta.description || '');
    setMetaDescription(meta.metaDescription || '');
    setOgTitle(meta.ogTitle || '');
    setOgDescription(meta.ogDescription || '');
    setOgImage(meta.ogImage || '');
    setIsDraft(meta.status === 'draft');
    setIsHomepage(page.path === '/');
  }, [page]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    updatePage.mutate({
      title: title.trim(),
      metadata: {
        ...metadata,
        description: description.trim(),
        metaDescription: metaDescription.trim(),
        ogTitle: ogTitle.trim(),
        ogDescription: ogDescription.trim(),
        ogImage: ogImage.trim(),
        status: isDraft ? 'draft' : 'published',
        isHomepage
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Page Settings</DialogTitle>
            <DialogDescription>
              Configure settings for {page.title || 'this page'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
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
                <Label htmlFor="path">URL Path</Label>
                <Input
                  id="path"
                  value={page.path}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  URL paths cannot be changed after creation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Internal Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description for internal reference..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="draft">Save as Draft</Label>
                  <p className="text-sm text-muted-foreground">
                    Draft pages are not visible to visitors
                  </p>
                </div>
                <Switch
                  id="draft"
                  checked={isDraft}
                  onCheckedChange={setIsDraft}
                />
              </div>

              {page.path !== '/' && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="homepage">Set as Homepage</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this the default landing page
                    </p>
                  </div>
                  <Switch
                    id="homepage"
                    checked={isHomepage}
                    onCheckedChange={setIsHomepage}
                    disabled // TODO: Implement homepage switching
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="Page description for search engines..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogTitle">Open Graph Title</Label>
                <Input
                  id="ogTitle"
                  placeholder="Title for social media sharing"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use page title
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  placeholder="Description for social media sharing..."
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use meta description
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  placeholder="https://example.com/image.jpg"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Image displayed when sharing on social media
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {updatePage.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {updatePage.error?.message || 'Failed to update page'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatePage.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatePage.isPending}
            >
              {updatePage.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}