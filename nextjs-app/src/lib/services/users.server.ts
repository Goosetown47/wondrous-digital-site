import { createAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserWithAccounts } from './users';

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  user_metadata: {
    display_name?: string;
    avatar_url?: string;
    phone?: string;
    [key: string]: any;
  };
}

export interface UserProfile {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

/**
 * Get all users with their auth data and account relationships
 * This function can only be called from server-side code
 */
export async function getAllUsersWithAuth(): Promise<UserWithAccounts[]> {
  const adminClient = createAdminClient();
  
  // Get all users from auth.users using admin client
  const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
  if (authError) throw authError;

  // Get all account relationships
  const { data: accountUsers, error: accountError } = await adminClient
    .from('account_users')
    .select(`
      user_id,
      account_id,
      role,
      joined_at,
      invited_by,
      accounts!inner(
        id,
        name,
        slug
      )
    `)
    .order('joined_at', { ascending: false });

  if (accountError) throw accountError;

  // Create a map of user accounts
  const userAccountsMap = new Map<string, typeof accountUsers>();
  for (const relation of accountUsers) {
    const userId = relation.user_id;
    if (!userAccountsMap.has(userId)) {
      userAccountsMap.set(userId, []);
    }
    userAccountsMap.get(userId)!.push(relation);
  }

  // Platform account ID
  const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

  // Combine auth users with their accounts
  const usersWithAccounts: UserWithAccounts[] = authUsers.users.map(authUser => {
    const userAccounts = userAccountsMap.get(authUser.id) || [];
    
    const accounts = userAccounts.map(relation => ({
      account_id: relation.account_id,
      account_name: relation.accounts.name,
      account_slug: relation.accounts.slug,
      role: relation.role,
      joined_at: relation.joined_at,
      invited_by: relation.invited_by,
    }));

    // Filter out platform account from regular accounts display
    const regularAccounts = accounts.filter(acc => acc.account_id !== PLATFORM_ACCOUNT_ID);
    
    // Find primary account (excluding platform account)
    const primaryAccount = regularAccounts.find(acc => acc.role === 'account_owner') || regularAccounts[0];

    return {
      id: authUser.id,
      email: authUser.email!,
      display_name: authUser.user_metadata?.display_name,
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at,
      email_confirmed_at: authUser.email_confirmed_at,
      accounts, // Keep all accounts for role checking
      primary_account: primaryAccount ? {
        account_id: primaryAccount.account_id,
        account_name: primaryAccount.account_name,
        role: primaryAccount.role,
      } : undefined,
    };
  });

  return usersWithAccounts;
}

/**
 * Get a single user by ID with auth data
 */
export async function getUserByIdWithAuth(userId: string): Promise<UserWithAccounts> {
  const adminClient = createAdminClient();
  
  // Get user from auth.users
  const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);
  if (authError) throw authError;
  if (!authUser.user) throw new Error('User not found');

  // Get user's account relationships
  const { data: accountUsers, error: accountError } = await adminClient
    .from('account_users')
    .select(`
      user_id,
      account_id,
      role,
      joined_at,
      invited_by,
      accounts!inner(
        id,
        name,
        slug
      )
    `)
    .eq('user_id', userId);

  if (accountError) throw accountError;

  const accounts = accountUsers.map(relation => ({
    account_id: relation.account_id,
    account_name: relation.accounts.name,
    account_slug: relation.accounts.slug,
    role: relation.role,
    joined_at: relation.joined_at,
    invited_by: relation.invited_by,
  }));

  const primaryAccount = accounts.find(acc => acc.role === 'account_owner') || accounts[0];

  return {
    id: authUser.user.id,
    email: authUser.user.email!,
    display_name: authUser.user.user_metadata?.display_name,
    created_at: authUser.user.created_at,
    last_sign_in_at: authUser.user.last_sign_in_at,
    email_confirmed_at: authUser.user.email_confirmed_at,
    accounts,
    primary_account: primaryAccount ? {
      account_id: primaryAccount.account_id,
      account_name: primaryAccount.account_name,
      role: primaryAccount.role,
    } : undefined,
  };
}

/**
 * Update user metadata (display name, etc.)
 */
export async function updateUserMetadata(userId: string, metadata: Partial<UserProfile>): Promise<void> {
  const adminClient = createAdminClient();
  
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });

  if (error) throw error;
}

/**
 * Invite a new user via email
 */
export async function inviteUserByEmail(email: string, accountId: string, role: string, invitedBy: string) {
  const adminClient = createAdminClient();
  
  // Check if user already exists
  const { data: existingUsers } = await adminClient
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUsers) {
    // User exists, just add them to the account
    const { error } = await adminClient
      .from('account_users')
      .insert({
        user_id: existingUsers.id,
        account_id: accountId,
        role,
        invited_by: invitedBy,
      });
    
    if (error) throw error;
    return { userId: existingUsers.id, isNewUser: false };
  }

  // User doesn't exist, create invitation
  // In production, you'd send an email with magic link or invitation code
  // For now, we'll just return the invitation data
  return {
    email,
    accountId,
    role,
    invitedBy,
    isNewUser: true,
    message: 'User invitation would be sent via email in production',
  };
}