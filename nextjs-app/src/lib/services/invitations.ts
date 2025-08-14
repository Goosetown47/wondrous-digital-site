import { createAdminClient } from '@/lib/supabase/admin';
import type { AccountInvitation } from '@/types/database';
import { queueEmail } from '@/lib/services/email';
import { getAppUrl } from '@/lib/utils/app-url';

export interface CreateInvitationParams {
  accountId: string;
  email: string;
  role: 'account_owner' | 'user';
  invitedBy: string;
}

export interface InvitationWithAccount extends AccountInvitation {
  accounts?: {
    name: string;
    slug: string;
  };
  inviter?: {
    email: string;
    user_metadata?: {
      display_name?: string;
    };
  };
}

/**
 * Create a new invitation
 */
export async function createInvitation(params: CreateInvitationParams): Promise<AccountInvitation> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('account_invitations')
    .insert({
      account_id: params.accountId,
      email: params.email.toLowerCase(),
      role: params.role,
      invited_by: params.invitedBy,
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Get account and inviter details for the email
  const [accountResult, inviterResult] = await Promise.all([
    supabase.from('accounts').select('name').eq('id', params.accountId).single(),
    supabase.auth.admin.getUserById(params.invitedBy),
  ]);
  
  const accountName = accountResult.data?.name || 'Unknown Account';
  const inviterName = inviterResult.data?.user?.user_metadata?.display_name || 
                      inviterResult.data?.user?.email?.split('@')[0] || 
                      'A team member';
  const inviterEmail = inviterResult.data?.user?.email || 'noreply@wondrousdigital.com';
  
  // Queue invitation email
  const appUrl = getAppUrl();
  const invitationLink = `${appUrl}/invitation?token=${data.token}`;
  
  await queueEmail({
    to: params.email,
    from: 'Wondrous Digital <invitations@wondrousdigital.com>',
    subject: `${inviterName} invited you to join ${accountName}`,
    templateId: 'invitation',
    templateData: {
      invitee_name: params.email.split('@')[0], // Use email prefix as name
      inviter_name: inviterName,
      inviter_email: inviterEmail,
      account_name: accountName,
      invitation_link: invitationLink,
      role: params.role,
    },
  });
  
  return data;
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string): Promise<InvitationWithAccount | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('account_invitations')
    .select(`
      *,
      accounts!inner(
        name,
        slug
      )
    `)
    .eq('token', token)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  // Get inviter details
  if (data) {
    const { data: inviter } = await supabase.auth.admin.getUserById(data.invited_by);
    return {
      ...data,
      inviter: inviter?.user || undefined,
    };
  }
  
  return data;
}

/**
 * Get invitations for an account
 */
export async function getAccountInvitations(
  accountId: string,
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'all' = 'all'
): Promise<InvitationWithAccount[]> {
  const supabase = createAdminClient();
  
  let query = supabase
    .from('account_invitations')
    .select('*')
    .eq('account_id', accountId)
    .order('invited_at', { ascending: false });
    
  // Apply status filter
  switch (status) {
    case 'pending':
      query = query
        .is('accepted_at', null)
        .is('declined_at', null)
        .is('cancelled_at', null)
        .gt('expires_at', new Date().toISOString());
      break;
    case 'accepted':
      query = query.not('accepted_at', 'is', null);
      break;
    case 'declined':
      query = query.not('declined_at', 'is', null);
      break;
    case 'expired':
      query = query
        .is('accepted_at', null)
        .is('declined_at', null)
        .is('cancelled_at', null)
        .lt('expires_at', new Date().toISOString());
      break;
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Get inviter details for each invitation
  const invitationsWithInviters = await Promise.all(
    (data || []).map(async (invitation) => {
      const { data: inviter } = await supabase.auth.admin.getUserById(invitation.invited_by);
      return {
        ...invitation,
        inviter: inviter?.user || undefined,
      };
    })
  );
  
  return invitationsWithInviters;
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('account_invitations')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('id', invitationId)
    .is('accepted_at', null)
    .is('declined_at', null)
    .is('cancelled_at', null);
    
  if (error) throw error;
}

/**
 * Accept an invitation (uses RPC function)
 */
export async function acceptInvitation(token: string): Promise<{
  success: boolean;
  account_id?: string;
  role?: string;
  error?: string;
}> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .rpc('accept_invitation', { invitation_token: token });
    
  if (error) throw error;
  return data;
}

