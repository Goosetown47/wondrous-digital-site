'use client';

import { ComponentRegistry } from '@/lib/register-components';
import { useBuilderStore, type Section } from '@/stores/builderStore';
import { MultiSectionCanvas, type CanvasSection } from '@/components/shared/canvas/MultiSectionCanvas';
import { IframePreview } from '@/components/shared/preview/IframePreview';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { useCallback, useState } from 'react';
import type { Theme, LibraryItem } from '@/types/builder';

// Extend window type for drag data
declare global {
  interface Window {
    __draggingItemId?: string;
  }
}

interface CanvasProps {
  theme?: Theme | null;
}

export function Canvas({ theme }: CanvasProps) {
  const {
    sections,
    selectedSectionId,
    setSelectedSection,
    removeSection,
    updateSection,
    reorderSections,
    projectId
  } = useBuilderStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [insertPosition, setInsertPosition] = useState(0);

  const handleHoverZoneClick = useCallback((position: number) => {
    setInsertPosition(position);
    setModalOpen(true);
  }, []);

  const handleSectionMove = useCallback((fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);

    // Update order values
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    reorderSections(reorderedSections);
  }, [sections, reorderSections]);

  const handleTemplateSelect = useCallback(async (template: LibraryItem) => {
    try {
      // Fetch the library item to get its content
      const response = await fetch(`/api/library/${template.id}`);
      if (response.ok) {
        const libraryItem = await response.json();

        // Extract the proper content structure
        const sectionContent = libraryItem.content?.data || libraryItem.content || {};

        // Create new section with correct order based on insert position
        const newSection = {
          id: `section-${Date.now()}`,
          type: libraryItem.type || 'section',
          type_id: libraryItem.type_id,
          component_name: libraryItem.component_name,
          content: sectionContent,
          order: insertPosition,
          library_item_id: template.id, // Track which library item this came from
          library_version: libraryItem.version || 1, // Track the version used
        };

        // Update order of existing sections if needed
        const updatedSections = sections.map((section, index) => {
          if (index >= insertPosition) {
            return { ...section, order: (section.order || index) + 1 };
          }
          return section;
        });

        // Add new section at the correct position
        const finalSections = [...updatedSections, newSection].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );

        // Update store with reordered sections
        reorderSections(finalSections);

        // Note: Usage count is automatically incremented by the API endpoint
      } else {
        console.error('Failed to fetch library item, status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch library item:', error);
    }
  }, [insertPosition, sections, reorderSections]);

  const renderSection = useCallback((section: {
    id: string;
    component_name?: string;
    content: Record<string, unknown>
  }) => {
    // Get the component from the unified ComponentRegistry
    const componentName = section.component_name || 'HeroTwoColumn';
    const registryEntry = ComponentRegistry.get(componentName);

    if (!registryEntry) {
      // Fallback to generic section if component not found
      return (
        <div className="py-12 px-4 bg-gray-100 border-2 border-dashed border-gray-300">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-lg font-semibold text-gray-700">Component Not Found</h3>
            <p className="text-gray-500 mt-2">
              Component "{componentName}" is not registered in the system.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Please ensure the component is properly registered in ComponentRegistry.
            </p>
          </div>
        </div>
      );
    }

    const Component = registryEntry.component;
    const content = section.content || {};

    // Field-level update handler (matches LabCanvas pattern)
    // Components with inline Editable* wrappers will call this for each field
    const handleFieldUpdate = (fieldPath: string, value: unknown) => {
      console.log('💾 [BuilderCanvas] Field update:', {
        sectionId: section.id,
        fieldPath,
        value,
      });

      // Update the specific field in content
      const updatedContent = {
        ...content,
        [fieldPath]: value,
      };

      // Update section with new content
      updateSection(section.id, { content: updatedContent });
    };

    // Filter out empty/null/undefined values to let component defaults work
    const filteredContent = Object.entries(content).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    // Pass editable flag and update handler to component (NEW PATTERN - matches LabCanvas)
    // Components with inline EditableText/Image/Button wrappers will use these
    return (
      <Component
        {...filteredContent}
        editable={true}
        onUpdate={handleFieldUpdate}
        projectId={projectId}
      />
    );
  }, [projectId, updateSection]);

  return (
    <>
      <div className="w-full h-full">
        <IframePreview className="w-full" theme={theme}>
          <MultiSectionCanvas
            sections={sections as CanvasSection[]}
            selectedSectionId={selectedSectionId}
            onSectionSelect={setSelectedSection}
            onSectionDelete={removeSection}
            onSectionMove={handleSectionMove}
            onReorder={(newSections) => reorderSections(newSections as Section[])}
            renderSection={renderSection}
            emptyStateMessage="No sections yet"
            emptyStateDescription="Click the plus icon to add a section"
            showAddButtons={false}
            enableDragReorder={true}
            useHoverZones={true}
            onHoverZoneClick={handleHoverZoneClick}
          />
        </IframePreview>
      </div>

      <TemplateLibraryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleTemplateSelect}
      />
    </>
  );
}