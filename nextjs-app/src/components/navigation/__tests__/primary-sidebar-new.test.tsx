import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { PrimarySidebar } from '../primary-sidebar-new';
import { useRouter } from 'next/navigation';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/providers/auth-provider';

// Setup ResizeObserver polyfill for tests
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/dashboard'),
}));

vi.mock('@/hooks/useRole', () => ({
  useAccountRole: vi.fn(() => ({ data: 'admin' })),
}));

vi.mock('@/stores/module-theme-store', () => ({
  useModuleThemeStore: vi.fn(),
}));

vi.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: vi.fn(),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => (
    <img src={src} alt={alt} width={width} height={height} className={className} />
  ),
}));

describe('PrimarySidebar', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const mockSetModule = vi.fn();
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useModuleThemeStore).mockReturnValue({
      currentModule: 'dashboard',
      setModule: mockSetModule,
    });
    vi.mocked(useUserProfile).mockReturnValue({
      data: {
        display_name: 'John Doe',
        avatar_url: null,
      },
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    vi.mocked(useAuth).mockReturnValue({
      signOut: mockSignOut,
      user: null,
      loading: false,
      accounts: [],
      isAdmin: false,
      currentAccount: null,
      setCurrentAccount: vi.fn(),
      currentProject: null,
      setCurrentProject: vi.fn(),
      refreshAccounts: vi.fn(),
    });
  });

  describe('Module Icon Tooltips', () => {
    it('should render Dashboard module button', () => {
      render(<PrimarySidebar isAdmin={true} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toBeInTheDocument();
      // Dashboard button should exist
    });

    it('should render Builder module button', () => {
      render(<PrimarySidebar isAdmin={true} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[1]).toBeInTheDocument();
      // Builder button should exist
    });

    it('should render Admin module button when user is admin', () => {
      render(<PrimarySidebar isAdmin={true} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[2]).toBeInTheDocument();
      // Admin button should exist
    });

    it('should not show Admin module when user is not admin', () => {
      render(<PrimarySidebar isAdmin={false} />);
      
      const buttons = screen.getAllByRole('button');
      // Should have Dashboard, Builder, Help, Profile - but not Admin
      expect(buttons.length).toBeLessThan(5);
    });
  });

  describe('Module Switching', () => {
    it('should switch to Dashboard module when clicked', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar isAdmin={true} />);
      
      const dashboardButton = screen.getAllByRole('button')[0];
      await user.click(dashboardButton);
      
      expect(mockSetModule).toHaveBeenCalledWith('dashboard');
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });

    it('should switch to Builder module when clicked', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar isAdmin={true} />);
      
      const builderButton = screen.getAllByRole('button')[1];
      await user.click(builderButton);
      
      expect(mockSetModule).toHaveBeenCalledWith('builder');
      expect(mockRouter.push).toHaveBeenCalledWith('/builder');
    });

    it('should switch to Admin module when clicked', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar isAdmin={true} />);
      
      const adminButton = screen.getAllByRole('button')[2];
      await user.click(adminButton);
      
      expect(mockSetModule).toHaveBeenCalledWith('admin');
      expect(mockRouter.push).toHaveBeenCalledWith('/admin');
    });
  });

  describe('Active Module Highlighting', () => {
    it('should highlight Dashboard module when active', () => {
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'dashboard',
        setModule: mockSetModule,
      });
      
      render(<PrimarySidebar isAdmin={true} />);
      
      const dashboardButton = screen.getAllByRole('button')[0];
      // Check that the active module has the correct background color
      expect(dashboardButton).toHaveStyle({ backgroundColor: '#EFEFEF' });
    });

    it('should highlight Builder module when active', () => {
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'builder',
        setModule: mockSetModule,
      });
      
      render(<PrimarySidebar isAdmin={true} />);
      
      const builderButton = screen.getAllByRole('button')[1];
      expect(builderButton).toHaveStyle({ backgroundColor: '#AA60C4' });
    });
  });

  describe('Profile Dropdown', () => {
    it('should open profile dropdown when avatar is clicked', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar isAdmin={true} />);
      
      const avatar = screen.getByText('JD'); // Initials from John Doe
      await user.click(avatar);
      
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('should navigate to profile when Profile option is clicked', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar isAdmin={true} />);
      
      const avatar = screen.getByText('JD');
      await user.click(avatar);
      
      const profileOption = screen.getByText('Profile Settings');
      await user.click(profileOption);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/profile');
    });

    it('should sign out when Sign Out option is clicked', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar isAdmin={true} />);
      
      const avatar = screen.getByText('JD');
      await user.click(avatar);
      
      const signOutOption = screen.getByText('Sign Out');
      await user.click(signOutOption);
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Help Dropdown', () => {
    it('should open help dropdown when help icon is clicked', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar isAdmin={true} />);
      
      // Find the help button (it's before the profile avatar)
      const buttons = screen.getAllByRole('button');
      const helpButton = buttons[buttons.length - 2]; // Second to last button
      await user.click(helpButton);
      
      expect(screen.getByText('Read Documentation')).toBeInTheDocument();
      expect(screen.getByText('Make a Request')).toBeInTheDocument();
      expect(screen.getByText('Get Support')).toBeInTheDocument();
    });
  });
});