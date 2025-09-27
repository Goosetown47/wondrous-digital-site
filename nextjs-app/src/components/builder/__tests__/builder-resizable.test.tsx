import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BuilderPage from '@/app/(app)/builder/[projectId]/[pageId]/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock ResizablePreview component
vi.mock('@/components/lab/resizable-preview', () => ({
  ResizablePreview: ({
    children,
    presetWidth,
    minWidth,
    maxWidth,
  }: {
    children: React.ReactNode;
    presetWidth?: number | null;
    minWidth?: number;
    maxWidth?: number;
  }) => (
    <div
      data-testid="resizable-preview"
      data-preset-width={presetWidth}
      data-min-width={minWidth}
      data-max-width={maxWidth}
      style={{ width: presetWidth ? `${presetWidth}px` : '100%' }}
    >
      {children}
    </div>
  ),
}));

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useParams: () => ({ projectId: 'test-project', pageId: 'test-page' }),
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock hooks
vi.mock('@/hooks/useProjects', () => ({
  useProject: () => ({ data: { id: 'test-project', name: 'Test Project', theme_id: 'theme1' } }),
}));

vi.mock('@/hooks/usePages', () => ({
  usePageById: () => ({
    data: {
      id: 'test-page',
      title: 'Test Page',
      path: '/',
      sections: []
    },
    isLoading: false
  }),
  useProjectPages: () => ({ data: [] }),
  usePublishPage: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useThemes', () => ({
  useTheme: () => ({ data: null }),
}));

vi.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({ saveNow: vi.fn() }),
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({ setCurrentProject: vi.fn() }),
}));

vi.mock('@/stores/builderStore', () => ({
  useBuilderStore: () => ({
    sections: [],
    loadPage: vi.fn(),
    saveStatus: 'saved',
    lastSavedAt: new Date(),
    pageId: 'test-page',
    addSection: vi.fn(),
    isDirty: false,
    hasUnpublishedChanges: () => false,
    saveError: null,
  }),
}));

// Mock components
vi.mock('@/components/builder/Canvas', () => ({
  Canvas: () => <div data-testid="canvas">Canvas Content</div>,
}));

vi.mock('@/components/builder/SectionLibrary', () => ({
  SectionLibrary: () => <div data-testid="section-library">Library</div>,
}));

vi.mock('@/components/builder/CanvasNavbar', () => ({
  CanvasNavbar: ({ onDeviceViewChange, deviceView }: { onDeviceViewChange?: (view: string) => void; deviceView?: string }) => (
    <div data-testid="canvas-navbar">
      <button onClick={() => onDeviceViewChange?.('desktop')} aria-label="Desktop view">Desktop</button>
      <button onClick={() => onDeviceViewChange?.('tablet')} aria-label="Tablet view">Tablet</button>
      <button onClick={() => onDeviceViewChange?.('mobile')} aria-label="Mobile view">Mobile</button>
      <span data-testid="current-view">{deviceView}</span>
    </div>
  ),
}));

vi.mock('@/components/builder/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Create a test wrapper with QueryClient
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

describe('Builder Resizable Preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ResizablePreview wrapper around canvas', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('resizable-preview')).toBeInTheDocument();
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    // Canvas should be inside ResizablePreview
    const resizable = screen.getByTestId('resizable-preview');
    const canvas = screen.getByTestId('canvas');
    expect(resizable).toContainElement(canvas);
  });

  it('should change preset width when device view changes to mobile', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('resizable-preview')).toBeInTheDocument();
    });

    // Initially should be desktop (no preset width)
    let resizable = screen.getByTestId('resizable-preview');
    expect(resizable.getAttribute('data-preset-width')).toBe('null');

    // Click mobile button
    fireEvent.click(screen.getByLabelText('Mobile view'));

    await waitFor(() => {
      resizable = screen.getByTestId('resizable-preview');
      expect(resizable.getAttribute('data-preset-width')).toBe('375');
    });
  });

  it('should change preset width when device view changes to tablet', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('resizable-preview')).toBeInTheDocument();
    });

    // Click tablet button
    fireEvent.click(screen.getByLabelText('Tablet view'));

    await waitFor(() => {
      const resizable = screen.getByTestId('resizable-preview');
      expect(resizable.getAttribute('data-preset-width')).toBe('768');
    });
  });

  it('should reset to full width when device view changes to desktop', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('resizable-preview')).toBeInTheDocument();
    });

    // Set to mobile first
    fireEvent.click(screen.getByLabelText('Mobile view'));

    await waitFor(() => {
      const resizable = screen.getByTestId('resizable-preview');
      expect(resizable.getAttribute('data-preset-width')).toBe('375');
    });

    // Then back to desktop
    fireEvent.click(screen.getByLabelText('Desktop view'));

    await waitFor(() => {
      const resizable = screen.getByTestId('resizable-preview');
      expect(resizable.getAttribute('data-preset-width')).toBe('null');
    });
  });

  it('should pass correct min and max width to ResizablePreview', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('resizable-preview')).toBeInTheDocument();
    });

    const resizable = screen.getByTestId('resizable-preview');
    expect(resizable.getAttribute('data-min-width')).toBe('320');
    expect(resizable.getAttribute('data-max-width')).toBe('1400');
  });

  it('should maintain drag and drop functionality within resizable area', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('resizable-preview')).toBeInTheDocument();
    });

    // Check that the canvas area has drag event handlers
    const canvasArea = screen.getByTestId('resizable-preview').parentElement;
    expect(canvasArea).toBeInTheDocument();

    // Simulate drag over event
    const dragEvent = new Event('dragover', { bubbles: true });
    fireEvent(canvasArea!, dragEvent);

    // Should prevent default (allow drop)
    expect(dragEvent.defaultPrevented).toBe(true);
  });
});