'use client';

import { ReactNode, useCallback } from 'react';
import { AnimatePresence, Reorder } from 'framer-motion';
import { SectionWrapper } from './SectionWrapper';
import { AddSectionButton } from './AddSectionButton';
import { HoverZone } from '@/components/builder/HoverZone';
import { Layers } from 'lucide-react';

export interface CanvasSection {
  id: string;
  type?: string;
  component_name?: string;
  content: Record<string, unknown>;
  order?: number;
  [key: string]: unknown; // Allow additional properties for flexibility
}

interface MultiSectionCanvasProps {
  sections: CanvasSection[];
  selectedSectionId?: string | null;
  onSectionSelect?: (sectionId: string) => void;
  onSectionMove?: (fromIndex: number, toIndex: number) => void;
  onSectionDelete?: (sectionId: string) => void;
  onSectionSettings?: (sectionId: string) => void;
  onAddSection?: (afterIndex?: number) => void;
  onReorder?: (sections: CanvasSection[]) => void;
  renderSection: (section: CanvasSection) => ReactNode;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
  showAddButtons?: boolean;
  enableDragReorder?: boolean;
  useHoverZones?: boolean;
  onHoverZoneClick?: (position: number) => void;
  className?: string;
}

export function MultiSectionCanvas({
  sections,
  selectedSectionId,
  onSectionSelect,
  onSectionMove,
  onSectionDelete,
  onSectionSettings,
  onAddSection,
  onReorder,
  renderSection,
  emptyStateMessage = "No sections yet",
  emptyStateDescription = "Add a section to get started",
  showAddButtons = true,
  enableDragReorder = false,
  useHoverZones = false,
  onHoverZoneClick,
  className = ""
}: MultiSectionCanvasProps) {
  const handleMoveSection = useCallback(
    (fromIndex: number, direction: 'up' | 'down') => {
      if (!onSectionMove) return;

      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

      if (toIndex < 0 || toIndex >= sections.length) return;

      onSectionMove(fromIndex, toIndex);
    },
    [sections.length, onSectionMove]
  );

  const handleReorder = useCallback(
    (newOrder: CanvasSection[]) => {
      if (onReorder) {
        onReorder(newOrder);
      }
    },
    [onReorder]
  );

  // Empty state
  if (sections.length === 0) {
    // Use HoverZone for builder mode
    if (useHoverZones && onHoverZoneClick) {
      return (
        <div className={`min-h-[400px] ${className} relative pl-14`}>
          <HoverZone
            position={0}
            onAddClick={onHoverZoneClick}
            isEmpty={true}
          />
        </div>
      );
    }

    // Default empty state for non-builder mode
    return (
      <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {emptyStateMessage}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {emptyStateDescription}
          </p>
          {onAddSection && (
            <button
              onClick={() => onAddSection()}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Add First Section
            </button>
          )}
        </div>
      </div>
    );
  }

  // Sections with drag reordering
  if (enableDragReorder && onReorder) {
    return (
      <div className={`${className} relative pl-14`}>
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={handleReorder}
          className="space-y-0"
        >
          <AnimatePresence mode="sync">
            {/* HoverZone or Add button before first section */}
            {useHoverZones && onHoverZoneClick ? (
              <HoverZone position={0} onAddClick={onHoverZoneClick} />
            ) : (
              showAddButtons && onAddSection && (
                <AddSectionButton onClick={() => onAddSection(0)} />
              )
            )}

            {sections.map((section, index) => (
              <div key={section.id}>
                <Reorder.Item
                  key={section.id}
                  value={section}
                  className="relative"
                >
                  <SectionWrapper
                    id={section.id}
                    index={index}
                    totalSections={sections.length}
                    isSelected={selectedSectionId === section.id}
                    onSelect={() => onSectionSelect?.(section.id)}
                    onMoveUp={() => handleMoveSection(index, 'up')}
                    onMoveDown={() => handleMoveSection(index, 'down')}
                    onDelete={() => onSectionDelete?.(section.id)}
                    onSettings={() => onSectionSettings?.(section.id)}
                  >
                    {renderSection(section)}
                  </SectionWrapper>
                </Reorder.Item>

                {/* HoverZone or Add button after each section */}
                {useHoverZones && onHoverZoneClick ? (
                  <HoverZone position={index + 1} onAddClick={onHoverZoneClick} />
                ) : (
                  showAddButtons && onAddSection && (
                    <AddSectionButton onClick={() => onAddSection(index + 1)} />
                  )
                )}
              </div>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    );
  }

  // Sections without drag reordering
  return (
    <div className={`${className} relative pl-14`}>
      <AnimatePresence mode="sync">
        {/* HoverZone or Add button before first section */}
        {useHoverZones && onHoverZoneClick ? (
          <HoverZone position={0} onAddClick={onHoverZoneClick} />
        ) : (
          showAddButtons && onAddSection && (
            <AddSectionButton onClick={() => onAddSection(0)} />
          )
        )}

        {sections.map((section, index) => (
          <div key={section.id}>
            <SectionWrapper
              id={section.id}
              index={index}
              totalSections={sections.length}
              isSelected={selectedSectionId === section.id}
              onSelect={() => onSectionSelect?.(section.id)}
              onMoveUp={onSectionMove ? () => handleMoveSection(index, 'up') : undefined}
              onMoveDown={onSectionMove ? () => handleMoveSection(index, 'down') : undefined}
              onDelete={onSectionDelete ? () => onSectionDelete(section.id) : undefined}
              onSettings={onSectionSettings ? () => onSectionSettings(section.id) : undefined}
            >
              {renderSection(section)}
            </SectionWrapper>

            {/* HoverZone or Add button after each section */}
            {useHoverZones && onHoverZoneClick ? (
              <HoverZone position={index + 1} onAddClick={onHoverZoneClick} />
            ) : (
              showAddButtons && onAddSection && (
                <AddSectionButton onClick={() => onAddSection(index + 1)} />
              )
            )}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}