'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Type, Layout, FileText, Globe, Search, Loader2, Filter, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLibraryItems } from '@/hooks/useLibrary';
import { useTypesByCategory } from '@/hooks/useTypes';

const typeIcons = {
  section: Layout,
  page: FileText,
  site: Globe,
};

interface SectionLibraryProps {
  onDragStart: (sectionType: string) => void;
}

export function SectionLibrary({ onDragStart }: SectionLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'section' | 'page'>('all');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all');

  // Fetch types based on selected category
  const { data: sectionTypes } = useTypesByCategory('section');
  const { data: pageTypes } = useTypesByCategory('page');

  // Get current types based on selection
  const currentTypes = selectedType === 'section' ? sectionTypes : 
                      selectedType === 'page' ? pageTypes : 
                      null;

  // Fetch items based on selected type
  const { data: sectionItems, isLoading: sectionsLoading } = useLibraryItems({
    type: 'section',
    published: true,
    search: searchQuery,
    typeId: selectedType === 'section' && selectedTypeId !== 'all' ? selectedTypeId : undefined,
  });

  const { data: pageItems, isLoading: pagesLoading } = useLibraryItems({
    type: 'page',
    published: true,
    search: searchQuery,
    typeId: selectedType === 'page' && selectedTypeId !== 'all' ? selectedTypeId : undefined,
  });

  // Combine items based on filter
  const isLoading = sectionsLoading || pagesLoading;
  const items = selectedType === 'all' 
    ? [...(sectionItems || []), ...(pageItems || [])]
    : selectedType === 'section' 
    ? (sectionItems || [])
    : (pageItems || []);

  // Reset type filter when category changes
  const handleCategoryChange = (value: string) => {
    setSelectedType(value as any);
    setSelectedTypeId('all');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-3">
        {/* Category Filter */}
        <Select value={selectedType} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter templates" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            <SelectItem value="section">Sections Only</SelectItem>
            <SelectItem value="page">Pages Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter - only show when a specific category is selected */}
        {selectedType !== 'all' && currentTypes && currentTypes.length > 0 && (
          <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {selectedType === 'section' ? 'Section' : 'Page'} Types</SelectItem>
              {currentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No published templates available
              {selectedTypeId !== 'all' && ' for this type'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create and publish some in the Lab
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const Icon = typeIcons[item.type] || Layout;
              // Find the type display name if available
              const typeInfo = item.type_id ? 
                (item.type === 'section' ? sectionTypes : pageTypes)?.find(t => t.id === item.type_id) : 
                null;
              
              return (
                <motion.div
                  key={item.id}
                  draggable
                  onDragStart={() => onDragStart(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileDrag={{ scale: 1.05, opacity: 0.8 }}
                  className="group"
                >
                  <Card className="p-3 cursor-move transition-all hover:shadow-md group-active:shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-md shrink-0">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        {item.content?.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {item.content.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            {item.type}
                          </span>
                          {typeInfo && (
                            <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {typeInfo.display_name}
                            </span>
                          )}
                          {item.category && (
                            <span className="inline-block text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}