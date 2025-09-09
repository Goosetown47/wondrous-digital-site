'use client';

import { useState } from 'react';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { useLibraryItems } from '@/hooks/useLibrary';

type LibraryItemType = 'section' | 'page' | 'site' | 'theme';

interface LibrarySingleTypeProps {
  type: LibraryItemType;
  title: string;
}

export function LibrarySingleType({ type, title }: LibrarySingleTypeProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPublished, setShowPublished] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedCategory: string | undefined = undefined;

  const { data: items, isLoading } = useLibraryItems({
    type,
    published: showPublished ? undefined : false,
    search: searchQuery,
    category: selectedCategory,
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">
          Browse and manage published {type}s
        </p>
      </div>
      
      <LibraryHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showPublished={showPublished}
        onPublishedChange={setShowPublished}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hideTitle={true}
      />

      <LibraryGrid
        items={items || []}
        viewMode={viewMode}
        isLoading={isLoading}
        type={type}
      />
    </div>
  );
}