'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCoreComponents } from '@/hooks/useCoreComponents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Code, Package, Loader2 } from 'lucide-react';
import type { ComponentFilters } from '@/lib/supabase/core-components';

export default function CorePage() {
  const [filters, setFilters] = useState<ComponentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { data: components, isLoading } = useCoreComponents(filters);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleTypeFilter = (type: string) => {
    if (type === 'all') {
      setFilters(prev => ({ ...prev, type: undefined }));
    } else {
      setFilters(prev => ({ ...prev, type: type as 'component' | 'section' }));
    }
  };

  const handleSourceFilter = (source: string) => {
    if (source === 'all') {
      setFilters(prev => ({ ...prev, source: undefined }));
    } else {
      setFilters(prev => ({ ...prev, source: source as 'shadcn' | 'custom' | 'third-party' }));
    }
  };

  const componentCount = components?.length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Core Components</h1>
          <p className="text-muted-foreground">
            Raw component library from shadcn/ui and other sources
          </p>
        </div>
        <Button asChild>
          <Link href="/core/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Component
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all" onValueChange={handleTypeFilter}>
          <TabsList>
            <TabsTrigger value="all">All Types</TabsTrigger>
            <TabsTrigger value="component">Components</TabsTrigger>
            <TabsTrigger value="section">Sections</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs defaultValue="all" onValueChange={handleSourceFilter}>
          <TabsList>
            <TabsTrigger value="all">All Sources</TabsTrigger>
            <TabsTrigger value="shadcn">shadcn/ui</TabsTrigger>
            <TabsTrigger value="aceternity">Aceternity</TabsTrigger>
            <TabsTrigger value="expansions">Expansions</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Component Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {componentCount} component{componentCount !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Components Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : components && components.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {components.map((component) => (
            <Card key={component.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{component.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {component.type === 'component' ? (
                        <Package className="inline h-3 w-3 mr-1" />
                      ) : (
                        <Code className="inline h-3 w-3 mr-1" />
                      )}
                      {component.type}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{component.source}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {component.dependencies && component.dependencies.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Dependencies: {component.dependencies.length}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/core/${component.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(component.code);
                      }}
                    >
                      Copy Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No components found. Start by adding your first component.
          </p>
          <Button asChild>
            <Link href="/core/add">
              <Plus className="mr-2 h-4 w-4" />
              Add First Component
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}