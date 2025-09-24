'use client';

import { useCallback } from 'react';
import type { CanvasSection } from '../MultiSectionCanvas';

interface UseCanvasOperationsProps {
  sections: CanvasSection[];
  onUpdate: (sections: CanvasSection[]) => void;
}

export function useCanvasOperations({ sections, onUpdate }: UseCanvasOperationsProps) {
  const moveSection = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      const newSections = [...sections];
      const [movedSection] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedSection);

      // Update order property
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order: index
      }));

      onUpdate(reorderedSections);
    },
    [sections, onUpdate]
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      const newSections = sections.filter(s => s.id !== sectionId);

      // Update order property
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order: index
      }));

      onUpdate(reorderedSections);
    },
    [sections, onUpdate]
  );

  const insertSection = useCallback(
    (section: CanvasSection, atIndex?: number) => {
      const newSections = [...sections];
      const insertIndex = atIndex !== undefined ? atIndex : sections.length;

      newSections.splice(insertIndex, 0, {
        ...section,
        order: insertIndex
      });

      // Update order property for all sections
      const reorderedSections = newSections.map((s, index) => ({
        ...s,
        order: index
      }));

      onUpdate(reorderedSections);
    },
    [sections, onUpdate]
  );

  const updateSection = useCallback(
    (sectionId: string, updates: Partial<CanvasSection>) => {
      const newSections = sections.map(section =>
        section.id === sectionId
          ? { ...section, ...updates }
          : section
      );

      onUpdate(newSections);
    },
    [sections, onUpdate]
  );

  const reorderSections = useCallback(
    (newSections: CanvasSection[]) => {
      // Update order property
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order: index
      }));

      onUpdate(reorderedSections);
    },
    [onUpdate]
  );

  return {
    moveSection,
    deleteSection,
    insertSection,
    updateSection,
    reorderSections
  };
}