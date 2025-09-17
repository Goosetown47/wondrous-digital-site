'use client';

import { getSectionComponent } from '@/components/sections/index';
import { useBuilderStore, type Section } from '@/stores/builderStore';
import { MultiSectionCanvas, type CanvasSection } from '@/components/shared/canvas/MultiSectionCanvas';
import { useCallback } from 'react';

export function Canvas() {
  const {
    sections,
    selectedSectionId,
    setSelectedSection,
    removeSection,
    updateSection,
    reorderSections
  } = useBuilderStore();

  const handleSectionContentChange = useCallback((sectionId: string, updates: Record<string, unknown>) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      updateSection(sectionId, {
        content: { ...section.content, ...updates }
      });
    }
  }, [sections, updateSection]);

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
        isEditing={selectedSectionId === section.id}
        onContentChange={(updates) => handleSectionContentChange(section.id, updates)}
      />
    );
  }, [selectedSectionId, handleSectionContentChange]);

  return (
    <div
      className="min-h-screen bg-gray-50 @container"
      style={{ containerType: 'inline-size' }}
    >
      <MultiSectionCanvas
        sections={sections as CanvasSection[]}
        selectedSectionId={selectedSectionId}
        onSectionSelect={setSelectedSection}
        onSectionDelete={removeSection}
        onReorder={(newSections) => reorderSections(newSections as Section[])}
        renderSection={renderSection}
        emptyStateMessage="No sections yet"
        emptyStateDescription="Drag a section from the library to get started"
        showAddButtons={false} // Builder uses drag-and-drop from library
        enableDragReorder={true}
      />
    </div>
  );
}