import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditDraftPage from '../page';
import { useParams, useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client first
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
      })),
    },
  })),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

// Mock services
vi.mock('@/lib/supabase/lab-drafts', () => ({
  labDraftService: {
    getById: vi.fn(() => Promise.resolve({
      id: 'test-draft-id',
      name: 'Test Draft',
      type: 'section',
      status: 'draft',
      content: {},
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    getAll: vi.fn(() => Promise.resolve([])),
    update: vi.fn(() => Promise.resolve({})),
    promoteToLibrary: vi.fn(() => Promise.resolve({})),
    updateLibraryItem: vi.fn(() => Promise.resolve({})),
  },
}));

vi.mock('@/lib/supabase/core-components', () => ({
  coreComponentsService: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('@/hooks/useTypes', () => ({
  useTypes: vi.fn(() => ({ data: [] })),
  useTypesByCategory: vi.fn(() => ({ data: [] })),
}));

vi.mock('@/hooks/useThemes', () => ({
  useThemes: vi.fn(() => ({ 
    data: [
      { id: 'theme-1', name: 'Modern', published: true },
      { id: 'theme-2', name: 'Classic', published: true },
      { id: 'theme-3', name: 'Minimal', published: true },
    ] 
  })),
}));

// Mock components that might not exist yet
vi.mock('@/components/lab/OpenSavedModal', () => ({
  OpenSavedModal: vi.fn(({ open }) => 
    open ? <div data-testid="open-saved-modal">Open Saved Modal</div> : null
  ),
}));

describe('LAB Interface Redesign', () => {
  let queryClient: QueryClient;
  const mockPush = vi.fn();
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ id: 'test-draft-id' });
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EditDraftPage />
      </QueryClientProvider>
    );
  };

  describe('Header Layout', () => {
    it('should NOT have a settings cog button in the header', async () => {
      renderComponent();
      
      await waitFor(() => {
        // Settings icon should not be in the main header
        const header = screen.getByRole('banner');
        const settingsButton = header.querySelector('[data-testid="settings-button"]');
        expect(settingsButton).toBeNull();
      });
    });

    it('should have Import Component button on the left side with pink/primary color', async () => {
      renderComponent();
      
      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /import component/i });
        expect(importButton).toBeInTheDocument();
        expect(importButton).toHaveClass('bg-primary', 'text-primary-foreground');
        
        // Check it's positioned on the left
        const header = importButton.closest('header');
        const leftSection = header?.querySelector('.flex.items-center.gap-3');
        expect(leftSection).toContainElement(importButton);
      });
    });

    it('should have Theme dropdown in the header toolbar', async () => {
      renderComponent();
      
      await waitFor(() => {
        const themeDropdown = screen.getByRole('combobox', { name: /theme/i });
        expect(themeDropdown).toBeInTheDocument();
        
        // Should be in the header, not in a side panel
        const header = themeDropdown.closest('header');
        expect(header).toBeInTheDocument();
      });
    });

    it('should populate Theme dropdown with actual themes from library', async () => {
      renderComponent();
      
      await waitFor(() => {
        const themeDropdown = screen.getByRole('combobox', { name: /theme/i });
        fireEvent.click(themeDropdown);
      });
      
      // Should NOT have hardcoded "Default" option
      expect(screen.queryByText('Default')).not.toBeInTheDocument();
      
      // Should have actual themes
      expect(screen.getByText('Modern')).toBeInTheDocument();
      expect(screen.getByText('Classic')).toBeInTheDocument();
      expect(screen.getByText('Minimal')).toBeInTheDocument();
    });

    it('should have Type dropdown (Section/Page) in header', async () => {
      renderComponent();
      
      await waitFor(() => {
        // First wait for the draft to load
        expect(screen.getByRole('textbox', { name: /draft name/i })).toBeInTheDocument();
      });

      await waitFor(() => {
        const typeDropdown = screen.getByRole('combobox', { name: 'Type' });
        expect(typeDropdown).toBeInTheDocument();
        
        fireEvent.click(typeDropdown);
        expect(screen.getByText('Section')).toBeInTheDocument();
        expect(screen.getByText('Page')).toBeInTheDocument();
      });
    });

    it('should have Sub Type dropdown that populates based on Type selection', async () => {
      renderComponent();
      
      await waitFor(() => {
        const subTypeDropdown = screen.getByRole('combobox', { name: 'Subtype' });
        expect(subTypeDropdown).toBeInTheDocument();
      });
      
      // Select Section type
      const typeDropdown = screen.getByRole('combobox', { name: 'Type' });
      fireEvent.click(typeDropdown);
      fireEvent.click(screen.getByText('Section'));
      
      // Sub Type should update with section types
      const subTypeDropdown = screen.getByRole('combobox', { name: 'Subtype' });
      fireEvent.click(subTypeDropdown);
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Hero')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
    });

    it('should have Version dropdown for selecting draft versions', async () => {
      renderComponent();
      
      await waitFor(() => {
        const versionDropdown = screen.getByRole('combobox', { name: /version/i });
        expect(versionDropdown).toBeInTheDocument();
        expect(versionDropdown).toHaveTextContent('v1'); // Default version
      });
    });

    it('should have Open Saved button in header', async () => {
      renderComponent();
      
      await waitFor(() => {
        const openSavedButton = screen.getByRole('button', { name: /open saved/i });
        expect(openSavedButton).toBeInTheDocument();
        
        // Should be in header
        const header = openSavedButton.closest('header');
        expect(header).toBeInTheDocument();
      });
    });

    it('should keep Save Draft button in header', async () => {
      renderComponent();
      
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save draft/i });
        expect(saveButton).toBeInTheDocument();
      });
    });

    it('should keep Promote to Library button in header', async () => {
      renderComponent();
      
      await waitFor(() => {
        const promoteButton = screen.getByRole('button', { name: /promote to library/i });
        expect(promoteButton).toBeInTheDocument();
      });
    });

    it('should have responsive viewport toggles (desktop/tablet/mobile)', async () => {
      renderComponent();
      
      await waitFor(() => {
        const desktopButton = screen.getByRole('button', { name: /desktop/i });
        const tabletButton = screen.getByRole('button', { name: /tablet/i });
        const mobileButton = screen.getByRole('button', { name: /mobile/i });
        
        expect(desktopButton).toBeInTheDocument();
        expect(tabletButton).toBeInTheDocument();
        expect(mobileButton).toBeInTheDocument();
        
        // All should be in the header
        const header = desktopButton.closest('header');
        expect(header).toContainElement(tabletButton);
        expect(header).toContainElement(mobileButton);
      });
    });
  });

  describe('Component Interactions', () => {
    it('should open component selector modal when Import Component is clicked', async () => {
      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /import component/i });
        expect(importButton).toBeInTheDocument();
      });
      
      const importButton = screen.getByRole('button', { name: /import component/i });
      await user.click(importButton);
      
      // Modal should open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/select a component/i)).toBeInTheDocument();
      });
    });

    it('should open saved drafts modal when Open Saved is clicked', async () => {
      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        const openSavedButton = screen.getByRole('button', { name: /open saved/i });
        expect(openSavedButton).toBeInTheDocument();
      });
      
      const openSavedButton = screen.getByRole('button', { name: /open saved/i });
      await user.click(openSavedButton);
      
      // Modal should open
      await waitFor(() => {
        expect(screen.getByTestId('open-saved-modal')).toBeInTheDocument();
      });
    });

    it('should apply selected theme to preview when theme is changed', async () => {
      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        const themeDropdown = screen.getByRole('combobox', { name: /theme/i });
        expect(themeDropdown).toBeInTheDocument();
      });
      
      const themeDropdown = screen.getByRole('combobox', { name: /theme/i });
      await user.click(themeDropdown);
      await user.click(screen.getByText('Modern'));
      
      // Preview should have theme applied
      await waitFor(() => {
        const preview = screen.getByTestId('resizable-preview');
        expect(preview).toHaveClass('theme-modern');
      });
    });

    it('should show autosave indicator when content changes', async () => {
      renderComponent();
      const user = userEvent.setup();
      
      await waitFor(() => {
        const draftNameInput = screen.getByRole('textbox', { name: /draft name/i });
        expect(draftNameInput).toBeInTheDocument();
      });
      
      const draftNameInput = screen.getByRole('textbox', { name: /draft name/i });
      await user.type(draftNameInput, ' Updated');
      
      // Should show saving indicator
      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
      });
      
      // Should show saved after a delay
      await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Layout Structure', () => {
    it('should have header at top with all controls', async () => {
      renderComponent();
      
      await waitFor(() => {
        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
        
        // Should contain all main controls
        expect(header).toContainElement(screen.getByRole('button', { name: /import component/i }));
        expect(header).toContainElement(screen.getByRole('combobox', { name: /theme/i }));
        expect(header).toContainElement(screen.getByRole('combobox', { name: /type/i }));
        expect(header).toContainElement(screen.getByRole('button', { name: /save draft/i }));
      });
    });

    it('should have clean canvas area without settings panel', async () => {
      renderComponent();
      
      await waitFor(() => {
        // Should not have a side panel for settings
        expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
        expect(screen.queryByTestId('settings-sheet')).not.toBeInTheDocument();
        
        // Canvas should be the main focus
        const canvas = screen.getByTestId('lab-canvas');
        expect(canvas).toBeInTheDocument();
      });
    });
  });
});