'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coreComponentsService } from '@/lib/supabase/core-components';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Check } from 'lucide-react';
import type { CoreComponent } from '@/types/builder';

interface ComponentSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectComponent: (component: CoreComponent) => void;
  currentComponentName?: string;
}

export function ComponentSelectorModal({
  open,
  onOpenChange,
  onSelectComponent,
  currentComponentName,
}: ComponentSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all core components from database (sections only)
  const { data: allComponents = [], isLoading } = useQuery({
    queryKey: ['core-components'],
    queryFn: async () => {
      const components = await coreComponentsService.getAll();
      // Filter to only show sections
      return components.filter(c => c.type === 'section');
    },
    enabled: open,
  });

  // Filter components based on search
  const filteredComponents = allComponents.filter(component => {
    const matchesSearch = searchTerm === '' ||
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (component.description && component.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleSelectComponent = (component: CoreComponent) => {
    onSelectComponent(component);
    onOpenChange(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Component</DialogTitle>
          <DialogDescription>
            Select a component from the Core library to use in your draft
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Components List */}
          <ScrollArea className="h-[450px] pr-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading components...
              </div>
            ) : filteredComponents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? 'No components found matching your search'
                  : 'No components available'}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredComponents.map((component) => (
                  <Card
                    key={component.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      currentComponentName === component.name ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelectComponent(component)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {component.name}
                            {currentComponentName === component.name && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CardTitle>
                          {component.description && (
                            <CardDescription className="text-xs">
                              {component.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {component.source}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {component.dependencies?.length || 0} dependencies
                        </div>
                        <Button
                          size="sm"
                          variant={currentComponentName === component.name ? "secondary" : "default"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectComponent(component);
                          }}
                        >
                          {currentComponentName === component.name ? (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Plus className="mr-1 h-3 w-3" />
                              Select
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}