import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import type { AccountUser } from '@/types/database';

interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown>;
}

interface AccountUserWithDetails extends AccountUser {
  user: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
    user_metadata?: {
      full_name?: string;
    };
  };
  profile?: UserProfile;
}

// Get all users in an account
export function useAccountUsers(accountId: string | null) {
  return useQuery({
    queryKey: ['account-users', accountId],
    queryFn: async () => {
      if (!accountId) return [];

      // Use API endpoint to bypass RLS and get user details
      const response = await fetch(`/api/accounts/${accountId}/users`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch account users');
      }

      const accountUsers = await response.json();

      // Transform the data to match our interface
      return accountUsers.map((au: { 
        account_id: string; 
        user_id: string; 
        role: string; 
        joined_at: string; 
        invited_by: string; 
        email?: string;
        email_confirmed_at?: string | null;
        display_name?: string | null;
        avatar_url?: string | null;
        profile_metadata?: Record<string, unknown>;
        raw_user_meta_data?: { full_name?: string };
        user?: { email?: string; user_metadata?: { full_name?: string; display_name?: string } } 
      }) => ({
        account_id: au.account_id,
        user_id: au.user_id,
        role: au.role,
        joined_at: au.joined_at,
        invited_by: au.invited_by,
        user: { 
          id: au.user_id, 
          email: au.email,
          email_confirmed_at: au.email_confirmed_at,
          user_metadata: {
            full_name: au.display_name || au.raw_user_meta_data?.full_name
          }
        },
        profile: {
          user_id: au.user_id,
          display_name: au.display_name,
          avatar_url: au.avatar_url,
          metadata: au.profile_metadata || {}
        }
      })) as AccountUserWithDetails[];
    },
    enabled: !!accountId,
  });
}

// Invite a user to an account
export function useInviteUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      accountId,
      email,
      role,
    }: {
      accountId: string;
      email: string;
      role: AccountUser['role'];
    }) => {
      if (!user) throw new Error('Must be logged in to invite users');

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        // User exists, add them to the account
        const { error } = await supabase
          .from('account_users')
          .insert({
            account_id: accountId,
            user_id: existingUser.id,
            role,
            invited_by: user.id,
          });

        if (error) throw error;
      } else {
        // User doesn't exist, send invitation email
        // This would typically send an email with a signup link
        // For now, we'll just throw an error
        throw new Error('User invitation system not yet implemented');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['account-users', variables.accountId] 
      });
    },
  });
}

// Update a user's role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      userId,
      role,
    }: {
      accountId: string;
      userId: string;
      role: AccountUser['role'];
    }) => {
      const response = await fetch(`/api/accounts/${accountId}/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['account-users', variables.accountId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['account-role', variables.accountId, variables.userId] 
      });
    },
  });
}

// Remove a user from an account
export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      userId,
    }: {
      accountId: string;
      userId: string;
    }) => {
      const response = await fetch(`/api/accounts/${accountId}/users?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove user');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['account-users', variables.accountId] 
      });
    },
  });
}