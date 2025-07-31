'use client';

import { Loader2 } from 'lucide-react';
import { LibraryCard } from './LibraryCard';
import { LibraryListItem } from './LibraryListItem';
import type { LibraryItem, LibraryItemType } from '@/types/builder';

interface LibraryGridProps {
  items: LibraryItem[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  type: LibraryItemType;
}

export function LibraryGrid({ items, viewMode, isLoading, type }: LibraryGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No {type}s found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create some in the Lab and promote them here
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <LibraryListItem key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <LibraryCard key={item.id} item={item} />
      ))}
    </div>
  );
}