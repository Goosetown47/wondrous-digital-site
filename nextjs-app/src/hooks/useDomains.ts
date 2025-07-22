import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProjectDomain } from '@/types/database';

// Fetch domains for a project
export function useDomains(projectId: string | null) {
  return useQuery({
    queryKey: ['domains', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_domains')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectDomain[];
    },
    enabled: !!projectId,
  });
}

// Add a domain
export function useAddDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, domain }: { projectId: string; domain: string }) => {
      const { data, error } = await supabase
        .from('project_domains')
        .insert({
          project_id: projectId,
          domain,
          // For development, auto-verify domains
          // In production, you'd implement proper domain verification
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProjectDomain;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['domains', data.project_id] });
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === '23505') {
        alert('This domain is already in use');
      } else {
        alert('Failed to add domain');
      }
    },
  });
}

// Remove a domain
export function useRemoveDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const { error } = await supabase
        .from('project_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
    },
  });
}