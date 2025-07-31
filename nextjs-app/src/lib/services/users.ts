import { supabase } from '@/lib/supabase/client';
import type { AccountUser } from '@/types/database';
import { isAdmin, isStaff } from '@/lib/permissions';

export interface UserWithAccounts {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  accounts: Array<{
    account_id: string;
    account_name: string;
    account_slug: string;
    role: string;
    joined_at: string;
    invited_by?: string | null;
  }>;
  primary_account?: {
    account_id: string;
    account_name: string;
    role: string;
  };
}

export interface CreateUserInvitationData {
  email: string;
  account_id: string;
  role: 'account_owner' | 'user' | 'staff' | 'admin';
  invited_by: string;
}

export interface UpdateUserRoleData {
  user_id: string;
  account_id: string;
  role: 'account_owner' | 'user' | 'staff' | 'admin';
}

export interface UserInvitation {
  id: string;
  email: string;
  account_id: string;
  account_name: string;
  role: string;
  invited_by: string;
  invited_by_email: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
}

/**
 * Get all users across all accounts (admin/staff only)
 */
export async function getAllUsers() {
  try {
    const response = await fetch('/api/users', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users');
    }

    const data = await response.json();
    return data.users as UserWithAccounts[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get a single user by ID with account relationships
 */
export async function getUserById(userId: string): Promise<UserWithAccounts> {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

/**
 * Update user role in a specific account
 */
export async function updateUserRole({ user_id, account_id, role }: UpdateUserRoleData): Promise<AccountUser> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canUpdate = await isAdmin(user.id) || await isStaff(user.id);
  if (!canUpdate) throw new Error('Insufficient permissions');

  const { data: accountUser, error } = await supabase
    .from('account_users')
    .update({ role })
    .match({ user_id, account_id })
    .select()
    .single();

  if (error) throw error;
  if (!accountUser) throw new Error('User account relationship not found');

  // Log the action
  await supabase
    .from('audit_logs')
    .insert({
      account_id,
      user_id: user.id,
      action: 'user.role_update',
      resource_type: 'user',
      resource_id: user_id,
      metadata: {
        target_user_id: user_id,
        new_role: role,
        account_id,
      },
    });

  return accountUser;
}

/**
 * Remove user from an account
 */
export async function removeUserFromAccount(userId: string, accountId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canRemove = await isAdmin(user.id) || await isStaff(user.id);
  if (!canRemove) throw new Error('Insufficient permissions');

  // Don't allow removing the last account_owner
  const { data: accountOwners } = await supabase
    .from('account_users')
    .select('user_id')
    .match({ account_id: accountId, role: 'account_owner' });

  if (accountOwners && accountOwners.length === 1 && accountOwners[0].user_id === userId) {
    throw new Error('Cannot remove the last account owner');
  }

  const { error } = await supabase
    .from('account_users')
    .delete()
    .match({ user_id: userId, account_id: accountId });

  if (error) throw error;

  // Log the action
  await supabase
    .from('audit_logs')
    .insert({
      account_id: accountId,
      user_id: user.id,
      action: 'user.remove_from_account',
      resource_type: 'user',
      resource_id: userId,
      metadata: {
        removed_user_id: userId,
        account_id: accountId,
      },
    });
}

/**
 * Invite a user to an account
 */
export async function inviteUser({ email, account_id, role, invited_by }: CreateUserInvitationData): Promise<UserInvitation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canInvite = await isAdmin(user.id) || await isStaff(user.id);
  if (!canInvite) throw new Error('Insufficient permissions');

  // Check if user is already in the account
  const { data: existingUser } = await supabase
    .from('account_users')
    .select('user_id')
    .match({ account_id })
    .single();

  // For now, we'll create a pending invitation record
  // In a real implementation, this would integrate with Supabase Auth
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const invitationData = {
    id: `inv_${Date.now()}`,
    email,
    account_id,
    account_name: 'Account Name', // Would fetch from accounts table
    role,
    invited_by,
    invited_by_email: user.email!,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  };

  // Log the action
  await supabase
    .from('audit_logs')
    .insert({
      account_id,
      user_id: user.id,
      action: 'user.invite',
      resource_type: 'invitation',
      resource_id: invitationData.id,
      metadata: {
        invited_email: email,
        role,
        expires_at: invitationData.expires_at,
      },
    });

  return invitationData;
}

/**
 * Get pending invitations for an account
 */
export async function getAccountInvitations(accountId: string): Promise<UserInvitation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canView = await isAdmin(user.id) || await isStaff(user.id);
  if (!canView) throw new Error('Insufficient permissions');

  // For now, return empty array since we don't have an invitations table yet
  // In a real implementation, this would query the invitations table
  return [];
}

/**
 * Bulk operations
 */
export async function bulkUpdateUserRoles(updates: UpdateUserRoleData[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canUpdate = await isAdmin(user.id) || await isStaff(user.id);
  if (!canUpdate) throw new Error('Insufficient permissions');

  for (const update of updates) {
    await updateUserRole(update);
  }
}

export async function bulkRemoveUsersFromAccount(userIds: string[], accountId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canRemove = await isAdmin(user.id) || await isStaff(user.id);
  if (!canRemove) throw new Error('Insufficient permissions');

  for (const userId of userIds) {
    await removeUserFromAccount(userId, accountId);
  }
}

/**
 * Get users for a specific account
 */
export async function getAccountUsers(accountId: string): Promise<UserWithAccounts[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canView = await isAdmin(user.id) || await isStaff(user.id);
  if (!canView) throw new Error('Insufficient permissions');

  const { data: accountUsers, error } = await supabase
    .from('account_users')
    .select(`
      user_id,
      role,
      joined_at,
      invited_by,
      accounts!inner(
        id,
        name,
        slug
      )
    `)
    .eq('account_id', accountId)
    .order('joined_at', { ascending: false });

  if (error) throw error;

  return accountUsers.map(relation => ({
    id: relation.user_id,
    email: `user-${relation.user_id.slice(0, 8)}@example.com`, // Placeholder
    created_at: relation.joined_at,
    last_sign_in_at: null,
    email_confirmed_at: null,
    accounts: [{
      account_id: accountId,
      account_name: relation.accounts.name,
      account_slug: relation.accounts.slug,
      role: relation.role,
      joined_at: relation.joined_at,
      invited_by: relation.invited_by,
    }],
    primary_account: {
      account_id: accountId,
      account_name: relation.accounts.name,
      role: relation.role,
    },
  }));
}