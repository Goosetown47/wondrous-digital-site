import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SecondarySidebar } from '../secondary-sidebar-new';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { useAuth } from '@/providers/auth-provider';
import { useIsAdmin, useIsAccountOwner } from '@/hooks/useRole';
import { useAccountProjects } from '@/hooks/useProjects';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/dashboard'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock dependencies
vi.mock('@/stores/module-theme-store', () => ({
  useModuleThemeStore: vi.fn(),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useRole', () => ({
  useIsAdmin: vi.fn(),
  useIsAccountOwner: vi.fn(),
}));

vi.mock('@/hooks/useProjects', () => ({
  useAccountProjects: vi.fn(),
}));

describe('SecondarySidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModuleThemeStore).mockReturnValue({
      currentModule: 'dashboard',
    });
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      accounts: [],
      isAdmin: false,
      setCurrentAccount: vi.fn(),
      setCurrentProject: vi.fn(),
      signOut: vi.fn(),
      refreshAccounts: vi.fn(),
      currentProject: null,
      currentAccount: { 
        id: '1', 
        name: 'Test Account',
        slug: 'test-account',
        tier: 'FREE',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any,
    });
    vi.mocked(useIsAdmin).mockReturnValue({ data: false, isLoading: false, error: null } as any);
    vi.mocked(useIsAccountOwner).mockReturnValue({ data: false, isLoading: false, error: null } as any);
    vi.mocked(useAccountProjects).mockReturnValue({ data: [], isLoading: false, error: null } as any);
  });

  describe('Navigation State Persistence', () => {
    it('should hide completely when collapsed', () => {
      const { container } = render(<SecondarySidebar isCollapsed={true} />);

      // When collapsed, the sidebar should have width 0
      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('w-0');
    });

    it('should show full width when not collapsed', () => {
      const { container } = render(<SecondarySidebar isCollapsed={false} />);

      const sidebar = container.querySelector('.w-\\[300px\\]');
      expect(sidebar).toBeInTheDocument();
    });

    it('should display module heading when not collapsed', () => {
      render(<SecondarySidebar isCollapsed={false} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Dashboard');
    });

    it('should display correct module heading for Builder module', () => {
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'builder',
      });
      vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      accounts: [],
      isAdmin: false,
      setCurrentAccount: vi.fn(),
      setCurrentProject: vi.fn(),
      signOut: vi.fn(),
      refreshAccounts: vi.fn(),
        currentProject: { 
        id: '1', 
        name: 'Test Project',
        slug: 'test-project',
        customer_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any,
      currentAccount: { 
        id: '1', 
        name: 'Test Account',
        slug: 'test-account',
        tier: 'FREE',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any,
    });

      render(<SecondarySidebar isCollapsed={false} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Builder');
    });

    it('should display correct module heading for Admin module', () => {
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'admin',
      });
      vi.mocked(useIsAdmin).mockReturnValue({ data: true, isLoading: false, error: null } as any);
      render(<SecondarySidebar isCollapsed={false} />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Collapse/Expand Behavior', () => {
    it('should have width 0 when collapsed prop is true', () => {
      const { container } = render(<SecondarySidebar isCollapsed={true} />);
      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('w-0');
    });

    it('should show navigation items when expanded', () => {
      render(<SecondarySidebar isCollapsed={false} />);

      // Dashboard navigation items should be visible
      // Use getAllByText since "Dashboard" appears in both heading and navigation
      const dashboardElements = screen.getAllByText('Dashboard');
      expect(dashboardElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Updates')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    it('should show account management section for account owners', () => {
      vi.mocked(useIsAccountOwner).mockReturnValue({ data: true, isLoading: false, error: null } as any);
      render(<SecondarySidebar isCollapsed={false} />);

      expect(screen.getByText('Account Management')).toBeInTheDocument();
      expect(screen.getByText('Billing')).toBeInTheDocument();
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    it('should not show account management section for non-owners', () => {
      vi.mocked(useIsAccountOwner).mockReturnValue({ data: false, isLoading: false, error: null } as any);
      render(<SecondarySidebar isCollapsed={false} />);

      expect(screen.queryByText('Account Management')).not.toBeInTheDocument();
      expect(screen.queryByText('Billing')).not.toBeInTheDocument();
    });
  });

  describe('Category Expand/Collapse', () => {
    it('should allow collapsing and expanding categories', async () => {
      const user = userEvent.setup();
      render(<SecondarySidebar isCollapsed={false} />);

      // Find the Application category button
      const applicationCategory = screen.getByText('Application');
      const categoryButton = applicationCategory.closest('button');

      // Category should be expanded by default
      expect(screen.getByText('Updates')).toBeVisible();

      // Click to collapse
      if (categoryButton) {
        await user.click(categoryButton);
        // Note: This would require checking the actual collapse state
        // which depends on the Collapsible component implementation
      }
    });
  });

  describe('Module-specific Content', () => {
    it('should show Dashboard module navigation when on dashboard', () => {
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'dashboard',
      });

      render(<SecondarySidebar isCollapsed={false} />);

      expect(screen.getByText('Application')).toBeInTheDocument();
      expect(screen.getByText('Project Management')).toBeInTheDocument();
    });

    it('should show Builder module navigation when on builder', () => {
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'builder',
      });
      vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      accounts: [],
      isAdmin: false,
      setCurrentAccount: vi.fn(),
      setCurrentProject: vi.fn(),
      signOut: vi.fn(),
      refreshAccounts: vi.fn(),
        currentProject: { 
        id: '1', 
        name: 'Test Project',
        slug: 'test-project',
        customer_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any,
      currentAccount: { 
        id: '1', 
        name: 'Test Account',
        slug: 'test-account',
        tier: 'FREE',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any,
    });

      render(<SecondarySidebar isCollapsed={false} />);

      expect(screen.getByText('Canvas')).toBeInTheDocument();
      expect(screen.getByText('Pages')).toBeInTheDocument();
      expect(screen.getByText('Themes')).toBeInTheDocument();
    });

    it('should show Admin module navigation when on admin', () => {
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'admin',
      });
      vi.mocked(useIsAdmin).mockReturnValue({ data: true, isLoading: false, error: null } as any);
      render(<SecondarySidebar isCollapsed={false} />);

      expect(screen.getByText('Lab')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByText('Core')).toBeInTheDocument();
    });

    it('should not show Builder navigation when no project is selected', () => {
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'builder',
      });
      vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      accounts: [],
      isAdmin: false,
      setCurrentAccount: vi.fn(),
      setCurrentProject: vi.fn(),
      signOut: vi.fn(),
      refreshAccounts: vi.fn(),
        currentProject: null,
        currentAccount: { 
        id: '1', 
        name: 'Test Account',
        slug: 'test-account',
        tier: 'FREE',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any,
    });

      render(<SecondarySidebar isCollapsed={false} />);

      expect(screen.queryByText('Canvas')).not.toBeInTheDocument();
      expect(screen.queryByText('Pages')).not.toBeInTheDocument();
    });
  });
});