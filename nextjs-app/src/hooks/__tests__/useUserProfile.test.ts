import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUserProfile, useUserRole } from '../useUserProfile';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock auth provider
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

const mockCurrentAccount = {
  id: 'account-123',
  name: 'Test Account',
};

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(),
}));

describe('useUserProfile hooks', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  describe('useUserProfile', () => {
    beforeEach(async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser });
    });

    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        user_id: 'test-user-id',
        display_name: 'John Doe',
        phone: '+1234567890',
        avatar_url: 'https://example.com/avatar.jpg',
        metadata: { theme: 'dark' },
        profile_completed: true,
      };

      const { supabase } = await import('@/lib/supabase/client');
      const singleMock = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserProfile(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockProfile);
      });

      expect(fromMock).toHaveBeenCalledWith('user_profiles');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqMock).toHaveBeenCalledWith('user_id', 'test-user-id');
    });

    it('should return default profile when no profile exists', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserProfile(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({
          user_id: 'test-user-id',
          display_name: 'Test User', // From user_metadata.full_name
          phone: null,
          avatar_url: null,
          metadata: {},
          profile_completed: false,
        });
      });
    });

    it('should handle PGRST116 error (no rows) gracefully', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const error = new Error('No rows returned');
      (error as Error & { code?: string }).code = 'PGRST116';
      const singleMock = vi.fn().mockResolvedValue({ data: null, error });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserProfile(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({
          user_id: 'test-user-id',
          display_name: 'Test User',
          phone: null,
          avatar_url: null,
          metadata: {},
          profile_completed: false,
        });
      });

      // Should not throw error
      expect(result.current.error).toBeNull();
    });

    it('should throw other database errors', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const error = new Error('Database connection failed');
      const singleMock = vi.fn().mockResolvedValue({ data: null, error });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserProfile(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toBe('Database connection failed');
      });
    });

    it('should use email prefix as fallback display name', async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        user: {
          ...mockUser,
          user_metadata: {}, // No full_name
        },
      });

      const { supabase } = await import('@/lib/supabase/client');
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserProfile(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data?.display_name).toBe('test'); // From test@example.com
      });
    });

    it('should return null when no user is logged in', async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null });

      const { result } = renderHook(
        () => useUserProfile(),
        { wrapper: createWrapper }
      );

      // When disabled (no user), the query returns undefined
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useUserRole', () => {
    it('should return Admin role for system admin', async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser, currentAccount: mockCurrentAccount });

      const { supabase } = await import('@/lib/supabase/client');
      
      let callCount = 0;
      const fromMock = vi.fn().mockImplementation(() => {
        callCount++;
        
        if (callCount === 1) {
          // First call - check system role
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null })
                })
              })
            })
          };
        }
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserRole(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe('Admin');
      });
    });

    it('should return Staff role for system staff', async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser, currentAccount: mockCurrentAccount });

      const { supabase } = await import('@/lib/supabase/client');
      
      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { role: 'staff' }, error: null })
            })
          })
        })
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserRole(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe('Staff');
      });
    });

    it('should return Account Owner role for account owner', async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser, currentAccount: mockCurrentAccount });

      const { supabase } = await import('@/lib/supabase/client');
      
      let callCount = 0;
      const fromMock = vi.fn().mockImplementation(() => {
        callCount++;
        
        if (callCount === 1) {
          // First call - check system role (not admin/staff)
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null })
                })
              })
            })
          };
        }
        
        if (callCount === 2) {
          // Second call - check account role
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { role: 'account_owner' }, error: null })
                })
              })
            })
          };
        }
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserRole(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe('Account Owner');
      });
    });

    it('should return User role for regular user', async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser, currentAccount: mockCurrentAccount });

      const { supabase } = await import('@/lib/supabase/client');
      
      let callCount = 0;
      const fromMock = vi.fn().mockImplementation(() => {
        callCount++;
        
        if (callCount === 1) {
          // First call - check system role (not admin/staff)
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null })
                })
              })
            })
          };
        }
        
        if (callCount === 2) {
          // Second call - check account role
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null })
                })
              })
            })
          };
        }
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserRole(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe('User');
      });
    });

    it('should return User as default when no roles found', async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser, currentAccount: mockCurrentAccount });

      const { supabase } = await import('@/lib/supabase/client');
      
      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        })
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserRole(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe('User');
      });
    });

    it('should return null when no user is logged in', async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null, currentAccount: null });

      const { result } = renderHook(
        () => useUserRole(),
        { wrapper: createWrapper }
      );

      // When disabled (no user), the query returns undefined
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should check role without current account', async () => {
      const { useAuth } = await import('@/providers/auth-provider');
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser, currentAccount: null });

      const { supabase } = await import('@/lib/supabase/client');
      
      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        })
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserRole(),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe('User');
      });
    });
  });
});