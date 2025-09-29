import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DependenciesPage from '../page';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
  useToast: vi.fn(() => ({ toast: vi.fn() }))
}));

// Mock fetch API
global.fetch = vi.fn();

describe('Dependencies Management Page', () => {
  let queryClient: QueryClient;
  const mockPush = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DependenciesPage />
      </QueryClientProvider>
    );
  };

  it('should render the page header and main sections', () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        components: [],
        uiComponents: [],
        installedDependencies: [],
        stats: {
          totalComponents: 0,
          totalUiFiles: 0,
          bySource: {},
          uniqueDependencies: 0
        }
      })
    });

    renderComponent();

    expect(screen.getByText('Component Dependencies')).toBeInTheDocument();
    expect(screen.getByText('Manage UI components and their dependencies')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/paste registry url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import component/i })).toBeInTheDocument();
  });

  it('should display loading state while fetching dependencies', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ components: [], uiComponents: [], installedDependencies: [], stats: {} })
      }), 100))
    );

    renderComponent();

    expect(screen.getByText(/loading dependencies/i)).toBeInTheDocument();
  });

  it('should display list of imported components', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        components: [
          {
            id: '1',
            name: 'button',
            source: 'shadcn',
            sourceUrl: 'https://ui.shadcn.com/registry/button.json',
            dependencies: ['clsx', 'class-variance-authority'],
            transformations: [],
            importDate: '2024-01-20T10:00:00Z'
          },
          {
            id: '2',
            name: 'sparkles',
            source: 'aceternity',
            sourceUrl: 'https://ui.aceternity.com/registry/sparkles.json',
            dependencies: ['framer-motion'],
            transformations: ['motion/react -> framer-motion'],
            importDate: '2024-01-21T10:00:00Z'
          }
        ],
        uiComponents: ['button.tsx', 'sparkles.tsx'],
        installedDependencies: ['clsx', 'framer-motion'],
        stats: {
          totalComponents: 2,
          totalUiFiles: 2,
          bySource: { shadcn: 1, aceternity: 1 },
          uniqueDependencies: 3
        }
      })
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('button')).toBeInTheDocument();
      expect(screen.getByText('sparkles')).toBeInTheDocument();
      expect(screen.getByText('shadcn')).toBeInTheDocument();
      expect(screen.getByText('aceternity')).toBeInTheDocument();
    });
  });

  it('should validate import URL format', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        components: [],
        uiComponents: [],
        installedDependencies: [],
        stats: {}
      })
    });

    renderComponent();

    const input = screen.getByPlaceholderText(/paste registry url/i);
    const importButton = screen.getByRole('button', { name: /import component/i });

    // Try invalid URL
    await user.type(input, 'not-a-valid-url');
    await user.click(importButton);

    expect(toast).toHaveBeenCalledWith({
      title: 'Invalid URL',
      description: expect.stringContaining('Please enter a valid registry URL'),
      variant: 'destructive'
    });
  });

  it('should handle successful component import', async () => {
    // Mock initial load
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        components: [],
        uiComponents: [],
        installedDependencies: [],
        stats: {}
      })
    });

    renderComponent();

    const input = await screen.findByPlaceholderText(/paste registry url/i);
    const importButton = screen.getByRole('button', { name: /import component/i });

    // Mock import API call
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        component: {
          name: 'button',
          source: 'shadcn',
          dependencies: ['clsx'],
          transformations: [],
          filesWritten: 1
        }
      })
    });

    // Mock refetch after import
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        components: [{
          id: '1',
          name: 'button',
          source: 'shadcn',
          importDate: new Date().toISOString()
        }],
        uiComponents: ['button.tsx'],
        installedDependencies: ['clsx'],
        stats: { totalComponents: 1 }
      })
    });

    await user.type(input, 'https://ui.shadcn.com/registry/button.json');
    await user.click(importButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Component imported successfully',
        description: 'button has been added to your project'
      });
    });

    expect(input).toHaveValue('');
  });

  it('should handle import errors', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        components: [],
        uiComponents: [],
        installedDependencies: [],
        stats: {}
      })
    });

    renderComponent();

    const input = await screen.findByPlaceholderText(/paste registry url/i);
    const importButton = screen.getByRole('button', { name: /import component/i });

    // Mock failed import
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Failed to import component',
        details: 'Network error'
      })
    });

    await user.type(input, 'https://ui.shadcn.com/registry/button.json');
    await user.click(importButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Import failed',
        description: 'Failed to import component',
        variant: 'destructive'
      });
    });
  });

  it('should show import options (autoFix, installDeps)', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        components: [],
        uiComponents: [],
        installedDependencies: [],
        stats: {}
      })
    });

    renderComponent();

    // Check for import options checkboxes
    expect(screen.getByLabelText(/auto-fix import paths/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/install missing dependencies/i)).toBeInTheDocument();

    // Both should be checked by default
    const autoFixCheckbox = screen.getByLabelText(/auto-fix import paths/i) as HTMLInputElement;
    const installDepsCheckbox = screen.getByLabelText(/install missing dependencies/i) as HTMLInputElement;

    expect(autoFixCheckbox.checked).toBe(true);
    expect(installDepsCheckbox.checked).toBe(true);
  });

  it('should filter components by source', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        components: [
          { id: '1', name: 'button', source: 'shadcn' },
          { id: '2', name: 'sparkles', source: 'aceternity' },
          { id: '3', name: 'card', source: 'shadcn' }
        ],
        uiComponents: [],
        installedDependencies: [],
        stats: {}
      })
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('button')).toBeInTheDocument();
      expect(screen.getByText('sparkles')).toBeInTheDocument();
      expect(screen.getByText('card')).toBeInTheDocument();
    });

    // Filter by source
    const filterSelect = screen.getByRole('combobox', { name: /filter by source/i });
    await user.selectOptions(filterSelect, 'shadcn');

    await waitFor(() => {
      expect(screen.getByText('button')).toBeInTheDocument();
      expect(screen.queryByText('sparkles')).not.toBeInTheDocument();
      expect(screen.getByText('card')).toBeInTheDocument();
    });
  });

  it('should display statistics', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        components: [],
        uiComponents: [],
        installedDependencies: ['framer-motion', 'clsx', 'react'],
        stats: {
          totalComponents: 5,
          totalUiFiles: 8,
          bySource: {
            shadcn: 3,
            aceternity: 2
          },
          uniqueDependencies: 3
        }
      })
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Total components
      expect(screen.getByText('8')).toBeInTheDocument(); // Total UI files
      expect(screen.getByText('3')).toBeInTheDocument(); // Unique dependencies
    });
  });

  it('should handle batch import mode', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        components: [],
        uiComponents: [],
        installedDependencies: [],
        stats: {}
      })
    });

    renderComponent();

    // Toggle batch mode
    const batchModeToggle = screen.getByLabelText(/batch import mode/i);
    await user.click(batchModeToggle);

    // Should show textarea for multiple URLs
    expect(screen.getByPlaceholderText(/enter multiple registry urls/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/enter multiple registry urls/i);
    const urls = [
      'https://ui.shadcn.com/registry/button.json',
      'https://ui.aceternity.com/registry/sparkles.json'
    ].join('\n');

    await user.type(textarea, urls);

    const importButton = screen.getByRole('button', { name: /import \d+ components/i });
    expect(importButton).toHaveTextContent('Import 2 components');
  });

  it('should show component details on click', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        components: [{
          id: '1',
          name: 'button',
          source: 'shadcn',
          sourceUrl: 'https://ui.shadcn.com/registry/button.json',
          dependencies: ['clsx', 'class-variance-authority'],
          transformations: [],
          importDate: '2024-01-20T10:00:00Z'
        }],
        uiComponents: ['button.tsx'],
        installedDependencies: [],
        stats: {}
      })
    });

    renderComponent();

    await waitFor(() => {
      const buttonComponent = screen.getByText('button');
      expect(buttonComponent).toBeInTheDocument();
    });

    // Click on component to show details
    const buttonComponent = screen.getByText('button');
    await user.click(buttonComponent);

    // Should show component details
    expect(screen.getByText('Dependencies:')).toBeInTheDocument();
    expect(screen.getByText('clsx')).toBeInTheDocument();
    expect(screen.getByText('class-variance-authority')).toBeInTheDocument();
    expect(screen.getByText(/imported on/i)).toBeInTheDocument();
  });
});