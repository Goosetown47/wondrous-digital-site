'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ParsedCommand } from '@/lib/command-import/command-parser';
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

type DialogMode = 'input' | 'preview' | 'executing' | 'complete';

interface ExecutionResult {
  success: boolean;
  originalCommand: string;
  commandType: string;
  output: string;
  errors: string[];
  warnings: string[];
  packagesInstalled?: string[];
  alreadyInstalled?: string[];
  filesCreated?: string[];
  dependenciesInstalled?: string[];
  component?: string;
  duration?: number;
}

interface PreviewResponse {
  parsed: {
    commands: ParsedCommand[];
    hasWarnings: boolean;
    totalCommands: number;
  };
  preview: {
    npmPackages: Array<{
      name: string;
      alreadyInstalled: boolean;
      version?: string;
    }>;
    shadcnComponents: Array<{
      name: string;
      type: string;
    }>;
  };
}

export default function DependenciesPage() {
  // Universal Command Input state
  const [showCommandInput, setShowCommandInput] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [commandPreview, setCommandPreview] = useState<PreviewResponse | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Execution progress state
  const [dialogMode, setDialogMode] = useState<DialogMode>('input');
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);

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

  // Command execution mutation - now updates UI in real-time
  const executeCommandMutation = useMutation({
    mutationFn: async (commands: string) => {
      // Reset state for new execution
      setExecutionResults([]);
      setDialogMode('executing');

      const response = await fetch('/api/admin/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute commands');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Store results and switch to complete mode
      setExecutionResults(data.results);
      setDialogMode('complete');

      // Refresh dependencies table
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });

      // Don't close dialog or show toast - results are in modal
    },
    onError: (error: Error) => {
      setDialogMode('complete');
      setExecutionResults([{
        success: false,
        originalCommand: 'Execution failed',
        commandType: 'error',
        output: '',
        errors: [error.message],
        warnings: [],
      }]);
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
    // Track which dependencies are used by components
    const dependencyUsage = new Map<string, number>();

    data.components.forEach(component => {
      if (component.dependencies && Array.isArray(component.dependencies)) {
        component.dependencies.forEach(dep => {
          dependencyUsage.set(dep, (dependencyUsage.get(dep) || 0) + 1);
        });
      }
    });

    // Show ALL installed dependencies from package.json
    data.installedDependencies.forEach(dep => {
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

  const handlePreviewCommands = async () => {
    if (!commandInput.trim()) return;

    setIsPreviewLoading(true);
    try {
      const response = await fetch('/api/admin/commands/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands: commandInput })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to preview commands');
      }

      const data = await response.json();
      setCommandPreview(data);
      setDialogMode('preview'); // Switch to preview mode
    } catch (error) {
      toast({
        title: 'Preview failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleExecuteCommands = () => {
    if (!commandInput.trim()) return;
    executeCommandMutation.mutate(commandInput);
  };

  const handleCloseDialog = () => {
    setShowCommandInput(false);
    setDialogMode('input');
    setCommandInput('');
    setCommandPreview(null);
    setExecutionResults([]);
  };

  const handleOpenDialog = () => {
    setShowCommandInput(true);
    setDialogMode('input');
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
          <Button onClick={handleOpenDialog}>
            <Package2 className="mr-2 h-4 w-4" />
            Batch Install
          </Button>
        </div>
      </div>

      {/* Universal Command Input Dialog */}
      <Dialog open={showCommandInput} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'input' && 'Batch Install'}
              {dialogMode === 'preview' && 'Preview Installation'}
              {dialogMode === 'executing' && 'Installing...'}
              {dialogMode === 'complete' && 'Installation Complete'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'input' && 'Paste npm install or shadcn add commands to install multiple packages at once'}
              {dialogMode === 'preview' && 'Review what will be installed before executing'}
              {dialogMode === 'executing' && 'Commands are being executed sequentially...'}
              {dialogMode === 'complete' && 'Review the installation results below'}
            </DialogDescription>
          </DialogHeader>

          {/* INPUT MODE */}
          {dialogMode === 'input' && (
            <div className="space-y-4">
              <Textarea
                placeholder={`npm install framer-motion clsx
npx shadcn add button
npx shadcn add https://ui.aceternity.com/registry/container-text-flip.json`}
                value={commandInput}
                onChange={(e) => {
                  setCommandInput(e.target.value);
                  setCommandPreview(null);
                }}
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handlePreviewCommands}
                  disabled={!commandInput.trim() || isPreviewLoading}
                >
                  {isPreviewLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Previewing...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* PREVIEW MODE */}
          {dialogMode === 'preview' && commandPreview && (
            <div className="space-y-4">
              {/* Read-only command display */}
              <div className="border rounded-lg p-3 bg-muted/30">
                <div className="text-xs font-medium mb-2 text-muted-foreground">Commands</div>
                <pre className="text-xs font-mono whitespace-pre-wrap">{commandInput}</pre>
              </div>

              {/* Warnings */}
              {commandPreview.parsed.hasWarnings && (
                <div className="border border-amber-500/50 rounded-lg p-3 bg-amber-500/10">
                  <div className="text-sm font-medium text-amber-600 dark:text-amber-500">
                    ⚠️ Some commands have warnings
                  </div>
                </div>
              )}

              {/* NPM Packages Preview */}
              {commandPreview.preview.npmPackages.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="text-sm font-medium">
                    NPM Packages ({commandPreview.preview.npmPackages.length})
                  </div>
                  <div className="space-y-1">
                    {commandPreview.preview.npmPackages.map((pkg, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-1">
                        <span className="font-mono">{pkg.name}</span>
                        {pkg.alreadyInstalled ? (
                          <Badge variant="outline" className="text-xs">
                            ✓ Installed {pkg.version}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            → Will install
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shadcn Components Preview */}
              {commandPreview.preview.shadcnComponents.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="text-sm font-medium">
                    Shadcn Components ({commandPreview.preview.shadcnComponents.length})
                  </div>
                  <div className="space-y-1">
                    {commandPreview.preview.shadcnComponents.map((comp, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-1">
                        <span className="font-mono truncate">{comp.name}</span>
                        <Badge variant="default" className="text-xs">
                          {comp.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setDialogMode('input')}>
                  Back
                </Button>
                <Button
                  onClick={handleExecuteCommands}
                  disabled={executeCommandMutation.isPending}
                >
                  {executeCommandMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Package2 className="mr-2 h-4 w-4" />
                      Install
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* EXECUTING MODE */}
          {dialogMode === 'executing' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                <Loader2 className="h-5 w-5 animate-spin" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Executing commands...</div>
                  <div className="text-xs text-muted-foreground">
                    Please wait while packages are being installed
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMPLETE MODE */}
          {dialogMode === 'complete' && executionResults.length > 0 && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="text-sm font-medium mb-2">Summary</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="font-medium">{executionResults.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Succeeded</div>
                    <div className="font-medium text-green-600">
                      {executionResults.filter(r => r.success).length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                    <div className="font-medium text-red-600">
                      {executionResults.filter(r => !r.success).length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {executionResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 ${
                      result.success
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-red-500/50 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {result.success ? (
                          <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <span className="text-green-600 text-sm">✓</span>
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-red-600 text-sm">✕</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-mono mb-1">{result.originalCommand}</div>

                        {result.duration && (
                          <div className="text-xs text-muted-foreground mb-2">
                            Completed in {(result.duration / 1000).toFixed(1)}s
                          </div>
                        )}

                        {/* Success details */}
                        {result.success && (
                          <div className="space-y-1">
                            {result.packagesInstalled && result.packagesInstalled.length > 0 && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">Installed:</span>{' '}
                                <span className="font-mono">{result.packagesInstalled.join(', ')}</span>
                              </div>
                            )}
                            {result.alreadyInstalled && result.alreadyInstalled.length > 0 && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">Already installed:</span>{' '}
                                <span className="font-mono">{result.alreadyInstalled.join(', ')}</span>
                              </div>
                            )}
                            {result.filesCreated && result.filesCreated.length > 0 && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">Files created:</span>{' '}
                                <span className="font-mono">{result.filesCreated.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Error details */}
                        {!result.success && result.errors.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {result.errors.map((error, errIdx) => (
                              <div key={errIdx} className="text-xs text-red-600 dark:text-red-400">
                                {error}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Output (expandable) */}
                        {result.output && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              View full output
                            </summary>
                            <pre className="mt-2 text-xs font-mono whitespace-pre-wrap bg-muted/50 p-2 rounded border max-h-[200px] overflow-y-auto">
                              {result.output}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button onClick={handleCloseDialog}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                        {item.dependencies?.length || 0} deps
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
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            handleViewDetails(item);
                          }}
                        >
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
      <Dialog
        open={detailsModalOpen}
        onOpenChange={(open) => {
          setDetailsModalOpen(open);
          if (!open) {
            setSelectedItem(null); // Clear selected item when closing
          }
        }}
      >
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