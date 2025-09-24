'use client';

import { getSectionComponent } from '@/components/sections/index';
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
    reorderSections
  } = useBuilderStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [insertPosition, setInsertPosition] = useState(0);

  const handleSectionContentChange = useCallback((sectionId: string, updates: Record<string, unknown>) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      updateSection(sectionId, {
        content: { ...section.content, ...updates }
      });
    }
  }, [sections, updateSection]);

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
    // Get the appropriate component using component_name from the section
    const SectionComponent = getSectionComponent(section.component_name);

    // Prepare the content, handling both old and new formats
    const content = section.content || {};

    return (
      <SectionComponent
        content={content}
        isEditing={true} // Always allow editing on hover in Builder mode
        onContentChange={(updates) => handleSectionContentChange(section.id, updates)}
      />
    );
  }, [handleSectionContentChange]);

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