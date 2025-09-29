'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  Loader2,
  Download,
  XCircle,
  FileCode2,
  Package2,
  MoreHorizontal,
  Eye,
  Trash2,
  Search,
  Zap
} from 'lucide-react';

interface ComponentImport {
  id: string;
  name: string;
  source: string;
  sourceUrl: string;
  dependencies: string[];
  transformations: string[];
  importDate: string;
  importedBy?: string;
  metadata?: {
    isHistorical?: boolean;
    filePath?: string;
    autoDiscovered?: boolean;
  };
}

interface ComponentItem {
  id: string;
  name: string;
  type: 'component' | 'dependency';
  source: string;
  dependencies: string[];
  usageCount?: number;
  importDate: string;
  importedBy?: string;
  sourceUrl?: string;
  transformations?: string[];
  metadata?: Record<string, unknown>;
}

interface DependenciesData {
  components: ComponentImport[];
  uiComponents: string[];
  installedDependencies: string[];
  stats: {
    totalComponents: number;
    totalUiFiles: number;
    bySource: Record<string, number>;
    uniqueDependencies: number;
  };
}

export default function DependenciesPage() {
  // Import-related state
  const [importUrl, setImportUrl] = useState('');
  const [autoFix, setAutoFix] = useState(true);
  const [installDeps, setInstallDeps] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);

  // Filtering and sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'components' | 'dependencies'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'type' | 'source' | 'importDate'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal state
  const [selectedItem, setSelectedItem] = useState<ComponentItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch dependencies data
  const { data, isLoading, error, refetch } = useQuery<DependenciesData>({
    queryKey: ['dependencies'],
    queryFn: async () => {
      const response = await fetch('/api/admin/components/dependencies', {
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch dependencies');
      }

      const result = await response.json();
      return result;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Component discovery mutation
  const discoveryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/components/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to discover components');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Components discovered successfully',
        description: data.message
      });
      refetch(); // Refresh the component list
    },
    onError: (error: Error) => {
      toast({
        title: 'Discovery failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Import component mutation
  const importMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/admin/components/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, autoFix, installDeps })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import component');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Component imported successfully',
        description: `${data.component.name} has been added to your project`
      });
      setImportUrl('');
      setBatchUrls('');
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Process data into unified items list
  const processedItems: ComponentItem[] = React.useMemo(() => {
    if (!data) return [];

    const items: ComponentItem[] = [];

    // Add components
    data.components.forEach(component => {
      items.push({
        id: component.id,
        name: component.name,
        type: 'component',
        source: component.source,
        dependencies: component.dependencies,
        importDate: component.importDate,
        importedBy: component.importedBy,
        sourceUrl: component.sourceUrl,
        transformations: component.transformations,
        metadata: component.metadata
      });
    });

    // Add npm dependencies as separate items
    const allDependencies = new Set<string>();
    const dependencyUsage = new Map<string, number>();

    data.components.forEach(component => {
      component.dependencies.forEach(dep => {
        allDependencies.add(dep);
        dependencyUsage.set(dep, (dependencyUsage.get(dep) || 0) + 1);
      });
    });

    Array.from(allDependencies).forEach(dep => {
      items.push({
        id: `dep-${dep}`,
        name: dep,
        type: 'dependency',
        source: 'npm',
        dependencies: [],
        usageCount: dependencyUsage.get(dep) || 0,
        importDate: '', // Dependencies don't have individual import dates
      });
    });

    return items;
  }, [data]);

  // Filter and sort items
  const filteredAndSortedItems = React.useMemo(() => {
    const filtered = processedItems.filter(item => {
      // Search filter
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = typeFilter === 'all' ||
        (typeFilter === 'components' && item.type === 'component') ||
        (typeFilter === 'dependencies' && item.type === 'dependency');

      // Source filter
      const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;

      return matchesSearch && matchesType && matchesSource;
    });

    // Sort items
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'source':
          comparison = a.source.localeCompare(b.source);
          break;
        case 'importDate':
          comparison = new Date(a.importDate || 0).getTime() - new Date(b.importDate || 0).getTime();
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [processedItems, searchQuery, typeFilter, sourceFilter, sortField, sortDirection]);

  const handleImport = () => {
    if (batchMode) {
      const urls = batchUrls.split('\n').filter(url => url.trim());
      urls.forEach(url => {
        if (validateUrl(url.trim())) {
          importMutation.mutate(url.trim());
        }
      });
    } else {
      if (!validateUrl(importUrl)) {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid registry URL',
          variant: 'destructive'
        });
        return;
      }
      importMutation.mutate(importUrl);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && url.endsWith('.json');
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading dependencies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">Failed to load dependencies</p>
        </div>
      </div>
    );
  }

  // Helper functions
  const getBadgeVariant = (source: string) => {
    switch (source) {
      case 'shadcn': return 'default';
      case 'aceternity': return 'secondary';
      case 'skiper': return 'outline';
      case 'npm': return 'outline';
      default: return 'default';
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (item: ComponentItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  const urlCount = batchMode ? batchUrls.split('\n').filter(url => url.trim()).length : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading dependencies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">Failed to load dependencies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Component Dependencies</h2>
          <p className="text-muted-foreground">
            Manage UI components and their dependencies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => discoveryMutation.mutate()}
            disabled={discoveryMutation.isPending}
          >
            {discoveryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Discovering...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Discover Components
              </>
            )}
          </Button>
          <Button onClick={() => setShowImportForm(!showImportForm)}>
            <Download className="mr-2 h-4 w-4" />
            Import Component
          </Button>
        </div>
      </div>

      {/* Import Section (Collapsible) */}
      {showImportForm && (
        <Card>
          <CardHeader>
            <CardTitle>Import Component</CardTitle>
            <CardDescription>
              Paste a registry URL to import a new component
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Batch Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="batch-mode"
                checked={batchMode}
                onCheckedChange={(checked) => setBatchMode(checked as boolean)}
              />
              <Label htmlFor="batch-mode">Batch import mode</Label>
            </div>

            {/* Import Input */}
            {batchMode ? (
              <Textarea
                placeholder="Enter multiple registry URLs, one per line..."
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                className="min-h-[100px]"
              />
            ) : (
              <Input
                placeholder="Paste registry URL (e.g., https://ui.shadcn.com/registry/button.json)"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
              />
            )}

            {/* Import Options */}
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-fix"
                  checked={autoFix}
                  onCheckedChange={(checked) => setAutoFix(checked as boolean)}
                />
                <Label htmlFor="auto-fix">Auto-fix import paths</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="install-deps"
                  checked={installDeps}
                  onCheckedChange={(checked) => setInstallDeps(checked as boolean)}
                />
                <Label htmlFor="install-deps">Install missing dependencies</Label>
              </div>
            </div>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={importMutation.isPending || (batchMode ? !batchUrls.trim() : !importUrl)}
              className="w-full"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {batchMode ? `Import ${urlCount} component${urlCount !== 1 ? 's' : ''}` : 'Import Component'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components and dependencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            All
          </Button>
          <Button
            variant={typeFilter === 'components' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('components')}
          >
            Components
          </Button>
          <Button
            variant={typeFilter === 'dependencies' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('dependencies')}
          >
            Dependencies
          </Button>
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="shadcn">shadcn</SelectItem>
            <SelectItem value="aceternity">Aceternity</SelectItem>
            <SelectItem value="skiper">Skiper UI</SelectItem>
            <SelectItem value="tweakcn">TweakCN</SelectItem>
            <SelectItem value="npm">NPM</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort('name')}
              >
                Name
                {sortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort('type')}
              >
                Type
                {sortField === 'type' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort('source')}
              >
                Source
                {sortField === 'source' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Dependencies</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort('importDate')}
              >
                Imported
                {sortField === 'importDate' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {processedItems.length === 0
                    ? "No components found. Click 'Discover Components' to scan existing components."
                    : "No items match your search criteria."
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {item.type === 'component' ? (
                        <FileCode2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Package2 className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'component' ? 'default' : 'secondary'}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(item.source)}>
                      {item.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.type === 'component' ? (
                      <Badge variant="outline" className="text-xs">
                        {item.dependencies.length} deps
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {item.usageCount} uses
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.importDate ? (
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.importDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Historical
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>
              {selectedItem?.type === 'component' ? 'Component Details' : 'Dependency Information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm text-muted-foreground capitalize">{selectedItem.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Source</Label>
                    <p className="text-sm text-muted-foreground">{selectedItem.source}</p>
                  </div>
                </div>

                {selectedItem.sourceUrl && (
                  <div>
                    <Label className="text-sm font-medium">Source URL</Label>
                    <p className="text-sm text-muted-foreground break-all">{selectedItem.sourceUrl}</p>
                  </div>
                )}

                {selectedItem.type === 'component' && selectedItem.dependencies.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Dependencies</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedItem.dependencies.map(dep => (
                        <Badge key={dep} variant="secondary" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.transformations && selectedItem.transformations.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Transformations Applied</Label>
                    <ul className="text-sm text-muted-foreground mt-1">
                      {selectedItem.transformations.map((transform, index) => (
                        <li key={index}>• {transform}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedItem.metadata?.isHistorical && (
                  <div>
                    <Label className="text-sm font-medium">Additional Info</Label>
                    <p className="text-sm text-muted-foreground">
                      This component was automatically discovered from existing files.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}