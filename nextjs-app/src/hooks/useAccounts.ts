import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  suspendAccount,
  activateAccount,
  bulkSuspendAccounts,
  bulkActivateAccounts,
  bulkDeleteAccounts,
  getAccountStats,
  type AccountWithStats,
  type CreateAccountData,
  type UpdateAccountData,
  type AccountStats,
} from '@/lib/services/accounts';

/**
 * Hook to fetch all accounts
 */
export function useAccounts(includeStats = false) {
  return useQuery({
    queryKey: ['accounts', includeStats],
    queryFn: () => getAllAccounts(includeStats),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single account by ID
 */
export function useAccount(id: string | null | undefined) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => id ? getAccountById(id) : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch account statistics
 */
export function useAccountStats(accountId: string | null | undefined) {
  return useQuery({
    queryKey: ['account-stats', accountId],
    queryFn: () => accountId ? getAccountStats(accountId) : null,
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000, // 2 minutes (stats change more frequently)
  });
}

/**
 * Hook to create a new account
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountData) => createAccount(data),
    onSuccess: (newAccount) => {
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      // Add to cache
      queryClient.setQueryData(['account', newAccount.id], newAccount);
      
      toast.success('Account created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create account: ${error.message}`);
    },
  });
}

/**
 * Hook to update an account
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateAccountData }) => 
      updateAccount(id, updates),
    onSuccess: (updatedAccount) => {
      // Update cache
      queryClient.setQueryData(['account', updatedAccount.id], updatedAccount);
      
      // Invalidate accounts list to refresh stats
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      toast.success('Account updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update account: ${error.message}`);
    },
  });
}

/**
 * Hook to delete an account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['account', deletedId] });
      queryClient.removeQueries({ queryKey: ['account-stats', deletedId] });
      
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      toast.success('Account deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete account: ${error.message}`);
    },
  });
}

/**
 * Hook to suspend an account
 */
export function useSuspendAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suspendAccount(id),
    onSuccess: (updatedAccount) => {
      // Update cache
      queryClient.setQueryData(['account', updatedAccount.id], updatedAccount);
      
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      toast.success('Account suspended successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to suspend account: ${error.message}`);
    },
  });
}

/**
 * Hook to activate (unsuspend) an account
 */
export function useActivateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateAccount(id),
    onSuccess: (updatedAccount) => {
      // Update cache
      queryClient.setQueryData(['account', updatedAccount.id], updatedAccount);
      
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      toast.success('Account activated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to activate account: ${error.message}`);
    },
  });
}

/**
 * Hook for bulk account operations
 */
export function useBulkAccountOperations() {
  const queryClient = useQueryClient();

  const suspendMutation = useMutation({
    mutationFn: (accountIds: string[]) => bulkSuspendAccounts(accountIds),
    onSuccess: (_, accountIds) => {
      // Invalidate affected accounts
      accountIds.forEach(id => {
        queryClient.invalidateQueries({ queryKey: ['account', id] });
      });
      
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      toast.success(`${accountIds.length} account${accountIds.length === 1 ? '' : 's'} suspended successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to suspend accounts: ${error.message}`);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (accountIds: string[]) => bulkActivateAccounts(accountIds),
    onSuccess: (_, accountIds) => {
      // Invalidate affected accounts
      accountIds.forEach(id => {
        queryClient.invalidateQueries({ queryKey: ['account', id] });
      });
      
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      toast.success(`${accountIds.length} account${accountIds.length === 1 ? '' : 's'} activated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to activate accounts: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (accountIds: string[]) => bulkDeleteAccounts(accountIds),
    onSuccess: (_, accountIds) => {
      // Remove from cache
      accountIds.forEach(id => {
        queryClient.removeQueries({ queryKey: ['account', id] });
        queryClient.removeQueries({ queryKey: ['account-stats', id] });
      });
      
      // Invalidate accounts list
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      toast.success(`${accountIds.length} account${accountIds.length === 1 ? '' : 's'} deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete accounts: ${error.message}`);
    },
  });

  return {
    suspendAccounts: suspendMutation.mutate,
    activateAccounts: activateMutation.mutate,
    deleteAccounts: deleteMutation.mutate,
    isLoading: suspendMutation.isPending || activateMutation.isPending || deleteMutation.isPending,
  };
}

/**
 * Utility hook to get account status
 */
export function useAccountStatus(account: AccountWithStats | null | undefined) {
  if (!account) return null;

  const settings = account.settings as any;
  const isSuspended = settings?.suspended === true;
  
  return {
    isSuspended,
    suspendedAt: settings?.suspended_at,
    suspendedBy: settings?.suspended_by,
    isActive: !isSuspended,
  };
}