/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePublishPage, useUnpublishedChanges } from '@/hooks/usePages';
import { publishPageDraft, pageHasUnpublishedChanges } from '@/lib/services/pages';
import { toast } from 'sonner';
import { vi } from 'vitest';

// Mock the services
vi.mock('@/lib/services/pages', () => ({
  publishPageDraft: vi.fn(),
  pageHasUnpublishedChanges: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockedPublishPageDraft = vi.mocked(publishPageDraft);
const mockedPageHasUnpublishedChanges = vi.mocked(pageHasUnpublishedChanges);
const mockedToast = vi.mocked(toast);

describe('usePublishPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should publish page successfully', async () => {
    const mockPage = {
      id: 'test-page-id',
      project_id: 'test-project-id',
      path: '/',
      title: 'Test Page',
      sections: [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
      published_sections: [{ id: 'section-1', type: 'hero', content: {}, order: 0 }],
      metadata: {},
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    mockedPublishPageDraft.mockResolvedValue(mockPage);

    const { result } = renderHook(() => usePublishPage(), { wrapper });

    result.current.mutate({ pageId: 'test-page-id' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedPublishPageDraft).toHaveBeenCalledWith('test-page-id');
    expect(mockedToast.success).toHaveBeenCalledWith('Page published successfully');
  });

  it('should handle publish error', async () => {
    const error = new Error('Failed to publish');
    mockedPublishPageDraft.mockRejectedValue(error);

    const { result } = renderHook(() => usePublishPage(), { wrapper });

    result.current.mutate({ pageId: 'test-page-id' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockedToast.error).toHaveBeenCalledWith('Failed to publish');
  });
});

describe('useUnpublishedChanges', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should return true when there are unpublished changes', async () => {
    mockedPageHasUnpublishedChanges.mockResolvedValue(true);

    const { result } = renderHook(() => useUnpublishedChanges('test-page-id'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBe(true);
    });

    expect(mockedPageHasUnpublishedChanges).toHaveBeenCalledWith('test-page-id');
  });

  it('should return false when there are no unpublished changes', async () => {
    mockedPageHasUnpublishedChanges.mockResolvedValue(false);

    const { result } = renderHook(() => useUnpublishedChanges('test-page-id'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBe(false);
    });

    expect(mockedPageHasUnpublishedChanges).toHaveBeenCalledWith('test-page-id');
  });

  it('should return undefined when pageId is undefined', async () => {
    const { result } = renderHook(() => useUnpublishedChanges(undefined), { wrapper });

    // Query should be disabled when pageId is undefined
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);

    expect(mockedPageHasUnpublishedChanges).not.toHaveBeenCalled();
  });
});