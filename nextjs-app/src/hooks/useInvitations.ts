import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

// Get all invitations for an account
export function useAccountInvitations(accountId: string | null) {
  return useQuery({
    queryKey: ['account-invitations', accountId],
    queryFn: async () => {
      if (!accountId) return [];

      const { data, error } = await supabase
        .from('account_invitations')
        .select(`
          *,
          inviter:invited_by(
            email,
            raw_user_meta_data->full_name
          )
        `)
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
  const { user } = useAuth();

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
      if (!user) throw new Error('Must be logged in to invite users');

      // Check if user already exists in the account
      const { data: existingUser } = await supabase
        .from('account_users')
        .select('user_id')
        .eq('account_id', accountId)
        .eq('user_id', (
          await supabase
            .from('auth.users')
            .select('id')
            .eq('email', email)
            .single()
        ).data?.id || '')
        .single();

      if (existingUser) {
        throw new Error('User is already a member of this account');
      }

      // Check if there's already a pending invitation
      const { data: existingInvite } = await supabase
        .from('account_invitations')
        .select('id')
        .eq('account_id', accountId)
        .eq('email', email)
        .is('accepted_at', null)
        .is('declined_at', null)
        .is('cancelled_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingInvite) {
        throw new Error('An invitation has already been sent to this email');
      }

      // Create the invitation
      const { data, error } = await supabase
        .from('account_invitations')
        .insert({
          account_id: accountId,
          email,
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Send invitation email via edge function
      // For now, we'll just return the data

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['account-invitations', variables.accountId] 
      });
      toast.success('Invitation sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Cancel an invitation
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invitationId,
    }: {
      invitationId: string;
      accountId: string;
    }) => {
      const { error } = await supabase
        .from('account_invitations')
        .update({ cancelled_at: new Date().toISOString() })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['account-invitations', variables.accountId] 
      });
      toast.success('Invitation cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel invitation');
    },
  });
}

// Resend an invitation
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invitationId,
    }: {
      invitationId: string;
      accountId: string;
    }) => {
      // Get the original invitation
      const { data: invitation, error: fetchError } = await supabase
        .from('account_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (fetchError || !invitation) throw fetchError || new Error('Invitation not found');

      // Update the expiration date to extend it
      const { error } = await supabase
        .from('account_invitations')
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .eq('id', invitationId);

      if (error) throw error;

      // TODO: Resend invitation email via edge function

      return invitation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['account-invitations', variables.accountId] 
      });
      toast.success('Invitation resent successfully');
    },
    onError: () => {
      toast.error('Failed to resend invitation');
    },
  });
}