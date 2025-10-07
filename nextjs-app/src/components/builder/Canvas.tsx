'use client';

import { ComponentRegistry } from '@/lib/register-components';
import { useBuilderStore, type Section, type ProjectSection } from '@/stores/builderStore';
import { MultiSectionCanvas, type CanvasSection } from '@/components/shared/canvas/MultiSectionCanvas';
import { IframePreview } from '@/components/shared/preview/IframePreview';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { SectionSettingsModal, type SectionSettings } from '@/components/shared/canvas/SectionSettingsModal';
import { GlobalSectionBadge } from '@/components/shared/canvas/GlobalSectionBadge';
import { useCallback, useState, useEffect } from 'react';
import type { Theme, LibraryItem } from '@/types/builder';
import { useAutoSave } from '@/hooks/useAutoSave';

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
    projectId,
    projectSections,
    loadProjectSections,
  } = useBuilderStore();

  const { saveNow } = useAutoSave();

  const [modalOpen, setModalOpen] = useState(false);
  const [insertPosition, setInsertPosition] = useState(0);

  // Section settings modal state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsSectionId, setSettingsSectionId] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Fetch project sections function (reusable)
  const fetchProjectSections = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/sections`);
      if (response.ok) {
        const projectSections = await response.json();
        loadProjectSections(projectSections);
      } else {
        console.error('Failed to fetch project sections:', response.status);
      }
    } catch (error) {
      console.error('Error fetching project sections:', error);
    }
  }, [projectId, loadProjectSections]);

  // Fetch project sections on mount
  useEffect(() => {
    fetchProjectSections();
  }, [fetchProjectSections]);

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

  // Handle section settings button click
  const handleSectionSettings = useCallback((sectionId: string) => {
    setSettingsSectionId(sectionId);
    setSettingsModalOpen(true);
  }, []);

  // Handle saving section settings
  const handleSaveSettings = useCallback(async (settings: SectionSettings) => {
    if (!settingsSectionId || !projectId || isConverting) return;

    const section = sections.find((s) => s.id === settingsSectionId);
    if (!section) return;

    if (settings.scope === 'global' && settings.placement) {
      setIsConverting(true);

      try {
        // STEP 1: Save the section to database first (if not already saved)
        console.log('💾 Saving section to database before converting...');
        await saveNow();

        // Wait a moment for the save to complete and get the real database ID
        await new Promise(resolve => setTimeout(resolve, 500));

        // STEP 2: Convert page section to global section
        console.log('🌐 Converting section to global...');
        const response = await fetch(`/api/sections/${settingsSectionId}/make-global`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section_placement: settings.placement,
            display_order: settings.displayOrder || 0,
          }),
        });

        if (response.ok) {
          const { globalSection } = await response.json();

          // Remove from page sections (it's now in project_sections table)
          removeSection(settingsSectionId);

          // Refetch project sections to show the new global section
          await fetchProjectSections();

          console.log('✅ Section successfully converted to global:', globalSection);
          alert('Section is now global and will appear on all pages!');
        } else {
          const error = await response.json();
          console.error('Failed to convert section to global:', error);
          alert(`Failed to convert section: ${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error converting section to global:', error);
        alert('An error occurred while converting the section');
      } finally {
        setIsConverting(false);
      }
    }
    // Note: Converting from global back to page-specific not yet implemented
  }, [settingsSectionId, projectId, sections, removeSection, saveNow, isConverting, fetchProjectSections]);

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

    // Batch field update handler - updates multiple fields atomically
    // Prevents race conditions when updating related fields (e.g., button properties)
    const handleBatchFieldUpdate = (updates: Record<string, unknown>) => {
      console.log('💾 [BuilderCanvas] Batch update:', {
        sectionId: section.id,
        updates,
      });

      // Update all fields at once in content
      const updatedContent = {
        ...content,
        ...updates,
      };

      // Single update section call = single auto-save
      updateSection(section.id, { content: updatedContent });
    };

    // Filter out empty/null/undefined values to let component defaults work
    const filteredContent = Object.entries(content).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    // Pass editable flag and update handlers to component (NEW PATTERN - matches LabCanvas)
    // Components with inline EditableText/Image/Button wrappers will use these
    return (
      <Component
        {...filteredContent}
        editable={true}
        onUpdate={handleFieldUpdate}
        onBatchUpdate={handleBatchFieldUpdate}
        projectId={projectId}
      />
    );
  }, [projectId, updateSection]);

  // Organize global sections by placement
  const globalHeaders = projectSections.filter(s => s.section_placement === 'global_header');
  const globalFooters = projectSections.filter(s => s.section_placement === 'global_footer');

  // Render a global section with badge
  const renderGlobalSection = (section: ProjectSection) => {
    const componentName = section.component_name || 'HeroTwoColumn';
    const registryEntry = ComponentRegistry.get(componentName);

    if (!registryEntry) return null;

    const Component = registryEntry.component;
    const content = section.content || {};
    const filteredContent = Object.entries(content).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    return (
      <div key={section.id} className="relative">
        <GlobalSectionBadge placement={section.section_placement} />
        <Component
          {...filteredContent}
          editable={true}
          projectId={projectId}
        />
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-full">
        <IframePreview className="w-full pt-12" theme={theme}>
          {/* Global Headers */}
          {globalHeaders.map(renderGlobalSection)}

          {/* Page Sections */}
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
            onSectionSettings={handleSectionSettings}
          />

          {/* Global Footers */}
          {globalFooters.map(renderGlobalSection)}
        </IframePreview>
      </div>

      <TemplateLibraryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleTemplateSelect}
      />

      <SectionSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => {
          setSettingsModalOpen(false);
          setSettingsSectionId(null);
        }}
        onSave={handleSaveSettings}
        currentSettings={{
          scope: 'page', // Always page-specific when opening settings
          placement: undefined,
          displayOrder: undefined,
        }}
        sectionName={
          settingsSectionId
            ? sections.find((s) => s.id === settingsSectionId)?.component_name
            : undefined
        }
      />
    </>
  );
}