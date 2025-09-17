'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, FileText, Layers, AlertCircle, GitBranch, Copy } from 'lucide-react';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import { useLabStore } from '@/stores/labStore';
import { useRouter } from 'next/navigation';
import type { SectionContent, PageContent, LabDraft } from '@/types/builder';

interface SaveDraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDraftId: string;
  currentDraftName: string;
  currentDraftType: 'section' | 'page';
  currentDraft?: LabDraft;
}

export function SaveDraftModal({
  open,
  onOpenChange,
  currentDraftId,
  currentDraftName,
  currentDraftType,
  currentDraft,
}: SaveDraftModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { sections, getContent, markClean } = useLabStore();

  // Form state
  const [saveMode, setSaveMode] = useState<'update' | 'new-version' | 'fork'>('update');
  const [draftName, setDraftName] = useState(currentDraftName);
  const [draftType, setDraftType] = useState<'section' | 'page'>(
    sections.length > 1 ? 'page' : currentDraftType
  );
  const [description, setDescription] = useState('');
  const [changelog, setChangelog] = useState('');

  // Query for max version when creating new version
  const { data: maxVersion } = useQuery({
    queryKey: ['max-version', currentDraftName],
    queryFn: async () => {
      const allDrafts = await labDraftService.getAll();
      const baseName = currentDraftName.replace(/\s*\(v\d+\)$/, '');
      const relatedDrafts = allDrafts.filter(draft => {
        const draftBaseName = draft.name.replace(/\s*\(v\d+\)$/, '');
        return draftBaseName === baseName;
      });
      return Math.max(...relatedDrafts.map(d => d.version || 1), currentDraft?.version || 1);
    },
    enabled: open && saveMode === 'new-version',
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async () => {
      const content = getContent();
      return labDraftService.update(currentDraftId, {
        name: draftName,
        type: draftType,
        content: content as unknown as SectionContent | PageContent,
        changelog: saveMode === 'update' && changelog ? changelog : undefined,
        metadata: {
          ...(currentDraft?.metadata || {}),
          description: description || undefined,
          lastSavedAt: new Date().toISOString(),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-draft', currentDraftId] });
      markClean();
      onOpenChange(false);
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: async () => {
      const content = getContent();
      const nextVersion = (maxVersion || currentDraft?.version || 1) + 1;

      return labDraftService.create({
        name: draftName,
        type: draftType,
        type_id: currentDraft?.type_id || null,
        status: 'draft',
        content: content as unknown as SectionContent | PageContent,
        version: nextVersion,
        content_hash: null,
        library_version: currentDraft?.library_version || null, // Preserve parent library ID
        changelog: changelog || `Version ${nextVersion} created from v${currentDraft?.version || 1}`,
        metadata: {
          ...(currentDraft?.metadata || {}),
          description: description || undefined,
          previousVersionId: currentDraftId,
          createdFromVersion: currentDraft?.version || 1,
        },
      });
    },
    onSuccess: (newDraft) => {
      queryClient.invalidateQueries({ queryKey: ['lab-drafts'] });
      queryClient.invalidateQueries({ queryKey: ['lab-draft-versions'] });
      onOpenChange(false);
      // Navigate to the new version
      router.push(`/lab/${newDraft.id}`);
    },
  });

  const forkMutation = useMutation({
    mutationFn: async () => {
      const content = getContent();
      return labDraftService.create({
        name: draftName,
        type: draftType,
        type_id: null, // New type for forked item
        status: 'draft',
        content: content as unknown as SectionContent | PageContent,
        version: 1, // Start fresh versioning for fork
        content_hash: null,
        library_version: null, // No parent library ID for fork
        changelog: `Forked from "${currentDraftName}"`,
        metadata: {
          description: description || undefined,
          forkedFrom: currentDraftId,
          forkedFromName: currentDraftName,
        },
      });
    },
    onSuccess: (newDraft) => {
      queryClient.invalidateQueries({ queryKey: ['lab-drafts'] });
      onOpenChange(false);
      // Navigate to the forked draft
      router.push(`/lab/${newDraft.id}`);
    },
  });

  const handleSave = () => {
    if (saveMode === 'update') {
      updateMutation.mutate();
    } else if (saveMode === 'new-version') {
      createVersionMutation.mutate();
    } else if (saveMode === 'fork') {
      forkMutation.mutate();
    }
  };

  const isLoading = updateMutation.isPending || createVersionMutation.isPending || forkMutation.isPending;
  const hasMultipleSections = sections.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Save Draft</DialogTitle>
          <DialogDescription>
            Configure how you want to save your current work
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current sections:</span>
              <Badge variant="secondary">{sections.length} section{sections.length !== 1 ? 's' : ''}</Badge>
            </div>
            {hasMultipleSections && (
              <Alert className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Multiple sections detected. Consider saving as a "Page" type.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Save Mode */}
          <div>
            <Label>Save Mode</Label>
            <RadioGroup value={saveMode} onValueChange={(v) => setSaveMode(v as 'update' | 'new-version' | 'fork')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="update" id="update" />
                <Label htmlFor="update" className="font-normal cursor-pointer flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <div>
                    <div>Save over current version</div>
                    <div className="text-xs text-muted-foreground">
                      Update v{currentDraft?.version || 1} in place
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new-version" id="new-version" />
                <Label htmlFor="new-version" className="font-normal cursor-pointer flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  <div>
                    <div>Create new version</div>
                    <div className="text-xs text-muted-foreground">
                      Will create v{(maxVersion || currentDraft?.version || 1) + 1} of this item
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fork" id="fork" />
                <Label htmlFor="fork" className="font-normal cursor-pointer flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  <div>
                    <div>Fork as new item</div>
                    <div className="text-xs text-muted-foreground">
                      Create independent copy with fresh versioning
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Draft Name */}
          <div>
            <Label htmlFor="name">Draft Name</Label>
            <Input
              id="name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Enter draft name"
              disabled={saveMode === 'update' || saveMode === 'new-version'}
            />
            {saveMode === 'fork' && (
              <p className="text-xs text-muted-foreground mt-1">
                Give your forked item a unique name
              </p>
            )}
          </div>

          {/* Draft Type */}
          <div>
            <Label>Save As</Label>
            <RadioGroup value={draftType} onValueChange={(v) => setDraftType(v as 'section' | 'page')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="section" id="section" />
                <Label htmlFor="section" className="font-normal cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Section
                  <span className="text-xs text-muted-foreground">
                    (Single reusable component)
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="page" id="page" />
                <Label htmlFor="page" className="font-normal cursor-pointer flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Page
                  <span className="text-xs text-muted-foreground">
                    (Multiple sections combined)
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Changelog for new versions */}
          {(saveMode === 'new-version' || saveMode === 'update') && (
            <div>
              <Label htmlFor="changelog">
                Changelog {saveMode === 'new-version' ? '(required)' : '(optional)'}
              </Label>
              <Textarea
                id="changelog"
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder={
                  saveMode === 'new-version'
                    ? "What's changed in this version?"
                    : "Optional: Document any changes made"
                }
                rows={3}
              />
            </div>
          )}

          {/* Description for forks */}
          {saveMode === 'fork' && (
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this fork..."
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isLoading ||
              !draftName.trim() ||
              (saveMode === 'new-version' && !changelog.trim())
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {saveMode === 'update' && <Save className="mr-2 h-4 w-4" />}
                {saveMode === 'new-version' && <GitBranch className="mr-2 h-4 w-4" />}
                {saveMode === 'fork' && <Copy className="mr-2 h-4 w-4" />}
                {saveMode === 'update' && 'Update Draft'}
                {saveMode === 'new-version' && `Create v${(maxVersion || currentDraft?.version || 1) + 1}`}
                {saveMode === 'fork' && 'Fork as New'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}