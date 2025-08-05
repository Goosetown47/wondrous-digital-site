/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useBuilderStore } from '@/stores/builderStore';
import { useSaveDraft } from '@/hooks/usePages';
import { vi } from 'vitest';

// Mock the useSaveDraft hook
vi.mock('@/hooks/usePages', () => ({
  useSaveDraft: vi.fn(),
}));

const mockedUseSaveDraft = vi.mocked(useSaveDraft);

describe('useAutoSave', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset the store
    useBuilderStore.getState().clearAll();

    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should not trigger auto-save when not dirty', () => {
    const mockMutate = vi.fn();
    mockedUseSaveDraft.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSaveDraft>);

    renderHook(() => useAutoSave(), { wrapper });

    // Set up store with clean state
    act(() => {
      useBuilderStore.getState().loadPage(
        'page-1',
        'project-1',
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        'Test Page'
      );
    });

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should trigger auto-save after 2 seconds when dirty', async () => {
    const mockMutate = vi.fn((params, options) => {
      // Simulate successful save
      if (options?.onSuccess) {
        options.onSuccess();
      }
    });
    
    mockedUseSaveDraft.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSaveDraft>);

    renderHook(() => useAutoSave(), { wrapper });

    // Set up store and make it dirty
    act(() => {
      useBuilderStore.getState().loadPage(
        'page-1',
        'project-1',
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        'Test Page'
      );
      useBuilderStore.getState().markDirty();
    });

    // Fast-forward time to trigger auto-save
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          pageId: 'page-1',
          sections: [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        },
        expect.any(Object)
      );
    });
  });

  it('should debounce multiple changes', async () => {
    const mockMutate = vi.fn((params, options) => {
      if (options?.onSuccess) {
        options.onSuccess();
      }
    });
    
    mockedUseSaveDraft.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSaveDraft>);

    renderHook(() => useAutoSave(), { wrapper });

    // Set up store
    act(() => {
      useBuilderStore.getState().loadPage(
        'page-1',
        'project-1',
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        'Test Page'
      );
    });

    // Make multiple changes quickly
    act(() => {
      useBuilderStore.getState().markDirty();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      useBuilderStore.getState().markDirty();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      useBuilderStore.getState().markDirty();
    });

    // Should only trigger save once after debounce period
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
  });

  it('should provide saveNow function for immediate save', async () => {
    const mockMutate = vi.fn((params, options) => {
      if (options?.onSuccess) {
        options.onSuccess();
      }
    });
    
    mockedUseSaveDraft.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSaveDraft>);

    const { result } = renderHook(() => useAutoSave(), { wrapper });

    // Set up store and make it dirty
    act(() => {
      useBuilderStore.getState().loadPage(
        'page-1',
        'project-1',
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        'Test Page'
      );
      useBuilderStore.getState().markDirty();
    });

    // Call saveNow immediately
    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockMutate).toHaveBeenCalledWith(
      {
        pageId: 'page-1',
        sections: [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
      },
      expect.any(Object)
    );
  });

  it('should handle save errors', async () => {
    const mockMutate = vi.fn((params, options) => {
      if (options?.onError) {
        options.onError(new Error('Save failed'));
      }
    });
    
    mockedUseSaveDraft.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSaveDraft>);

    renderHook(() => useAutoSave(), { wrapper });

    // Set up store and make it dirty
    act(() => {
      useBuilderStore.getState().loadPage(
        'page-1',
        'project-1',
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        'Test Page'
      );
      useBuilderStore.getState().markDirty();
    });

    // Trigger auto-save
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(useBuilderStore.getState().saveStatus).toBe('error');
      expect(useBuilderStore.getState().saveError).toBe('Save failed');
    });
  });

  it('should not save when pageId is missing', () => {
    const mockMutate = vi.fn();
    mockedUseSaveDraft.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSaveDraft>);

    renderHook(() => useAutoSave(), { wrapper });

    // Set store without pageId
    act(() => {
      useBuilderStore.getState().markDirty();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});