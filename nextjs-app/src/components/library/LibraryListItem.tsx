'use client';

import { useState } from 'react';
import { 
  Eye, MoreVertical, Edit, Trash2, Upload, Download,
  FileText, Layout, Palette, Globe
} from 'lucide-react';
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

interface LibraryListItemProps {
  item: LibraryItem;
}

const typeIcons = {
  section: Layout,
  page: FileText,
  site: Globe,
  theme: Palette,
};

export function LibraryListItem({ item }: LibraryListItemProps) {
  const router = useRouter();
  const publishMutation = usePublishLibraryItem();
  const deleteMutation = useDeleteLibraryItem();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const Icon = typeIcons[item.type];

  const handlePublishToggle = () => {
    publishMutation.mutate({ id: item.id, published: !item.published });
  };

  const handleEdit = () => {
    router.push(`/lab/${item.source_draft_id || item.id}`);
  };

  const handleDelete = () => {
    deleteMutation.mutate(item.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{item.name}</h3>
            <Badge variant={item.published ? 'default' : 'secondary'} className="shrink-0">
              {item.published ? 'Published' : 'Unpublished'}
            </Badge>
            {item.category && (
              <Badge variant="outline" className="shrink-0">{item.category}</Badge>
            )}
          </div>
          {item.content && typeof item.content === 'object' && 'description' in item.content && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {(item.content as { description: string }).description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-sm text-muted-foreground text-right">
            <div>{item.usage_count || 0} uses</div>
            <div className="text-xs">
              {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {item.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}