import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPageByProjectId,
  createPage,
  updatePage,
  deletePage,
  listProjectPages,
  getOrCreateHomepage,
  duplicatePage,
  type CreatePageData,
  type UpdatePageData,
} from '@/lib/services/pages';
import type { Section } from '@/stores/builderStore';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook to fetch a specific page by project ID and path
 */
export function usePage(projectId: string | undefined, path: string = '/') {
  return useQuery({
    queryKey: ['pages', projectId, path],
    queryFn: () => projectId ? getPageByProjectId(projectId, path) : null,
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch a specific page by its ID
 */
export function usePageById(pageId: string | undefined) {
  return useQuery({
    queryKey: ['pages', 'byId', pageId],
    queryFn: async () => {
      if (!pageId) return null;
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!pageId,
  });
}

/**
 * Hook to fetch or create homepage for a project
 */
export function useHomepage(projectId: string | undefined) {
  return useQuery({
    queryKey: ['pages', projectId, 'homepage'],
    queryFn: () => projectId ? getOrCreateHomepage(projectId) : null,
    enabled: !!projectId,
  });
}

/**
 * Hook to list all pages in a project
 */
export function useProjectPages(projectId: string | undefined) {
  return useQuery({
    queryKey: ['pages', 'project', projectId],
    queryFn: () => projectId ? listProjectPages(projectId) : [],
    enabled: !!projectId,
  });
}

/**
 * Hook to create a new page
 */
export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPage,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success(`Page "${data.title || data.path}" created successfully`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create page');
    },
  });
}

/**
 * Hook to update a page
 */
export function useUpdatePage(pageId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdatePageData) => {
      if (!pageId) throw new Error('Page ID is required');
      return updatePage(pageId, updates);
    },
    onSuccess: (data) => {
      // Update the specific page in cache
      if (data.project_id) {
        queryClient.setQueryData(['pages', data.project_id, data.path], data);
      }
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['pages', 'project'] });
      toast.success('Page saved successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save page');
    },
  });
}

/**
 * Hook to delete a page
 */
export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete page');
    },
  });
}

/**
 * Hook to duplicate a page
 */
export function useDuplicatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, newPath, newTitle }: { 
      pageId: string; 
      newPath: string; 
      newTitle?: string;
    }) => duplicatePage(pageId, newPath, newTitle),
    onSuccess: (data) => {
      // Invalidate queries to refresh the page list
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success(`Page duplicated as "${data.title}"`);
    },
    onError: (error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('A page with that path already exists');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to duplicate page');
      }
    },
  });
}

/**
 * Convenience hook for the builder to save page sections
 */
export function useSavePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      pageId,
      sections, 
      title 
    }: { 
      projectId: string;
      pageId?: string;
      sections: Section[];
      title?: string;
    }) => {
      // If we have a pageId, update the existing page
      if (pageId) {
        return updatePage(pageId, { sections, title });
      }
      
      // Otherwise, create a new homepage
      return createPage({
        project_id: projectId,
        path: '/',
        title: title || 'Home',
        sections,
        metadata: { isHomepage: true }
      });
    },
    onMutate: async ({ projectId, sections }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['pages', projectId] });
      
      const previousPage = queryClient.getQueryData(['pages', projectId, '/']);
      
      // Optimistically update the page
      queryClient.setQueryData(['pages', projectId, '/'], (old: any) => ({
        ...old,
        sections,
        updated_at: new Date().toISOString(),
      }));

      return { previousPage };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPage) {
        queryClient.setQueryData(
          ['pages', variables.projectId, '/'], 
          context.previousPage
        );
      }
      toast.error('Failed to save page');
    },
    onSuccess: (data) => {
      toast.success('Page saved successfully');
    },
    onSettled: (data, error, variables) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['pages', variables.projectId] });
    },
  });
}