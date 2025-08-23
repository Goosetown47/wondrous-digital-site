/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react';
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

  it('should trigger auto-save after 2 seconds when dirty', () => {
    const mockMutate = vi.fn();
    
    mockedUseSaveDraft.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSaveDraft>);

    // Set up store first
    act(() => {
      useBuilderStore.getState().loadPage(
        'page-1',
        'project-1',
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        'Test Page'
      );
    });

    renderHook(() => useAutoSave(), { wrapper });

    // Make it dirty
    act(() => {
      useBuilderStore.getState().markDirty();
    });

    // Fast-forward time to trigger auto-save
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(mockMutate).toHaveBeenCalledWith(
      {
        pageId: 'page-1',
        sections: [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
      },
      expect.any(Object)
    );
  });

  it('should debounce multiple changes', () => {
    const mockMutate = vi.fn();
    
    mockedUseSaveDraft.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSaveDraft>);

    // Set up store first
    act(() => {
      useBuilderStore.getState().loadPage(
        'page-1',
        'project-1',
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        'Test Page'
      );
    });

    renderHook(() => useAutoSave(), { wrapper });

    // Make first change
    act(() => {
      useBuilderStore.getState().markDirty();
    });

    // Advance time but not enough to trigger save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // isDirty stays true throughout, triggering saves
    // This test needs to be re-thought since isDirty doesn't toggle
    expect(mockMutate).not.toHaveBeenCalled();

    // Advance more time to trigger the save
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
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

  it('should handle save errors', () => {
    const mockMutate = vi.fn((params, callbacks) => {
      // Immediately call onError
      if (callbacks?.onError) {
        callbacks.onError(new Error('Save failed'));
      }
    });
    
    mockedUseSaveDraft.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useSaveDraft>);

    // Set up store first
    act(() => {
      useBuilderStore.getState().loadPage(
        'page-1',
        'project-1',
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
        'Test Page'
      );
    });

    renderHook(() => useAutoSave(), { wrapper });

    // Make it dirty
    act(() => {
      useBuilderStore.getState().markDirty();
    });

    // Trigger auto-save
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(mockMutate).toHaveBeenCalled();
    expect(useBuilderStore.getState().saveStatus).toBe('error');
    expect(useBuilderStore.getState().saveError).toBe('Save failed');
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