'use client';

import { Canvas } from '@/components/builder/Canvas';
import { SectionLibrary } from '@/components/builder/SectionLibrary';
import { CanvasNavbar } from '@/components/builder/CanvasNavbar';
import { ThemeProvider } from '@/components/builder/ThemeProvider';
import { useBuilderStore } from '@/stores/builderStore';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { usePageById } from '@/hooks/usePages';
import { useTheme } from '@/hooks/useThemes';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useEffect, useState } from 'react';

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const pageId = params.pageId as string;
  const { 
    addSection, 
    sections, 
    loadPage,
    saveStatus,
    lastSavedAt,
    pageId: storedPageId
  } = useBuilderStore();
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Fetch project and page data
  const { data: project } = useProject(projectId);
  const { data: page, isLoading: isLoadingPage, error: pageError } = usePageById(pageId);
  
  // Enable auto-save
  const { saveNow } = useAutoSave();
  
  // Fetch theme if project has one
  const { data: theme } = useTheme(project?.theme_id);

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

  const handleDragStart = (itemId: string) => {
    console.log('Drag started for item:', itemId);
    if (typeof window !== 'undefined') {
      window.__draggingItemId = itemId;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    console.log('Drop event triggered');
    const itemId = window.__draggingItemId;
    console.log('Dropped item ID:', itemId);
    
    if (itemId) {
      // Fetch the library item to get its content
      try {
        console.log('Fetching library item:', itemId);
        const response = await fetch(`/api/library/${itemId}`);
        if (response.ok) {
          const libraryItem = await response.json();
          console.log('Library item fetched:', libraryItem);
          
          // Add the section from library item
          // Extract the proper content structure
          const sectionContent = libraryItem.content?.data || libraryItem.content || {};
          
          const newSection = {
            id: `section-${Date.now()}`,
            type: libraryItem.type || 'section',
            type_id: libraryItem.type_id,
            component_name: libraryItem.component_name,
            content: sectionContent,
            order: sections.length,
          };
          
          console.log('Adding new section:', newSection);
          addSection(newSection);
        } else {
          console.error('Failed to fetch library item, status:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch library item:', error);
      }
    }
    
    delete window.__draggingItemId;
  };

  const handleManualSave = () => {
    return saveNow();
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
        onSave={handleManualSave}
        saveSuccess={saveStatus === 'saved'}
        saveError={null}
      />

      {/* Main content area with sidebar and canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with toggle */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="w-80 h-full bg-white border-r overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Template Library</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Drag templates to canvas
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L10 10L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <SectionLibrary onDragStart={handleDragStart} />
          </div>
        </div>

        {/* Canvas area */}
        <div 
          className="flex-1 overflow-auto min-h-0 relative"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Sidebar toggle button */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute left-4 top-4 z-10 p-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L10 10L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          <ThemeProvider 
            theme={theme} 
            overrides={project?.theme_overrides}
            className="min-h-full"
          >
            <Canvas />
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
}

// Extend window type for drag data
declare global {
  interface Window {
    __draggingItemId?: string;
  }
}