'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCoreComponents, useDeleteComponent } from '@/hooks/useCoreComponents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Code, Package, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import type { ComponentFilters } from '@/lib/supabase/core-components';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CoreClient() {
  const [filters, setFilters] = useState<ComponentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: ''
  });
  const { data: components, isLoading } = useCoreComponents(filters);
  const deleteComponent = useDeleteComponent();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleDeleteClick = (componentId: string, componentName: string) => {
    setDeleteDialog({ open: true, id: componentId, name: componentName });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteComponent.mutateAsync(deleteDialog.id);
      setDeleteDialog({ open: false, id: '', name: '' });
    } catch (error) {
      console.error('Failed to delete component:', error);
      // Could add a toast notification here instead of alert
    }
  };

  // Removed unused handleTypeFilter function

  const handleSourceFilter = (source: string) => {
    if (source === 'all') {
      setFilters(prev => ({ ...prev, source: undefined }));
    } else {
      setFilters(prev => ({ ...prev, source: source as 'shadcn' | 'aceternity' | 'expansions' | 'custom' }));
    }
  };

  const componentCount = components?.length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Core Sections</h1>
          <p className="text-muted-foreground">
            Raw section library from shadcn/ui and other sources
          </p>
        </div>
        <Button asChild>
          <Link href="/core/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all" onValueChange={handleSourceFilter}>
          <TabsList>
            <TabsTrigger value="all">All Sources</TabsTrigger>
            <TabsTrigger value="ui.shadcn.com">ui.shadcn.com</TabsTrigger>
            <TabsTrigger value="ui.aceternity.com">ui.aceternity.com</TabsTrigger>
            <TabsTrigger value="pro.aceternity.com">pro.aceternity.com</TabsTrigger>
            <TabsTrigger value="shadcnblocks.com">shadcnblocks.com</TabsTrigger>
            <TabsTrigger value="reactbits.dev">reactbits.dev</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Section Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {componentCount} section{componentCount !== 1 ? 's' : ''} found
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
                  <div className="flex-1">
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
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary">{component.source}</Badge>
                    {component.usage && component.usage.totalUsage > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Used {component.usage.totalUsage}x
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {component.dependencies && component.dependencies.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Dependencies: {component.dependencies.length}
                    </div>
                  )}
                  {component.usage && component.usage.totalUsage > 0 && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Used by {component.usage.draftCount} draft{component.usage.draftCount !== 1 ? 's' : ''}, {component.usage.libraryCount} library item{component.usage.libraryCount !== 1 ? 's' : ''}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(component.id, component.name)}
                      disabled={deleteComponent.isPending || (component.usage?.isInUse ?? false)}
                      className="text-destructive hover:text-destructive disabled:opacity-50"
                      title={component.usage?.isInUse ? 'Cannot delete: Component is in use' : 'Delete component'}
                    >
                      <Trash2 className="h-3 w-3" />
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
            No sections found. Start by adding your first section.
          </p>
          <Button asChild>
            <Link href="/core/add">
              <Plus className="mr-2 h-4 w-4" />
              Add First Section
            </Link>
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteComponent.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteComponent.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}