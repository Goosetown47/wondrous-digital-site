import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from '../users';

// Mock fetch globally
global.fetch = vi.fn();

describe('createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully create a user', async () => {
    const mockResponse = {
      success: true,
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com'
      }
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
      status: 200,
      statusText: 'OK',
      url: 'http://localhost:3000/api/users/create',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      clone: () => ({ ok: true } as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => JSON.stringify(mockResponse),
      bytes: async () => new Uint8Array()
    } as Response);

    const userData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      full_name: 'Test User',
      role: 'user' as const,
      auto_confirm_email: true,
      send_welcome_email: false,
      account_id: 'acc-123'
    };

    const result = await createUser(userData);

    expect(global.fetch).toHaveBeenCalledWith('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    expect(result).toEqual({
      success: true,
      user: mockResponse.user
    });
  });

  it('should handle validation errors', async () => {
    const errorResponse = {
      error: 'Validation failed',
      details: [{ field: 'email', message: 'Invalid email format' }]
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => errorResponse,
      status: 400,
      statusText: 'Bad Request',
      url: 'http://localhost:3000/api/users/create',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      clone: () => ({ ok: false } as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => JSON.stringify(errorResponse),
      bytes: async () => new Uint8Array()
    } as Response);

    const userData = {
      email: 'invalid-email',
      password: 'pass',
      full_name: 'Test User',
      role: 'user' as const,
      auto_confirm_email: true,
      send_welcome_email: false
    };

    const result = await createUser(userData);

    expect(result).toEqual({
      success: false,
      error: 'Validation failed'
    });
  });

  it('should handle duplicate email error', async () => {
    const errorResponse = {
      error: 'A user with this email already exists'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => errorResponse,
      status: 409,
      statusText: 'Conflict',
      url: 'http://localhost:3000/api/users/create',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      clone: () => ({ ok: false } as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => JSON.stringify(errorResponse),
      bytes: async () => new Uint8Array()
    } as Response);

    const userData = {
      email: 'existing@example.com',
      password: 'SecurePassword123!',
      full_name: 'Test User',
      role: 'user' as const,
      auto_confirm_email: true,
      send_welcome_email: false
    };

    const result = await createUser(userData);

    expect(result).toEqual({
      success: false,
      error: 'A user with this email already exists'
    });
  });

  it('should handle server errors', async () => {
    const errorResponse = {
      error: 'Internal server error'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => errorResponse,
      status: 500,
      statusText: 'Internal Server Error',
      url: 'http://localhost:3000/api/users/create',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      clone: () => ({ ok: false } as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => JSON.stringify(errorResponse),
      bytes: async () => new Uint8Array()
    } as Response);

    const userData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      full_name: 'Test User',
      role: 'admin' as const,
      auto_confirm_email: true,
      send_welcome_email: false
    };

    const result = await createUser(userData);

    expect(result).toEqual({
      success: false,
      error: 'Internal server error'
    });
  });

  it('should handle JSON parsing errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new Error('Invalid JSON'); },
      status: 500,
      statusText: 'Internal Server Error',
      url: 'http://localhost:3000/api/users/create',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      clone: () => ({ ok: false } as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => '',
      bytes: async () => new Uint8Array()
    } as Response);

    const userData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      full_name: 'Test User',
      role: 'user' as const,
      auto_confirm_email: true,
      send_welcome_email: false
    };

    const result = await createUser(userData);

    expect(result).toEqual({
      success: false,
      error: 'Invalid response from server'
    });
  });

  it('should handle network errors', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const userData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      full_name: 'Test User',
      role: 'user' as const,
      auto_confirm_email: true,
      send_welcome_email: false
    };

    const result = await createUser(userData);

    expect(result).toEqual({
      success: false,
      error: 'Network error'
    });
  });

  it('should include hint in error message if available', async () => {
    const errorResponse = {
      error: 'User creation failed',
      hint: 'Check account permissions'
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => errorResponse,
      status: 403,
      statusText: 'Forbidden',
      url: 'http://localhost:3000/api/users/create',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      clone: () => ({ ok: false } as Response),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => JSON.stringify(errorResponse),
      bytes: async () => new Uint8Array()
    } as Response);

    const userData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      full_name: 'Test User',
      role: 'user' as const,
      auto_confirm_email: true,
      send_welcome_email: false,
      account_id: 'restricted-account'
    };

    const result = await createUser(userData);

    expect(result).toEqual({
      success: false,
      error: 'User creation failed - Check account permissions'
    });
  });
});