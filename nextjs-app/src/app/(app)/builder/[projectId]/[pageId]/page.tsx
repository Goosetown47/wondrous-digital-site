'use client';

import { Canvas } from '@/components/builder/Canvas';
import { CanvasNavbar } from '@/components/builder/CanvasNavbar';
import { ResizablePreview } from '@/components/lab/resizable-preview';
import { useBuilderStore } from '@/stores/builderStore';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { usePageById } from '@/hooks/usePages';
import { useTheme } from '@/hooks/useThemes';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { setCurrentProject } = useAuth();
  const projectId = params.projectId as string;
  const pageId = params.pageId as string;
  const {
    sections,
    loadPage,
    saveStatus,
    lastSavedAt,
    pageId: storedPageId
  } = useBuilderStore();
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Fetch project and page data
  const { data: project } = useProject(projectId);
  const { data: page, isLoading: isLoadingPage, error: pageError } = usePageById(pageId);
  
  // Enable auto-save
  useAutoSave();
  
  // Fetch theme if project has one
  const { data: theme } = useTheme(project?.theme_id);

  // Sync current project when project data loads
  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  // Reset hasLoadedInitialData when pageId changes
  useEffect(() => {
    setHasLoadedInitialData(false);
  }, [pageId]);

  // Handle page not found
  useEffect(() => {
    if (pageError) {
      router.push(`/builder/${projectId}`);
    }
  }, [pageError, projectId, router]);

  // Load page sections when data arrives
  useEffect(() => {
    // Check if we need to load/reload data:
    // 1. Page data is available
    // 2. Either we haven't loaded initial data OR the stored pageId doesn't match current pageId
    const needsLoad = page && page.sections && (!hasLoadedInitialData || storedPageId !== pageId);
    
    if (needsLoad) {
      // Load both draft sections and published sections
      const draftSections = page.sections || [];
      // If published_sections is null/undefined, use the same sections as published
      // This ensures initial state doesn't show false "unpublished changes"
      const publishedSections = page.published_sections !== undefined 
        ? page.published_sections 
        : draftSections;
      
      loadPage(
        pageId,
        projectId,
        draftSections,
        publishedSections,
        page.title || 'Untitled Page'
      );
      setHasLoadedInitialData(true);
    }
  }, [page, loadPage, pageId, projectId, hasLoadedInitialData, storedPageId]);

  const getDeviceWidth = () => {
    switch (deviceView) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      default:
        return null; // null means full width
    }
  };

  if (isLoadingPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Full-width Canvas Navbar */}
      <CanvasNavbar
        projectId={projectId}
        currentPageId={pageId}
        currentPage={page}
        themeId={project?.theme_id || undefined}
        sectionCount={sections.length}
        lastSaved={lastSavedAt}
        saveSuccess={saveStatus === 'saved'}
        saveError={null}
        deviceView={deviceView}
        onDeviceViewChange={setDeviceView}
      />

      {/* Main content area - full width canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area - full width */}
        <div className="flex-1 overflow-auto min-h-0">
          <ResizablePreview
            presetWidth={getDeviceWidth()}
            minWidth={320}
            maxWidth={1400}
          >
            <Canvas theme={theme} />
          </ResizablePreview>
        </div>
      </div>
    </div>
  );
}