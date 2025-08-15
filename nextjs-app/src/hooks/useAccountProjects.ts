import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface Project {
  id: string;
  name: string;
  account_id: string;
  created_at: string;
}

interface ProjectWithAccess extends Project {
  has_access: boolean;
}

// Get all projects for an account with user access status
export function useAccountProjectsWithAccess(accountId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ['account-projects-with-access', accountId, userId],
    queryFn: async () => {
      if (!accountId || !userId) return [];

      // Get all projects for the account
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, account_id, created_at')
        .eq('account_id', accountId)
        .order('name', { ascending: true });

      if (projectsError) throw projectsError;
      if (!projects) return [];

      // Get user's project access
      const { data: userAccess, error: accessError } = await supabase
        .from('project_users')
        .select('project_id')
        .eq('user_id', userId)
        .eq('account_id', accountId);

      if (accessError) throw accessError;

      // Map projects with access status
      const userProjectIds = new Set(userAccess?.map(a => a.project_id) || []);
      
      return projects.map(project => ({
        ...project,
        has_access: userProjectIds.has(project.id)
      })) as ProjectWithAccess[];
    },
    enabled: !!accountId && !!userId,
  });
}

// Get count of projects a user has access to in an account
export function useUserProjectCount(accountId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ['user-project-count', accountId, userId],
    queryFn: async () => {
      if (!accountId || !userId) return { total: 0, accessible: 0 };

      // Get total projects in account
      const { count: totalCount, error: totalError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId);

      if (totalError) throw totalError;

      // Check if user is account owner (has access to all)
      const { data: accountUser, error: accountUserError } = await supabase
        .from('account_users')
        .select('role')
        .eq('account_id', accountId)
        .eq('user_id', userId)
        .single();

      if (accountUserError && accountUserError.code !== 'PGRST116') throw accountUserError;

      // Account owners have access to all projects
      if (accountUser?.role === 'account_owner') {
        return { 
          total: totalCount || 0, 
          accessible: totalCount || 0 
        };
      }

      // Regular users - count explicit access
      const { count: accessibleCount, error: accessError } = await supabase
        .from('project_users')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .eq('user_id', userId);

      if (accessError) throw accessError;

      return { 
        total: totalCount || 0, 
        accessible: accessibleCount || 0 
      };
    },
    enabled: !!accountId && !!userId,
  });
}