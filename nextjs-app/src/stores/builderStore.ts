import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Section {
  id: string;
  type: 'hero' | 'features' | 'navigation' | 'footer';
  content: Record<string, any>;
  order: number;
  templateId?: string;
}

interface BuilderState {
  sections: Section[];
  selectedSectionId: string | null;
  isDragging: boolean;
  isEditing: boolean;
  
  // Actions
  addSection: (section: Section) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  reorderSections: (sections: Section[]) => void;
  setSelectedSection: (id: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
  clearAll: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  devtools(
    persist(
      (set) => ({
        sections: [],
        selectedSectionId: null,
        isDragging: false,
        isEditing: false,

        addSection: (section) =>
          set((state) => ({
            sections: [...state.sections, section],
          })),

        removeSection: (id) =>
          set((state) => ({
            sections: state.sections.filter((s) => s.id !== id),
            selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
          })),

        updateSection: (id, updates) =>
          set((state) => ({
            sections: state.sections.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          })),

        reorderSections: (sections) =>
          set(() => ({
            sections: sections.map((s, index) => ({ ...s, order: index })),
          })),

        setSelectedSection: (id) =>
          set(() => ({
            selectedSectionId: id,
          })),

        setIsDragging: (isDragging) =>
          set(() => ({
            isDragging,
          })),

        setIsEditing: (isEditing) =>
          set(() => ({
            isEditing,
          })),

        clearAll: () =>
          set(() => ({
            sections: [],
            selectedSectionId: null,
            isDragging: false,
            isEditing: false,
          })),
      }),
      {
        name: 'builder-storage',
      }
    )
  )
);