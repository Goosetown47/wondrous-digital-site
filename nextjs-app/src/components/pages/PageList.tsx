'use client';

import { useState } from 'react';
import { Page } from '@/types/database';
import { PageSettingsDialog } from './PageSettingsDialog';
import { PageDuplicationDialog } from './PageDuplicationDialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { useDeletePage } from '@/hooks/usePages';
import { 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  Home,
  FileText,
  Settings,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PageListProps {
  pages: Page[];
  projectId: string;
  viewMode?: 'grid' | 'list';
}

export function PageList({ pages, projectId, viewMode = 'list' }: PageListProps) {
  const router = useRouter();
  const deletePage = useDeletePage();
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);
  const [duplicatingPage, setDuplicatingPage] = useState<Page | null>(null);

  const handleEdit = (page: Page) => {
    setEditingPage(page);
  };

  const handleDelete = async () => {
    if (!deletingPage) return;
    
    deletePage.mutate(deletingPage.id, {
      onSuccess: () => {
        setDeletingPage(null);
      },
    });
  };

  const handleDuplicate = (page: Page) => {
    setDuplicatingPage(page);
  };

  const goToBuilder = (pageId: string) => {
    router.push(`/builder/${projectId}/${pageId}`);
  };

  const sortedPages = [...pages].sort((a, b) => {
    // Homepage always comes first
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    // Then sort alphabetically by path
    return a.path.localeCompare(b.path);
  });

  return (
    <TooltipProvider>
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "grid gap-4"
      }>
        {sortedPages.map((page) => {
          const isHomepage = page.path === '/';
          const metadata = page.metadata || {};
          
          return (
            <Card key={page.id} className={`overflow-hidden transition-all hover:shadow-lg ${viewMode === 'grid' ? 'h-full flex flex-col' : ''}`}>
              <CardHeader className={viewMode === 'grid' ? "pb-2" : "pb-3"}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {page.title || 'Untitled Page'}
                      </CardTitle>
                      {isHomepage && (
                        <Badge variant="secondary" className="gap-1">
                          <Home className="w-3 h-3" />
                          Homepage
                        </Badge>
                      )}
                      {metadata.status === 'draft' && (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {page.path}
                      </code>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={viewMode === 'grid' ? 'h-7 w-7' : 'h-8 w-8'}
                      >
                        <MoreVertical className={viewMode === 'grid' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setDeletingPage(page)}
                        disabled={isHomepage}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Page
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className={viewMode === 'grid' ? "pb-2 flex-grow" : "pb-3"}>
                <div className={`text-sm text-muted-foreground ${viewMode === 'grid' ? 'space-y-1' : 'flex items-center justify-between'}`}>
                  {viewMode === 'grid' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span>{page.sections?.length || 0} sections</span>
                      </div>
                      {metadata.description && typeof metadata.description === 'string' && (
                        <p className="truncate text-xs">
                          {metadata.description}
                        </p>
                      )}
                      <p className="text-xs">
                        Updated {formatDistanceToNow(new Date(page.updated_at))} ago
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <span>
                          {page.sections?.length || 0} sections
                        </span>
                        {metadata.description && typeof metadata.description === 'string' && (
                          <span className="truncate max-w-xs">
                            {metadata.description}
                          </span>
                        )}
                      </div>
                      <span>
                        Updated {formatDistanceToNow(new Date(page.updated_at))} ago
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className={`bg-muted/50 ${viewMode === 'grid' ? 'px-4 py-2' : 'px-6 py-3'}`}>
                <div className="flex items-center justify-between w-full">
                  <Button
                    onClick={() => goToBuilder(page.id)}
                    size="sm"
                    className={viewMode === 'grid' ? 'gap-1 text-xs' : 'gap-2'}
                  >
                    <Edit className="w-4 h-4" />
                    {viewMode === 'grid' ? 'Edit' : 'Edit in Builder'}
                  </Button>
                  <div className={`flex items-center ${viewMode === 'grid' ? 'gap-1' : 'gap-2'}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(page)}
                          className={viewMode === 'grid' ? 'h-7 w-7' : 'h-8 w-8'}
                        >
                          <Settings className={viewMode === 'grid' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Page Settings</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(page)}
                          className={viewMode === 'grid' ? 'h-7 w-7' : 'h-8 w-8'}
                        >
                          <Copy className={viewMode === 'grid' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duplicate Page</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardFooter>
            </Card>
          );
        })}

        {pages.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No pages yet. Create your first page to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {editingPage && (
        <PageSettingsDialog
          page={editingPage}
          open={!!editingPage}
          onOpenChange={(open) => !open && setEditingPage(null)}
        />
      )}

      {duplicatingPage && (
        <PageDuplicationDialog
          page={duplicatingPage}
          open={!!duplicatingPage}
          onOpenChange={(open) => !open && setDuplicatingPage(null)}
        />
      )}

      <AlertDialog open={!!deletingPage} onOpenChange={(open) => !open && setDeletingPage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPage?.title || 'Untitled Page'}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}