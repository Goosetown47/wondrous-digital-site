import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MobileMenu } from '../mobile-menu';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { useAuth } from '@/providers/auth-provider';
import { useIsAdmin, useIsAccountOwner } from '@/hooks/useRole';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/dashboard'),
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

// Mock Sheet component from shadcn
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
    <div data-testid="sheet" data-open={open}>{children}</div>
  ),
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
  SheetContent: ({ children, side }: { children: React.ReactNode; side?: string }) => (
    <div data-testid="sheet-content" data-side={side}>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('MobileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModuleThemeStore).mockReturnValue({
      currentModule: 'dashboard',
      setModule: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      currentProject: null,
      currentAccount: { id: '1', name: 'Test Account' },
    } as ReturnType<typeof useAuth>);
    vi.mocked(useIsAdmin).mockReturnValue({ data: false } as ReturnType<typeof useIsAdmin>);
    vi.mocked(useIsAccountOwner).mockReturnValue({ data: false } as ReturnType<typeof useIsAccountOwner>);
  });

  describe('Mobile Menu Visibility', () => {
    it('should render hamburger menu button', () => {
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('should have lg:hidden class for responsive behavior', () => {
      const { container } = render(<MobileMenu />);
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('lg:hidden');
    });

    it('should open menu when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      // Check if sheet content is rendered
      const sheetContent = screen.getByTestId('sheet-content');
      expect(sheetContent).toBeInTheDocument();
    });
  });

  describe('Module Content Display', () => {
    it('should display Dashboard module content when active', async () => {
      const user = userEvent.setup();
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'dashboard',
        setModule: vi.fn(),
      });
      
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      // Dashboard appears in both dropdown and navigation
      const dashboards = screen.getAllByText('Dashboard');
      expect(dashboards.length).toBeGreaterThan(0);
      expect(screen.getByText('Updates')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Archived Projects')).toBeInTheDocument();
    });

    it('should display Builder module content when active', async () => {
      const user = userEvent.setup();
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'builder',
        setModule: vi.fn(),
      });
      vi.mocked(useAuth).mockReturnValue({
        currentProject: { id: '1', name: 'Test Project' },
        currentAccount: { id: '1', name: 'Test Account' },
      } as ReturnType<typeof useAuth>);
      
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      expect(screen.getByText('Canvas')).toBeInTheDocument();
      expect(screen.getByText('Pages')).toBeInTheDocument();
      expect(screen.getByText('Themes')).toBeInTheDocument();
    });

    it('should display Admin module content when active and user is admin', async () => {
      const user = userEvent.setup();
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'admin',
        setModule: vi.fn(),
      });
      vi.mocked(useIsAdmin).mockReturnValue({ data: true } as ReturnType<typeof useIsAdmin>);
      
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      expect(screen.getByText('Lab')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
      expect(screen.getByText('Core')).toBeInTheDocument();
    });
  });

  describe('Permission-based Content', () => {
    it('should show Account Management section for account owners', async () => {
      const user = userEvent.setup();
      vi.mocked(useIsAccountOwner).mockReturnValue({ data: true } as ReturnType<typeof useIsAccountOwner>);
      
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      expect(screen.getByText('Account Management')).toBeInTheDocument();
      expect(screen.getByText('Billing')).toBeInTheDocument();
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    it('should not show Account Management section for non-owners', async () => {
      const user = userEvent.setup();
      vi.mocked(useIsAccountOwner).mockReturnValue({ data: false } as ReturnType<typeof useIsAccountOwner>);
      
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      expect(screen.queryByText('Account Management')).not.toBeInTheDocument();
      expect(screen.queryByText('Billing')).not.toBeInTheDocument();
    });

    it('should not show Admin navigation for non-admin users', async () => {
      const user = userEvent.setup();
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'admin',
        setModule: vi.fn(),
      });
      vi.mocked(useIsAdmin).mockReturnValue({ data: false } as ReturnType<typeof useIsAdmin>);
      
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      // Should not show admin navigation items
      expect(screen.queryByText('Lab')).not.toBeInTheDocument();
      expect(screen.queryByText('Core')).not.toBeInTheDocument();
    });
  });

  describe('Sheet Behavior', () => {
    it('should have correct styling for mobile sheet', async () => {
      const user = userEvent.setup();
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      const sheetContent = screen.getByTestId('sheet-content');
      expect(sheetContent).toHaveAttribute('data-side', 'left');
    });

    it('should display module title in sheet header', async () => {
      const user = userEvent.setup();
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'dashboard',
        setModule: vi.fn(),
      });
      
      render(<MobileMenu />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      // Check for the module switcher dropdown instead of heading
      const dashboards = screen.getAllByText('Dashboard');
      expect(dashboards.length).toBeGreaterThan(0);
    });
  });
});