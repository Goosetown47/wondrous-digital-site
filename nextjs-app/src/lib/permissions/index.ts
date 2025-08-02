import { supabase } from '@/lib/supabase/client';
import type { Permission } from './constants';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Check if a user has admin role (platform admin)
 * Admins have access to all accounts and bypass all permission checks
 */
export async function isAdmin(userId: string, client?: SupabaseClient<Database>): Promise<boolean> {
  const supabaseClient = client || supabase;
  
  const { data, error } = await supabaseClient
    .from('account_users')
    .select('role')
    .eq('user_id', userId)
    .eq('account_id', PLATFORM_ACCOUNT_ID)
    .eq('role', 'admin')
    .limit(1);
    
  return !error && data && data.length > 0;
}

/**
 * Check if a user has staff or admin role
 * Staff have access to Lab, Library, Core, and Tools
 */
export async function isStaff(userId: string, client?: SupabaseClient<Database>): Promise<boolean> {
  const supabaseClient = client || supabase;
  
  const { data, error } = await supabaseClient
    .from('account_users')
    .select('role')
    .eq('user_id', userId)
    .eq('account_id', PLATFORM_ACCOUNT_ID)
    .in('role', ['staff', 'admin'])
    .limit(1);
    
  return !error && data && data.length > 0;
}

/**
 * Get the user's highest role across all accounts
 */
export async function getUserRole(userId: string, client?: SupabaseClient<Database>): Promise<'admin' | 'staff' | 'account_owner' | 'user' | null> {
  const supabaseClient = client || supabase;
  
  const { data, error } = await supabaseClient
    .from('account_users')
    .select('role')
    .eq('user_id', userId)
    .order('role');
    
  if (error || !data || data.length === 0) return null;
  
  // Return the highest role (admin > staff > account_owner > user)
  const roleHierarchy = ['admin', 'staff', 'account_owner', 'user'];
  for (const role of roleHierarchy) {
    if (data.some(d => d.role === role)) {
      return role as 'admin' | 'staff' | 'account_owner' | 'user';
    }
  }
  
  return null;
}

/**
 * Check if a user is a system admin (deprecated - use isAdmin instead)
 * @deprecated Use isAdmin() instead
 */
export async function checkSystemAdmin(userId: string, client?: SupabaseClient<Database>): Promise<boolean> {
  return isAdmin(userId, client);
}

/**
 * Check if a user has a specific permission in an account
 * @param userId - The user ID to check
 * @param accountId - The account context
 * @param permission - The permission to check (e.g., 'projects:create')
 * @param client - Optional Supabase client (for server-side use)
 */
export async function hasPermission(
  userId: string,
  accountId: string,
  permission: Permission | string,
  client?: SupabaseClient<Database>
): Promise<boolean> {
  const supabaseClient = client || supabase;
  
  // Check if user is admin - they bypass all checks
  const userIsAdmin = await isAdmin(userId, supabaseClient);
  if (userIsAdmin) return true;
  
  // Get user's role in the account
  const { data: accountUser, error } = await supabaseClient
    .from('account_users')
    .select(`
      role,
      roles!inner(
        permissions
      )
    `)
    .eq('account_id', accountId)
    .eq('user_id', userId)
    .single();
    
  if (error || !accountUser) return false;
  
  // Check if the role has the required permission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles = (accountUser as any).roles;
  const rolePermissions = Array.isArray(roles?.permissions) ? roles.permissions : [];
  return rolePermissions.includes(permission);
}

/**
 * Require a permission - throws if user doesn't have it
 * For use in server components and API routes
 */
export async function requirePermission(
  userId: string,
  accountId: string,
  permission: Permission | string,
  client?: SupabaseClient<Database>
): Promise<void> {
  const hasAccess = await hasPermission(userId, accountId, permission, client);
  
  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Get all accounts accessible to a user
 * System admins get all accounts, regular users get their own
 */
export async function getUserAccounts(userId: string, client?: SupabaseClient<Database>) {
  // Use the API endpoint that uses service role pattern
  try {
    const response = await fetch('/api/accounts', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      // If API call fails, fall back to client-side query for non-admin users
      console.warn('API call failed, falling back to client-side query');
      
      const supabaseClient = client || supabase;
      
      // Regular users see only their accounts (no admin check needed for fallback)
      const { data, error } = await supabaseClient
        .from('accounts')
        .select(`
          *,
          account_users!inner(
            user_id,
            role
          )
        `)
        .eq('account_users.user_id', userId)
        .order('name');
        
      if (error) throw error;
      return data || [];
    }

    const accounts = await response.json();
    return accounts || [];
    
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    return [];
  }
}

/**
 * Get all projects in an account accessible to a user
 */
export async function getAccountProjects(
  userId: string, 
  accountId: string,
  client?: SupabaseClient<Database>
) {
  const supabaseClient = client || supabase;
  
  // Check if user has access to this account
  const accounts = await getUserAccounts(userId, supabaseClient);
  const hasAccess = accounts.some((acc: { id: string }) => acc.id === accountId);
  
  if (!hasAccess) {
    return [];
  }
  
  console.log('Querying projects for account:', accountId);
  const { data, error } = await supabaseClient
    .from('projects')
    .select('*')
    .eq('account_id', accountId)
    .order('name');
    
  if (error) throw error;
  return data || [];
}

