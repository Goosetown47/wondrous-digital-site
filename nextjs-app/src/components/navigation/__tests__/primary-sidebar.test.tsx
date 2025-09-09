import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimarySidebar } from '../primary-sidebar';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { useRouter, usePathname } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock the theme store
vi.mock('@/stores/module-theme-store');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('PrimarySidebar', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(usePathname).mockReturnValue('/dashboard');
    
    // Default mock for theme store
    vi.mocked(useModuleThemeStore).mockReturnValue({
      currentModule: 'dashboard',
      setModule: vi.fn(),
      getCurrentModuleColors: () => ({
        primary: '#6B7280',
        secondary: '#9CA3AF',
        accent: '#EFEFEF',
        background: '#F9FAFB',
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Icons', () => {
    it('should render all module icons', () => {
      render(<PrimarySidebar />);
      
      // Check for module icons (by aria-label or data-testid)
      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Builder')).toBeInTheDocument();
      expect(screen.getByLabelText('Admin')).toBeInTheDocument();
    });

    it('should show tooltips on hover', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar />);
      
      const dashboardIcon = screen.getByLabelText('Dashboard');
      
      // Hover over dashboard icon
      await user.hover(dashboardIcon);
      
      // Wait for tooltip to appear
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByRole('tooltip')).toHaveTextContent('Dashboard');
      });
    });

    it('should highlight active module', () => {
      vi.mocked(usePathname).mockReturnValue('/builder/project-123');
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'builder',
        setModule: vi.fn(),
        getCurrentModuleColors: () => ({
          primary: '#AA60C4',
          secondary: '#73248F',
          accent: '#EFD0FA',
          background: '#F4E0FC',
        }),
      });
      
      render(<PrimarySidebar />);
      
      const builderIcon = screen.getByLabelText('Builder');
      
      // Check if builder icon button has active styling
      expect(builderIcon).toHaveStyle({ backgroundColor: '#AA60C4' });
    });
  });

  describe('Module Switching', () => {
    it('should switch modules when clicking icons', async () => {
      const mockSetModule = vi.fn();
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'dashboard',
        setModule: mockSetModule,
        getCurrentModuleColors: () => ({
          primary: '#6B7280',
          secondary: '#9CA3AF',
          accent: '#EFEFEF',
          background: '#F9FAFB',
        }),
      });
      
      const user = userEvent.setup();
      render(<PrimarySidebar />);
      
      const builderIcon = screen.getByLabelText('Builder');
      await user.click(builderIcon);
      
      expect(mockSetModule).toHaveBeenCalledWith('builder');
      expect(mockRouter.push).toHaveBeenCalledWith('/builder');
    });

    it('should navigate to correct module routes', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar />);
      
      // Test Dashboard navigation
      const dashboardIcon = screen.getByLabelText('Dashboard');
      await user.click(dashboardIcon);
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      
      // Test Admin navigation
      const adminIcon = screen.getByLabelText('Admin');
      await user.click(adminIcon);
      expect(mockRouter.push).toHaveBeenCalledWith('/admin');
    });
  });

  describe('Sidebar Styling', () => {
    it('should have correct width and background', () => {
      const { container } = render(<PrimarySidebar />);
      
      const sidebar = container.querySelector('[data-testid="primary-sidebar"]');
      expect(sidebar).toHaveClass('w-[75px]');
      expect(sidebar).toHaveClass('bg-black');
    });

    it('should have logo at the top', () => {
      render(<PrimarySidebar />);
      
      const logo = screen.getByLabelText('Wondrous Digital');
      expect(logo).toBeInTheDocument();
      
      // Logo should be at the top of the sidebar
      const sidebar = screen.getByTestId('primary-sidebar');
      expect(sidebar.firstElementChild).toContainElement(logo);
    });

    it('should have help and profile icons at the bottom', () => {
      render(<PrimarySidebar />);
      
      const helpIcon = screen.getByLabelText('Help');
      const profileIcon = screen.getByLabelText('Profile');
      
      expect(helpIcon).toBeInTheDocument();
      expect(profileIcon).toBeInTheDocument();
      
      // Check they are in the footer section
      const footer = screen.getByTestId('sidebar-footer');
      expect(footer).toContainElement(helpIcon);
      expect(footer).toContainElement(profileIcon);
    });
  });

  describe('Persistence', () => {
    it('should persist last selected module in localStorage', async () => {
      const mockSetModule = vi.fn();
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'dashboard',
        setModule: mockSetModule,
        getCurrentModuleColors: () => ({
          primary: '#6B7280',
          secondary: '#9CA3AF',
          accent: '#EFEFEF',
          background: '#F9FAFB',
        }),
      });
      
      const user = userEvent.setup();
      render(<PrimarySidebar />);
      
      const adminIcon = screen.getByLabelText('Admin');
      await user.click(adminIcon);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'last-selected-module',
        'admin'
      );
    });

    it('should restore last selected module on mount', () => {
      localStorageMock.getItem.mockReturnValue('builder');
      
      const mockSetModule = vi.fn();
      vi.mocked(useModuleThemeStore).mockReturnValue({
        currentModule: 'dashboard',
        setModule: mockSetModule,
        getCurrentModuleColors: () => ({
          primary: '#6B7280',
          secondary: '#9CA3AF',
          accent: '#EFEFEF',
          background: '#F9FAFB',
        }),
      });
      
      render(<PrimarySidebar />);
      
      expect(mockSetModule).toHaveBeenCalledWith('builder');
    });
  });

  describe('Admin Module Visibility', () => {
    it('should hide admin module for non-admin users', () => {
      render(<PrimarySidebar isAdmin={false} />);
      
      expect(screen.queryByLabelText('Admin')).not.toBeInTheDocument();
    });

    it('should show admin module for admin users', () => {
      render(<PrimarySidebar isAdmin={true} />);
      
      expect(screen.getByLabelText('Admin')).toBeInTheDocument();
    });
  });

  describe('Mobile Behavior', () => {
    it('should be hidden on mobile by default', () => {
      // Mock window.matchMedia for mobile
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { container } = render(<PrimarySidebar />);
      const sidebar = container.querySelector('[data-testid="primary-sidebar"]');
      
      expect(sidebar).toHaveClass('hidden');
      expect(sidebar).toHaveClass('md:flex');
    });
  });

  describe('Icon Hover Effects', () => {
    it('should apply module color on hover', async () => {
      const user = userEvent.setup();
      render(<PrimarySidebar />);
      
      const dashboardIcon = screen.getByLabelText('Dashboard');
      
      // Initially white
      expect(dashboardIcon).toHaveClass('text-white');
      
      // Hover to apply module color
      await user.hover(dashboardIcon);
      
      expect(dashboardIcon).toHaveClass('hover:text-module-primary');
    });
  });
});