'use client';

import { useState, useEffect } from 'react';
import { useProjectPages } from '@/hooks/usePages';
import { PageList } from './PageList';
import { PageCreationDialog } from './PageCreationDialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageManagerProps {
  projectId: string;
}

type ViewMode = 'grid' | 'list';

export function PageManager({ projectId }: PageManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { data: pages = [], isLoading } = useProjectPages(projectId);

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('page-view-mode') as ViewMode;
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
      setViewMode(savedView);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('page-view-mode', mode);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {pages.length} {pages.length === 1 ? 'page' : 'pages'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md shadow-sm" role="group">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewChange('list')}
              className={cn(
                "rounded-r-none",
                viewMode === 'list' && "bg-muted"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewChange('grid')}
              className={cn(
                "rounded-l-none -ml-px",
                viewMode === 'grid' && "bg-muted"
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Page
          </Button>
        </div>
      </div>

      <PageList pages={pages} projectId={projectId} viewMode={viewMode} />

      <PageCreationDialog
        projectId={projectId}
        open={isCreating}
        onOpenChange={setIsCreating}
      />
    </div>
  );
}