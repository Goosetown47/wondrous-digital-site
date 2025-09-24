import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BuilderPage from '../[projectId]/[pageId]/page';
import { useBuilderStore } from '@/stores/builderStore';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ projectId: 'project1', pageId: 'page1' }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock auth provider
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    user: { id: 'user1' },
    setCurrentProject: vi.fn(),
  }),
}));

// Mock hooks
vi.mock('@/hooks/useProjects', () => ({
  useProject: () => ({
    data: {
      id: 'project1',
      name: 'Test Project',
      theme_id: 'theme1',
    },
  }),
}));

vi.mock('@/hooks/usePages', () => ({
  usePageById: () => ({
    data: {
      id: 'page1',
      title: 'Test Page',
      sections: [],
      published_sections: [],
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useThemes', () => ({
  useTheme: () => ({
    data: null,
  }),
}));

vi.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    saveNow: vi.fn(),
  }),
}));

vi.mock('@/hooks/useLibrary', () => ({
  useLibraryItems: () => ({
    data: [
      {
        id: 'hero1',
        name: 'Hero Banner',
        type: 'section',
        category: 'hero',
        component_name: 'HeroSection',
        content: { heading: 'Welcome' },
      },
      {
        id: 'about1',
        name: 'About Section',
        type: 'section',
        category: 'content',
        component_name: 'AboutSection',
        content: { title: 'About Us' },
      },
    ],
    isLoading: false,
  }),
}));

// Mock builder store
vi.mock('@/stores/builderStore', () => ({
  useBuilderStore: vi.fn(() => ({
    sections: [],
    loadPage: vi.fn(),
    saveStatus: 'saved',
    lastSavedAt: new Date(),
    pageId: 'page1',
    selectedSectionId: null,
    setSelectedSection: vi.fn(),
    removeSection: vi.fn(),
    updateSection: vi.fn(),
    reorderSections: vi.fn(),
    addSection: vi.fn(),
  })),
}));

// Create wrapper with providers
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

