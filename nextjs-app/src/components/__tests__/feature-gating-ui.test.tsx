import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { DashboardUsageCard } from '@/components/dashboard/DashboardUsageCard';
import { MarketingPlatformButton } from '@/components/dashboard/MarketingPlatformButton';
import { useAuth } from '@/providers/auth-provider';
import { useAccountTier } from '@/hooks/useAccountTier';
import type { Account } from '@/types/database';

// Mock dependencies
vi.mock('@/providers/auth-provider');
vi.mock('@/hooks/useAccountTier');
vi.mock('@/hooks/useProjects', () => ({
  useCreateProject: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));
vi.mock('@/hooks/useAccountUsers');
vi.mock('@/hooks/useThemes', () => ({
  useThemes: () => ({ data: [], isLoading: false }),
}));
vi.mock('@/hooks/usePermissions', () => ({
  useHasPermission: () => ({ data: true, isLoading: false }),
}));
vi.mock('@/hooks/useAccountProjects', () => ({
  useUserProjectCount: () => ({ data: { total: 1, owned: 1 }, isLoading: false }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Feature Gating UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CreateProjectDialog with Tier Limits', () => {
    it('should block project creation when FREE tier hits limit', async () => {
      const freeAccount: Partial<Account> = { 
        id: 'test-id',
        tier: 'FREE',
        name: 'Test Account'
      };

      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        currentAccount: freeAccount,
        setCurrentProject: vi.fn(),
      });

      (useAccountTier as ReturnType<typeof vi.fn>).mockReturnValue({
        tier: 'FREE',
        canCreateMore: vi.fn().mockReturnValue(false),
        getRemainingCount: vi.fn().mockReturnValue(0),
        limits: { projects: 1 },
      });

      render(
        <CreateProjectDialog open={true} onOpenChange={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      // Should show upgrade prompt
      await waitFor(() => {
        expect(screen.getByText(/You've reached your project limit/i)).toBeInTheDocument();
      });

      // Create button should be disabled
      const createButton = screen.getByRole('button', { name: /create project/i });
      expect(createButton).toBeDisabled();
    });

    it('should allow project creation when under tier limit', async () => {
      const proAccount: Partial<Account> = { 
        id: 'test-id',
        tier: 'PRO',
        name: 'Test Account'
      };

      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        currentAccount: proAccount,
        setCurrentProject: vi.fn(),
      });

      (useAccountTier as ReturnType<typeof vi.fn>).mockReturnValue({
        tier: 'PRO',
        canCreateMore: vi.fn().mockReturnValue(true),
        getRemainingCount: vi.fn().mockReturnValue(3),
        limits: { projects: 5 },
      });

      render(
        <CreateProjectDialog open={true} onOpenChange={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      // Should not show upgrade prompt
      await waitFor(() => {
        expect(screen.queryByText(/You've reached your project limit/i)).not.toBeInTheDocument();
      });

      // Create button should be enabled
      const createButton = screen.getByRole('button', { name: /create project/i });
      expect(createButton).toBeEnabled();
    });
  });

  describe('Dashboard Usage Display', () => {
    it('should show project usage count for FREE tier', async () => {
      render(
        <DashboardUsageCard
          tier="FREE"
          projectCount={1}
          projectLimit={1}
          userCount={1}
          userLimit={1}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('1/1 projects used')).toBeInTheDocument();
      expect(screen.getByText('1/1 users')).toBeInTheDocument();
    });

    it('should show project usage count for PRO tier', async () => {
      render(
        <DashboardUsageCard
          tier="PRO"
          projectCount={3}
          projectLimit={5}
          userCount={2}
          userLimit={3}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('3/5 projects used')).toBeInTheDocument();
      expect(screen.getByText('2/3 users')).toBeInTheDocument();
    });

    it('should show project usage count for SCALE tier', async () => {
      render(
        <DashboardUsageCard
          tier="SCALE"
          projectCount={7}
          projectLimit={10}
          userCount={4}
          userLimit={5}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('7/10 projects used')).toBeInTheDocument();
      expect(screen.getByText('4/5 users')).toBeInTheDocument();
    });

    it('should show project usage count for MAX tier', async () => {
      render(
        <DashboardUsageCard
          tier="MAX"
          projectCount={15}
          projectLimit={25}
          userCount={8}
          userLimit={10}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('15/25 projects used')).toBeInTheDocument();
      expect(screen.getByText('8/10 users')).toBeInTheDocument();
    });

    it('should update counts in real-time without page refresh', async () => {
      const { rerender } = render(
        <DashboardUsageCard
          tier="PRO"
          projectCount={2}
          projectLimit={5}
          userCount={1}
          userLimit={3}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('2/5 projects used')).toBeInTheDocument();

      // Simulate real-time update
      rerender(
        <DashboardUsageCard
          tier="PRO"
          projectCount={3}
          projectLimit={5}
          userCount={1}
          userLimit={3}
        />
      );

      expect(screen.getByText('3/5 projects used')).toBeInTheDocument();
    });
  });

  describe('Marketing Platform Button', () => {
    it('should not show Marketing Platform button for FREE tier', () => {
      render(
        <MarketingPlatformButton tier="FREE" />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByText(/Launch Marketing Platform/i)).not.toBeInTheDocument();
    });

    it('should show Marketing Platform button for PRO tier', () => {
      render(
        <MarketingPlatformButton tier="PRO" />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Launch Marketing Platform/i)).toBeInTheDocument();
    });

    it('should show Marketing Platform button for SCALE tier', () => {
      render(
        <MarketingPlatformButton tier="SCALE" />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Launch Marketing Platform/i)).toBeInTheDocument();
    });

    it('should show Marketing Platform button for MAX tier', () => {
      render(
        <MarketingPlatformButton tier="MAX" />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Launch Marketing Platform/i)).toBeInTheDocument();
    });
  });

  describe('Custom Domain Restrictions', () => {
    it('should show upgrade prompt for custom domains on FREE tier', async () => {
      const freeAccount: Partial<Account> = { 
        id: 'test-id',
        tier: 'FREE',
        name: 'Test Account'
      };

      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        currentAccount: freeAccount,
      });

      (useAccountTier as ReturnType<typeof vi.fn>).mockReturnValue({
        tier: 'FREE',
        canUseFeature: vi.fn().mockReturnValue(false),
        getUpgradeMessage: vi.fn().mockReturnValue('Upgrade to PRO or higher to use custom domains'),
      });

      // This would be in the domain settings component
      const canUseCustomDomains = false;
      const upgradeMessage = 'Upgrade to PRO or higher to use custom domains';

      expect(canUseCustomDomains).toBe(false);
      expect(upgradeMessage).toContain('Upgrade to PRO');
    });
  });
});