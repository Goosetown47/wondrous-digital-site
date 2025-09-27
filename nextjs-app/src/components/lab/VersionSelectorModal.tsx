'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
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
import { Clock, GitBranch, Check } from 'lucide-react';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import type { LabDraft } from '@/types/builder';

interface VersionSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDraftId: string;
  currentDraft?: LabDraft;
  onSelectVersion: (draft: LabDraft) => void;
}

export function VersionSelectorModal({
  open,
  onOpenChange,
  currentDraftId,
  currentDraft,
  onSelectVersion,
}: VersionSelectorModalProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(currentDraftId);

  // Query all versions of this draft
  // For now, we'll query by name similarity, but ideally this would use a proper version tracking system
  // In the future, we'll track versions via parent_library_id or a dedicated version group ID
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['lab-draft-versions', currentDraftId, currentDraft?.name],
    queryFn: async () => {
      if (!currentDraft) return [];

      const allDrafts = await labDraftService.getAll();

      // Group versions by base name (without version suffix)
      const baseName = currentDraft.name.replace(/\s*\(v\d+\)$/, '');

      // Find all drafts that share the same base name
      const relatedDrafts = allDrafts.filter(draft => {
        const draftBaseName = draft.name.replace(/\s*\(v\d+\)$/, '');
        return draftBaseName === baseName;
      });

      // Sort by version number (descending) then by updated_at
      return relatedDrafts.sort((a, b) => {
        const versionA = a.version || 1;
        const versionB = b.version || 1;
        if (versionA !== versionB) {
          return versionB - versionA;
        }
        // If versions are the same, sort by updated_at
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
    },
    enabled: open && !!currentDraft,
  });

  const handleSelectVersion = () => {
    const selectedDraft = versions.find(v => v.id === selectedVersionId);
    if (selectedDraft) {
      onSelectVersion(selectedDraft);
      onOpenChange(false);
    }
  };

  useEffect(() => {
    // Reset selection when modal opens
    if (open) {
      setSelectedVersionId(currentDraftId);
    }
  }, [open, currentDraftId]);

  const getVersionLabel = (draft: LabDraft) => {
    return `v${draft.version || 1}`;
  };

  const isCurrentVersion = (draftId: string) => draftId === currentDraftId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            Select a version to load. Changes will be saved as a new version.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading versions...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No versions found
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedVersionId === version.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedVersionId(version.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <span className="font-medium">
                          {getVersionLabel(version)}
                        </span>
                        {isCurrentVersion(version.id) && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {version.status === 'promoted' && (
                          <Badge variant="default" className="text-xs">
                            Published
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(version.updated_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {version.changelog && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Changelog:</p>
                          <p className="text-sm text-muted-foreground">
                            {version.changelog}
                          </p>
                        </div>
                      )}
                      {!version.changelog && version.metadata?.description && typeof version.metadata.description === 'string' ? (
                        <p className="text-sm text-muted-foreground mt-2">
                          {version.metadata.description}
                        </p>
                      ) : null}
                    </div>
                    {selectedVersionId === version.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {versions.length} version{versions.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSelectVersion}
              disabled={selectedVersionId === currentDraftId}
            >
              Load Version
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}