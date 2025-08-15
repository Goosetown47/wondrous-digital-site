import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';

interface UserProfile {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown>;
  profile_completed: boolean;
}

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      // If no profile exists, return default
      if (!data) {
        return {
          user_id: user.id,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
          phone: null,
          avatar_url: null,
          metadata: {},
          profile_completed: false,
        } as UserProfile;
      }

      return data as UserProfile;
    },
    enabled: !!user,
  });
}

export function useUserRole() {
  const { user, currentAccount } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id, currentAccount?.id],
    queryFn: async () => {
      if (!user) return null;

      // Check if user is admin/staff (system-level)
      const { data: systemRole } = await supabase
        .from('account_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('account_id', '00000000-0000-0000-0000-000000000000')
        .single();

      if (systemRole?.role === 'admin') return 'Admin';
      if (systemRole?.role === 'staff') return 'Staff';

      // Check role in current account
      if (currentAccount) {
        const { data: accountRole } = await supabase
          .from('account_users')
          .select('role')
          .eq('user_id', user.id)
          .eq('account_id', currentAccount.id)
          .single();

        if (accountRole?.role === 'account_owner') return 'Account Owner';
        if (accountRole?.role === 'user') return 'User';
      }

      return 'User';
    },
    enabled: !!user,
  });
}