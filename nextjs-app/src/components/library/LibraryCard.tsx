'use client';

import { useState } from 'react';
import { 
  Eye, MoreVertical, Edit, Trash2, Upload, Download,
  FileText, Layout, Palette, Globe
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

  const Icon = typeIcons[item.type];

  const handlePublishToggle = () => {
    publishMutation.mutate({ id: item.id, published: !item.published });
  };

  const handleEdit = () => {
    // Navigate to Lab with this item
    router.push(`/lab/${item.source_draft_id || item.id}`);
  };

  const handleDelete = () => {
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
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit in Lab
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
          
          {item.content?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.content.description}
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