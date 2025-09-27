import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasNavbar } from '../CanvasNavbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock hooks
vi.mock('@/hooks/usePages', () => ({
  useProjectPages: vi.fn(() => ({
    data: [
      { id: 'page1', title: 'Home', path: '/' },
      { id: 'page2', title: 'About', path: '/about' },
    ],
  })),
  usePublishPage: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

// Mock builder store
vi.mock('@/stores/builderStore', () => ({
  useBuilderStore: vi.fn(() => ({
    saveStatus: 'saved',
    lastSavedAt: new Date(),
    saveError: null,
    isDirty: false,
    hasUnpublishedChanges: () => false,
  })),
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

describe('Builder Viewport Controls', () => {
  const defaultProps = {
    projectId: 'project1',
    currentPageId: 'page1',
    currentPage: {
      id: 'page1',
      title: 'Test Page',
      path: '/test',
    },
    sectionCount: 3,
    lastSaved: new Date(),
    onSave: vi.fn(),
    onDeviceViewChange: vi.fn(),
    deviceView: 'desktop' as const,
  };

  it('should render viewport control buttons', () => {
    render(
      <CanvasNavbar {...defaultProps} />,
      { wrapper: createWrapper() }
    );

    // Check for viewport buttons
    expect(screen.getByLabelText('Desktop view')).toBeInTheDocument();
    expect(screen.getByLabelText('Tablet view')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobile view')).toBeInTheDocument();
  });

  it('should highlight active viewport button', () => {
    const { rerender } = render(
      <CanvasNavbar {...defaultProps} deviceView="desktop" />,
      { wrapper: createWrapper() }
    );

    // Desktop should be active
    const desktopButton = screen.getByLabelText('Desktop view');
    expect(desktopButton).toHaveClass('bg-primary');

    // Rerender with tablet view
    rerender(
      <CanvasNavbar {...defaultProps} deviceView="tablet" />,
    );

    // Tablet should be active
    const tabletButton = screen.getByLabelText('Tablet view');
    expect(tabletButton).toHaveClass('bg-primary');

    // Rerender with mobile view
    rerender(
      <CanvasNavbar {...defaultProps} deviceView="mobile" />,
    );

    // Mobile should be active
    const mobileButton = screen.getByLabelText('Mobile view');
    expect(mobileButton).toHaveClass('bg-primary');
  });

  it('should call onDeviceViewChange when viewport buttons are clicked', () => {
    const onDeviceViewChange = vi.fn();
    render(
      <CanvasNavbar {...defaultProps} onDeviceViewChange={onDeviceViewChange} />,
      { wrapper: createWrapper() }
    );

    // Click tablet button
    fireEvent.click(screen.getByLabelText('Tablet view'));
    expect(onDeviceViewChange).toHaveBeenCalledWith('tablet');

    // Click mobile button
    fireEvent.click(screen.getByLabelText('Mobile view'));
    expect(onDeviceViewChange).toHaveBeenCalledWith('mobile');

    // Click desktop button
    fireEvent.click(screen.getByLabelText('Desktop view'));
    expect(onDeviceViewChange).toHaveBeenCalledWith('desktop');
  });

  it('should position viewport controls in the navbar', () => {
    const { container } = render(
      <CanvasNavbar {...defaultProps} />,
      { wrapper: createWrapper() }
    );

    // Check that viewport controls are in the right section of navbar
    const navbar = container.querySelector('.sticky');
    expect(navbar).toBeInTheDocument();

    // Check viewport controls exist within navbar
    const viewportControls = container.querySelector('[data-testid="viewport-controls"]');
    expect(viewportControls).toBeInTheDocument();
    if (viewportControls && navbar) {
      expect(navbar).toContainElement(viewportControls as HTMLElement);
    }
  });

  it('should use correct icons for each viewport', () => {
    render(
      <CanvasNavbar {...defaultProps} />,
      { wrapper: createWrapper() }
    );

    // Check for icon presence (icons are rendered as svg elements)
    const desktopButton = screen.getByLabelText('Desktop view');
    const tabletButton = screen.getByLabelText('Tablet view');
    const mobileButton = screen.getByLabelText('Mobile view');

    // Each button should contain an svg icon
    expect(desktopButton.querySelector('svg')).toBeInTheDocument();
    expect(tabletButton.querySelector('svg')).toBeInTheDocument();
    expect(mobileButton.querySelector('svg')).toBeInTheDocument();
  });
});