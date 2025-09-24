'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { useLibraryItems } from '@/hooks/useLibrary';
import { useDebounce } from '@/hooks/useDebounce';
import type { LibraryItem } from '@/types/builder';

interface TemplateLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: LibraryItem) => void;
}

export function TemplateLibraryModal({
  open,
  onOpenChange,
  onSelect,
}: TemplateLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'sections' | 'pages'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch library items with filters
  const {
    data: items,
    isLoading,
  } = useLibraryItems({
    type: activeTab === 'all' ? undefined : activeTab === 'sections' ? 'section' : 'page',
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: debouncedSearch || undefined,
  });

  // Get unique categories from items
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    if (items) {
      items.forEach((item: LibraryItem) => {
        if (item.category) {
          categorySet.add(item.category);
        }
      });
    }
    return Array.from(categorySet).sort();
  }, [items]);

  // Filter items based on tab (excluding themes)
  const filteredItems = useMemo(() => {
    if (!items) return [];

    // First, filter out themes from all items
    const nonThemeItems = items.filter((item: LibraryItem) => item.type !== 'theme');

    if (activeTab === 'all') {
      return nonThemeItems;
    }

    return nonThemeItems.filter((item: LibraryItem) => {
      if (activeTab === 'sections') return item.type === 'section';
      if (activeTab === 'pages') return item.type === 'page';
      return true;
    });
  }, [items, activeTab]);


  // Handle template selection
  const handleSelect = (template: LibraryItem) => {
    onSelect(template);
    onOpenChange(false);
  };

  // Reset filters when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('all');
      setSelectedCategory('all');
      setSearchQuery('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-4 pb-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'sections' | 'pages')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Category */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {categories.length > 0 && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" aria-label="Category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Template Grid */}
        <div
          ref={scrollContainerRef}
          data-testid="scroll-container"
          className="flex-1 overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No templates found</p>
            </div>
          ) : (
            <div
              data-testid="template-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4"
            >
              {filteredItems.map((item: LibraryItem) => (
                <TemplateCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  type={item.type === 'theme' ? 'site' : item.type as 'section' | 'page' | 'site'}
                  category={item.category ?? undefined}
                  previewImage={(item.metadata?.preview_image as string) ?? null}
                  onClick={() => handleSelect(item)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}