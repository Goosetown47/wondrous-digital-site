import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  type UserWithAccounts,
  type CreateUserInvitationData,
  type UpdateUserRoleData,
} from '@/lib/services/users';

/**
 * Hook to fetch all users across all accounts
 */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return data.users as UserWithAccounts[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await response.json();
      return data.user as UserWithAccounts;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch users for a specific account
 */
export function useAccountUsers(accountId: string | null | undefined) {
  return useQuery({
    queryKey: ['account-users', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      // For now, filter from all users until we have a specific endpoint
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      const allUsers = data.users as UserWithAccounts[];
      return allUsers.filter(user => 
        user.accounts.some(acc => acc.account_id === accountId)
      );
    },
    enabled: !!accountId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to fetch pending invitations for an account
 */
export function useAccountInvitations(accountId: string | null | undefined) {
  return useQuery({
    queryKey: ['account-invitations', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      // TODO: Implement invitations endpoint
      return [];
    },
    enabled: !!accountId,
    staleTime: 1 * 60 * 1000, // 1 minute (invitations change frequently)
  });
}

/**
 * Hook to update a user's role in an account
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserRoleData) => {
      const response = await fetch(`/api/users/${data.user_id}/roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: data.account_id,
          role: data.role,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ['account-users', variables.account_id] });
      
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });
}

/**
 * Hook to remove a user from an account
 */
export function useRemoveUserFromAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, accountId }: { userId: string; accountId: string }) => {
      const response = await fetch(`/api/users/${userId}/accounts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: [{ account_id: accountId }],
          action: 'remove',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to remove user from account');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['account-users', variables.accountId] });
      
      // Remove user from account users cache
      queryClient.setQueryData(['account-users', variables.accountId], (old: UserWithAccounts[] | undefined) => {
        return old?.filter(user => user.id !== variables.userId) || [];
      });
      
      toast.success('User removed from account successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove user: ${error.message}`);
    },
  });
}

/**
 * Hook to add a user to accounts
 */
export function useAddUserToAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      accounts 
    }: { 
      userId: string; 
      accounts: Array<{ account_id: string; role: 'admin' | 'staff' | 'account_owner' | 'user' }> 
    }) => {
      const response = await fetch(`/api/users/${userId}/accounts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts,
          action: 'add',
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add user to accounts');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      
      // Invalidate account-users for each account
      variables.accounts.forEach(account => {
        queryClient.invalidateQueries({ queryKey: ['account-users', account.account_id] });
      });
      
      const accountCount = variables.accounts.length;
      toast.success(`User added to ${accountCount} account${accountCount !== 1 ? 's' : ''} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add user to accounts: ${error.message}`);
    },
  });
}

/**
 * Hook to invite a user to an account
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserInvitationData) => {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to invite user');
      }
      const result = await response.json();
      return result.data;
    },
    onSuccess: (newInvitation) => {
      // Invalidate invitations for the account
      queryClient.invalidateQueries({ queryKey: ['account-invitations', newInvitation.account_id] });
      
      toast.success(`Invitation sent to ${newInvitation.email}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to send invitation: ${error.message}`);
    },
  });
}

/**
 * Hook for bulk user operations
 */
export function useBulkUserOperations() {
  const queryClient = useQueryClient();

  const updateRolesMutation = useMutation({
    mutationFn: async (updates: UpdateUserRoleData[]) => {
      // Call individual update endpoints for each user
      const promises = updates.map(update => 
        fetch(`/api/users/${update.user_id}/roles`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_id: update.account_id,
            role: update.role,
          }),
        })
      );
      const responses = await Promise.all(promises);
      
      // Check if all succeeded
      const failed = responses.filter(r => !r.ok);
      if (failed.length > 0) {
        throw new Error(`Failed to update ${failed.length} user role(s)`);
      }
    },
    onSuccess: (_, updates) => {
      // Invalidate all affected queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Invalidate specific user and account queries
      const affectedUsers = new Set(updates.map(u => u.user_id));
      const affectedAccounts = new Set(updates.map(u => u.account_id));
      
      affectedUsers.forEach(userId => {
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      });
      
      affectedAccounts.forEach(accountId => {
        queryClient.invalidateQueries({ queryKey: ['account-users', accountId] });
      });
      
      toast.success(`${updates.length} user role${updates.length === 1 ? '' : 's'} updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user roles: ${error.message}`);
    },
  });

  const removeUsersMutation = useMutation({
    mutationFn: async ({ userIds, accountId }: { userIds: string[]; accountId: string }) => {
      // Call individual remove endpoints for each user
      const promises = userIds.map(userId => 
        fetch(`/api/users/${userId}/accounts`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accounts: [{ account_id: accountId }],
            action: 'remove',
          }),
        })
      );
      const responses = await Promise.all(promises);
      
      // Check if all succeeded
      const failed = responses.filter(r => !r.ok);
      if (failed.length > 0) {
        throw new Error(`Failed to remove ${failed.length} user(s)`);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['account-users', variables.accountId] });
      
      // Invalidate individual user queries
      variables.userIds.forEach(userId => {
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      });
      
      // Update account users cache
      queryClient.setQueryData(['account-users', variables.accountId], (old: UserWithAccounts[] | undefined) => {
        return old?.filter(user => !variables.userIds.includes(user.id)) || [];
      });
      
      toast.success(`${variables.userIds.length} user${variables.userIds.length === 1 ? '' : 's'} removed successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove users: ${error.message}`);
    },
  });

  return {
    updateUserRoles: updateRolesMutation.mutate,
    removeUsersFromAccount: removeUsersMutation.mutate,
    isLoading: updateRolesMutation.isPending || removeUsersMutation.isPending,
  };
}

/**
 * Utility hook to get user role info
 */
export function useUserRole(user: UserWithAccounts | null | undefined, accountId?: string) {
  if (!user) return null;

  // If accountId is provided, find role for that specific account
  if (accountId) {
    const accountRole = user.accounts.find(acc => acc.account_id === accountId);
    return accountRole ? {
      role: accountRole.role,
      accountId: accountRole.account_id,
      accountName: accountRole.account_name,
      joinedAt: accountRole.joined_at,
      invitedBy: accountRole.invited_by,
    } : null;
  }

  // Otherwise, return primary account role
  return user.primary_account ? {
    role: user.primary_account.role,
    accountId: user.primary_account.account_id,
    accountName: user.primary_account.account_name,
    joinedAt: user.accounts[0]?.joined_at,
    invitedBy: user.accounts[0]?.invited_by,
  } : null;
}

/**
 * Utility hook to check if user has specific role
 */
export function useUserHasRole(user: UserWithAccounts | null | undefined, requiredRole: string, accountId?: string) {
  const userRole = useUserRole(user, accountId);
  
  if (!userRole) return false;

  // Role hierarchy: admin > staff > account_owner > user
  const roleHierarchy = {
    'admin': 4,
    'staff': 3,
    'account_owner': 2,
    'user': 1,
  };

  const userRoleLevel = roleHierarchy[userRole.role as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Hook to get user statistics
 */
export function useUserStats(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await response.json();
      const user = data.user as UserWithAccounts;
      
      return {
        accountCount: user.accounts.length,
        primaryRole: user.primary_account?.role,
        joinedAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
        emailConfirmed: !!user.email_confirmed_at,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
}