import { useQuery } from '@tanstack/react-query';
import type { ProjectSection } from '@/stores/builderStore';

/**
 * Hook to fetch all global sections for a project
 * These are sections that appear on all pages (navigation, footer, etc.)
 */
export function useProjectSections(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project-sections', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const response = await fetch(`/api/projects/${projectId}/sections`);
      if (!response.ok) {
        throw new Error('Failed to fetch project sections');
      }

      const data = await response.json();
      return data as ProjectSection[];
    },
    enabled: !!projectId,
  });
}
