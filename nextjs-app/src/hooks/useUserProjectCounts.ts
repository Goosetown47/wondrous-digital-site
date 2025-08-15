import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface UserProjectCount {
  user_id: string;
  project_count: number;
  project_names: string[];
  has_all_access: boolean;
}

export function useUserProjectCounts(accountId: string | null) {
  return useQuery({
    queryKey: ['user-project-counts', accountId],
    queryFn: async () => {
      if (!accountId) return [];

      // Get all projects in the account
      const { data: accountProjects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('account_id', accountId)
        .is('archived_at', null);

      const totalProjects = accountProjects?.length || 0;
      const projectMap = new Map(accountProjects?.map(p => [p.id, p.name]) || []);

      // Get all users in the account
      const { data: accountUsers } = await supabase
        .from('account_users')
        .select('user_id, role')
        .eq('account_id', accountId);

      if (!accountUsers) return [];

      // Get project access for all users
      const { data: projectAccess } = await supabase
        .from('project_users')
        .select('user_id, project_id')
        .eq('account_id', accountId);

      // Build counts for each user
      const userCounts: UserProjectCount[] = accountUsers.map(user => {
        // Account owners have access to all projects
        if (user.role === 'account_owner') {
          return {
            user_id: user.user_id,
            project_count: totalProjects,
            project_names: accountProjects?.map(p => p.name) || [],
            has_all_access: true,
          };
        }

        // Regular users only have access to explicitly granted projects
        const userProjectAccess = projectAccess?.filter(pa => pa.user_id === user.user_id) || [];
        const accessibleProjectNames = userProjectAccess
          .map(pa => projectMap.get(pa.project_id))
          .filter(Boolean) as string[];

        return {
          user_id: user.user_id,
          project_count: userProjectAccess.length,
          project_names: accessibleProjectNames,
          has_all_access: false,
        };
      });

      return userCounts;
    },
    enabled: !!accountId,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}

export function useAccountProjectCount(accountId: string | null) {
  return useQuery({
    queryKey: ['account-project-count', accountId],
    queryFn: async () => {
      if (!accountId) return 0;

      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .is('archived_at', null);

      return count || 0;
    },
    enabled: !!accountId,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}