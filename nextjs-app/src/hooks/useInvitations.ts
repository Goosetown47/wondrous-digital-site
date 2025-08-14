import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Get all invitations for an account
export function useAccountInvitations(accountId: string | null) {
  return useQuery({
    queryKey: ['account-invitations', accountId],
    queryFn: async () => {
      if (!accountId) return [];

      const { data, error } = await supabase
        .from('account_invitations')
        .select('*')
        .eq('account_id', accountId)
        .is('accepted_at', null)
        .is('declined_at', null)
        .is('cancelled_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!accountId,
  });
}

// Create a new invitation
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      email,
      role,
    }: {
      accountId: string;
      email: string;
      role: 'account_owner' | 'user';
    }) => {
      const response = await fetch(`/api/accounts/${accountId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['account-invitations', variables.accountId] 
      });
    },
  });
}

// Cancel an invitation
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invitationId,
      accountId, // eslint-disable-line @typescript-eslint/no-unused-vars
    }: {
      invitationId: string;
      accountId: string;
    }) => {
      const response = await fetch(`/api/invitations/${invitationId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel invitation');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['account-invitations', variables.accountId] 
      });
      toast.success('Invitation cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel invitation');
    },
  });
}

// Resend an invitation
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invitationId,
      accountId, // eslint-disable-line @typescript-eslint/no-unused-vars
    }: {
      invitationId: string;
      accountId: string;
    }) => {
      const response = await fetch(`/api/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resend invitation');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['account-invitations', variables.accountId] 
      });
      toast.success('Invitation resent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invitation');
    },
  });
}