import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useProjectAccess,
  useUserProjectAccess,
  useGrantProjectAccess,
  useUpdateProjectAccess,
  useRevokeProjectAccess,
  useHasProjectAccess,
} from '../useProjectAccess';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Mock auth provider
import { useAuth } from '@/providers/auth-provider';
import type { User } from '@supabase/supabase-js';

const mockUser: User = {
  id: 'granting-user-id',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  email: 'test@example.com',
};

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(() => ({ 
    user: mockUser,
    loading: false,
    accounts: [],
    isAdmin: false,
    currentAccount: null,
    setCurrentAccount: vi.fn(),
    currentProject: null,
    setCurrentProject: vi.fn(),
    signOut: vi.fn(),
    refreshAccounts: vi.fn(),
  })),
}));

describe('useProjectAccess hooks', () => {
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

  describe('useProjectAccess', () => {
    it('should fetch project access data', async () => {
      const mockData = [
        {
          id: 'access-1',
          project_id: 'project-123',
          user_id: 'user-1',
          account_id: 'account-123',
          granted_by: 'admin-1',
          granted_at: new Date().toISOString(),
          access_level: 'viewer' as const,
          user_display_name: 'John Doe',
        },
      ];

      const { supabase } = await import('@/lib/supabase/client');
      const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useProjectAccess('project-123'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(fromMock).toHaveBeenCalledWith('project_access_view');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqMock).toHaveBeenCalledWith('project_id', 'project-123');
    });

    it('should return empty array for null projectId', async () => {
      const { result } = renderHook(
        () => useProjectAccess(null),
        { wrapper: createWrapper }
      );

      // When disabled, the query returns undefined initially
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle fetch errors', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const orderMock = vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useProjectAccess('project-123'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });

  describe('useUserProjectAccess', () => {
    it('should fetch user project access', async () => {
      const mockData = [
        {
          id: 'access-1',
          project_id: 'project-1',
          user_id: 'user-123',
          account_id: 'account-123',
          granted_by: 'admin-1',
          granted_at: new Date().toISOString(),
          access_level: 'editor' as const,
          project_name: 'Project One',
        },
      ];

      const { supabase } = await import('@/lib/supabase/client');
      const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUserProjectAccess('user-123'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(eqMock).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  describe('useGrantProjectAccess', () => {
    it('should grant project access successfully', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useGrantProjectAccess(),
        { wrapper: createWrapper }
      );

      await result.current.mutateAsync({
        projectId: 'project-123',
        userId: 'user-456',
        accountId: 'account-789',
        accessLevel: 'editor',
      });

      expect(fromMock).toHaveBeenCalledWith('project_users');
      expect(insertMock).toHaveBeenCalledWith({
        project_id: 'project-123',
        user_id: 'user-456',
        account_id: 'account-789',
        granted_by: 'granting-user-id',
        access_level: 'editor',
      });
    });

    it('should throw error when user is not logged in', async () => {
      // Mock useAuth to return null user for this test
      const useAuthMock = vi.mocked(useAuth);
      useAuthMock.mockReturnValueOnce({ 
        user: null, 
        loading: false, 
        accounts: [],
        isAdmin: false,
        currentAccount: null,
        setCurrentAccount: vi.fn(),
        currentProject: null,
        setCurrentProject: vi.fn(),
        signOut: vi.fn(),
        refreshAccounts: vi.fn(),
      });

      const { result } = renderHook(
        () => useGrantProjectAccess(),
        { wrapper: createWrapper }
      );

      await expect(
        result.current.mutateAsync({
          projectId: 'project-123',
          userId: 'user-456',
          accountId: 'account-789',
        })
      ).rejects.toThrow('Must be logged in to grant access');
      
      // Restore mock to default
      useAuthMock.mockReturnValue({ 
        user: mockUser, 
        loading: false,
        accounts: [],
        isAdmin: false,
        currentAccount: null,
        setCurrentAccount: vi.fn(),
        currentProject: null,
        setCurrentProject: vi.fn(),
        signOut: vi.fn(),
        refreshAccounts: vi.fn(),
      });
    });

    it('should invalidate queries after granting access', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(
        () => useGrantProjectAccess(),
        { wrapper: createWrapper }
      );

      await result.current.mutateAsync({
        projectId: 'project-123',
        userId: 'user-456',
        accountId: 'account-789',
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['project-access', 'project-123'],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['user-project-access', 'user-456'],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['projects'],
      });
    });
  });

  describe('useUpdateProjectAccess', () => {
    it('should update access level successfully', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const eqMock2 = vi.fn().mockResolvedValue({ error: null });
      const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock1 });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useUpdateProjectAccess(),
        { wrapper: createWrapper }
      );

      await result.current.mutateAsync({
        projectId: 'project-123',
        userId: 'user-456',
        accessLevel: 'admin',
      });

      expect(updateMock).toHaveBeenCalledWith({ access_level: 'admin' });
      expect(eqMock1).toHaveBeenCalledWith('project_id', 'project-123');
      expect(eqMock2).toHaveBeenCalledWith('user_id', 'user-456');
    });
  });

  describe('useRevokeProjectAccess', () => {
    it('should revoke access successfully', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const eqMock2 = vi.fn().mockResolvedValue({ error: null });
      const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 });
      const deleteMock = vi.fn().mockReturnValue({ eq: eqMock1 });
      const fromMock = vi.fn().mockReturnValue({ delete: deleteMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const { result } = renderHook(
        () => useRevokeProjectAccess(),
        { wrapper: createWrapper }
      );

      await result.current.mutateAsync({
        projectId: 'project-123',
        userId: 'user-456',
        accountId: 'account-123',
      });

      expect(fromMock).toHaveBeenCalledWith('project_users');
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock1).toHaveBeenCalledWith('project_id', 'project-123');
      expect(eqMock2).toHaveBeenCalledWith('user_id', 'user-456');
    });

    it('should invalidate queries after revoking access', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const eqMock2 = vi.fn().mockResolvedValue({ error: null });
      const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 });
      const deleteMock = vi.fn().mockReturnValue({ eq: eqMock1 });
      const fromMock = vi.fn().mockReturnValue({ delete: deleteMock });
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(fromMock);

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(
        () => useRevokeProjectAccess(),
        { wrapper: createWrapper }
      );

      await result.current.mutateAsync({
        projectId: 'project-123',
        userId: 'user-456',
        accountId: 'account-123',
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['project-access', 'project-123'],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['user-project-access', 'user-456'],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['projects'],
      });
    });
  });

  describe('useHasProjectAccess', () => {
    it('should check if user has project access', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const rpcMock = vi.fn().mockResolvedValue({ data: true, error: null });
      (supabase.rpc as ReturnType<typeof vi.fn>).mockImplementation(rpcMock);

      const { result } = renderHook(
        () => useHasProjectAccess('project-123', 'user-456'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBe(true);
      });

      expect(rpcMock).toHaveBeenCalledWith('has_project_access', {
        p_project_id: 'project-123',
        p_user_id: 'user-456',
      });
    });

    it('should return false for null values', async () => {
      const { result } = renderHook(
        () => useHasProjectAccess(null, 'user-456'),
        { wrapper: createWrapper }
      );

      // When disabled (null projectId), the query returns undefined
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle RPC errors', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      const rpcMock = vi.fn().mockResolvedValue({ data: null, error: new Error('RPC failed') });
      (supabase.rpc as ReturnType<typeof vi.fn>).mockImplementation(rpcMock);

      const { result } = renderHook(
        () => useHasProjectAccess('project-123', 'user-456'),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });
});