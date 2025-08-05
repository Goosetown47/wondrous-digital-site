import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Section {
  id: string;
  type: string; // Made flexible to support any type
  type_id?: string; // Reference to types table
  component_name?: string; // React component name from library item
  content: Record<string, unknown>;
  order: number;
  templateId?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface BuilderState {
  // Current working sections (draft)
  sections: Section[];
  
  // Published sections (what's live on the site)
  publishedSections: Section[];
  
  // UI State
  selectedSectionId: string | null;
  isDragging: boolean;
  isEditing: boolean;
  
  // Save State
  isDirty: boolean;
  lastSavedAt: Date | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  
  // Page Metadata
  pageId: string | null;
  projectId: string | null;
  pageTitle: string;
  
  // Actions
  addSection: (section: Section) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  reorderSections: (sections: Section[]) => void;
  setSelectedSection: (id: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
  clearAll: () => void;
  
  // New Save Actions
  markDirty: () => void;
  markClean: () => void;
  setSaveStatus: (status: SaveStatus, error?: string) => void;
  setLastSavedAt: (date: Date) => void;
  
  // Page Actions
  loadPage: (pageId: string, projectId: string, sections: Section[], publishedSections: Section[], title: string) => void;
  publishDraft: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        sections: [],
        publishedSections: [],
        selectedSectionId: null,
        isDragging: false,
        isEditing: false,
        isDirty: false,
        lastSavedAt: null,
        saveStatus: 'idle',
        saveError: null,
        pageId: null,
        projectId: null,
        pageTitle: '',

        // Section Actions - now mark as dirty when modified
        addSection: (section) =>
          set((state) => ({
            sections: [...state.sections, section],
            isDirty: true,
          })),

        removeSection: (id) =>
          set((state) => ({
            sections: state.sections.filter((s) => s.id !== id),
            selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
            isDirty: true,
          })),

        updateSection: (id, updates) =>
          set((state) => ({
            sections: state.sections.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
            isDirty: true,
          })),

        reorderSections: (sections) =>
          set(() => ({
            sections: sections.map((s, index) => ({ ...s, order: index })),
            isDirty: true,
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
            publishedSections: [],
            selectedSectionId: null,
            isDragging: false,
            isEditing: false,
            isDirty: false,
            saveStatus: 'idle',
            saveError: null,
            pageId: null,
            projectId: null,
            pageTitle: '',
          })),

        // Save Actions
        markDirty: () =>
          set(() => ({
            isDirty: true,
          })),

        markClean: () =>
          set(() => ({
            isDirty: false,
            saveError: null,
          })),

        setSaveStatus: (status, error) =>
          set(() => ({
            saveStatus: status,
            saveError: error || null,
          })),

        setLastSavedAt: (date) =>
          set(() => ({
            lastSavedAt: date,
          })),

        // Page Actions
        loadPage: (pageId, projectId, sections, publishedSections, title) =>
          set(() => ({
            pageId,
            projectId,
            sections,
            publishedSections,
            pageTitle: title,
            isDirty: false,
            saveStatus: 'idle',
            saveError: null,
          })),

        publishDraft: () =>
          set((state) => ({
            publishedSections: [...state.sections],
            isDirty: false,
          })),
      }),
      {
        name: 'builder-storage',
      }
    )
  )
);