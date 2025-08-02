'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { LibraryGrid } from '@/components/library/LibraryGrid';
import { useLibraryItems } from '@/hooks/useLibrary';
type LibraryItemType = 'section' | 'page' | 'site' | 'theme';

function LibraryPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPublished, setShowPublished] = useState(true);
  const [selectedType, setSelectedType] = useState<LibraryItemType>(
    (tabParam as LibraryItemType) || 'section'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const selectedCategory: string | undefined = undefined;

  // Update selected type when URL parameter changes
  useEffect(() => {
    if (tabParam && ['site', 'page', 'section', 'theme'].includes(tabParam)) {
      setSelectedType(tabParam as LibraryItemType);
    }
  }, [tabParam]);

  const { data: items, isLoading } = useLibraryItems({
    type: selectedType,
    published: showPublished ? undefined : false,
    search: searchQuery,
    category: selectedCategory,
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <LibraryHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showPublished={showPublished}
        onPublishedChange={setShowPublished}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Tabs value={selectedType} onValueChange={(value: string) => setSelectedType(value as LibraryItemType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="site">Sites</TabsTrigger>
          <TabsTrigger value="page">Pages</TabsTrigger>
          <TabsTrigger value="section">Sections</TabsTrigger>
          <TabsTrigger value="theme">Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-4">
          <LibraryGrid
            items={items?.filter(item => item.type === 'site') || []}
            viewMode={viewMode}
            isLoading={isLoading}
            type="site"
          />
        </TabsContent>

        <TabsContent value="page" className="space-y-4">
          <LibraryGrid
            items={items?.filter(item => item.type === 'page') || []}
            viewMode={viewMode}
            isLoading={isLoading}
            type="page"
          />
        </TabsContent>

        <TabsContent value="section" className="space-y-4">
          <LibraryGrid
            items={items?.filter(item => item.type === 'section') || []}
            viewMode={viewMode}
            isLoading={isLoading}
            type="section"
          />
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <LibraryGrid
            items={items?.filter(item => item.type === 'theme') || []}
            viewMode={viewMode}
            isLoading={isLoading}
            type="theme"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <LibraryPageContent />
    </Suspense>
  );
}