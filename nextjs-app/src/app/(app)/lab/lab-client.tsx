'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, GitBranch, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
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

export default function LabClient() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'section' | 'page' | 'site' | 'theme'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<{ id: string; name: string } | null>(null);

  const queryClient = useQueryClient();

  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ['lab-drafts', selectedType],
    queryFn: async () => {
      const allDrafts = await labDraftService.getAll();
      if (selectedType === 'all') return allDrafts;
      return allDrafts.filter(draft => draft.type === selectedType);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await labDraftService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-drafts'] });
      setDeleteDialogOpen(false);
      setDraftToDelete(null);
    },
    onError: (error: Error) => {
      console.error('Failed to delete draft:', error);
      alert(error.message || 'Failed to delete draft');
    },
  });

  const filteredDrafts = drafts.filter(draft =>
    draft.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteClick = (e: React.MouseEvent, draft: { id: string; name: string }) => {
    e.preventDefault();
    e.stopPropagation();
    setDraftToDelete(draft);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (draftToDelete) {
      deleteMutation.mutate(draftToDelete.id);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'section':
        return 'bg-blue-500 text-white';
      case 'page':
        return 'bg-green-500 text-white';
      case 'site':
        return 'bg-purple-500 text-white';
      case 'theme':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lab</h1>
        <p className="text-muted-foreground">
          Create and test new components, pages, sites, and themes
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setSelectedType('all')}>
              All
            </TabsTrigger>
            <TabsTrigger value="section" onClick={() => setSelectedType('section')}>
              Sections
            </TabsTrigger>
            <TabsTrigger value="page" onClick={() => setSelectedType('page')}>
              Pages
            </TabsTrigger>
            <TabsTrigger value="site" onClick={() => setSelectedType('site')}>
              Sites
            </TabsTrigger>
            <TabsTrigger value="theme" onClick={() => setSelectedType('theme')}>
              Themes
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search drafts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[300px]"
            />
            <Link href="/lab/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value={selectedType} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading drafts...</p>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {search
                  ? `No ${selectedType === 'all' ? 'drafts' : selectedType + 's'} found matching "${search}"`
                  : `No ${selectedType === 'all' ? 'drafts' : selectedType + 's'} yet`}
              </p>
              <Link href="/lab/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First {selectedType === 'all' ? 'Draft' : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDrafts.map((draft) => (
                <div key={draft.id} className="relative group">
                  <Link href={draft.type === 'theme' ? `/lab/themes/${draft.id}` : `/lab/${draft.id}`}>
                    <Card className="cursor-pointer transition-all hover:shadow-lg h-full min-h-[280px] flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate pr-2">{draft.name}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2 min-h-[2.5rem]">
                              {draft.metadata?.description as string || 'No description'}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <Badge className={getTypeColor(draft.type)} variant="secondary">
                              {draft.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              v{draft.version || 1}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between">
                        {/* Lineage and metadata info */}
                        <div className="space-y-2 mb-3">
                          {(() => {
                            const meta = draft.metadata as Record<string, unknown> | null;
                            return meta?.parent_library_id ? (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <LinkIcon className="h-3 w-3" />
                                <span>Linked to library</span>
                              </div>
                            ) : null;
                          })()}
                          {draft.status === 'promoted' && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <GitBranch className="h-3 w-3" />
                              <span>Published to library</span>
                            </div>
                          )}
                          {draft.changelog && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span className="truncate">Has changelog</span>
                            </div>
                          )}
                        </div>

                        {/* Footer with date and status */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t">
                          <span className="text-xs">
                            {new Date(draft.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <Badge
                            variant={draft.status === 'promoted' ? 'default' :
                                   draft.status === 'ready' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {draft.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Delete button - only show on hover */}
                  {draft.status !== 'promoted' && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={(e) => handleDeleteClick(e, { id: draft.id, name: draft.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{draftToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
            {draftToDelete && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                Note: Drafts that have been promoted to the library cannot be deleted.
              </div>
            )}
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
    </div>
  );
}