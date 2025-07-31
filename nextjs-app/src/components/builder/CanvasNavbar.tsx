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
import { useProjectPages } from '@/hooks/usePages';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Eye, Plus, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

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
  isSaving: boolean;
  onSave: () => void;
  saveSuccess?: boolean;
  saveError?: Error | null;
}

export function CanvasNavbar({
  projectId,
  projectName,
  currentPageId,
  currentPage,
  themeId,
  sectionCount,
  lastSaved,
  isSaving,
  onSave,
  saveSuccess,
  saveError,
}: CanvasNavbarProps) {
  const router = useRouter();
  const { data: pages } = useProjectPages(projectId);

  const handlePageChange = (pageId: string) => {
    router.push(`/builder/${projectId}/${pageId}`);
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
            <Button variant="outline" size="sm" asChild>
              <Link href={`/preview/${projectId}/${currentPageId}`}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Link>
            </Button>

            {/* Save button and status */}
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>

              {/* Save status */}
              {lastSaved && !isSaving && (
                <span className="text-xs text-muted-foreground">
                  Saved {format(lastSaved, 'h:mm a')}
                </span>
              )}
              
              {saveSuccess && !isSaving && (
                <span className="text-xs text-green-600">
                  Saved!
                </span>
              )}
              
              {saveError && (
                <span className="text-xs text-red-600" title={saveError.message}>
                  Failed to save
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}