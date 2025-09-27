'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  GitBranch,
  Check,
  FileText,
  Package,
  ArrowUpRight,
  RotateCcw,
  GitCompare,
  ChevronRight
} from 'lucide-react';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import type { LabDraft, LibraryItem } from '@/types/builder';

interface VersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDraft: LabDraft;
  onLoadVersion?: (draft: LabDraft) => void;
}

interface LibraryVersion {
  id: string;
  library_item_id: string;
  version: number;
  content: unknown;
  metadata: unknown;
  change_notes: string | null;
  created_at: string;
  created_by: string;
}

export function VersionHistory({
  open,
  onOpenChange,
  currentDraft,
  onLoadVersion,
}: VersionHistoryProps) {
  const [selectedDraftId, setSelectedDraftId] = useState<string>(currentDraft.id);
  // const [showComparison, setShowComparison] = useState(false);
  // const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get all draft versions with the same name pattern
  const { data: draftVersions = [], isLoading: draftsLoading } = useQuery({
    queryKey: ['draft-versions', currentDraft.name, currentDraft.type],
    queryFn: async () => {
      const allDrafts = await labDraftService.getAll();

      // Get base name without version suffix
      const baseName = currentDraft.name.replace(/\s*v\d+$/, '').trim();

      // Find all related drafts by name and type
      const relatedDrafts = allDrafts.filter(draft => {
        const draftBaseName = draft.name.replace(/\s*v\d+$/, '').trim();
        return draftBaseName === baseName && draft.type === currentDraft.type;
      });

      // Sort by version descending
      return relatedDrafts.sort((a, b) => {
        const versionA = a.version || 1;
        const versionB = b.version || 1;
        return versionB - versionA;
      });
    },
    enabled: open,
  });

  // Get library versions if this draft has a parent library item
  const parentLibraryId = (currentDraft.metadata as Record<string, unknown>)?.parent_library_id as string | undefined;

  const { data: libraryItem } = useQuery({
    queryKey: ['library-item', parentLibraryId],
    queryFn: async () => {
      if (!parentLibraryId) return null;

      try {
        const response = await fetch('/api/library');
        if (!response.ok) throw new Error('Failed to fetch library items');
        const items = await response.json();
        return items.find((item: LibraryItem) => item.id === parentLibraryId) || null;
      } catch (error) {
        console.error('Failed to fetch library items:', error);
        return null;
      }
    },
    enabled: open && !!parentLibraryId,
  });

  // Get library version history
  const { data: libraryVersions = [], isLoading: versionsLoading } = useQuery({
    queryKey: ['library-versions', parentLibraryId],
    queryFn: async () => {
      if (!parentLibraryId) return [];

      try {
        // Use fetch API to call our API route which will handle the admin client
        const response = await fetch(`/api/library/versions?library_item_id=${parentLibraryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch library versions');
        }
        const data = await response.json();
        return data as LibraryVersion[];
      } catch (error) {
        console.error('Failed to fetch library versions:', error);
        return [];
      }
    },
    enabled: open && !!parentLibraryId,
  });

  // Restore to a previous version
  const restoreMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const draft = draftVersions.find(d => d.id === versionId);
      if (!draft) throw new Error('Version not found');

      // Create a new draft based on the selected version
      const newDraft = await labDraftService.create({
        name: currentDraft.name,
        type: draft.type,
        type_id: draft.type_id,
        content: draft.content,
        version: (currentDraft.version || 1) + 1,
        status: 'draft',
        metadata: {
          ...(draft.metadata as Record<string, unknown> || {}),
          restored_from: versionId,
          restored_at: new Date().toISOString(),
        },
        changelog: `Restored from v${draft.version || 1}`,
        library_version: draft.library_version,
        content_hash: draft.content_hash,
      });

      return newDraft;
    },
    onSuccess: (newDraft) => {
      queryClient.invalidateQueries({ queryKey: ['draft-versions'] });
      if (onLoadVersion) {
        onLoadVersion(newDraft);
      }
      onOpenChange(false);
    },
  });

  const getStatusBadge = (draft: LabDraft) => {
    if (draft.id === currentDraft.id) {
      return <Badge variant="secondary" className="text-xs">Current</Badge>;
    }
    if (draft.status === 'promoted') {
      return <Badge variant="default" className="text-xs">Published</Badge>;
    }
    if (draft.status === 'ready') {
      return <Badge variant="outline" className="text-xs">Ready</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Draft</Badge>;
  };

  const handleLoadVersion = () => {
    const selectedDraft = draftVersions.find(v => v.id === selectedDraftId);
    if (selectedDraft && onLoadVersion) {
      onLoadVersion(selectedDraft);
      onOpenChange(false);
    }
  };

  const handleRestore = (versionId: string) => {
    if (confirm('Create a new version based on this one?')) {
      restoreMutation.mutate(versionId);
    }
  };

  const handleCompare = (versionId: string) => {
    // TODO: Implement version comparison
    alert(`Version comparison coming soon! Comparing with v${draftVersions.find(d => d.id === versionId)?.version || '?'}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and manage all versions of "{currentDraft.name}"
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="drafts" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="drafts">
              <FileText className="h-4 w-4 mr-2" />
              Draft Versions ({draftVersions.length})
            </TabsTrigger>
            {parentLibraryId && (
              <TabsTrigger value="library">
                <Package className="h-4 w-4 mr-2" />
                Library Versions ({libraryVersions.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="drafts" className="flex-1 mt-4">
            <ScrollArea className="h-[450px] pr-4">
              {draftsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading draft versions...
                </div>
              ) : draftVersions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No draft versions found
                </div>
              ) : (
                <div className="space-y-3">
                  {draftVersions.map((draft) => (
                    <div
                      key={draft.id}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedDraftId === draft.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      } ${draft.id === currentDraft.id ? 'ring-2 ring-primary/20' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            <span className="font-semibold">Version {draft.version || 1}</span>
                            {getStatusBadge(draft)}
                            {draft.id === currentDraft.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(draft.updated_at), 'MMM d, yyyy h:mm a')}
                            </span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}</span>
                          </div>

                          {draft.changelog && (
                            <div className="mt-2 p-2 bg-muted/50 rounded">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Changes:</p>
                              <p className="text-sm">{draft.changelog}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 ml-4">
                          {draft.id !== currentDraft.id && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestore(draft.id)}
                                title="Restore this version"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCompare(draft.id)}
                                title="Compare with current"
                              >
                                <GitCompare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDraftId(draft.id)}
                                title="View this version"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {parentLibraryId && (
            <TabsContent value="library" className="flex-1 mt-4">
              <ScrollArea className="h-[450px] pr-4">
                {versionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading library versions...
                  </div>
                ) : libraryVersions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No library versions found
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            Library Item: {libraryItem?.name}
                          </p>
                          <p className="text-blue-700 dark:text-blue-300 mt-1">
                            These are published versions available to all projects. Library versions are immutable to protect production usage.
                          </p>
                        </div>
                      </div>
                    </div>

                    {libraryVersions.map((version, index) => (
                      <div
                        key={version.id}
                        className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">Library Version {version.version}</span>
                              {index === 0 && (
                                <Badge variant="default" className="text-xs">Latest</Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                              </span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}</span>
                            </div>

                            {version.change_notes && (
                              <div className="mt-2 p-2 bg-muted/50 rounded">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Release Notes:</p>
                                <p className="text-sm">{version.change_notes}</p>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Create draft from library version
                              alert('Creating draft from library version - coming soon!');
                            }}
                            title="Create draft from this version"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {draftVersions.length} draft version{draftVersions.length !== 1 ? 's' : ''}
            {parentLibraryId && ` • ${libraryVersions.length} library version${libraryVersions.length !== 1 ? 's' : ''}`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {selectedDraftId !== currentDraft.id && (
              <Button onClick={handleLoadVersion}>
                Load Selected Version
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}