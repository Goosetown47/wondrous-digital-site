import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { deepEqual } from '@/lib/utils';

export interface Section {
  id: string;
  type: string; // Made flexible to support any type
  type_id?: string; // Reference to types table
  component_name?: string; // React component name from library item
  content: Record<string, unknown>;
  order: number;
  templateId?: string;
  library_item_id?: string; // Reference to the source library item
  library_version?: number; // Version of the library item when added
}

export interface ProjectSection {
  id: string;
  project_id: string;
  component_name: string;
  content: Record<string, unknown>;
  section_placement: 'global_header' | 'global_footer' | 'above_content' | 'below_content';
  display_order: number;
  is_published: boolean;
  library_item_id?: string;
  library_version?: number;
  created_at?: string;
  updated_at?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface BuilderState {
  // Current working sections (draft) - page-specific
  sections: Section[];

  // Published sections (what's live on the site) - page-specific
  publishedSections: Section[];

  // Global project sections (appear on all pages)
  projectSections: ProjectSection[];

  // UI State
  selectedSectionId: string | null;
  isDragging: boolean;
  isEditing: boolean;

  // Save State
  isDirty: boolean; // Has unsaved draft changes
  lastSavedAt: Date | null;
  saveStatus: SaveStatus;
  saveError: string | null;

  // Page Metadata
  pageId: string | null;
  projectId: string | null;
  pageTitle: string;

  // Actions - Page Sections
  addSection: (section: Section) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  reorderSections: (sections: Section[]) => void;
  setSelectedSection: (id: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
  clearAll: () => void;

  // Save Actions
  markDirty: () => void;
  markClean: () => void;
  setSaveStatus: (status: SaveStatus, error?: string) => void;
  setLastSavedAt: (date: Date) => void;

  // Page Actions
  loadPage: (pageId: string, projectId: string, sections: Section[], publishedSections: Section[], title: string) => void;
  publishDraft: () => void;
  hasUnpublishedChanges: () => boolean;
  loadPublishedSections: (publishedSections: Section[]) => void;

  // Project Section Actions
  loadProjectSections: (projectSections: ProjectSection[]) => void;
  addProjectSection: (section: ProjectSection) => void;
  updateProjectSection: (id: string, updates: Partial<ProjectSection>) => void;
  removeProjectSection: (id: string) => void;
}

export const useBuilderStore = create<BuilderState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sections: [],
        publishedSections: [],
        projectSections: [],
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
          set((state) => {
            const existingSection = state.sections.find(s => s.id === id);
            if (!existingSection) return state;
            
            // Check if the update would actually change anything
            const updatedSection = { ...existingSection, ...updates };
            const hasChanged = !deepEqual(existingSection, updatedSection);
            
            // Only mark as dirty if content actually changed
            if (!hasChanged) return state;
            
            return {
              sections: state.sections.map((s) =>
                s.id === id ? updatedSection : s
              ),
              isDirty: true,
            };
          }),

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
            saveStatus: 'idle',
          })),

        hasUnpublishedChanges: () => {
          const state = get();
          // Use deep equality check instead of JSON.stringify
          // This handles property ordering and undefined vs null properly
          return !deepEqual(state.sections, state.publishedSections);
        },

        loadPublishedSections: (publishedSections: Section[]) =>
          set(() => ({
            publishedSections,
          })),

        // Project Section Actions
        loadProjectSections: (projectSections: ProjectSection[]) =>
          set(() => ({
            projectSections,
          })),

        addProjectSection: (section: ProjectSection) =>
          set((state) => ({
            projectSections: [...state.projectSections, section],
          })),

        updateProjectSection: (id: string, updates: Partial<ProjectSection>) =>
          set((state) => ({
            projectSections: state.projectSections.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          })),

        removeProjectSection: (id: string) =>
          set((state) => ({
            projectSections: state.projectSections.filter((s) => s.id !== id),
          })),
      }),
      {
        name: 'builder-storage',
      }
    )
  )
);