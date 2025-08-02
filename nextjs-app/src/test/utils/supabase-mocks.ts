import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { mockAccountUsers, mockAccounts, mockRoles } from './auth-mocks';

// Mock Supabase client
export function createMockSupabaseClient(overrides?: Partial<SupabaseClient<Database>>) {
  const mockClient = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn((table: string) => {
      // Return different mock responses based on table
      switch (table) {
        case 'accounts':
          return createMockQuery('accounts');
        case 'account_users':
          return createMockQuery('account_users');
        case 'roles':
          return createMockQuery('roles');
        case 'projects':
          return createMockQuery('projects');
        case 'pages':
          return createMockQuery('pages');
        default:
          return createMockQuery(table);
      }
    }),
    rpc: vi.fn((functionName: string, params?: Record<string, unknown>) => {
      switch (functionName) {
        case 'is_platform_admin':
          return {
            data: params?.check_user_id === 'admin-user-id',
            error: null,
          };
        case 'get_user_role_in_account': {
          // Return role based on user and account
          const accountUser = Object.values(mockAccountUsers).find(
            au => au.user_id === params?.p_user_id && au.account_id === params?.p_account_id
          );
          return {
            data: accountUser?.role || null,
            error: null,
          };
        }
        default:
          return { data: null, error: null };
      }
    }),
    ...overrides,
  } as unknown as SupabaseClient<Database>;

  return mockClient;
}

// Create mock query builder
function createMockQuery(table: string) {
  const query = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    throwOnError: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => {
      // Return mock data based on table
      const mockData = getMockDataForTable(table);
      resolve({ data: mockData, error: null });
      return Promise.resolve({ data: mockData, error: null });
    }),
  };

  // Make it thenable
  Object.defineProperty(query, Symbol.toStringTag, {
    value: 'Promise',
  });

  return query;
}

// Get mock data for different tables
function getMockDataForTable(table: string) {
  switch (table) {
    case 'accounts':
      return Object.values(mockAccounts);
    case 'account_users':
      return Object.values(mockAccountUsers);
    case 'roles':
      return Object.values(mockRoles);
    case 'projects':
      return [
        {
          id: 'project-1',
          name: 'Test Project',
          slug: 'test-project',
          account_id: 'test-account-id',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'project-2',
          name: 'Other Project',
          slug: 'other-project',
          account_id: 'other-account-id',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
    case 'pages':
      return [
        {
          id: 'page-1',
          project_id: 'project-1',
          path: '/',
          title: 'Home',
          sections: [],
          metadata: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
    default:
      return [];
  }
}

// Mock specific responses for testing scenarios
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockSupabaseResponse(client: any, table: string, method: string, response: unknown) {
  const query = client.from(table);
  // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-explicit-any
  const mockMethod = (query as any)[method];
  if (mockMethod && typeof mockMethod.mockReturnValueOnce === 'function') {
    mockMethod.mockReturnValueOnce({
      ...query,
      then: vi.fn((resolve: (value: unknown) => void) => {
        resolve(response);
        return Promise.resolve(response);
      }),
    });
  }
}

// Mock auth responses
export function mockAuthResponse(client: Record<string, unknown>, method: string, response: unknown) {
  const auth = client.auth as Record<string, unknown>;
  // eslint-disable-next-line security/detect-object-injection
  const authMethod = auth[method] as { mockResolvedValueOnce?: (response: unknown) => void };
  if (authMethod && authMethod.mockResolvedValueOnce) {
    authMethod.mockResolvedValueOnce(response);
  }
}

// Mock RPC responses
export function mockRpcResponse(client: Record<string, unknown>, functionName: string, response: unknown) {
  const rpc = client.rpc as { mockResolvedValueOnce?: (response: unknown) => void };
  if (rpc && rpc.mockResolvedValueOnce) {
    rpc.mockResolvedValueOnce(response);
  }
}

// Helper to setup common auth scenarios
export function setupAuthScenario(client: Record<string, unknown>, scenario: 'admin' | 'owner' | 'user' | 'unauthenticated') {
  switch (scenario) {
    case 'admin':
      mockAuthResponse(client, 'getUser', {
        data: { user: { id: 'admin-user-id', email: 'admin@wondrousdigital.com' } },
        error: null,
      });
      mockRpcResponse(client, 'is_platform_admin', { data: true, error: null });
      break;
    
    case 'owner':
      mockAuthResponse(client, 'getUser', {
        data: { user: { id: 'owner-user-id', email: 'owner@testcompany.com' } },
        error: null,
      });
      mockRpcResponse(client, 'is_platform_admin', { data: false, error: null });
      break;
    
    case 'user':
      mockAuthResponse(client, 'getUser', {
        data: { user: { id: 'user-user-id', email: 'user@testcompany.com' } },
        error: null,
      });
      mockRpcResponse(client, 'is_platform_admin', { data: false, error: null });
      break;
    
    case 'unauthenticated':
      mockAuthResponse(client, 'getUser', {
        data: { user: null },
        error: null,
      });
      break;
  }
}