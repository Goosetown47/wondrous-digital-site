import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import type { Account, AccountUser } from '@/types/database';

// Get all accounts for the current user
export function useAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all accounts where user is a member
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          account_users!inner(
            user_id,
            role
          )
        `)
        .eq('account_users.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Account & { account_users: AccountUser[] })[];
    },
    enabled: !!user,
  });
}

// Get a specific account by ID
export function useAccount(accountId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['account', accountId],
    queryFn: async () => {
      if (!accountId || !user) return null;

      const { data, error } = await supabase
        .from('accounts')
        .select(`
          *,
          account_users!inner(
            user_id,
            role
          )
        `)
        .eq('id', accountId)
        .eq('account_users.user_id', user.id)
        .single();

      if (error) throw error;
      return data as Account & { account_users: AccountUser[] };
    },
    enabled: !!accountId && !!user,
  });
}

// Get the current user's role in an account
export function useAccountRole(accountId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['account-role', accountId, user?.id],
    queryFn: async () => {
      if (!accountId || !user) return null;

      const { data, error } = await supabase
        .from('account_users')
        .select('role')
        .eq('account_id', accountId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data.role as AccountUser['role'];
    },
    enabled: !!accountId && !!user,
  });
}

// Create a new account
export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      if (!user) throw new Error('Must be logged in to create an account');

      // Create the account
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert({ name, slug })
        .select()
        .single();

      if (accountError) throw accountError;

      // Add the user as owner
      const { error: memberError } = await supabase
        .from('account_users')
        .insert({
          account_id: account.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      return account as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Update account settings
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      updates,
    }: {
      accountId: string;
      updates: Partial<Pick<Account, 'name' | 'settings'>>;
    }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;
      return data as Account;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account', data.id] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}