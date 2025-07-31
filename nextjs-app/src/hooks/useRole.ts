import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { getUserRole, isAdmin, isStaff } from '@/lib/permissions';

/**
 * Hook to get the current user's highest role
 */
export function useRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return getUserRole(user.id);
    },
    enabled: !!user,
  });
}

/**
 * Hook to check if the current user is an admin
 */
export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      return isAdmin(user.id);
    },
    enabled: !!user,
  });
}

/**
 * Hook to check if the current user is staff or admin
 */
export function useIsStaff() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-staff', user?.id],
    queryFn: async () => {
      if (!user) return false;
      return isStaff(user.id);
    },
    enabled: !!user,
  });
}

/**
 * Hook to get the user's role in the current account
 */
export function useAccountRole() {
  const { user, currentAccount } = useAuth();

  return useQuery({
    queryKey: ['account-role', user?.id, currentAccount?.id],
    queryFn: async () => {
      if (!user || !currentAccount) return null;
      
      // Check if user is admin first (they have access to all accounts)
      const userIsAdmin = await isAdmin(user.id);
      if (userIsAdmin) return 'admin' as const;
      
      // Otherwise get their role in the specific account
      const { data } = await (await import('@/lib/supabase/client')).supabase
        .from('account_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('account_id', currentAccount.id)
        .single();
        
      return data?.role || null;
    },
    enabled: !!user && !!currentAccount,
  });
}

/**
 * Hook to check if the current user is an account owner
 */
export function useIsAccountOwner() {
  const { user, currentAccount } = useAuth();

  return useQuery({
    queryKey: ['is-account-owner', user?.id, currentAccount?.id],
    queryFn: async () => {
      if (!user || !currentAccount) return false;
      
      // Check if user is admin first (they have full access)
      const userIsAdmin = await isAdmin(user.id);
      if (userIsAdmin) return true;
      
      // Check if user is account owner of current account
      const { data } = await (await import('@/lib/supabase/client')).supabase
        .from('account_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('account_id', currentAccount.id)
        .eq('role', 'account_owner')
        .single();
        
      return !!data;
    },
    enabled: !!user && !!currentAccount,
  });
}