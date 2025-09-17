import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { LabPageContent } from '@/types/lab';

export interface LabSection {
  id: string;
  component_name: string;
  content: Record<string, unknown>;
  order: number;
  metadata?: Record<string, unknown>;
}

interface LabState {
  // Current draft sections
  sections: LabSection[];

  // UI State
  selectedSectionId: string | null;
  isDirty: boolean;

  // Draft metadata
  draftId: string | null;
  draftName: string;
  draftType: 'section' | 'page';

  // Actions
  setSections: (sections: LabSection[]) => void;
  addSection: (section: LabSection, atIndex?: number) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<LabSection>) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  reorderSections: (sections: LabSection[]) => void;
  setSelectedSection: (id: string | null) => void;
  markClean: () => void;

  // Draft management
  loadDraft: (draftId: string, draftName: string, draftType: 'section' | 'page', content: LabPageContent | Record<string, unknown>) => void;
  clearDraft: () => void;
  getContent: () => LabPageContent | Record<string, unknown>;
}

export const useLabStore = create<LabState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sections: [],
        selectedSectionId: null,
        isDirty: false,
        draftId: null,
        draftName: '',
        draftType: 'section',

        // Section Actions
        setSections: (sections) =>
          set(() => ({
            sections: sections.map((s, index) => ({ ...s, order: index })),
            isDirty: true
          })),

        addSection: (section, atIndex) =>
          set((state) => {
            const newSections = [...state.sections];
            const insertIndex = atIndex !== undefined ? atIndex : newSections.length;

            newSections.splice(insertIndex, 0, {
              ...section,
              order: insertIndex
            });

            return {
              sections: newSections.map((s, index) => ({ ...s, order: index })),
              isDirty: true
            };
          }),

        removeSection: (id) =>
          set((state) => ({
            sections: state.sections
              .filter((s) => s.id !== id)
              .map((s, index) => ({ ...s, order: index })),
            selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
            isDirty: true
          })),

        updateSection: (id, updates) =>
          set((state) => ({
            sections: state.sections.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
            isDirty: true
          })),

        moveSection: (fromIndex, toIndex) =>
          set((state) => {
            if (fromIndex === toIndex) return state;

            const newSections = [...state.sections];
            const [movedSection] = newSections.splice(fromIndex, 1);
            newSections.splice(toIndex, 0, movedSection);

            return {
              sections: newSections.map((s, index) => ({ ...s, order: index })),
              isDirty: true
            };
          }),

        reorderSections: (sections) =>
          set(() => ({
            sections: sections.map((s, index) => ({ ...s, order: index })),
            isDirty: true
          })),

        setSelectedSection: (id) =>
          set(() => ({
            selectedSectionId: id
          })),

        markClean: () =>
          set(() => ({
            isDirty: false
          })),

        // Draft management
        loadDraft: (draftId, draftName, draftType, content) => {
          // Handle multi-section content
          if ('sections' in content && Array.isArray(content.sections)) {
            set({
              draftId,
              draftName,
              draftType,
              sections: content.sections.map((s, index) => ({
                ...s,
                order: s.order ?? index
              })),
              selectedSectionId: null,
              isDirty: false
            });
          } else {
            // Convert single section to multi-section format for consistency
            const contentRecord = content as Record<string, unknown>;
            const metadata = contentRecord.metadata as Record<string, unknown> | undefined;
            const componentName = contentRecord.component_name as string ||
                                metadata?.component_name as string ||
                                'HeroTwoColumn';

            set({
              draftId,
              draftName,
              draftType,
              sections: [{
                id: `section-${Date.now()}`,
                component_name: componentName,
                content: content as Record<string, unknown>,
                order: 0
              }],
              selectedSectionId: null,
              isDirty: false
            });
          }
        },

        clearDraft: () =>
          set(() => ({
            sections: [],
            selectedSectionId: null,
            isDirty: false,
            draftId: null,
            draftName: '',
            draftType: 'section'
          })),

        getContent: () => {
          const state = get();

          // Always return multi-section format to preserve component_name
          // This ensures we don't lose section metadata when saving
          return {
            sections: state.sections,
            metadata: {}
          } as LabPageContent;
        }
      }),
      {
        name: 'lab-storage',
        partialize: (state) => ({
          // Only persist draft metadata, not sections (they're saved to database)
          draftId: state.draftId,
          draftName: state.draftName,
          draftType: state.draftType
        })
      }
    )
  )
);