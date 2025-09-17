'use client';

import { useState } from 'react';
import {
  Eye, MoreVertical, Edit, Trash2, Upload, Download,
  FileText, Layout, Palette, Globe, GitBranch
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePublishLibraryItem, useDeleteLibraryItem } from '@/hooks/useLibrary';
import { formatDistanceToNow } from 'date-fns';
import type { LibraryItem } from '@/types/builder';
import { useRouter } from 'next/navigation';
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

interface LibraryCardProps {
  item: LibraryItem;
}

const typeIcons = {
  section: Layout,
  page: FileText,
  site: Globe,
  theme: Palette,
};

export function LibraryCard({ item }: LibraryCardProps) {
  const router = useRouter();
  const publishMutation = usePublishLibraryItem();
  const deleteMutation = useDeleteLibraryItem();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Validate type exists to prevent object injection
  const Icon = Object.prototype.hasOwnProperty.call(typeIcons, item.type) 
    ? typeIcons[item.type as keyof typeof typeIcons]
    : Layout; // fallback icon

  const handlePublishToggle = () => {
    publishMutation.mutate({ id: item.id, published: !item.published });
  };

  const handleEdit = () => {
    // Navigate to Lab with this item
    router.push(`/lab/${item.source_draft_id || item.id}`);
  };

  const handleCreateNewVersion = async () => {
    // Create a new draft from this library item
    // This will track the parent library item and auto-increment the version
    try {
      const response = await fetch('/api/lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.name,
          type: item.type,
          type_id: item.type_id,
          content: item.content,
          version: (item.version || 1) + 1, // Auto-increment version
          status: 'draft',
          library_version: null, // Will be set properly when we migrate to UUID field
          changelog: `New version created from library v${item.version || 1}`,
          metadata: {
            ...item.metadata,
            parent_library_id: item.id, // Store parent library ID in metadata for now
            library_item_id: item.id,
            created_from_library: true,
            parent_version: item.version || 1,
          },
        }),
      });

      if (response.ok) {
        const newDraft = await response.json();
        // Navigate to the new draft in LAB
        router.push(`/lab/${newDraft.id}`);
      }
    } catch (error) {
      console.error('Failed to create new version:', error);
    }
  };

  const handleDelete = () => {
    // Check if item is in use
    if (item.usage_count > 0) {
      alert(`Cannot delete this ${item.type} - it is being used in ${item.usage_count} project${item.usage_count > 1 ? 's' : ''}`);
      setShowDeleteDialog(false);
      return;
    }
    deleteMutation.mutate(item.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="group relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold line-clamp-1">{item.name}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCreateNewVersion}>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Create New Version
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Draft
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePublishToggle}>
                  {item.published ? (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Publish
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
            <Icon className="h-12 w-12 text-muted-foreground/30" />
          </div>
          
          {item.content && typeof item.content === 'object' && 'description' in item.content && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {(item.content as { description: string }).description}
            </p>
          )}
        </CardContent>

        <CardFooter className="pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={item.published ? 'default' : 'secondary'}>
              {item.published ? 'Published' : 'Unpublished'}
            </Badge>
            {item.category && (
              <Badge variant="outline">{item.category}</Badge>
            )}
            <Badge variant="outline">v{item.version || 1}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {item.usage_count || 0} uses
          </div>
        </CardFooter>

        <div className="absolute bottom-2 left-4 right-4 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Updated {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {item.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </AlertDialogDescription>
            {item.usage_count > 0 && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm">
                <strong>Warning:</strong> This item is being used in {item.usage_count} project{item.usage_count > 1 ? 's' : ''} and cannot be deleted.
              </div>
            )}
            {item.source_draft_id && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                Note: The draft version will remain in the Lab.
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={item.usage_count > 0}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}