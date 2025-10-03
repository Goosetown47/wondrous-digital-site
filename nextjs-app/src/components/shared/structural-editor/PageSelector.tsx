/**
 * PageSelector Component
 *
 * Searchable dropdown to select pages from a project
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';

interface ProjectPage {
  id: string;
  name: string;
  path: string;
  published: boolean;
}

export interface PageSelectorProps {
  /** Project ID to fetch pages from */
  projectId: string;
  /** Selected page ID */
  value: string | null;
  /** Change handler - receives pageId and pagePath */
  onChange: (pageId: string | null, pagePath?: string | null) => void;
  /** Optional label text */
  label?: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional className for styling */
  className?: string;
}

export function PageSelector({
  projectId,
  value,
  onChange,
  label = 'Select Page',
  placeholder = 'Choose a page...',
  className,
}: PageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch project pages
  const { data: pages, isLoading, error } = useQuery<ProjectPage[]>({
    queryKey: ['project-pages', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/pages`);
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      return response.json();
    },
    enabled: !!projectId,
  });

  // Filter pages by search term
  const filteredPages = useMemo(() => {
    if (!pages) return [];
    if (!searchTerm) return pages;

    const term = searchTerm.toLowerCase();
    return pages.filter(
      (page) =>
        page.name.toLowerCase().includes(term) || page.path.toLowerCase().includes(term)
    );
  }, [pages, searchTerm]);

  // Find selected page
  const selectedPage = pages?.find((page) => page.id === value);

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium text-foreground mb-2 block">{label}</Label>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading pages...
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load pages</div>
      ) : !pages || pages.length === 0 ? (
        <div className="text-sm text-muted-foreground">No pages found in this project</div>
      ) : (
        <Select
          value={value || ''}
          onValueChange={(val) => {
            const selectedPage = pages?.find((p) => p.id === val);
            onChange(val || null, selectedPage?.path || null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder}>
              {selectedPage ? (
                <span>
                  {selectedPage.name}
                  <span className="text-muted-foreground ml-2 text-xs">
                    {selectedPage.path}
                  </span>
                </span>
              ) : (
                placeholder
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {/* Search Input */}
            <div className="px-2 py-1.5 sticky top-0 bg-background border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
            </div>

            {/* Pages List */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredPages.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No pages match your search
                </div>
              ) : (
                filteredPages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{page.name}</span>
                      <span className="text-xs text-muted-foreground">{page.path}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </div>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
