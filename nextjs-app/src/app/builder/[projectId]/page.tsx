'use client';

import { Canvas } from '@/components/builder/Canvas';
import { SectionLibrary } from '@/components/builder/SectionLibrary';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/stores/builderStore';
import { heroContentSchema } from '@/schemas/section';
import { Eye, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BuilderPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { addSection, sections } = useBuilderStore();

  const handleDragStart = (sectionType: string) => {
    // Store the section type being dragged
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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Page Builder</h2>
          <p className="text-sm text-gray-600 mt-1">Project: {projectId}</p>
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
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/preview/${projectId}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
              <Button size="sm">
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