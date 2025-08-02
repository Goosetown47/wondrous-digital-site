import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { hasPermission } from '@/lib/permissions';
import type { Permission } from '@/lib/permissions/constants';

/**
 * Hook to get all permissions for the current user in the current account
 */
export function usePermissions() {
  const { user, currentAccount } = useAuth();

  return useQuery({
    queryKey: ['permissions', user?.id, currentAccount?.id],
    queryFn: async () => {
      if (!user || !currentAccount) return [];

      // Check if admin
      const { data: adminCheck } = await supabase
        .from('account_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (adminCheck) {
        // Return all permissions for admins
        const { data: allPermissions } = await supabase
          .from('permissions')
          .select('resource, action');
          
        return allPermissions?.map(p => `${p.resource}:${p.action}`) || [];
      }

      // Get user's role and permissions
      const { data: accountUser } = await supabase
        .from('account_users')
        .select(`
          role,
          roles!inner(
            permissions
          )
        `)
        .eq('account_id', currentAccount.id)
        .eq('user_id', user.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roles = (accountUser as any)?.roles;
      return Array.isArray(roles?.permissions) ? roles.permissions : [];
    },
    enabled: !!user && !!currentAccount,
  });
}

/**
 * Hook to check if the current user has a specific permission
 */
export function useHasPermission(permission: Permission | string) {
  const { user, currentAccount } = useAuth();
  
  return useQuery({
    queryKey: ['has-permission', user?.id, currentAccount?.id, permission],
    queryFn: async () => {
      if (!user) return false;
      
      // If no current account, check if user is admin/staff (they don't need account context)
      if (!currentAccount) {
        const { data } = await supabase
          .from('account_users')
          .select('role')
          .eq('user_id', user.id)
          .eq('account_id', '00000000-0000-0000-0000-000000000000')
          .in('role', ['admin', 'staff'])
          .limit(1);
          
        return data && data.length > 0;
      }
      
      return hasPermission(user.id, currentAccount.id, permission);
    },
    enabled: !!user,
  });
}

/**
 * Hook to check multiple permissions at once
 */
export function useHasPermissions(permissions: (Permission | string)[]) {
  const { user, currentAccount } = useAuth();
  
  return useQuery({
    queryKey: ['has-permissions', user?.id, currentAccount?.id, ...permissions],
    queryFn: async () => {
      if (!user) {
        return permissions.reduce((acc, permission) => {
          acc[permission] = false;
          return acc;
        }, {} as Record<string, boolean>);
      }
      
      // If no current account, check if user is admin/staff
      if (!currentAccount) {
        const { data } = await supabase
          .from('account_users')
          .select('role')
          .eq('user_id', user.id)
          .eq('account_id', '00000000-0000-0000-0000-000000000000')
          .in('role', ['admin', 'staff'])
          .limit(1);
          
        const hasAccess = !!(data && data.length > 0);
        return permissions.reduce((acc, permission) => {
          acc[permission] = hasAccess;
          return acc;
        }, {} as Record<string, boolean>);
      }
      
      const results: Record<string, boolean> = {};
      
      for (const permission of permissions) {
        results[permission] = await hasPermission(user.id, currentAccount.id, permission);
      }
      
      return results;
    },
    enabled: !!user,
  });
}