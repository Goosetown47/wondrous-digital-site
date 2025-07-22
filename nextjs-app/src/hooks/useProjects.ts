import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Project, Page } from '@/types/database';
import type { Section } from '@/stores/builderStore';

// Fetch all projects for the current user
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });
}

// Fetch a single project
export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!projectId,
  });
}

// Create a new project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      // For now, we'll use a dummy user ID since auth isn't set up
      // In production, this would come from auth.uid()
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          customer_id: 'dummy-user-id', // Replace with auth.uid() when auth is set up
        })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Fetch page content
export function usePage(projectId: string | null, path: string = '/') {
  return useQuery({
    queryKey: ['page', projectId, path],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', projectId)
        .eq('path', path)
        .single();

      if (error) {
        // If page doesn't exist, return empty page
        if (error.code === 'PGRST116') {
          return {
            project_id: projectId,
            path,
            sections: [],
            metadata: {},
          } as Partial<Page>;
        }
        throw error;
      }
      return data as Page;
    },
    enabled: !!projectId,
  });
}

// Save page content
export function useSavePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      path = '/',
      sections,
      title,
    }: {
      projectId: string;
      path?: string;
      sections: Section[];
      title?: string;
    }) => {
      const { data, error } = await supabase
        .from('pages')
        .upsert({
          project_id: projectId,
          path,
          sections,
          title,
          metadata: {},
        }, {
          onConflict: 'project_id,path',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Page;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['page', data.project_id, data.path] 
      });
    },
  });
}