import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';

interface ProjectAccess {
  id: string;
  project_id: string;
  user_id: string;
  account_id: string;
  granted_by: string | null;
  granted_at: string;
  access_level: 'viewer' | 'editor' | 'admin';
  project_name?: string;
  user_display_name?: string | null;
  user_avatar_url?: string | null;
  granted_by_display_name?: string | null;
}

// Get all users with access to a project
export function useProjectAccess(projectId: string | null) {
  return useQuery({
    queryKey: ['project-access', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_access_view')
        .select('*')
        .eq('project_id', projectId)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return data as ProjectAccess[];
    },
    enabled: !!projectId,
  });
}

// Get projects a user has access to
export function useUserProjectAccess(userId: string | null) {
  return useQuery({
    queryKey: ['user-project-access', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('project_access_view')
        .select('*')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return data as ProjectAccess[];
    },
    enabled: !!userId,
  });
}

// Grant project access
export function useGrantProjectAccess() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      accountId,
      accessLevel = 'viewer',
    }: {
      projectId: string;
      userId: string;
      accountId: string;
      accessLevel?: 'viewer' | 'editor' | 'admin';
    }) => {
      if (!user) throw new Error('Must be logged in to grant access');

      const { error } = await supabase
        .from('project_users')
        .insert({
          project_id: projectId,
          user_id: userId,
          account_id: accountId,
          granted_by: user.id,
          access_level: accessLevel,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate the queries used by ProjectAccessDropdown
      queryClient.invalidateQueries({ 
        queryKey: ['account-projects-with-access', variables.accountId, variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-project-count', variables.accountId, variables.userId] 
      });
      // Also invalidate these for other components that might use them
      queryClient.invalidateQueries({ 
        queryKey: ['project-access', variables.projectId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-project-access', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['projects'] 
      });
    },
  });
}

// Update project access level
export function useUpdateProjectAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      accessLevel,
    }: {
      projectId: string;
      userId: string;
      accessLevel: 'viewer' | 'editor' | 'admin';
    }) => {
      const { error } = await supabase
        .from('project_users')
        .update({ access_level: accessLevel })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['project-access', variables.projectId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-project-access', variables.userId] 
      });
    },
  });
}

// Revoke project access
export function useRevokeProjectAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      accountId, // eslint-disable-line @typescript-eslint/no-unused-vars
    }: {
      projectId: string;
      userId: string;
      accountId: string;
    }) => {
      const { error } = await supabase
        .from('project_users')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate the queries used by ProjectAccessDropdown
      queryClient.invalidateQueries({ 
        queryKey: ['account-projects-with-access', variables.accountId, variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-project-count', variables.accountId, variables.userId] 
      });
      // Also invalidate these for other components that might use them
      queryClient.invalidateQueries({ 
        queryKey: ['project-access', variables.projectId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-project-access', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['projects'] 
      });
    },
  });
}

// Check if a user has access to a project
export function useHasProjectAccess(projectId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ['has-project-access', projectId, userId],
    queryFn: async () => {
      if (!projectId || !userId) return false;

      const { data, error } = await supabase
        .rpc('has_project_access', {
          p_project_id: projectId,
          p_user_id: userId,
        });

      if (error) throw error;
      return data as boolean;
    },
    enabled: !!projectId && !!userId,
  });
}