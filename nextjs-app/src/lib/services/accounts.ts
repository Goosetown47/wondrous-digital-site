import { supabase } from '@/lib/supabase/client';
import type { Account, AccountUser } from '@/types/database';
import { isAdmin, isStaff } from '@/lib/permissions';

export interface AccountWithStats extends Account {
  project_count?: number;
  user_count?: number;
  total_projects?: number;
  active_projects?: number;
  users?: AccountUser[];
}

export interface CreateAccountData {
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings?: Record<string, unknown>;
}

export interface UpdateAccountData {
  name?: string;
  slug?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  settings?: Record<string, unknown>;
}

export interface AccountStats {
  project_count: number;
  active_projects: number;
  archived_projects: number;
  user_count: number;
  total_pages: number;
  storage_used: number;
  last_activity: string | null;
}

/**
 * Get all accounts (admin/staff only)
 */
export async function getAllAccounts(includeStats = false) {
  const response = await fetch('/api/accounts', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch accounts' }));
    throw new Error(errorData.error || 'Failed to fetch accounts');
  }

  const accounts = await response.json();

  if (!includeStats) {
    return accounts as AccountWithStats[];
  }

  // Fetch additional stats for each account
  const accountsWithStats = await Promise.all(
    accounts.map(async (account: { id: string }) => {
      const stats = await getAccountStats(account.id);
      return {
        ...account,
        ...stats,
      } as unknown as AccountWithStats;
    })
  );

  return accountsWithStats;
}

/**
 * Get a single account by ID
 */
export async function getAccountById(id: string): Promise<AccountWithStats> {
  // Use API call instead of direct client access for admin operations
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch account' }));
    throw new Error(errorData.error || 'Failed to fetch account');
  }

  const account = await response.json();
  
  // Get account stats
  const stats = await getAccountStats(id);

  return {
    ...account,
    ...stats,
  } as AccountWithStats;
}

/**
 * Create a new account
 */
export async function createAccount(data: CreateAccountData): Promise<Account> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canCreate = await isAdmin(user.id) || await isStaff(user.id);
  if (!canCreate) throw new Error('Insufficient permissions');

  // Check if slug is already taken
  const { data: existingAccount } = await supabase
    .from('accounts')
    .select('id')
    .eq('slug', data.slug)
    .single();

  if (existingAccount) {
    throw new Error('Account slug already exists');
  }

  const { data: account, error } = await supabase
    .from('accounts')
    .insert({
      name: data.name,
      slug: data.slug,
      plan: data.plan,
      settings: data.settings || {},
    })
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await supabase
    .from('audit_logs')
    .insert({
      account_id: account.id,
      user_id: user.id,
      action: 'account.create',
      resource_type: 'account',
      resource_id: account.id,
      metadata: {
        account_name: account.name,
        plan: account.plan,
      },
    });

  return account;
}

/**
 * Update an account
 */
export async function updateAccount(id: string, updates: UpdateAccountData): Promise<Account> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canUpdate = await isAdmin(user.id) || await isStaff(user.id);
  if (!canUpdate) throw new Error('Insufficient permissions');

  // If updating slug, check if it's already taken
  if (updates.slug) {
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('id')
      .eq('slug', updates.slug)
      .neq('id', id)
      .single();

    if (existingAccount) {
      throw new Error('Account slug already exists');
    }
  }

  const { data: account, error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!account) throw new Error('Account not found');

  // Log the action
  await supabase
    .from('audit_logs')
    .insert({
      account_id: id,
      user_id: user.id,
      action: 'account.update',
      resource_type: 'account',
      resource_id: id,
      metadata: {
        updates,
        account_name: account.name,
      },
    });

  return account;
}

/**
 * Delete an account (admin only)
 */
export async function deleteAccount(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Only admins can delete accounts
  const canDelete = await isAdmin(user.id);
  if (!canDelete) throw new Error('Insufficient permissions');

  // Get account info for logging
  const { data: account } = await supabase
    .from('accounts')
    .select('name')
    .eq('id', id)
    .single();

  // Check if account has projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('account_id', id)
    .limit(1);

  if (projects && projects.length > 0) {
    throw new Error('Cannot delete account with existing projects');
  }

  // Delete account (CASCADE will handle related records)
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Log the action
  await supabase
    .from('audit_logs')
    .insert({
      account_id: id,
      user_id: user.id,
      action: 'account.delete',
      resource_type: 'account',
      resource_id: id,
      metadata: {
        account_name: account?.name || 'Unknown',
        permanent: true,
      },
    });
}

