import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { ProjectDomain } from '@/types/database';
import { toast } from 'sonner';

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
      
      // Filter out www domains that have an apex companion
      // This ensures we only show one card per domain pair
      const domains = data as ProjectDomain[];
      const filteredDomains = domains.filter(domain => {
        // Always show non-www domains
        if (!domain.domain.startsWith('www.')) return true;
        
        // For www domains, check if an apex companion exists
        const apexDomain = domain.domain.substring(4); // Remove 'www.'
        const hasApexCompanion = domains.some(d => d.domain === apexDomain);
        
        // Only show www domain if it's standalone (no apex companion)
        return !hasApexCompanion;
      });
      
      return filteredDomains;
    },
    enabled: !!projectId,
  });
}

// Add a domain
export function useAddDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, domain }: { projectId: string; domain: string }) => {
      // Call the API route which handles all validation and permissions
      const response = await fetch(`/api/projects/${projectId}/domains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add domain');
      }

      return data as ProjectDomain;
    },
    onSuccess: (data, variables) => {
      // Use project_id from response data, or fall back to the one from variables
      const projectId = data.project_id || variables.projectId;
      queryClient.invalidateQueries({ queryKey: ['domains', projectId] });
      toast.success('Domain added successfully');
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === '23505') {
        // Don't show toast here - we'll handle it with inline validation
        // The error will be passed to the component
      } else {
        toast.error(error.message || 'Failed to add domain');
      }
    },
  });
}

// Remove a domain
export function useRemoveDomain(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domainId: string) => {
      // Call the unified DELETE endpoint that handles both Vercel and database
      const response = await fetch(`/api/projects/${projectId}/domains?domainId=${domainId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove domain');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove domain');
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['domain-status'] });
      queryClient.invalidateQueries({ queryKey: ['domain-dns-config'] });
      
      // More nuanced messaging based on actual status - check configuration before SSL
      if (data.verified && data.configured && data.ssl?.state === 'READY') {
        toast.success('Domain is fully configured and active!');
      } else if (data.verified && !data.configured) {
        toast.warning('Domain ownership verified but DNS configuration is invalid. Please update your DNS records.');
      } else if (data.verified && data.configured && data.ssl?.state !== 'READY') {
        toast.info('Domain ownership verified and configured - SSL certificate is being provisioned');
      } else if (data.verification && data.verification.length > 0) {
        // Show DNS configuration instructions
        toast.info('DNS configuration required - please update your DNS records', { duration: 8000 });
      } else if (data.error) {
        toast.error(data.error);
      } else {
        toast.info('Checking domain status...');
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

// Get DNS configuration for a domain
export function useDomainDNSConfig(domainId: string | null) {
  return useQuery({
    queryKey: ['domain-dns-config', domainId],
    queryFn: async () => {
      if (!domainId) return null;
      
      const response = await fetch(`/api/domains/${domainId}/dns-config`);
      if (!response.ok) {
        throw new Error('Failed to fetch DNS configuration');
      }
      
      return await response.json();
    },
    enabled: !!domainId,
    staleTime: 60 * 1000, // Cache for 1 minute
  });
}

// Toggle www subdomain for a domain
export function useToggleWWW(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      domainId, 
      domain, 
      includeWWW 
    }: { 
      domainId: string; 
      domain: string;
      includeWWW: boolean;
    }) => {
      const response = await fetch(`/api/domains/${domainId}/toggle-www`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          domain,
          includeWWW,
          projectId 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle www subdomain');
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['domains', projectId] });
      queryClient.invalidateQueries({ queryKey: ['domain-status', variables.domainId] });
      queryClient.invalidateQueries({ queryKey: ['domain-dns-config', variables.domainId] });
      
      if (variables.includeWWW) {
        toast.success(`Added www.${variables.domain}`);
      } else {
        toast.success(`Removed www.${variables.domain}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle www subdomain');
    },
  });
}

// Make a domain primary
export function useMakePrimary(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (domainId: string) => {
      const response = await fetch(`/api/domains/${domainId}/make-primary`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to make domain primary');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['domains', projectId] });
      toast.success(`${data.domain} is now the primary domain`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to make domain primary');
    },
  });
}