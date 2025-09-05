import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook to enable real-time updates for users
 */
export function useRealtimeUsers() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to changes on the profiles table
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // Invalidate users query when profiles change
          queryClient.invalidateQueries({ queryKey: ['users'] });
          queryClient.invalidateQueries({ queryKey: ['user'] });
        }
      );

    // Subscribe to changes on the account_users table
    const accountUsersChannel = supabase
      .channel('account-users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',  
          table: 'account_users',
        },
        () => {
          // Invalidate users and account-related queries
          queryClient.invalidateQueries({ queryKey: ['users'] });
          queryClient.invalidateQueries({ queryKey: ['user'] });
          queryClient.invalidateQueries({ queryKey: ['account-users'] });
        }
      );

    // Subscribe to both channels
    profilesChannel.subscribe();
    accountUsersChannel.subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(accountUsersChannel);
    };
  }, [queryClient]);
}