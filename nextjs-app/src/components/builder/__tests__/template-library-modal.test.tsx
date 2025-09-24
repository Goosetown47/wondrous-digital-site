import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateLibraryModal } from '../TemplateLibraryModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useLibrary hook
vi.mock('@/hooks/useLibrary', () => ({
  useLibraryItems: vi.fn(() => ({
    data: [
      { id: '1', name: 'Hero Section', type: 'section', category: 'hero' },
      { id: '2', name: 'About Page', type: 'page', category: 'landing' },
      { id: '3', name: 'Footer Section', type: 'section', category: 'navigation' },
    ],
    isLoading: false,
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

describe('TemplateLibraryModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSelect: vi.fn(),
    insertPosition: 0,
  };

  it('should render modal with all filter tabs', () => {
    render(<TemplateLibraryModal {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('Add Section')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sections/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pages/i })).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<TemplateLibraryModal {...defaultProps} />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search templates/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should display templates in a grid', () => {
    render(<TemplateLibraryModal {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('Hero Section')).toBeInTheDocument();
    expect(screen.getByText('About Page')).toBeInTheDocument();
    expect(screen.getByText('Footer Section')).toBeInTheDocument();

    const grid = screen.getByTestId('template-grid');
    expect(grid).toHaveClass('grid');
  });

  it('should filter templates by type when tabs are clicked', async () => {
    render(<TemplateLibraryModal {...defaultProps} />, { wrapper: createWrapper() });

    // Click Sections tab
    fireEvent.click(screen.getByRole('tab', { name: /sections/i }));

    await waitFor(() => {
      const grid = screen.getByTestId('template-grid');
      const cards = grid.querySelectorAll('[data-testid^="template-card"]');
      // Should only show section type items
      expect(cards).toHaveLength(2); // Hero Section and Footer Section
    });

    // Click Pages tab
    fireEvent.click(screen.getByRole('tab', { name: /pages/i }));

    await waitFor(() => {
      const grid = screen.getByTestId('template-grid');
      const cards = grid.querySelectorAll('[data-testid^="template-card"]');
      // Should only show page type items
      expect(cards).toHaveLength(1); // About Page
    });
  });

  it('should filter templates by search query', async () => {
    render(<TemplateLibraryModal {...defaultProps} />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search templates/i);
    fireEvent.change(searchInput, { target: { value: 'hero' } });

    await waitFor(() => {
      expect(screen.getByText('Hero Section')).toBeInTheDocument();
      expect(screen.queryByText('About Page')).not.toBeInTheDocument();
      expect(screen.queryByText('Footer Section')).not.toBeInTheDocument();
    });
  });

  it('should call onSelect with template when template is clicked', () => {
    const onSelect = vi.fn();
    render(<TemplateLibraryModal {...defaultProps} onSelect={onSelect} />, { wrapper: createWrapper() });

    const heroCard = screen.getByTestId('template-card-1');
    fireEvent.click(heroCard);

    expect(onSelect).toHaveBeenCalledWith({
      id: '1',
      name: 'Hero Section',
      type: 'section',
      category: 'hero',
    });
  });

  it('should close modal after selection', async () => {
    const onOpenChange = vi.fn();
    render(<TemplateLibraryModal {...defaultProps} onOpenChange={onOpenChange} />, { wrapper: createWrapper() });

    const heroCard = screen.getByTestId('template-card-1');
    fireEvent.click(heroCard);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should close modal when close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(<TemplateLibraryModal {...defaultProps} onOpenChange={onOpenChange} />, { wrapper: createWrapper() });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });


  it('should display category dropdown with dynamic options', () => {
    render(<TemplateLibraryModal {...defaultProps} />, { wrapper: createWrapper() });

    const categoryDropdown = screen.getByRole('combobox', { name: /category/i });
    expect(categoryDropdown).toBeInTheDocument();

    fireEvent.click(categoryDropdown);

    expect(screen.getByRole('option', { name: /all categories/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /hero/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /landing/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /navigation/i })).toBeInTheDocument();
  });

  it('should be responsive - 3 columns on desktop, 2 on tablet, 1 on mobile', () => {
    render(<TemplateLibraryModal {...defaultProps} />, { wrapper: createWrapper() });

    const grid = screen.getByTestId('template-grid');

    // Check for responsive grid classes
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });
});