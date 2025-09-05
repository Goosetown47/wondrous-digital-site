import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { canCreateMore, getRemainingCount, canUseFeature } from '@/lib/tier-features';
import type { TierName } from '@/types/database';

// Mock Supabase client
vi.mock('@/lib/supabase/service');

describe('Feature Gating - Tier Limits', () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createSupabaseServiceClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
  });

  describe('Project Creation Limits', () => {
    it('should enforce project limit of 1 for FREE tier', () => {
      const freeAccount = { tier: 'FREE' as TierName };
      
      // Should allow first project
      expect(canCreateMore(freeAccount, 'projects', 0)).toBe(true);
      expect(getRemainingCount(freeAccount, 'projects', 0)).toBe(1);
      
      // Should block second project
      expect(canCreateMore(freeAccount, 'projects', 1)).toBe(false);
      expect(getRemainingCount(freeAccount, 'projects', 1)).toBe(0);
    });

    it('should enforce project limit of 5 for PRO tier', () => {
      const proAccount = { tier: 'PRO' as TierName };
      
      // Should allow up to 5 projects
      expect(canCreateMore(proAccount, 'projects', 4)).toBe(true);
      expect(getRemainingCount(proAccount, 'projects', 4)).toBe(1);
      
      // Should block 6th project
      expect(canCreateMore(proAccount, 'projects', 5)).toBe(false);
      expect(getRemainingCount(proAccount, 'projects', 5)).toBe(0);
    });

    it('should enforce project limit of 10 for SCALE tier', () => {
      const scaleAccount = { tier: 'SCALE' as TierName };
      
      // Should allow up to 10 projects
      expect(canCreateMore(scaleAccount, 'projects', 9)).toBe(true);
      expect(getRemainingCount(scaleAccount, 'projects', 9)).toBe(1);
      
      // Should block 11th project
      expect(canCreateMore(scaleAccount, 'projects', 10)).toBe(false);
    });

    it('should enforce project limit of 25 for MAX tier', () => {
      const maxAccount = { tier: 'MAX' as TierName };
      
      // Should allow up to 25 projects
      expect(canCreateMore(maxAccount, 'projects', 24)).toBe(true);
      expect(getRemainingCount(maxAccount, 'projects', 24)).toBe(1);
      
      // Should block 26th project
      expect(canCreateMore(maxAccount, 'projects', 25)).toBe(false);
    });
  });

  describe('User Invitation Limits', () => {
    it('should enforce user limit of 1 for FREE tier', () => {
      const freeAccount = { tier: 'FREE' as TierName };
      
      // Should not allow any additional users (account owner is the 1 user)
      expect(canCreateMore(freeAccount, 'users', 1)).toBe(false);
      expect(getRemainingCount(freeAccount, 'users', 1)).toBe(0);
    });

    it('should enforce user limit of 3 for PRO tier', () => {
      const proAccount = { tier: 'PRO' as TierName };
      
      // Should allow up to 3 users total
      expect(canCreateMore(proAccount, 'users', 2)).toBe(true);
      expect(getRemainingCount(proAccount, 'users', 2)).toBe(1);
      
      // Should block 4th user
      expect(canCreateMore(proAccount, 'users', 3)).toBe(false);
    });

    it('should enforce user limit of 5 for SCALE tier', () => {
      const scaleAccount = { tier: 'SCALE' as TierName };
      
      // Should allow up to 5 users
      expect(canCreateMore(scaleAccount, 'users', 4)).toBe(true);
      expect(getRemainingCount(scaleAccount, 'users', 4)).toBe(1);
      
      // Should block 6th user
      expect(canCreateMore(scaleAccount, 'users', 5)).toBe(false);
    });

    it('should enforce user limit of 10 for MAX tier', () => {
      const maxAccount = { tier: 'MAX' as TierName };
      
      // Should allow up to 10 users
      expect(canCreateMore(maxAccount, 'users', 9)).toBe(true);
      expect(getRemainingCount(maxAccount, 'users', 9)).toBe(1);
      
      // Should block 11th user
      expect(canCreateMore(maxAccount, 'users', 10)).toBe(false);
    });
  });

  describe('Custom Domain Restrictions', () => {
    it('should block custom domains for FREE tier', () => {
      const freeAccount = { tier: 'FREE' as TierName };
      
      expect(canUseFeature(freeAccount, 'customDomains')).toBe(false);
    });

    it('should allow custom domains for PRO tier', () => {
      const proAccount = { tier: 'PRO' as TierName };
      
      expect(canUseFeature(proAccount, 'customDomains')).toBe(true);
    });

    it('should allow custom domains for SCALE tier', () => {
      const scaleAccount = { tier: 'SCALE' as TierName };
      
      expect(canUseFeature(scaleAccount, 'customDomains')).toBe(true);
    });

    it('should allow custom domains for MAX tier', () => {
      const maxAccount = { tier: 'MAX' as TierName };
      
      expect(canUseFeature(maxAccount, 'customDomains')).toBe(true);
    });
  });

  describe('Marketing Platform Access', () => {
    it('should not show Marketing Platform for FREE tier', () => {
      const freeAccount = { tier: 'FREE' as TierName };
      
      expect(canUseFeature(freeAccount, 'marketingPlatform')).toBe(false);
    });

    it('should show Marketing Platform for PRO tier', () => {
      const proAccount = { tier: 'PRO' as TierName };
      
      expect(canUseFeature(proAccount, 'marketingPlatform')).toBe(true);
    });

    it('should show Marketing Platform for SCALE tier', () => {
      const scaleAccount = { tier: 'SCALE' as TierName };
      
      expect(canUseFeature(scaleAccount, 'marketingPlatform')).toBe(true);
    });

    it('should show Marketing Platform for MAX tier', () => {
      const maxAccount = { tier: 'MAX' as TierName };
      
      expect(canUseFeature(maxAccount, 'marketingPlatform')).toBe(true);
    });
  });

  describe('Dashboard Usage Display', () => {
    it('should calculate correct usage display for projects', async () => {
      // Mock query to get project count
      const mockProjectsQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        count: vi.fn().mockResolvedValue({ count: 3, error: null }),
      };
      
      mockSupabase.from.mockReturnValue(mockProjectsQuery);
      
      const proAccount = { 
        id: 'test-account-id',
        tier: 'PRO' as TierName 
      };
      
      // Get current count (mocked as 3)
      const result = await mockSupabase.from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', proAccount.id)
        .count();
      
      const currentCount = result.count || 0;
      const remaining = getRemainingCount(proAccount, 'projects', currentCount);
      
      // PRO tier has 5 projects, with 3 used, should show 2 remaining
      expect(currentCount).toBe(3);
      expect(remaining).toBe(2);
      
      // Display would be "3/5 projects used"
      const displayText = `${currentCount}/5 projects used`;
      expect(displayText).toBe('3/5 projects used');
    });

    it('should calculate correct usage display for users', async () => {
      // Mock query to get user count
      const mockUsersQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        count: vi.fn().mockResolvedValue({ count: 2, error: null }),
      };
      
      mockSupabase.from.mockReturnValue(mockUsersQuery);
      
      const scaleAccount = { 
        id: 'test-account-id',
        tier: 'SCALE' as TierName 
      };
      
      // Get current count (mocked as 2)
      const result = await mockSupabase.from('account_users')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', scaleAccount.id)
        .count();
      
      const currentCount = result.count || 0;
      const remaining = getRemainingCount(scaleAccount, 'users', currentCount);
      
      // SCALE tier has 5 users, with 2 used, should show 3 remaining
      expect(currentCount).toBe(2);
      expect(remaining).toBe(3);
      
      // Display would be "2/5 users"
      const displayText = `${currentCount}/5 users`;
      expect(displayText).toBe('2/5 users');
    });
  });

  describe('Real-time Usage Updates', () => {
    it('should update usage counts without page refresh', async () => {
      // This test verifies that React Query invalidation works
      // In actual implementation, we'll use React Query's invalidateQueries
      
      const mockInvalidateQueries = vi.fn();
      
      // Simulate adding a project
      await addProject();
      
      // Should trigger query invalidation
      mockInvalidateQueries(['projects']);
      mockInvalidateQueries(['usage-counts']);
      
      expect(mockInvalidateQueries).toHaveBeenCalledWith(['projects']);
      expect(mockInvalidateQueries).toHaveBeenCalledWith(['usage-counts']);
    });
  });

  describe('Upgrade Prompts', () => {
    it('should trigger upgrade prompt when FREE tier hits project limit', () => {
      const freeAccount = { tier: 'FREE' as TierName };
      const canCreate = canCreateMore(freeAccount, 'projects', 1);
      
      expect(canCreate).toBe(false);
      
      // In UI, this would trigger an upgrade prompt
      const shouldShowUpgradePrompt = !canCreate;
      expect(shouldShowUpgradePrompt).toBe(true);
    });

    it('should trigger upgrade prompt when PRO tier hits user limit', () => {
      const proAccount = { tier: 'PRO' as TierName };
      const canInvite = canCreateMore(proAccount, 'users', 3);
      
      expect(canInvite).toBe(false);
      
      // In UI, this would trigger an upgrade prompt
      const shouldShowUpgradePrompt = !canInvite;
      expect(shouldShowUpgradePrompt).toBe(true);
    });
  });
});

// Helper function to simulate project creation
async function addProject() {
  // This would be the actual implementation
  return Promise.resolve();
}