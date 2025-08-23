import type { User } from '@supabase/supabase-js';
import type { Account, AccountUser, Role } from '@/types/database';

// Platform account constant
export const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

// Mock user data
export const mockUsers = {
  platformAdmin: {
    id: 'admin-user-id',
    email: 'admin@wondrousdigital.com',
    user_metadata: {
      display_name: 'Platform Admin',
    },
  } as unknown as User,
  
  platformStaff: {
    id: 'staff-user-id',
    email: 'staff@wondrousdigital.com',
    user_metadata: {
      display_name: 'Platform Staff',
    },
  } as unknown as User,
  
  accountOwner: {
    id: 'owner-user-id',
    email: 'owner@testcompany.com',
    user_metadata: {
      display_name: 'Account Owner',
    },
  } as unknown as User,
  
  regularUser: {
    id: 'user-user-id',
    email: 'user@testcompany.com',
    user_metadata: {
      display_name: 'Regular User',
    },
  } as unknown as User,
  
  otherAccountUser: {
    id: 'other-user-id',
    email: 'user@othercompany.com',
    user_metadata: {
      display_name: 'Other Account User',
    },
  } as unknown as User,
};

// Mock accounts
export const mockAccounts = {
  platformAccount: {
    id: PLATFORM_ACCOUNT_ID,
    name: 'Platform Account',
    slug: 'platform',
    tier: 'MAX' as const,
    settings: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  } as Account,
  
  testAccount: {
    id: 'test-account-id',
    name: 'Test Company',
    slug: 'test-company',
    tier: 'PRO' as const,
    settings: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  } as Account,
  
  otherAccount: {
    id: 'other-account-id',
    name: 'Other Company',
    slug: 'other-company',
    tier: 'FREE' as const,
    settings: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  } as Account,
};

// Mock account users (role assignments)
export const mockAccountUsers = {
  platformAdmin: {
    account_id: PLATFORM_ACCOUNT_ID,
    user_id: mockUsers.platformAdmin.id,
    role: 'admin',
    joined_at: '2024-01-01T00:00:00Z',
  } as AccountUser,
  
  platformStaff: {
    account_id: PLATFORM_ACCOUNT_ID,
    user_id: mockUsers.platformStaff.id,
    role: 'staff',
    joined_at: '2024-01-01T00:00:00Z',
  } as AccountUser,
  
  accountOwner: {
    account_id: mockAccounts.testAccount.id,
    user_id: mockUsers.accountOwner.id,
    role: 'account_owner',
    joined_at: '2024-01-01T00:00:00Z',
  } as AccountUser,
  
  regularUser: {
    account_id: mockAccounts.testAccount.id,
    user_id: mockUsers.regularUser.id,
    role: 'user',
    joined_at: '2024-01-01T00:00:00Z',
  } as AccountUser,
  
  otherAccountUser: {
    account_id: mockAccounts.otherAccount.id,
    user_id: mockUsers.otherAccountUser.id,
    role: 'user',
    joined_at: '2024-01-01T00:00:00Z',
  } as AccountUser,
};

// Mock roles
export const mockRoles = {
  admin: {
    id: 'admin-role-id',
    name: 'admin',
    permissions: ['*'],
    account_id: PLATFORM_ACCOUNT_ID,
    description: 'Platform administrator with full access',
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  } as Role,
  
  staff: {
    id: 'staff-role-id',
    name: 'staff',
    permissions: ['accounts.read', 'projects.read', 'users.read'],
    account_id: PLATFORM_ACCOUNT_ID,
    description: 'Platform staff with limited admin access',
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  } as Role,
  
  accountOwner: {
    id: 'owner-role-id',
    name: 'account_owner',
    permissions: ['account.manage', 'users.manage', 'projects.manage'],
    account_id: null,
    description: 'Account owner with full account access',
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  } as Role,
  
  user: {
    id: 'user-role-id',
    name: 'user',
    permissions: ['projects.read', 'projects.use'],
    account_id: null,
    description: 'Regular user with basic access',
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  } as Role,
};

// Helper to create auth context for testing
export function createMockAuthContext(user: User, accountUser: AccountUser, account: Account) {
  return {
    user,
    currentAccount: account,
    currentAccountUser: accountUser,
    isLoading: false,
  };
}

// Helper to create a complete test scenario
export function createTestScenario(role: 'platformAdmin' | 'platformStaff' | 'accountOwner' | 'regularUser' | 'otherAccountUser') {
  switch (role) {
    case 'platformAdmin':
      return {
        user: mockUsers.platformAdmin,
        account: mockAccounts.platformAccount,
        accountUser: mockAccountUsers.platformAdmin,
        role: mockRoles.admin,
      };
    
    case 'platformStaff':
      return {
        user: mockUsers.platformStaff,
        account: mockAccounts.platformAccount,
        accountUser: mockAccountUsers.platformStaff,
        role: mockRoles.staff,
      };
    
    case 'accountOwner':
      return {
        user: mockUsers.accountOwner,
        account: mockAccounts.testAccount,
        accountUser: mockAccountUsers.accountOwner,
        role: mockRoles.accountOwner,
      };
    
    case 'regularUser':
      return {
        user: mockUsers.regularUser,
        account: mockAccounts.testAccount,
        accountUser: mockAccountUsers.regularUser,
        role: mockRoles.user,
      };
    
    case 'otherAccountUser':
      return {
        user: mockUsers.otherAccountUser,
        account: mockAccounts.otherAccount,
        accountUser: mockAccountUsers.otherAccountUser,
        role: mockRoles.user,
      };
  }
}