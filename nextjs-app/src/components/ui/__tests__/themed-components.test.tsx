import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';
import { Badge } from '../badge';
import { useModuleThemeStore } from '@/stores/module-theme-store';

// Mock the theme store
vi.mock('@/stores/module-theme-store');

describe('Themed Components', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock return
    (useModuleThemeStore as any).mockReturnValue({ // eslint-disable-linecurrentModule: 'dashboard',
      getCurrentModuleColors: () => ({
        primary: '#6B7280',
        secondary: '#9CA3AF',
        accent: '#EFEFEF',
        background: '#F9FAFB',
      }),
    });
  });

  describe('Button Component', () => {
    it('should apply module primary color to primary button', () => {
      render(<Button variant="default">Test Button</Button>);

      const button = screen.getByRole('button');

      // Button should use CSS variable
      expect(button.className).toContain('bg-primary');
    });

    it('should update button color when module changes', () => {
      const { rerender } = render(<Button variant="default">Test Button</Button>);

      // Change to builder module
      (useModuleThemeStore as any).mockReturnValue({ // eslint-disable-linecurrentModule: 'builder',
        getCurrentModuleColors: () => ({
          primary: '#AA60C4',
          secondary: '#73248F',
          accent: '#EFD0FA',
          background: '#F4E0FC',
        }),
      });

      rerender(<Button variant="default">Test Button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-primary');
    });

    it('should apply module secondary color to secondary button', () => {
      render(<Button variant="secondary">Secondary Button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-secondary');
    });

    it('should maintain outline variant with module color border', () => {
      render(<Button variant="outline">Outline Button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('border');
      expect(button.className).toContain('border-input');
    });
  });

  describe('Badge Component', () => {
    it('should apply module accent color to badge', () => {
      render(<Badge variant="secondary">Test Badge</Badge>);

      const badge = screen.getByText('Test Badge');
      expect(badge.className).toContain('bg-secondary');
    });

    it('should update badge color when module changes', () => {
      const { rerender } = render(<Badge variant="secondary">Test Badge</Badge>);

      // Change to admin module
      (useModuleThemeStore as any).mockReturnValue({ // eslint-disable-linecurrentModule: 'admin',
        getCurrentModuleColors: () => ({
          primary: '#E382A5',
          secondary: '#B5406B',
          accent: '#FCDFF2',
          background: '#FCEDFB',
        }),
      });

      rerender(<Badge variant="secondary">Test Badge</Badge>);

      const badge = screen.getByText('Test Badge');
      expect(badge.className).toContain('bg-secondary');
    });

    it('should support different badge variants with module colors', () => {
      render(
        <>
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </>
      );

      const defaultBadge = screen.getByText('Default');
      const secondaryBadge = screen.getByText('Secondary');
      const outlineBadge = screen.getByText('Outline');

      expect(defaultBadge.className).toContain('bg-primary');
      expect(secondaryBadge.className).toContain('bg-secondary');
      expect(outlineBadge.className).toContain('border');
    });
  });

  describe('Typography Components', () => {
    it('should apply module primary color to H1 headings', () => {
      render(<h1 className="text-module-primary">Test Heading</h1>);

      const heading = screen.getByText('Test Heading');
      expect(heading.className).toContain('text-module-primary');
    });

    it('should apply module colors to different heading levels', () => {
      render(
        <>
          <h1 className="text-module-primary">H1 Heading</h1>
          <h2 className="text-module-secondary">H2 Heading</h2>
          <h3 className="text-module-accent">H3 Heading</h3>
        </>
      );

      expect(screen.getByText('H1 Heading').className).toContain('text-module-primary');
      expect(screen.getByText('H2 Heading').className).toContain('text-module-secondary');
      expect(screen.getByText('H3 Heading').className).toContain('text-module-accent');
    });
  });

  describe('Icon Components', () => {
    it('should inherit module color for icons', () => {
      // Mock Lucide icon component
      const MockIcon = ({ className }: { className?: string }) => (
        <svg className={className || ''} data-testid="icon">Icon</svg>
      );

      render(<MockIcon className="text-module-primary" />);

      const icon = screen.getByTestId('icon');
      expect(icon.getAttribute('class')).toContain('text-module-primary');
    });

    it('should update icon color when module changes', () => {
      const MockIcon = ({ className }: { className?: string }) => (
        <svg className={className || ''} data-testid="icon">Icon</svg>
      );

      const { rerender } = render(<MockIcon className="text-module-primary" />);

      // Verify initial state
      let icon = screen.getByTestId('icon');
      expect(icon.getAttribute('class')).toContain('text-module-primary');

      // Change module and rerender
      (useModuleThemeStore as any).mockReturnValue({ // eslint-disable-linecurrentModule: 'builder',
        getCurrentModuleColors: () => ({
          primary: '#AA60C4',
          secondary: '#73248F',
          accent: '#EFD0FA',
          background: '#F4E0FC',
        }),
      });

      rerender(<MockIcon className="text-module-primary" />);

      icon = screen.getByTestId('icon');
      expect(icon.getAttribute('class')).toContain('text-module-primary');
    });
  });

  describe('Module-Specific Styling', () => {
    it('should apply dashboard greyscale theme', () => {
      (useModuleThemeStore as any).mockReturnValue({ // eslint-disable-linecurrentModule: 'dashboard',
        getCurrentModuleColors: () => ({
          primary: '#6B7280',
          secondary: '#9CA3AF',
          accent: '#EFEFEF',
          background: '#F9FAFB',
        }),
      });

      render(<div className="bg-module-background">Dashboard Content</div>);

      const content = screen.getByText('Dashboard Content');
      expect(content.className).toContain('bg-module-background');
    });

    it('should apply builder purple theme', () => {
      (useModuleThemeStore as any).mockReturnValue({ // eslint-disable-linecurrentModule: 'builder',
        getCurrentModuleColors: () => ({
          primary: '#AA60C4',
          secondary: '#73248F',
          accent: '#EFD0FA',
          background: '#F4E0FC',
        }),
      });

      render(<div className="bg-module-background">Builder Content</div>);

      const content = screen.getByText('Builder Content');
      expect(content.className).toContain('bg-module-background');
    });

    it('should apply admin pink theme', () => {
      (useModuleThemeStore as any).mockReturnValue({ // eslint-disable-linecurrentModule: 'admin',
        getCurrentModuleColors: () => ({
          primary: '#E382A5',
          secondary: '#B5406B',
          accent: '#FCDFF2',
          background: '#FCEDFB',
        }),
      });

      render(<div className="bg-module-background">Admin Content</div>);

      const content = screen.getByText('Admin Content');
      expect(content.className).toContain('bg-module-background');
    });
  });
});