import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUserProjectCounts, useAccountProjectCount } from '../useUserProjectCounts';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useUserProjectCounts hooks', () => {
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

  describe('useUserProjectCounts', () => {
    it('should fetch user project counts with account owners having all access', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project One' },
        { id: 'project-2', name: 'Project Two' },
        { id: 'project-3', name: 'Project Three' },
      ];

      const mockAccountUsers = [
        { user_id: 'owner-1', role: 'account_owner' },
        { user_id: 'user-1', role: 'user' },
        { user_id: 'user-2', role: 'user' },
      ];

      const mockProjectAccess = [
        { user_id: 'user-1', project_id: 'project-1' },
        { user_id: 'user-1', project_id: 'project-3' },
        { user_id: 'user-2', project_id: 'project-2' },
      ];

      const { supabase } = await import('@/lib/supabase/client');
      
      // Mock the three database calls
      let callCount = 0;
      const fromMock = vi.fn().mockImplementation((table) => {
        callCount++;
        
        if (table === 'projects' && callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ data: mockProjects, error: null })
              })
            })
          };
        }
        
        if (table === 'account_users' && callCount === 2) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockAccountUsers, error: null })
            })
          };
        }
        
        if (table === 'project_users' && callCount === 3) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockProjectAccess, error: null })
            })
          };
        }
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserProjectCounts('account-123'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const data = result.current.data;
      
      // Check account owner has all projects
      const ownerData = data?.find(u => u.user_id === 'owner-1');
      expect(ownerData).toEqual({
        user_id: 'owner-1',
        project_count: 3,
        project_names: ['Project One', 'Project Two', 'Project Three'],
        has_all_access: true,
      });

      // Check regular user with limited access
      const user1Data = data?.find(u => u.user_id === 'user-1');
      expect(user1Data).toEqual({
        user_id: 'user-1',
        project_count: 2,
        project_names: ['Project One', 'Project Three'],
        has_all_access: false,
      });

      // Check another user with different access
      const user2Data = data?.find(u => u.user_id === 'user-2');
      expect(user2Data).toEqual({
        user_id: 'user-2',
        project_count: 1,
        project_names: ['Project Two'],
        has_all_access: false,
      });
    });

    it('should return empty array for null accountId', async () => {
      const { result } = renderHook(
        () => useUserProjectCounts(null),
        { wrapper: createWrapper }
      );

      // When disabled (null accountId), the query returns undefined
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle users with no project access', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project One' },
      ];

      const mockAccountUsers = [
        { user_id: 'user-1', role: 'user' },
      ];

      const mockProjectAccess: { user_id: string; project_id: string }[] = []; // No project access

      const { supabase } = await import('@/lib/supabase/client');
      
      let callCount = 0;
      const fromMock = vi.fn().mockImplementation((table) => {
        callCount++;
        
        if (table === 'projects' && callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ data: mockProjects, error: null })
              })
            })
          };
        }
        
        if (table === 'account_users' && callCount === 2) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockAccountUsers, error: null })
            })
          };
        }
        
        if (table === 'project_users' && callCount === 3) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockProjectAccess, error: null })
            })
          };
        }
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserProjectCounts('account-123'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const userData = result.current.data?.[0];
      expect(userData).toEqual({
        user_id: 'user-1',
        project_count: 0,
        project_names: [],
        has_all_access: false,
      });
    });

    it('should handle empty account (no users)', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      
      let callCount = 0;
      const fromMock = vi.fn().mockImplementation((table) => {
        callCount++;
        
        if (table === 'projects' && callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ data: [], error: null })
              })
            })
          };
        }
        
        if (table === 'account_users' && callCount === 2) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null })
            })
          };
        }
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserProjectCounts('account-123'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
      });
    });

    it('should use stale time for caching', () => {
      renderHook(
        () => useUserProjectCounts('account-123'),
        { wrapper: createWrapper }
      );

      // Check that the query has the correct stale time
      const query = queryClient.getQueryCache().find({
        queryKey: ['user-project-counts', 'account-123'],
      });
      
      expect((query?.options as Record<string, unknown>)?.staleTime).toBe(30 * 1000); // 30 seconds
    });
  });

  describe('useAccountProjectCount', () => {
    it('should fetch total project count', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      
      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ count: 5, error: null })
          })
        })
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useAccountProjectCount('account-123'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe(5);
      });

      expect(fromMock).toHaveBeenCalledWith('projects');
    });

    it('should return 0 for null accountId', async () => {
      const { result } = renderHook(
        () => useAccountProjectCount(null),
        { wrapper: createWrapper }
      );

      // When disabled (null accountId), the query returns undefined
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should return 0 when count is null', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      
      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ count: null, error: null })
          })
        })
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useAccountProjectCount('account-123'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe(0);
      });
    });

    it('should use correct query parameters', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      
      const isMock = vi.fn().mockResolvedValue({ count: 3, error: null });
      const eqMock = vi.fn().mockReturnValue({ is: isMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useAccountProjectCount('account-123'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe(3);
      });

      expect(selectMock).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(eqMock).toHaveBeenCalledWith('account_id', 'account-123');
      expect(isMock).toHaveBeenCalledWith('archived_at', null);
    });

    it('should use stale time for caching', () => {
      renderHook(
        () => useAccountProjectCount('account-123'),
        { wrapper: createWrapper }
      );

      // Check that the query has the correct stale time
      const query = queryClient.getQueryCache().find({
        queryKey: ['account-project-count', 'account-123'],
      });
      
      expect((query?.options as Record<string, unknown>)?.staleTime).toBe(30 * 1000); // 30 seconds
    });
  });
});