/**
 * Suspend an account
 */
export async function suspendAccount(id: string): Promise<Account> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canSuspend = await isAdmin(user.id) || await isStaff(user.id);
  if (!canSuspend) throw new Error('Insufficient permissions');

  // First get the current account settings
  const { data: currentAccount } = await supabase
    .from('accounts')
    .select('settings')
    .eq('id', id)
    .single();

  if (!currentAccount) throw new Error('Account not found');

  const { data: account, error } = await supabase
    .from('accounts')
    .update({
      settings: {
        ...(currentAccount.settings || {}),
        suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_by: user.id,
      },
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!account) throw new Error('Account not found');

  // Log the action
  await supabase
    .from('audit_logs')
    .insert({
      account_id: id,
      user_id: user.id,
      action: 'account.suspend',
      resource_type: 'account',
      resource_id: id,
      metadata: {
        account_name: account.name,
      },
    });

  return account;
}

/**
 * Activate (unsuspend) an account
 */
export async function activateAccount(id: string): Promise<Account> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canActivate = await isAdmin(user.id) || await isStaff(user.id);
  if (!canActivate) throw new Error('Insufficient permissions');

  // First get the current account settings
  const { data: currentAccount } = await supabase
    .from('accounts')
    .select('settings')
    .eq('id', id)
    .single();

  if (!currentAccount) throw new Error('Account not found');

  const settings = { ...currentAccount.settings };
  delete settings.suspended;
  delete settings.suspended_at;
  delete settings.suspended_by;

  const { data: account, error } = await supabase
    .from('accounts')
    .update({ settings })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!account) throw new Error('Account not found');

  // Log the action
  await supabase
    .from('audit_logs')
    .insert({
      account_id: id,
      user_id: user.id,
      action: 'account.activate',
      resource_type: 'account',
      resource_id: id,
      metadata: {
        account_name: account.name,
      },
    });

  return account;
}

/**
 * Get account statistics
 */
export async function getAccountStats(accountId: string): Promise<AccountStats> {
  const [
    projectsResult,
    usersResult,
    pagesResult,
    recentActivityResult,
  ] = await Promise.all([
    // Get project counts
    supabase
      .from('projects')
      .select('id, archived_at')
      .eq('account_id', accountId),
    
    // Get user count
    supabase
      .from('account_users')
      .select('user_id')
      .eq('account_id', accountId),
    
    // Get total pages (join through projects table)
    supabase
      .from('pages')
      .select('id, projects!inner(account_id)')
      .eq('projects.account_id', accountId),
    
    // Get recent activity
    supabase
      .from('audit_logs')
      .select('created_at')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  const projects = projectsResult.data || [];
  const activeProjects = projects.filter(p => !p.archived_at);
  const archivedProjects = projects.filter(p => p.archived_at);

  return {
    project_count: projects.length,
    active_projects: activeProjects.length,
    archived_projects: archivedProjects.length,
    user_count: usersResult.data?.length || 0,
    total_pages: pagesResult.data?.length || 0,
    storage_used: 0, // TODO: Calculate actual storage usage
    last_activity: recentActivityResult.data?.created_at || null,
  };
}

/**
 * Bulk operations
 */
export async function bulkSuspendAccounts(accountIds: string[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canSuspend = await isAdmin(user.id) || await isStaff(user.id);
  if (!canSuspend) throw new Error('Insufficient permissions');

  for (const accountId of accountIds) {
    await suspendAccount(accountId);
  }
}

export async function bulkActivateAccounts(accountIds: string[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin or staff
  const canActivate = await isAdmin(user.id) || await isStaff(user.id);
  if (!canActivate) throw new Error('Insufficient permissions');

  for (const accountId of accountIds) {
    await activateAccount(accountId);
  }
}

export async function bulkDeleteAccounts(accountIds: string[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Only admins can delete accounts
  const canDelete = await isAdmin(user.id);
  if (!canDelete) throw new Error('Insufficient permissions');

  for (const accountId of accountIds) {
    await deleteAccount(accountId);
  }
}