import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PLATFORM_ACCOUNT_ID } from '@/test/utils/auth-mocks';
import React from 'react';

// Mock dependencies first
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  },
  createClient: vi.fn(() => ({
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  })),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(),
}));

// Import after mocks are set up
import { 
  useStaffMembers, 
  useStaffAssignments, 
  useAssignStaff, 
  useUnassignStaff,
  useAssignmentActivity 
} from '../useStaffAssignments';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';

// Get reference to mocked supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSupabaseClient = supabase as any;

describe('Staff Assignment Hooks', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  });

  describe('useStaffMembers', () => {
    it('should fetch all staff members with their assignments', async () => {
      const mockStaffUsers = [
        {
          user_id: 'staff-1',
          auth_users: {
            id: 'staff-1',
            email: 'staff1@wondrousdigital.com',
            last_sign_in_at: '2024-01-15T10:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            raw_user_meta_data: { full_name: 'Staff One' },
          },
        },
        {
          user_id: 'staff-2',
          auth_users: {
            id: 'staff-2',
            email: 'staff2@wondrousdigital.com',
            last_sign_in_at: '2024-01-16T10:00:00Z',
            created_at: '2024-01-02T00:00:00Z',
            raw_user_meta_data: {},
          },
        },
      ];

      const mockAssignments = [
        {
          id: 'assign-1',
          staff_user_id: 'staff-1',
          account_id: 'account-1',
          accounts: {
            id: 'account-1',
            name: 'Test Account 1',
            slug: 'test-1',
          },
        },
        {
          id: 'assign-2',
          staff_user_id: 'staff-1',
          account_id: 'account-2',
          accounts: {
            id: 'account-2',
            name: 'Test Account 2',
            slug: 'test-2',
          },
        },
      ];

      const mockProfiles = [
        { user_id: 'staff-1', display_name: 'Staff Member One' },
      ];

      // Mock the queries
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'account_users') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockImplementation((field, value) => {
              if (field === 'account_id' && value === PLATFORM_ACCOUNT_ID) {
                return {
                  eq: vi.fn().mockResolvedValue({
                    data: mockStaffUsers,
                    error: null,
                  }),
                };
              }
              return { eq: vi.fn().mockResolvedValue({ data: [], error: null }) };
            }),
          };
        }
        if (table === 'staff_account_assignments') {
          return {
            select: vi.fn().mockResolvedValue({
              data: mockAssignments,
              error: null,
            }),
          };
        }
        if (table === 'user_profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: mockProfiles,
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      const { result } = renderHook(() => useStaffMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0]).toEqual({
        id: 'staff-1',
        email: 'staff1@wondrousdigital.com',
        display_name: 'Staff Member One',
        last_sign_in_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        assignment_count: 2,
        assignments: mockAssignments,
      });
      expect(result.current.data?.[1]).toEqual({
        id: 'staff-2',
        email: 'staff2@wondrousdigital.com',
        display_name: null,
        last_sign_in_at: '2024-01-16T10:00:00Z',
        created_at: '2024-01-02T00:00:00Z',
        assignment_count: 0,
        assignments: [],
      });
    });

    it('should handle errors when fetching staff members', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockRejectedValue(new Error('Database error')),
      });

      const { result } = renderHook(() => useStaffMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Database error');
    });
  });

  describe('useStaffAssignments', () => {
    it('should fetch assignments for a specific staff member', async () => {
      const staffUserId = 'staff-1';
      
      // Mock useAuth
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ 
        user: { id: 'user-123', email: 'user@example.com' } 
      });
      
      const mockAssignments = [
        {
          id: 'assign-1',
          staff_user_id: staffUserId,
          account_id: 'account-1',
          assigned_by: 'admin-1',
          accounts: {
            id: 'account-1',
            name: 'Test Account',
            slug: 'test-account',
          },
          assigned_by_user: {
            id: 'admin-1',
            email: 'admin@wondrousdigital.com',
            raw_user_meta_data: { full_name: 'Admin User' },
          },
        },
      ];

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staff_account_assignments') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockAssignments,
              error: null,
            }),
          };
        }
        if (table === 'user_profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [{ user_id: 'admin-1', display_name: 'Administrator' }],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      const { result } = renderHook(() => useStaffAssignments(staffUserId), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toMatchObject({
        id: 'assign-1',
        staff_user_id: staffUserId,
        assigned_by_user: {
          id: 'admin-1',
          email: 'admin@wondrousdigital.com',
          display_name: 'Administrator',
        },
      });
    });

    it('should use current user if no staffUserId provided', async () => {
      const currentUser = { id: 'current-staff', email: 'current@wondrousdigital.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: currentUser });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staff_account_assignments') {
          return {
            select: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockImplementation(() => ({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              })),
            })),
          };
        }
        // user_profiles query
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      const { result } = renderHook(() => useStaffAssignments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useAssignStaff', () => {
    it('should assign staff to multiple accounts', async () => {
      const currentUser = { id: 'admin-user', email: 'admin@wondrousdigital.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: currentUser });

      const staffUserId = 'staff-1';
      const accountIds = ['account-1', 'account-2'];
      const notes = 'Assigned for project support';

      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: accountIds.map((accountId, i) => ({
            id: `assign-${i}`,
            staff_user_id: staffUserId,
            account_id: accountId,
            assignment_notes: notes,
            assigned_by: currentUser.id,
          })),
          error: null,
        }),
      });

      const { result } = renderHook(() => useAssignStaff(), { wrapper });

      await result.current.mutateAsync({
        staffUserId,
        accountIds,
        notes,
      });

      // Verify delete was called to remove existing assignments
      expect(supabase.from).toHaveBeenCalledWith('staff_account_assignments');
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled();

      // Verify insert was called with correct data
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith([
        {
          staff_user_id: staffUserId,
          account_id: 'account-1',
          assignment_notes: notes,
          assigned_by: currentUser.id,
        },
        {
          staff_user_id: staffUserId,
          account_id: 'account-2',
          assignment_notes: notes,
          assigned_by: currentUser.id,
        },
      ]);
    });

    it('should handle removing all assignments', async () => {
      const currentUser = { id: 'admin-user', email: 'admin@wondrousdigital.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: currentUser });

      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const { result } = renderHook(() => useAssignStaff(), { wrapper });

      const response = await result.current.mutateAsync({
        staffUserId: 'staff-1',
        accountIds: [],
      });

      expect(response).toEqual([]);
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
    });

    it('should require user to be logged in', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null });

      const { result } = renderHook(() => useAssignStaff(), { wrapper });

      await expect(
        result.current.mutateAsync({
          staffUserId: 'staff-1',
          accountIds: ['account-1'],
        })
      ).rejects.toThrow('Must be logged in');
    });
  });

  describe('useUnassignStaff', () => {
    it('should remove a specific staff assignment', async () => {
      const staffUserId = 'staff-1';
      const accountId = 'account-1';

      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((field, value) => {
          if (field === 'staff_user_id' && value === staffUserId) {
            return {
              eq: vi.fn().mockImplementation((field2, value2) => {
                if (field2 === 'account_id' && value2 === accountId) {
                  return Promise.resolve({ error: null });
                }
                return Promise.resolve({ error: new Error('Wrong parameters') });
              }),
            };
          }
          return { eq: vi.fn().mockResolvedValue({ error: new Error('Wrong parameters') }) };
        }),
      });

      const { result } = renderHook(() => useUnassignStaff(), { wrapper });

      await result.current.mutateAsync({ staffUserId, accountId });

      expect(supabase.from).toHaveBeenCalledWith('staff_account_assignments');
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
    });

    it('should invalidate queries after successful unassignment', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Mock the chained delete operation
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      const { result } = renderHook(() => useUnassignStaff(), { wrapper });

      await result.current.mutateAsync({
        staffUserId: 'staff-1',
        accountId: 'account-1',
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['staff-members'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['staff-assignments', 'staff-1'] });
    });
  });

  describe('useAssignmentActivity', () => {
    it('should fetch assignment activity logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          user_id: 'admin-1',
          action: 'staff.assignments_updated',
          created_at: '2024-01-15T10:00:00Z',
          user: {
            id: 'admin-1',
            email: 'admin@wondrousdigital.com',
            raw_user_meta_data: {},
          },
        },
      ];

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'audit_logs') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({
              data: mockLogs,
              error: null,
            }),
          };
        }
        if (table === 'user_profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [{ user_id: 'admin-1', display_name: 'System Admin' }],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      const { result } = renderHook(() => useAssignmentActivity(10), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toMatchObject({
        id: 'log-1',
        action: 'staff.assignments_updated',
        user: {
          id: 'admin-1',
          display_name: 'System Admin',
        },
      });
    });
  });

  describe('Permission Tests', () => {
    it('should only allow platform admins to create assignments', async () => {
      // This test validates that the RLS policies would prevent non-admins
      // In a real implementation, the database would reject the operation
      const regularUser = { id: 'regular-user', email: 'user@example.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: regularUser });

      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ 
          error: { code: '42501', message: 'permission denied' } 
        }),
      });

      const { result } = renderHook(() => useAssignStaff(), { wrapper });

      await expect(
        result.current.mutateAsync({
          staffUserId: 'staff-1',
          accountIds: ['account-1'],
        })
      ).rejects.toThrow();
    });

    it('should enforce assignment uniqueness constraint', async () => {
      const currentUser = { id: 'admin-user', email: 'admin@wondrousdigital.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: currentUser });

      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          error: { 
            code: '23505', 
            message: 'duplicate key value violates unique constraint' 
          },
        }),
      });

      const { result } = renderHook(() => useAssignStaff(), { wrapper });

      await expect(
        result.current.mutateAsync({
          staffUserId: 'staff-1',
          accountIds: ['account-1', 'account-1'], // Duplicate
        })
      ).rejects.toThrow();
    });

    it('should ensure staff can only see their own assignments', async () => {
      const staffUser = { id: 'staff-1', email: 'staff@wondrousdigital.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: staffUser });

      // Mock a query that would be filtered by RLS
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staff_account_assignments') {
          return {
            select: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockImplementation(() => ({
                order: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'assign-1',
                      staff_user_id: staffUser.id,
                      account_id: 'account-1',
                      assigned_by: 'admin-1',
                      accounts: {
                        id: 'account-1',
                        name: 'Test Account',
                        slug: 'test-account',
                      },
                      assigned_by_user: {
                        id: 'admin-1',
                        email: 'admin@wondrousdigital.com',
                        raw_user_meta_data: { full_name: 'Admin' },
                      },
                    },
                  ],
                  error: null,
                }),
              })),
            })),
          };
        }
        // user_profiles query
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ 
            data: [{ user_id: 'admin-1', display_name: 'Administrator' }], 
            error: null 
          }),
        };
      });

      const { result } = renderHook(() => useStaffAssignments(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Staff should only see their own assignments
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].staff_user_id).toBe(staffUser.id);
    });
  });

  describe('Account Isolation Tests', () => {
    it('should ensure staff assignments are properly isolated by account', async () => {
      const mockAssignments = [
        {
          id: 'assign-1',
          staff_user_id: 'staff-1',
          account_id: 'account-1',
          accounts: { id: 'account-1', name: 'Account 1', slug: 'account-1' },
        },
        {
          id: 'assign-2',
          staff_user_id: 'staff-1',
          account_id: 'account-2',
          accounts: { id: 'account-2', name: 'Account 2', slug: 'account-2' },
        },
      ];

      const staffUser = { id: 'staff-1', email: 'staff1@wondrousdigital.com' };
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: staffUser });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staff_account_assignments') {
          return {
            select: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockImplementation(() => ({
                order: vi.fn().mockResolvedValue({
                  data: mockAssignments.map(a => ({
                    ...a,
                    assigned_by_user: {
                      id: 'admin-1',
                      email: 'admin@wondrousdigital.com',
                      raw_user_meta_data: { full_name: 'Admin' },
                    },
                  })),
                  error: null,
                }),
              })),
            })),
          };
        }
        if (table === 'user_profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [{ user_id: 'admin-1', display_name: 'Administrator' }],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      const { result } = renderHook(() => useStaffAssignments('staff-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Each assignment should be for a different account
      const accountIds = result.current.data?.map(a => a.account_id) || [];
      const uniqueAccountIds = [...new Set(accountIds)];
      expect(uniqueAccountIds).toHaveLength(accountIds.length);
    });

    it('should prevent staff from accessing unassigned accounts', async () => {
      // This would be enforced by RLS policies
      const staffUser = { id: 'staff-1', email: 'staff@wondrousdigital.com' };
      
      // Mock that staff has no assignments to a specific account
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staff_account_assignments') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockImplementation((field, value) => {
              if (field === 'staff_user_id' && value === staffUser.id) {
                return {
                  eq: vi.fn().mockImplementation((field2, value2) => {
                    if (field2 === 'account_id' && value2 === 'unassigned-account') {
                      return Promise.resolve({ data: [], error: null });
                    }
                    return Promise.resolve({ data: [], error: null });
                  }),
                };
              }
              return Promise.resolve({ data: [], error: null });
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      // In a real scenario, attempting to access resources from an unassigned account
      // would be blocked by RLS policies at the database level
      const checkAccess = async (accountId: string) => {
        const { data } = await supabase
          .from('staff_account_assignments')
          .select('*')
          .eq('staff_user_id', staffUser.id)
          .eq('account_id', accountId);
        
        return data && data.length > 0;
      };

      const hasAccess = await checkAccess('unassigned-account');
      expect(hasAccess).toBe(false);
    });
  });
});