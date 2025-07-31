import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { ProjectDomain } from '@/types/database';
import { toast } from 'sonner';
import { validateDomainFormat } from '@/lib/services/domains';

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
      // Validate domain format first
      const validationError = validateDomainFormat(domain);
      if (validationError) {
        throw new Error(validationError);
      }

      // Add to database
      const { data, error } = await supabase
        .from('project_domains')
        .insert({
          project_id: projectId,
          domain,
          verified: false,
          verified_at: null,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add to Vercel (fire and forget - don't block on this)
      fetch(`/api/domains/${data.id}/add-to-vercel`, {
        method: 'POST',
      }).catch(err => {
        console.error('Failed to add domain to Vercel:', err);
      });

      return data as ProjectDomain;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['domains', data.project_id] });
      toast.success('Domain added successfully');
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === '23505') {
        // Don't show toast here - we'll handle it with inline validation
        // The error will be passed to the component
      } else {
        toast.error('Failed to add domain');
      }
    },
  });
}

// Remove a domain
export function useRemoveDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domainId: string) => {
      // Remove from Vercel first (fire and forget)
      fetch(`/api/domains/${domainId}/remove-from-vercel`, {
        method: 'DELETE',
      }).catch(err => {
        console.error('Failed to remove domain from Vercel:', err);
      });

      // Remove from database
      const { error } = await supabase
        .from('project_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove domain');
    },
  });
}

// Verify a domain
export function useVerifyDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const response = await fetch(`/api/domains/${domainId}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify domain');
      }

      return await response.json();
    },
    onSuccess: (data, domainId) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      
      if (data.verified) {
        toast.success('Domain verified successfully!');
      } else if (data.error) {
        toast.error(data.error);
      } else {
        toast.info('Domain verification pending. Please check your DNS settings.');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify domain');
    },
  });
}

// Get domain status
export function useDomainStatus(domainId: string | null) {
  return useQuery({
    queryKey: ['domain-status', domainId],
    queryFn: async () => {
      if (!domainId) return null;
      
      const response = await fetch(`/api/domains/${domainId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch domain status');
      }
      
      return await response.json();
    },
    enabled: !!domainId,
    refetchInterval: (query) => {
      // Poll every 10 seconds if domain is not verified
      const data = query.state.data;
      return data && !data.verified ? 10000 : false;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Check Vercel configuration status
export function useVercelStatus() {
  return useQuery({
    queryKey: ['vercel-status'],
    queryFn: async () => {
      const response = await fetch('/api/domains/vercel-status');
      
      if (!response.ok) {
        throw new Error('Failed to check Vercel status');
      }
      
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}