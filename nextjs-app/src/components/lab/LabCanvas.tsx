'use client';

import { useCallback, useEffect, useState } from 'react';
import { MultiSectionCanvas, type CanvasSection } from '@/components/shared/canvas/MultiSectionCanvas';
import { ComponentRegistry } from '@/lib/register-components';
import { useLabStore, type LabSection } from '@/stores/labStore';
import { ComponentSelectorModal } from './ComponentSelectorModal';
import { EditableSectionWrapper } from '@/components/shared/content-editor';
import type { CoreComponent } from '@/types/builder';
import { getCodeName } from '@/lib/services/naming-service';
import { IframePreview } from '@/components/shared/preview/IframePreview';
import type { Theme } from '@/types/builder';

interface LabCanvasProps {
  className?: string;
  theme?: Theme | null;
}

export function LabCanvas({ className = '', theme }: LabCanvasProps) {
  const {
    sections,
    selectedSectionId,
    setSelectedSection,
    moveSection,
    removeSection,
    updateSection,
    addSection,
    reorderSections
  } = useLabStore();

  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | undefined>();

  // Handle adding a new section
  const handleAddSection = useCallback((afterIndex?: number) => {
    setInsertIndex(afterIndex);
    setShowComponentSelector(true);
  }, []);

  // Handle component selection from modal
  const handleSelectComponent = useCallback((component: CoreComponent) => {
    // Use code_name field if available (for new components), fallback to naming service
    const componentCodeName = component.code_name ||
                            component.metadata?.component_code as string ||
                            getCodeName(component.name);

    const newSection = {
      id: `section-${Date.now()}`,
      component_name: componentCodeName, // Use the code name for registry lookup
      content: component.default_content || {},
      order: insertIndex ?? sections.length,
      metadata: {
        component_type: component.type,
        component_source: component.source,
        display_name: component.name, // Keep the display name for UI
        component_name: componentCodeName // Also store in metadata for lab_drafts table
      }
    };

    addSection(newSection, insertIndex);
    setShowComponentSelector(false);
    setInsertIndex(undefined);
  }, [insertIndex, sections.length, addSection]);

  // Render a section
  const renderSection = useCallback((section: {
    id: string;
    component_name?: string;
    content: Record<string, unknown>;
    [key: string]: unknown;
  }) => {
    // Handle both direct code names and display names
    let componentName = section.component_name || 'HeroTwoColumn';

    // If the component isn't found, try mapping from display name
    let registryEntry = ComponentRegistry.get(componentName);
    if (!registryEntry && section.component_name) {
      componentName = getCodeName(section.component_name);
      registryEntry = ComponentRegistry.get(componentName);
    }

    if (!registryEntry) {
      return (
        <div className="p-8 text-center bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            Component "{componentName}" not found in registry
          </p>
        </div>
      );
    }

    const Component = registryEntry.component;

    // Check if component has editable fields configuration
    const hasEditableFields = registryEntry.editableFields && registryEntry.editableFields.length > 0;

    // Handle content update
    const handleContentUpdate = (updatedContent: Record<string, unknown>) => {
      updateSection(section.id, { content: updatedContent });
    };

    // If component has editable fields, use the wrapper
    if (hasEditableFields) {
      return (
        <EditableSectionWrapper
          componentName={componentName}
          content={section.content}
          editable={true}
          onContentUpdate={handleContentUpdate}
        >
          <Component {...section.content} />
        </EditableSectionWrapper>
      );
    }

    // Backward compatibility: Handle components without field configs (old way)
    let contentProps = section.content;

    // Handle special component types that haven't migrated yet
    if (componentName === 'HeroTwoColumn') {
      // HeroTwoColumn should use the new system, but keep as fallback
      contentProps = {
        ...section.content,
        editable: true,
        onHeadingChange: (heading: string) => updateSection(section.id, {
          content: { ...section.content, heading }
        }),
        onSubtextChange: (subtext: string) => updateSection(section.id, {
          content: { ...section.content, subtext }
        }),
        onButtonTextChange: (buttonText: string) => updateSection(section.id, {
          content: { ...section.content, buttonText }
        }),
        onImageChange: (imageUrl: string | null) => updateSection(section.id, {
          content: { ...section.content, imageUrl }
        })
      };
    } else if (componentName === 'Navbar2' || componentName === 'Footer2' || componentName === 'NavBar3') {
      // Navigation components with partial editability
      contentProps = {
        ...section.content,
        editable: true,
        onLogoChange: (imageUrl: string | null) => updateSection(section.id, {
          content: {
            ...section.content,
            logo: {
              ...((section.content.logo as Record<string, unknown>) || {}),
              src: imageUrl
            }
          }
        })
      };
    } else {
      // All other components get basic editable prop
      contentProps = {
        ...section.content,
        editable: true
      };
    }

    return <Component {...contentProps} />;
  }, [updateSection]);

  // Handle section settings
  const handleSectionSettings = useCallback((sectionId: string) => {
    // TODO: Open section-specific settings panel
    console.log('Open settings for section:', sectionId);
  }, []);

  // Listen for the custom add-section event from the header button
  useEffect(() => {
    const handleAddSectionEvent = () => {
      handleAddSection();
    };

    const element = document.querySelector('[data-lab-canvas]');
    if (element) {
      element.addEventListener('add-section', handleAddSectionEvent);
      return () => {
        element.removeEventListener('add-section', handleAddSectionEvent);
      };
    }
  }, [handleAddSection]);

  return (
    <>
      <div data-lab-canvas className={className}>
        <IframePreview className="w-full" theme={theme}>
          <MultiSectionCanvas
            sections={sections as CanvasSection[]}
            selectedSectionId={selectedSectionId}
            onSectionSelect={setSelectedSection}
            onSectionMove={moveSection}
            onSectionDelete={removeSection}
            onSectionSettings={handleSectionSettings}
            onAddSection={handleAddSection}
            onReorder={(newSections) => reorderSections(newSections as LabSection[])}
            renderSection={renderSection}
            emptyStateMessage="No sections in this draft"
            emptyStateDescription="Click 'Add Section' in the header to add your first section"
            showAddButtons={false} // Removed dividers between sections
            enableDragReorder={true}
            className=""
          />
        </IframePreview>
      </div>

      <ComponentSelectorModal
        open={showComponentSelector}
        onOpenChange={setShowComponentSelector}
        onSelectComponent={handleSelectComponent}
      />
    </>
  );
}