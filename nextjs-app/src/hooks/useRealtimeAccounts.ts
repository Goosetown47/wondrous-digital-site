import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook to subscribe to real-time account changes
 * This ensures the accounts list and user counts stay in sync
 */
export function useRealtimeAccounts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = () => {
      // Subscribe to accounts table changes
      channel = supabase
        .channel('accounts-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'accounts',
          },
          () => {
            // Invalidate accounts queries when any account changes
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'account_users',
          },
          () => {
            // Invalidate both accounts (for stats) and account-users queries
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['account-users'] });
            queryClient.invalidateQueries({ queryKey: ['account-stats'] });
          }
        )
        .subscribe();
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);
}

/**
 * Hook to subscribe to real-time changes for a specific account
 */
export function useRealtimeAccount(accountId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accountId) return;

    let channel: RealtimeChannel;

    const setupSubscription = () => {
      channel = supabase
        .channel(`account-${accountId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'accounts',
            filter: `id=eq.${accountId}`,
          },
          () => {
            // Invalidate specific account query
            queryClient.invalidateQueries({ queryKey: ['account', accountId] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'account_users',
            filter: `account_id=eq.${accountId}`,
          },
          () => {
            // Invalidate account users and stats
            queryClient.invalidateQueries({ queryKey: ['account-users', accountId] });
            queryClient.invalidateQueries({ queryKey: ['account-stats', accountId] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [accountId, queryClient]);
}