import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/permissions/server-checks';

// Mock the Supabase clients
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn()
}));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn()
}));
vi.mock('@/lib/permissions/server-checks', () => ({
  isAdminServer: vi.fn()
}));

// Keep console methods active during tests for debugging
// global.console.log = vi.fn();
// global.console.error = vi.fn();

// Define mock types
interface MockSupabaseClient {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    admin: {
      createUser: ReturnType<typeof vi.fn>;
      deleteUser: ReturnType<typeof vi.fn>;
      updateUserById: ReturnType<typeof vi.fn>;
    };
  };
  from: ReturnType<typeof vi.fn>;
}

describe('POST /api/users/create', () => {
  let mockAdminClient: MockSupabaseClient;
  let mockServerClient: MockSupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup admin client mock
    mockAdminClient = {
      auth: {
        getUser: vi.fn(),
        admin: {
          createUser: vi.fn(),
          deleteUser: vi.fn(),
          updateUserById: vi.fn(),
        }
      },
      from: vi.fn((table) => {
        if (table === 'accounts') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({ data: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Test Account' }, error: null }))
              }))
            }))
          };
        }
        if (table === 'account_users') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn(() => ({ data: null, error: null }))
                }))
              })),
              limit: vi.fn(() => ({
                single: vi.fn(() => ({ data: null, error: null }))
              })),
              count: vi.fn(() => ({ count: 0, error: null }))
            })),
            insert: vi.fn(() => ({ error: null })),
            upsert: vi.fn(() => ({ error: null }))
          };
        }
        if (table === 'user_profiles') {
          return {
            insert: vi.fn(() => ({ error: null }))
          };
        }
        return {
          insert: vi.fn(() => ({ error: null })),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ data: null, error: null }))
            }))
          }))
        };
      })
    };

    // Setup server client mock  
    mockServerClient = {
      auth: {
        getUser: vi.fn(() => ({ 
          data: { user: { id: 'admin-user-id' } }, 
          error: null 
        })),
        admin: {
          createUser: vi.fn(),
          deleteUser: vi.fn(),
          updateUserById: vi.fn(),
        }
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ 
              data: { role: 'admin' }, 
              error: null 
            }))
          }))
        })),
        insert: vi.fn(() => ({ error: null }))
      }))
    };

    vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as ReturnType<typeof createAdminClient>);
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockServerClient as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    vi.mocked(isAdminServer).mockResolvedValue(true); // Default to admin user
  });

  it('should create a user successfully', async () => {
    const mockUser = {
      id: 'new-user-id',
      email: 'test@example.com'
    };

    mockAdminClient.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        full_name: 'Test User',
        role: 'user',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        auto_confirm_email: true,
        send_welcome_email: false
      })
    });

    const response = await POST(request);
    const data = await response.json();

    if (response.status !== 200) {
      console.log('Test failed with:', { status: response.status, data });
    }

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.id).toBe('new-user-id');
    expect(data.user.email).toBe('test@example.com');
    
    expect(mockAdminClient.auth.admin.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePassword123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        display_name: 'Test User'
      }
    });
  });

  it('should reject non-admin users', async () => {
    vi.mocked(isAdminServer).mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/users/create', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        full_name: 'Test User',
        role: 'user',
        auto_confirm_email: true,
        send_welcome_email: false
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Access denied. Admin role required.');
  });

  it('should handle validation errors', async () => {
    const request = new NextRequest('http://localhost:3000/api/users/create', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'weak',
        full_name: '',
        role: 'invalid-role'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('should handle duplicate email error', async () => {
    mockAdminClient.auth.admin.createUser.mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered' }
    });

    const request = new NextRequest('http://localhost:3000/api/users/create', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        full_name: 'Test User',
        role: 'user',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        auto_confirm_email: true,
        send_welcome_email: false
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('A user with this email already exists');
  });

  it('should require account_id for user and account_owner roles', async () => {
    const request = new NextRequest('http://localhost:3000/api/users/create', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        full_name: 'Test User',
        role: 'user',
        auto_confirm_email: true,
        send_welcome_email: false
        // Missing account_id
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Account ID is required');
  });

  it('should assign platform roles correctly', async () => {
    mockAdminClient.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: { id: 'admin-user-id', email: 'admin@example.com' } },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/users/create', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'SecurePassword123!',
        full_name: 'Admin User',
        role: 'admin',
        auto_confirm_email: true,
        send_welcome_email: false
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    
    // Check that account_users was called with platform account ID
    expect(mockAdminClient.from).toHaveBeenCalledWith('account_users');
  });

  it('should clean up user if account assignment fails', async () => {
    mockAdminClient.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: { id: 'new-user-id', email: 'test@example.com' } },
      error: null
    });

    // Make account assignment fail
    mockAdminClient.from = vi.fn((table) => {
      if (table === 'accounts') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ data: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Test Account' }, error: null }))
            }))
          }))
        };
      }
      if (table === 'account_users') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => ({ data: null, error: null }))
              }))
            })),
            limit: vi.fn(() => ({
              single: vi.fn(() => ({ data: null, error: null }))
            })),
            count: vi.fn(() => ({ count: 0, error: null }))
          })),
          insert: vi.fn(() => ({ error: { message: 'Role constraint violation' } })),
          upsert: vi.fn(() => ({ error: { message: 'Role constraint violation' } }))
        };
      }
      if (table === 'user_profiles') {
        return {
          insert: vi.fn(() => ({ error: null }))
        };
      }
      return {
        insert: vi.fn(() => ({ error: null }))
      };
    });

    const request = new NextRequest('http://localhost:3000/api/users/create', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        full_name: 'Test User',
        role: 'user',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        auto_confirm_email: true,
        send_welcome_email: false
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('account assignment failed');
    expect(mockAdminClient.auth.admin.deleteUser).toHaveBeenCalledWith('new-user-id');
  });

  it('should handle malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/users/create', {
      method: 'POST',
      body: 'invalid json'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Unexpected token');
  });
});