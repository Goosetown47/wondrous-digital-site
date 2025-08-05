'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ThemeSelector } from '@/components/builder/ThemeSelector';
import { useProjectPages, usePublishPage } from '@/hooks/usePages';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Eye, Plus, FileText, Calendar, Check, AlertCircle, Upload } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useBuilderStore } from '@/stores/builderStore';

interface CanvasNavbarProps {
  projectId: string;
  currentPageId: string;
  currentPage?: {
    id: string;
    title: string;
    path: string;
    status?: 'published' | 'draft';
    version?: number;
    updated_at?: string;
  };
  themeId?: string;
  sectionCount: number;
  lastSaved: Date | null;
  onSave: () => void;
  saveSuccess?: boolean;
  saveError?: Error | null;
}

export function CanvasNavbar({
  projectId,
  // projectName,
  currentPageId,
  currentPage,
  themeId,
  sectionCount,
  onSave,
}: CanvasNavbarProps) {
  const router = useRouter();
  const { data: pages } = useProjectPages(projectId);
  const publishPage = usePublishPage();
  
  // Get save status and unpublished changes from Zustand (single source of truth)
  const { saveStatus, lastSavedAt, saveError: storeSaveError, isDirty, hasUnpublishedChanges } = useBuilderStore();

  const handlePageChange = (pageId: string) => {
    router.push(`/builder/${projectId}/${pageId}`);
  };

  const handlePublish = async () => {
    if (!currentPageId) return;
    
    try {
      await publishPage.mutateAsync({ pageId: currentPageId });
    } catch (error) {
      console.error('Publish failed:', error);
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-background border-b">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Page info and metrics */}
          <div className="flex items-center gap-4">
            {/* Page selector */}
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Select value={currentPageId} onValueChange={handlePageChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a page">
                    {currentPage?.title || 'Loading...'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {pages?.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                      {page.path === '/' && (
                        <span className="ml-2 text-xs text-muted-foreground">(Home)</span>
                      )}
                    </SelectItem>
                  ))}
                  <div className="border-t mt-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={`/builder/${projectId}/pages`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Page
                      </Link>
                    </Button>
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Page metrics */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {sectionCount} section{sectionCount !== 1 ? 's' : ''}
              </span>
              
              {currentPage?.status && (
                <Badge 
                  variant={currentPage.status === 'published' ? 'default' : 'secondary'}
                >
                  {currentPage.status === 'published' ? 'Live' : 'Draft'}
                </Badge>
              )}

              {currentPage?.version && (
                <span className="text-muted-foreground">
                  v{currentPage.version}
                </span>
              )}

              {currentPage?.updated_at && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(currentPage.updated_at), 'MMM d, h:mm a')}
                </span>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Theme selector */}
            <ThemeSelector 
              projectId={projectId} 
              currentThemeId={themeId} 
            />

            <div className="h-6 w-px bg-border" />

            {/* Preview button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                // Navigate directly to preview - it will use Zustand state
                router.push(`/preview/${projectId}/${currentPageId}`);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            {/* Publish button */}
            <Button 
              onClick={handlePublish}
              disabled={publishPage.isPending || !hasUnpublishedChanges()}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {publishPage.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Publish Changes
                </>
              )}
            </Button>

            {/* Auto-save status indicator */}
            <div className="flex items-center gap-2">
              {/* Save status indicator */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted/50">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    <span className="text-xs text-blue-600">Saving draft...</span>
                  </>
                )}
                
                {saveStatus === 'saved' && !isDirty && (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      Draft saved {lastSavedAt ? format(lastSavedAt, 'h:mm a') : ''}
                    </span>
                  </>
                )}
                
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span className="text-xs text-red-600" title={storeSaveError || 'Save failed'}>
                      Draft save failed
                    </span>
                  </>
                )}
                
                {isDirty && saveStatus !== 'saving' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-xs text-muted-foreground">Unsaved changes</span>
                  </>
                )}

                {hasUnpublishedChanges() && !isDirty && saveStatus !== 'saving' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-xs text-muted-foreground">Unpublished changes</span>
                  </>
                )}
              </div>

              {/* Manual save button (for edge cases) */}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onSave}
                disabled={saveStatus === 'saving' || !isDirty}
                title="Force save draft now"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}