describe('Section Selection Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show centered hover zone when canvas is empty', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const emptyHoverZone = screen.getByTestId('hover-zone-empty');
      expect(emptyHoverZone).toBeInTheDocument();
      expect(emptyHoverZone).toHaveClass('min-h-[200px]');
    });
  });

  it('should open modal when hover zone is clicked', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const hoverZone = screen.getByTestId('hover-zone-empty');
      expect(hoverZone).toBeInTheDocument();
    });

    // Click the hover zone
    const hoverZone = screen.getByTestId('hover-zone-empty');
    fireEvent.click(hoverZone);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText('Add Section')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should add section to canvas when template is selected', async () => {
    const addSection = vi.fn();
    vi.mocked(useBuilderStore).mockReturnValue({
      sections: [],
      addSection,
      loadPage: vi.fn(),
      saveStatus: 'saved',
      lastSavedAt: new Date(),
      pageId: 'page1',
      selectedSectionId: null,
      setSelectedSection: vi.fn(),
      removeSection: vi.fn(),
      updateSection: vi.fn(),
      reorderSections: vi.fn(),
    } as ReturnType<typeof useBuilderStore>);

    render(<BuilderPage />, { wrapper: createWrapper() });

    // Click hover zone to open modal
    await waitFor(() => {
      const hoverZone = screen.getByTestId('hover-zone-empty');
      fireEvent.click(hoverZone);
    });

    // Select a template from modal
    await waitFor(() => {
      const heroCard = screen.getByTestId('template-card-hero1');
      fireEvent.click(heroCard);
    });

    // Verify section was added
    await waitFor(() => {
      expect(addSection).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'section',
          component_name: 'HeroSection',
          content: { heading: 'Welcome' },
        })
      );
    });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should show hover zones between multiple sections', async () => {
    vi.mocked(useBuilderStore).mockReturnValue({
      sections: [
        { id: 's1', type: 'section', component_name: 'HeroSection', content: {}, order: 0 },
        { id: 's2', type: 'section', component_name: 'AboutSection', content: {}, order: 1 },
      ],
      loadPage: vi.fn(),
      saveStatus: 'saved',
      lastSavedAt: new Date(),
      pageId: 'page1',
      selectedSectionId: null,
      setSelectedSection: vi.fn(),
      removeSection: vi.fn(),
      updateSection: vi.fn(),
      reorderSections: vi.fn(),
      addSection: vi.fn(),
    } as ReturnType<typeof useBuilderStore>);

    render(<BuilderPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should have hover zones at positions 0, 1, and 2
      expect(screen.getByTestId('hover-zone-0')).toBeInTheDocument(); // Before first section
      expect(screen.getByTestId('hover-zone-1')).toBeInTheDocument(); // Between sections
      expect(screen.getByTestId('hover-zone-2')).toBeInTheDocument(); // After last section
    });
  });

  it('should insert section at correct position when hover zone is clicked', async () => {
    const addSection = vi.fn();
    vi.mocked(useBuilderStore).mockReturnValue({
      sections: [
        { id: 's1', type: 'section', component_name: 'HeroSection', content: {}, order: 0 },
        { id: 's2', type: 'section', component_name: 'FooterSection', content: {}, order: 1 },
      ],
      addSection,
      loadPage: vi.fn(),
      saveStatus: 'saved',
      lastSavedAt: new Date(),
      pageId: 'page1',
      selectedSectionId: null,
      setSelectedSection: vi.fn(),
      removeSection: vi.fn(),
      updateSection: vi.fn(),
      reorderSections: vi.fn(),
    } as ReturnType<typeof useBuilderStore>);

    render(<BuilderPage />, { wrapper: createWrapper() });

    // Click hover zone between sections (position 1)
    await waitFor(() => {
      const hoverZone = screen.getByTestId('hover-zone-1');
      fireEvent.click(hoverZone);
    });

    // Modal opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Select a template
    const aboutCard = screen.getByTestId('template-card-about1');
    fireEvent.click(aboutCard);

    // Verify section was added with correct position
    await waitFor(() => {
      expect(addSection).toHaveBeenCalledWith(
        expect.objectContaining({
          component_name: 'AboutSection',
          order: 1, // Should be inserted at position 1
        })
      );
    });
  });

  it('should filter templates in modal', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    // Open modal
    await waitFor(() => {
      const hoverZone = screen.getByTestId('hover-zone-empty');
      fireEvent.click(hoverZone);
    });

    // Initially shows all templates
    await waitFor(() => {
      expect(screen.getByText('Hero Banner')).toBeInTheDocument();
      expect(screen.getByText('About Section')).toBeInTheDocument();
    });

    // Search for "hero"
    const searchInput = screen.getByPlaceholderText(/search templates/i);
    fireEvent.change(searchInput, { target: { value: 'hero' } });

    // Should only show hero templates
    await waitFor(() => {
      expect(screen.getByText('Hero Banner')).toBeInTheDocument();
      expect(screen.queryByText('About Section')).not.toBeInTheDocument();
    });
  });

  it('should close modal with Escape key', async () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    // Open modal
    await waitFor(() => {
      const hoverZone = screen.getByTestId('hover-zone-empty');
      fireEvent.click(hoverZone);
    });

    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should not have sidebar visible', () => {
    render(<BuilderPage />, { wrapper: createWrapper() });

    // Sidebar should not be in the document
    expect(screen.queryByText('Template Library')).not.toBeInTheDocument();
    expect(screen.queryByText('Drag templates to canvas')).not.toBeInTheDocument();
  });

  it('should maintain hover zones after reordering sections', async () => {
    const reorderSections = vi.fn();
    vi.mocked(useBuilderStore).mockReturnValue({
      sections: [
        { id: 's1', type: 'section', component_name: 'HeroSection', content: {}, order: 0 },
        { id: 's2', type: 'section', component_name: 'AboutSection', content: {}, order: 1 },
        { id: 's3', type: 'section', component_name: 'FooterSection', content: {}, order: 2 },
      ],
      reorderSections,
      loadPage: vi.fn(),
      saveStatus: 'saved',
      lastSavedAt: new Date(),
      pageId: 'page1',
      selectedSectionId: null,
      setSelectedSection: vi.fn(),
      removeSection: vi.fn(),
      updateSection: vi.fn(),
      addSection: vi.fn(),
    } as ReturnType<typeof useBuilderStore>);

    render(<BuilderPage />, { wrapper: createWrapper() });

    // Verify all hover zones are present
    await waitFor(() => {
      expect(screen.getByTestId('hover-zone-0')).toBeInTheDocument();
      expect(screen.getByTestId('hover-zone-1')).toBeInTheDocument();
      expect(screen.getByTestId('hover-zone-2')).toBeInTheDocument();
      expect(screen.getByTestId('hover-zone-3')).toBeInTheDocument();
    });

    // Simulate drag reorder (would be done via drag handle)
    const newOrder = [
      { id: 's2', type: 'section', component_name: 'AboutSection', content: {}, order: 0 },
      { id: 's1', type: 'section', component_name: 'HeroSection', content: {}, order: 1 },
      { id: 's3', type: 'section', component_name: 'FooterSection', content: {}, order: 2 },
    ];

    reorderSections(newOrder);

    // Hover zones should still be correct
    await waitFor(() => {
      expect(screen.getByTestId('hover-zone-0')).toBeInTheDocument();
      expect(screen.getByTestId('hover-zone-1')).toBeInTheDocument();
      expect(screen.getByTestId('hover-zone-2')).toBeInTheDocument();
      expect(screen.getByTestId('hover-zone-3')).toBeInTheDocument();
    });
  });
});