'use client';

import { useEffect, useState } from 'react';
import { listProjectPages } from '@/lib/services/pages';
import type { Page } from '@/types/database';

interface UseProjectPagesOptions {
  projectId?: string | null;
  enabled?: boolean;
}

/**
 * Hook to fetch pages for a project
 * Returns an empty array if no project is provided
 */
export function useProjectPages({ projectId, enabled = true }: UseProjectPagesOptions = {}) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !projectId) {
      setPages([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchPages = async () => {
      setLoading(true);
      setError(null);

      try {
        const projectPages = await listProjectPages(projectId);
        setPages(projectPages || []);
      } catch (err) {
        console.error('Failed to fetch project pages:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch pages'));
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [projectId, enabled]);

  return { pages, loading, error };
}