import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { themeService } from '@/lib/supabase/themes';
import type { Theme } from '@/types/builder';

// Query keys
const THEME_KEYS = {
  all: ['themes'] as const,
  detail: (id: string) => ['themes', id] as const,
};

/**
 * Hook to fetch all themes
 */
export function useThemes() {
  return useQuery({
    queryKey: THEME_KEYS.all,
    queryFn: () => themeService.getAll(),
  });
}

/**
 * Hook to fetch a single theme
 */
export function useTheme(id: string) {
  return useQuery({
    queryKey: THEME_KEYS.detail(id),
    queryFn: () => themeService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new theme
 */
export function useCreateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (theme: Omit<Theme, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => 
      themeService.create(theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THEME_KEYS.all });
    },
  });
}

/**
 * Hook to update a theme
 */
export function useUpdateTheme(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Omit<Theme, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => 
      themeService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THEME_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: THEME_KEYS.all });
    },
  });
}

/**
 * Hook to delete a theme
 */
export function useDeleteTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THEME_KEYS.all });
    },
  });
}

/**
 * Hook to create a theme from a lab draft
 */
export function useCreateThemeFromDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      draftId, 
      name, 
      description 
    }: { 
      draftId: string; 
      name: string; 
      description?: string 
    }) => themeService.createFromDraft(draftId, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THEME_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['lab-drafts'] });
    },
  });
}

/**
 * Hook to apply a theme to a project
 */
export function useApplyThemeToProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      projectId, 
      themeId, 
      overrides 
    }: { 
      projectId: string; 
      themeId: string; 
      overrides?: any 
    }) => themeService.applyToProject(projectId, themeId, overrides),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
}