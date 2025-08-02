import { createSupabaseServerClient } from '@/lib/supabase/server';

const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Server-side check if a user has admin role
 * Use this in API routes and server components
 */
export async function isAdminServer(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', userId)
    .eq('account_id', PLATFORM_ACCOUNT_ID)
    .eq('role', 'admin')
    .limit(1);
    
  return !error && data && data.length > 0;
}

/**
 * Server-side check if a user has staff or admin role
 */
export async function isStaffServer(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', userId)
    .eq('account_id', PLATFORM_ACCOUNT_ID)
    .in('role', ['staff', 'admin'])
    .limit(1);
    
  return !error && data && data.length > 0;
}

/**
 * Get user's highest role across all accounts (server-side)
 */
export async function getUserHighestRoleServer(userId: string): Promise<'admin' | 'staff' | 'account_owner' | 'user' | null> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', userId);
    
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
 * Check if user has a specific role in a specific account
 */
export async function hasRoleInAccountServer(
  userId: string, 
  accountId: string, 
  requiredRoles: string[]
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('account_users')
    .select('role')
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .in('role', requiredRoles)
    .single();
    
  return !error && !!data;
}