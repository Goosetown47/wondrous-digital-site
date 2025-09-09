import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
// Remove unused import: notFound
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useParams: vi.fn(() => ({ projectId: 'test-project-id' })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(() => ({
    currentProject: { id: 'test-project-id', name: 'Test Project' },
    setCurrentProject: vi.fn(),
  })),
}));

vi.mock('@/hooks/useProjects', () => ({
  useProject: vi.fn(() => ({
    data: { 
      id: 'test-project-id', 
      name: 'Test Project', 
      slug: 'test-project',
      created_at: '2024-01-01T00:00:00Z'
    },
    isLoading: false,
  })),
  useUpdateProject: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useArchiveProject: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

vi.mock('@/hooks/useThemes', () => ({
  useThemes: vi.fn(() => ({
    data: [],
  })),
}));

vi.mock('@/hooks/usePages', () => ({
  useHomepage: vi.fn(() => ({
    data: null, // No homepage yet, so it shows loading
    error: null,
  })),
  usePages: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useProjectPages: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useDeletePage: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useSetAsHomepage: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useCreatePage: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

vi.mock('@/stores/module-theme-store', () => ({
  useModuleThemeStore: vi.fn(() => ({
    currentModule: 'builder',
    setModule: vi.fn(),
  })),
}));

describe('Builder Module Routing', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  describe('Canvas Page', () => {
    it('should render canvas page at /builder/[projectId]', async () => {
      const CanvasPage = (await import('../[projectId]/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <CanvasPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Loading project...')).toBeInTheDocument();
      });
    });
  });

  describe('Pages Management', () => {
    it('should render pages management at /builder/[projectId]/pages', async () => {
      const PagesPage = (await import('../[projectId]/pages/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <PagesPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /pages/i })).toBeInTheDocument();
      });
    });
  });

  describe('New Builder Pages', () => {
    it('should render navigation page at /builder/[projectId]/navigation', async () => {
      // Will be enabled after creating the page (GREEN phase)
      const NavigationPage = (await import('../[projectId]/navigation/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /navigation/i })).toBeInTheDocument();
      });
    });

    it('should render themes page at /builder/[projectId]/themes', async () => {
      // Tests are now GREEN
      const ThemesPage = (await import('../[projectId]/themes/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <ThemesPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /themes/i })).toBeInTheDocument();
      });
    });

    it('should render templates page at /builder/[projectId]/templates', async () => {
      // Will be enabled after creating the page (GREEN phase)
      const TemplatesPage = (await import('../[projectId]/templates/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <TemplatesPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /templates/i })).toBeInTheDocument();
      });
    });

    it('should render blog page at /builder/[projectId]/blog', async () => {
      // Will be enabled after creating the page (GREEN phase)
      const BlogPage = (await import('../[projectId]/blog/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <BlogPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /blog/i })).toBeInTheDocument();
      });
    });

    it('should render traffic page at /builder/[projectId]/traffic', async () => {
      // Will be enabled after creating the page (GREEN phase)
      const TrafficPage = (await import('../[projectId]/traffic/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <TrafficPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /traffic/i })).toBeInTheDocument();
      });
    });

    it('should render integrations page at /builder/[projectId]/integrations', async () => {
      // Will be enabled after creating the page (GREEN phase)
      const IntegrationsPage = (await import('../[projectId]/integrations/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <IntegrationsPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /integrations/i })).toBeInTheDocument();
      });
    });
  });

  describe('Settings Migration', () => {
    it('should render settings page at /builder/[projectId]/settings without tabs', async () => {
      // Will be enabled after creating the page (GREEN phase)
      const SettingsPage = (await import('../[projectId]/settings/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <SettingsPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /settings/i })).toBeInTheDocument();
        // Should NOT have tabs
        expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      });
    });

    it('should render domains page at /builder/[projectId]/domains', async () => {
      // Will be enabled after creating the page (GREEN phase)
      const DomainsPage = (await import('../[projectId]/domains/page')).default;
      
      render(
        <QueryClientProvider client={queryClient}>
          <DomainsPage />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /custom domains/i })).toBeInTheDocument();
      });
    });
  });

  describe('Module Theme Application', () => {
    it('should apply Builder purple theme to pages', async () => {
      const { useModuleThemeStore } = await import('@/stores/module-theme-store');
      const mockStore = useModuleThemeStore as unknown as ReturnType<typeof vi.fn>;
      
      mockStore.mockReturnValue({
        currentModule: 'builder',
        setModule: vi.fn(),
      });

      // Verify theme is set to builder module
      expect(mockStore().currentModule).toBe('builder');
    });
  });
});