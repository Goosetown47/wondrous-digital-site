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
import { Loader2, Eye, Plus, Calendar, AlertCircle, Upload, Monitor, Tablet, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useBuilderStore } from '@/stores/builderStore';

interface CanvasNavbarProps {
  projectId: string;
  projectName?: string;
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
  saveSuccess?: boolean;
  saveError?: Error | null;
  deviceView?: 'desktop' | 'tablet' | 'mobile';
  onDeviceViewChange?: (view: 'desktop' | 'tablet' | 'mobile') => void;
}

export function CanvasNavbar({
  projectId,
  projectName,
  currentPageId,
  currentPage,
  themeId,
  sectionCount,
  deviceView = 'desktop',
  onDeviceViewChange,
}: CanvasNavbarProps) {
  const router = useRouter();
  const { data: pages } = useProjectPages(projectId);
  const publishPage = usePublishPage();
  
  // Get save status and unpublished changes from Zustand (single source of truth)
  const { saveStatus, saveError: storeSaveError, isDirty, hasUnpublishedChanges } = useBuilderStore();

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
      {/* First Row - Page Context & Primary Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Project name & Page selector */}
          <div className="flex items-center gap-4">
            {/* Project Name */}
            {projectName && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{projectName}</span>
                <span className="text-muted-foreground">/</span>
              </div>
            )}
            {/* Page selector */}
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

          {/* Right side - Primary Actions */}
          <div className="flex items-center gap-3">
            {/* Save status indicator - only show when active */}
            {(saveStatus === 'saving' || saveStatus === 'error' || isDirty || hasUnpublishedChanges()) && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted/50">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    <span className="text-xs text-blue-600">Saving draft...</span>
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
            )}

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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
          </div>
        </div>
      </div>

      {/* Second Row - Canvas Controls & Configuration */}
      <div className="border-t px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Page metrics */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {sectionCount} section{sectionCount !== 1 ? 's' : ''}
            </span>

            {currentPage?.status && (
              <Badge
                variant={currentPage.status === 'published' ? 'default' : 'secondary'}
                className="h-5"
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

          {/* Right side - Canvas controls */}
          <div className="flex items-center gap-3">
            {/* Viewport controls */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Viewport</span>
              <div className="flex items-center gap-1" data-testid="viewport-controls">
                <Button
                  variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                  size="icon"
                  className={`h-8 w-8 ${deviceView === 'desktop' ? 'bg-primary' : ''}`}
                  onClick={() => onDeviceViewChange?.('desktop')}
                  aria-label="Desktop view"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={deviceView === 'tablet' ? 'default' : 'ghost'}
                  size="icon"
                  className={`h-8 w-8 ${deviceView === 'tablet' ? 'bg-primary' : ''}`}
                  onClick={() => onDeviceViewChange?.('tablet')}
                  aria-label="Tablet view"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                  size="icon"
                  className={`h-8 w-8 ${deviceView === 'mobile' ? 'bg-primary' : ''}`}
                  onClick={() => onDeviceViewChange?.('mobile')}
                  aria-label="Mobile view"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Theme selector with label */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeSelector
                projectId={projectId}
                currentThemeId={themeId}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}