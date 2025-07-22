'use client';

import { Canvas } from '@/components/builder/Canvas';
import { SectionLibrary } from '@/components/builder/SectionLibrary';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/stores/builderStore';
import { heroContentSchema } from '@/schemas/section';
import { Eye, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProject, usePage, useSavePage } from '@/hooks/useProjects';
import { useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export default function BuilderPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { addSection, sections, clearAll } = useBuilderStore();
  
  // Fetch project and page data
  const { data: project } = useProject(projectId);
  const { data: page, isLoading: isLoadingPage } = usePage(projectId);
  const savePage = useSavePage();

  // Debounce sections for auto-save
  const debouncedSections = useDebounce(sections, 1000);

  // Load page sections when data arrives
  useEffect(() => {
    if (page && page.sections) {
      clearAll();
      page.sections.forEach(section => {
        addSection(section);
      });
    }
  }, [page, clearAll, addSection]);

  // Auto-save when sections change
  useEffect(() => {
    if (projectId && debouncedSections.length > 0) {
      savePage.mutate({
        projectId,
        sections: debouncedSections,
        title: project?.name || 'Untitled Page',
      });
    }
  }, [debouncedSections, projectId, project?.name, savePage]);

  const handleDragStart = (sectionType: string) => {
    if (typeof window !== 'undefined') {
      window.__draggingSectionType = sectionType;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sectionType = window.__draggingSectionType;
    
    if (sectionType === 'hero') {
      const defaultContent = heroContentSchema.parse({});
      addSection({
        id: `${sectionType}-${Date.now()}`,
        type: 'hero',
        content: defaultContent,
        order: sections.length,
      });
    }
    
    delete window.__draggingSectionType;
  };

  const handleManualSave = () => {
    savePage.mutate({
      projectId,
      sections,
      title: project?.name || 'Untitled Page',
    });
  };

  if (isLoadingPage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Page Builder</h2>
          <p className="text-sm text-gray-600 mt-1">
            {project?.name || 'Loading...'}
          </p>
        </div>
        <SectionLibrary onDragStart={handleDragStart} />
      </div>

      {/* Main canvas area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Building Page</h1>
              <span className="text-sm text-gray-500">
                {sections.length} section{sections.length !== 1 ? 's' : ''}
              </span>
              {savePage.isPending && (
                <span className="text-sm text-gray-500 flex items-center">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Saving...
                </span>
              )}
              {savePage.isSuccess && !savePage.isPending && (
                <span className="text-sm text-green-600">
                  Saved
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/preview/${projectId}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
              <Button 
                size="sm" 
                onClick={handleManualSave}
                disabled={savePage.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div 
          className="flex-1 overflow-auto"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Canvas />
        </div>
      </div>
    </div>
  );
}

// Extend window type for drag data
declare global {
  interface Window {
    __draggingSectionType?: string;
  }
}