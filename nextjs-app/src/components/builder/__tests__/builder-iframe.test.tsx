import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Canvas } from '../Canvas';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  })),
}));

// Mock register-components to prevent module-level execution
vi.mock('@/lib/register-components', () => ({
  registerAllComponents: vi.fn(),
  ComponentRegistry: {
    getInstance: vi.fn(() => ({
      register: vi.fn(),
      get: vi.fn(),
      getAll: vi.fn(() => ({})),
      has: vi.fn(() => false),
      clear: vi.fn(),
    })),
  },
}));

// Mock the IframePreview component
vi.mock('@/components/shared/preview/IframePreview', () => ({
  IframePreview: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="iframe-preview" className={className}>
      {children}
    </div>
  ),
}));

// Mock the MultiSectionCanvas component
vi.mock('@/components/shared/canvas/MultiSectionCanvas', () => ({
  MultiSectionCanvas: ({ emptyStateMessage }: { emptyStateMessage?: string }) => (
    <div data-testid="multi-section-canvas">
      {emptyStateMessage || 'Canvas content'}
    </div>
  ),
}));

// Mock the component registry
vi.mock('@/lib/component-registry', () => ({
  getComponent: vi.fn(() => ({
    component: ({ content }: { content: Record<string, unknown> }) => (
      <div data-testid="mock-section">{JSON.stringify(content)}</div>
    ),
    type: 'section',
    defaultContent: {}
  })),
}));

// Mock the builder store
vi.mock('@/stores/builderStore', () => ({
  useBuilderStore: vi.fn(() => ({
    sections: [],
    selectedSectionId: null,
    setSelectedSection: vi.fn(),
    removeSection: vi.fn(),
    updateSection: vi.fn(),
    reorderSections: vi.fn(),
    projectId: 'test-project-id',
    pageId: 'test-page-id',
    projectSections: [], // Added: Canvas needs this
    loadProjectSections: vi.fn(), // Added: Canvas needs this
  })),
}));

// Mock useAutoSave hook
vi.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: vi.fn(() => ({
    saveNow: vi.fn(),
    isSaving: false,
  })),
}));

// Mock useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
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

describe('Builder Canvas Iframe Integration', () => {
  it('should render canvas wrapped in IframePreview', () => {
    render(<Canvas />, { wrapper: createWrapper() });

    // Check that IframePreview is rendered
    const iframePreview = screen.getByTestId('iframe-preview');
    expect(iframePreview).toBeInTheDocument();

    // Check that MultiSectionCanvas is rendered inside IframePreview
    const canvas = screen.getByTestId('multi-section-canvas');
    expect(canvas).toBeInTheDocument();
    expect(iframePreview).toContainElement(canvas);
  });

  it('should not have container query classes', () => {
    const { container } = render(<Canvas />, { wrapper: createWrapper() });

    // Check that no element has @container class
    const allElements = container.querySelectorAll('*');
    allElements.forEach(element => {
      const classList = element.className;
      expect(classList).not.toContain('@container');
    });

    // Check that no element has containerType style
    allElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      expect(styles.containerType).not.toBe('inline-size');
    });
  });

  it('should pass correct props to IframePreview', () => {
    render(<Canvas />, { wrapper: createWrapper() });

    // Check that IframePreview has proper className
    const iframePreview = screen.getByTestId('iframe-preview');
    expect(iframePreview).toHaveClass('w-full');
  });

  it('should maintain canvas functionality within iframe', () => {
    render(<Canvas />, { wrapper: createWrapper() });

    // Check that canvas still shows empty state message (from actual component)
    const canvas = screen.getByTestId('multi-section-canvas');
    expect(canvas).toHaveTextContent('No sections yet');
  });
});