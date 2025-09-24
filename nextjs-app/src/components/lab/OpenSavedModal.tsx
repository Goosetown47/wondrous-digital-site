'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, FileText, Layout, Globe, Palette, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface OpenSavedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LibraryItem {
  id: string;
  name: string;
  type: 'section' | 'page' | 'site' | 'theme';
  subtype?: string;
  version: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export function OpenSavedModal({ open, onOpenChange }: OpenSavedModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'draft' | 'published'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'section' | 'page' | 'site' | 'theme'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');

  // Fetch lab drafts
  const { data: drafts = [], isLoading: isDraftsLoading } = useQuery({
    queryKey: ['lab-drafts'],
    queryFn: () => labDraftService.getAll(),
    enabled: open,
  });

  // Fetch library items
  const { data: libraryItems = [], isLoading: isLibraryLoading } = useQuery({
    queryKey: ['library-items'],
    queryFn: async () => {
      const response = await fetch('/api/library?type=all&published=all');
      if (!response.ok) throw new Error('Failed to fetch library items');
      return response.json() as Promise<LibraryItem[]>;
    },
    enabled: open,
  });

  // Combine drafts and library items
  const allItems = [
    ...drafts.map(draft => ({
      ...draft,
      source: 'draft' as const,
      version: draft.version || 1, // Use draft.version, not library_version
      published: false,
      subtype: draft.metadata?.subtype || draft.metadata?.component_type || '',
    })),
    ...libraryItems.map(item => ({
      ...item,
      source: 'library' as const,
      status: 'published' as const,
      version: item.version || 1, // Ensure library items also have version
      subtype: item.subtype || '',
    })),
  ];

  // Filter and sort items
  const filteredItems = allItems
    .filter(item => {
      // Search filter
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType === 'draft' && item.source !== 'draft') return false;
      if (filterType === 'published' && !item.published) return false;

      // Category filter
      if (filterCategory !== 'all' && item.type !== filterCategory) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  const handleOpenItem = (item: typeof allItems[0]) => {
    if (item.source === 'draft') {
      // Open draft directly
      router.push(`/lab/${item.id}`);
    } else {
      // Create new draft version from published item
      handleCreateDraftFromPublished(item.id);
    }
    onOpenChange(false);
  };

  const handleCreateDraftFromPublished = async (libraryItemId: string) => {
    try {
      // Fetch library item details
      const response = await fetch(`/api/library/${libraryItemId}`);
      if (!response.ok) throw new Error('Failed to fetch library item');
      const libraryItem = await response.json();

      // Create new draft from library item
      const newDraft = await labDraftService.create({
        name: `${libraryItem.name} (New Version)`,
        type: libraryItem.type,
        type_id: libraryItem.type_id,
        content: libraryItem.content,
        metadata: {
          ...libraryItem.metadata,
          library_item_id: libraryItemId,
          source: 'library',
        },
        status: 'draft',
        version: 1,
        content_hash: '',
        library_version: libraryItem.version || 1,
      });

      // Navigate to new draft
      router.push(`/lab/${newDraft.id}`);
    } catch (error) {
      console.error('Failed to create draft from library item:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'section': return <Layout className="h-4 w-4" />;
      case 'page': return <FileText className="h-4 w-4" />;
      case 'site': return <Globe className="h-4 w-4" />;
      case 'theme': return <Palette className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Open Saved</DialogTitle>
          <DialogDescription>
            Select a draft or library item to open for editing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={(value: typeof filterType) => setFilterType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={(value: typeof filterCategory) => setFilterCategory(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="section">Sections</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                  <SelectItem value="site">Sites</SelectItem>
                  <SelectItem value="theme">Themes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
              </span>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Latest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items List */}
          <ScrollArea className="h-[400px] pr-4">
            {(isDraftsLoading || isLibraryLoading) ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading items...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <Button
                    key={`${item.source}-${item.id}`}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleOpenItem(item)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {getIcon(item.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            v{item.version}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="capitalize">{item.type}</span>
                          {item.subtype && typeof item.subtype === 'string' && (
                            <span>• {item.subtype}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(item.updated_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.source === 'draft' ? 'secondary' : 'default'}>
                          {item.source === 'draft' ? 'Draft' : 'Published'}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}