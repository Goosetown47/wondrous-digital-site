import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hasPermission, isAdmin, isStaff, getUserRole } from '../index';
import { createTestScenario, PLATFORM_ACCOUNT_ID } from '@/test/utils/auth-mocks';
import { createMockSupabaseClient } from '@/test/utils/supabase-mocks';

describe('Permission System', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
  });

  describe('isAdmin', () => {
    it('should return true for platform admin', async () => {
      const { user } = createTestScenario('platformAdmin');
      
      // Mock the query response
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ role: 'admin' }],
          error: null
        })
      });

      const result = await isAdmin(user.id, mockSupabase);
      expect(result).toBe(true);
    });

    it('should return false for non-admin users', async () => {
      const { user } = createTestScenario('regularUser');
      
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      const result = await isAdmin(user.id, mockSupabase);
      expect(result).toBe(false);
    });
  });

  describe('isStaff', () => {
    it('should return true for staff members', async () => {
      const { user } = createTestScenario('platformStaff');
      
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ role: 'staff' }],
          error: null
        })
      });

      const result = await isStaff(user.id, mockSupabase);
      expect(result).toBe(true);
    });

    it('should return true for admins (who are also staff)', async () => {
      const { user } = createTestScenario('platformAdmin');
      
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ role: 'admin' }],
          error: null
        })
      });

      const result = await isStaff(user.id, mockSupabase);
      expect(result).toBe(true);
    });
  });

  describe('getUserRole', () => {
    it('should return highest role for user', async () => {
      const { user } = createTestScenario('platformAdmin');
      
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [{ role: 'admin' }, { role: 'user' }],
          error: null
        })
      });

      const result = await getUserRole(user.id, mockSupabase);
      expect(result).toBe('admin');
    });

    it('should return null for user with no roles', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      const result = await getUserRole('unknown-user', mockSupabase);
      expect(result).toBe(null);
    });
  });

  describe('hasPermission', () => {
    it('should grant all permissions to platform admin', async () => {
      const adminScenario = createTestScenario('platformAdmin');
      
      // First check will call isAdmin which returns true
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ role: 'admin' }],
          error: null
        })
      });

      const result = await hasPermission(
        adminScenario.user.id,
        adminScenario.account.id,
        'any.permission',
        mockSupabase
      );
      expect(result).toBe(true);
    });

    it('should check role permissions for non-admin users', async () => {
      const userScenario = createTestScenario('regularUser');
      
      // First check isAdmin - returns false
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      // Then check user permissions
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            role: 'user',
            roles: {
              permissions: ['projects.read', 'projects.use']
            }
          },
          error: null
        })
      });

      const result = await hasPermission(
        userScenario.user.id,
        userScenario.account.id,
        'projects.read',
        mockSupabase
      );
      expect(result).toBe(true);
    });

    it('should deny permission when user lacks it', async () => {
      const userScenario = createTestScenario('regularUser');
      
      // First check isAdmin - returns false
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      // Then check user permissions
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            role: 'user',
            roles: {
              permissions: ['projects.read', 'projects.use']
            }
          },
          error: null
        })
      });

      const result = await hasPermission(
        userScenario.user.id,
        userScenario.account.id,
        'projects.delete',
        mockSupabase
      );
      expect(result).toBe(false);
    });

    it('should return false for users not in the account', async () => {
      const userScenario = createTestScenario('regularUser');
      const otherAccount = createTestScenario('otherAccountUser').account;
      
      // First check isAdmin - returns false
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      });

      // User not found in the other account
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      });

      const result = await hasPermission(
        userScenario.user.id,
        otherAccount.id,
        'projects.read',
        mockSupabase
      );
      expect(result).toBe(false);
    });
  });

  describe('Cross-Account Isolation', () => {
    it('should only allow platform roles in platform account', async () => {
      const adminScenario = createTestScenario('platformAdmin');
      const staffScenario = createTestScenario('platformStaff');
      
      // Platform roles should only exist in platform account
      expect(adminScenario.accountUser.account_id).toBe(PLATFORM_ACCOUNT_ID);
      expect(staffScenario.accountUser.account_id).toBe(PLATFORM_ACCOUNT_ID);
      
      // Regular account roles should not be in platform account
      const ownerScenario = createTestScenario('accountOwner');
      const userScenario = createTestScenario('regularUser');
      
      expect(ownerScenario.accountUser.account_id).not.toBe(PLATFORM_ACCOUNT_ID);
      expect(userScenario.accountUser.account_id).not.toBe(PLATFORM_ACCOUNT_ID);
    });
  });
});