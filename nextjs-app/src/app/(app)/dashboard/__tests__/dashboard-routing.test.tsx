import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock auth provider
vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', email: 'test@example.com' },
    currentAccount: { id: '1', name: 'Test Account' },
    currentProject: null,
  })),
}));

// Mock role hooks
vi.mock('@/hooks/useRole', () => ({
  useIsAdmin: vi.fn(() => ({ data: false })),
  useIsAccountOwner: vi.fn(() => ({ data: true })),
  useAccountRole: vi.fn(() => ({ data: 'owner' })),
}));

// Mock other hooks
vi.mock('@/hooks/useAccountTier', () => ({
  useAccountTier: vi.fn(() => ({ 
    tier: 'starter', 
    limits: {}, 
    isUnlocked: true 
  })),
}));

vi.mock('@/hooks/useProjects', () => ({
  useUserProjectCount: vi.fn(() => ({ data: 0 })),
  useProjectStats: vi.fn(() => ({ data: [] })),
}));

describe('Dashboard Module Routing', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>);
  });

  describe('Page Routes', () => {
    it('should have main dashboard page at /dashboard', async () => {
      const DashboardPage = await import('../page').then(m => m.default);
      expect(DashboardPage).toBeDefined();
      expect(typeof DashboardPage).toBe('function');
    });

    it('should have updates page at /dashboard/updates', async () => {
      const UpdatesPage = await import('../updates/page').then(m => m.default);
      expect(UpdatesPage).toBeDefined();
      expect(typeof UpdatesPage).toBe('function');
    });

    it('should have tasks page at /dashboard/tasks', async () => {
      const TasksPage = await import('../tasks/page').then(m => m.default);
      expect(TasksPage).toBeDefined();
      expect(typeof TasksPage).toBe('function');
    });

    it('should have archived projects page at /dashboard/archived-projects', async () => {
      const ArchivedPage = await import('../archived-projects/page').then(m => m.default);
      expect(ArchivedPage).toBeDefined();
      expect(typeof ArchivedPage).toBe('function');
    });

    it('should have billing page at /dashboard/billing', async () => {
      const BillingPage = await import('../billing/page').then(m => m.default);
      expect(BillingPage).toBeDefined();
      expect(typeof BillingPage).toBe('function');
    });

    it('should have account settings page at /dashboard/account-settings', async () => {
      const AccountSettingsPage = await import('../account-settings/page').then(m => m.default);
      expect(AccountSettingsPage).toBeDefined();
      expect(typeof AccountSettingsPage).toBe('function');
    });

    it('should have team members page at /dashboard/team-members', async () => {
      const TeamMembersPage = await import('../team-members/page').then(m => m.default);
      expect(TeamMembersPage).toBeDefined();
      expect(typeof TeamMembersPage).toBe('function');
    });
  });
});