/**
 * Decline an invitation (uses RPC function)
 */
export async function declineInvitation(token: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .rpc('decline_invitation', { invitation_token: token });
    
  if (error) throw error;
  return data;
}

/**
 * Check if an email is already invited to an account
 */
export async function isEmailInvited(accountId: string, email: string): Promise<boolean> {
  const supabase = createAdminClient();
  
  const { data } = await supabase
    .from('account_invitations')
    .select('id')
    .eq('account_id', accountId)
    .eq('email', email.toLowerCase())
    .is('accepted_at', null)
    .is('declined_at', null)
    .is('cancelled_at', null)
    .gt('expires_at', new Date().toISOString())
    .limit(1);
    
  return (data?.length || 0) > 0;
}

/**
 * Check if a user is already a member of an account
 */
export async function isUserMember(accountId: string, email: string): Promise<boolean> {
  const supabase = createAdminClient();
  
  // First, find the user by email using the admin API
  const { data: userData } = await supabase.auth.admin.listUsers();
  const user = userData?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    // No user with this email exists
    return false;
  }
  
  const userId = user.id;
  
  // Check if this user is a member of the account
  const { data, error } = await supabase
    .from('account_users')
    .select('id')
    .eq('account_id', accountId)
    .eq('user_id', userId)
    .limit(1);
  
  if (error) {
    console.error('Error checking user membership:', error);
    return false;
  }
    
  return (data?.length || 0) > 0;
}

/**
 * Resend an invitation (creates a new one with fresh expiry)
 */
export async function resendInvitation(invitationId: string): Promise<AccountInvitation> {
  const supabase = createAdminClient();
  
  // Get the original invitation
  const { data: original, error: fetchError } = await supabase
    .from('account_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();
    
  if (fetchError) throw fetchError;
  if (!original) throw new Error('Invitation not found');
  
  // Cancel the old one
  await cancelInvitation(invitationId);
  
  // Create a new one (which will automatically queue the email)
  return createInvitation({
    accountId: original.account_id,
    email: original.email,
    role: original.role,
    invitedBy: original.invited_by,
  });
}

/**
 * Accept an invitation after signup (for new users)
 */
export async function acceptInvitationAfterSignup(token: string, email: string): Promise<{
  success: boolean;
  account_id?: string;
  role?: string;
  error?: string;
}> {
  const supabase = createAdminClient();
  
  // First, verify the invitation exists and matches the email
  const { data: invitation, error: invError } = await supabase
    .from('account_invitations')
    .select('*')
    .eq('token', token)
    .eq('email', email.toLowerCase())
    .single();
    
  if (invError || !invitation) {
    return { success: false, error: 'Invitation not found or email does not match' };
  }
  
  // Check if already accepted
  if (invitation.accepted_at) {
    return { success: false, error: 'Invitation already accepted' };
  }
  
  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    return { success: false, error: 'Invitation has expired' };
  }
  
  // Get the user by email
  const { data: userData } = await supabase.auth.admin.listUsers();
  const user = userData?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return { success: false, error: 'User not found. Please complete signup first.' };
  }
  
  // Add user to the account
  const { error: addError } = await supabase
    .from('account_users')
    .insert({
      account_id: invitation.account_id,
      user_id: user.id,
      role: invitation.role,
    });
    
  if (addError) {
    // Check if user is already a member
    if (addError.code === '23505') { // Unique constraint violation
      return { success: false, error: 'User is already a member of this account' };
    }
    throw addError;
  }
  
  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('account_invitations')
    .update({ 
      accepted_at: new Date().toISOString(),
      accepted_by: user.id 
    })
    .eq('id', invitation.id);
    
  if (updateError) throw updateError;
  
  return {
    success: true,
    account_id: invitation.account_id,
    role: invitation.role,
  };
}