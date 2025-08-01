import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { themeService } from '@/lib/supabase/themes';

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: () => themeService.getAll(),
  });
}

export function useTheme(id: string | null | undefined) {
  return useQuery({
    queryKey: ['theme', id],
    queryFn: () => id ? themeService.getById(id) : null,
    enabled: !!id,
  });
}

export function useApplyTheme() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, themeId, overrides }: { 
      projectId: string; 
      themeId: string | null;
      overrides?: Record<string, unknown>;
    }) => {
      if (themeId === null) {
        // Remove theme
        return themeService.applyToProject(projectId, '', {});
      }
      return themeService.applyToProject(projectId, themeId, overrides);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useProjectTheme(projectId: string, themeId: string | null | undefined) {
  const { data: theme, isLoading } = useTheme(themeId);
  const applyTheme = useApplyTheme();

  const setTheme = async (newThemeId: string | null) => {
    await applyTheme.mutateAsync({ projectId, themeId: newThemeId });
  };

  return {
    theme,
    isLoading,
    setTheme,
    isApplying: applyTheme.isPending,
  };
}