'use client';

import { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface TableColumn<T> {
  key: string;
  title: string;
  render?: (item: T, value: unknown) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
}

export interface TableAction<T> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'secondary' | 'ghost';
  className?: string;
  show?: (item: T) => boolean;
}

export interface BulkAction<T> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (selectedItems: T[]) => void;
  variant?: 'default' | 'destructive' | 'secondary';
  requiresConfirmation?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface EnhancedTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
  searchPlaceholder?: string;
  searchable?: boolean;
  selectable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
  }[];
  getItemId: (item: T) => string;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
}

export function EnhancedTable<T>({
  data,
  columns,
  actions = [],
  bulkActions = [],
  searchPlaceholder = "Search...",
  searchable = true,
  selectable = true,
  loading = false,
  emptyMessage = "No items found",
  filters = [],
  getItemId,
  onSearch,
  onFilter,
}: EnhancedTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Clean up selection when data changes - remove items that no longer exist
  useMemo(() => {
    const validIds = new Set(data.map(item => getItemId(item)));
    const newSelected = new Set<string>();
    selectedItems.forEach(id => {
      if (validIds.has(id)) {
        newSelected.add(id);
      }
    });
    if (newSelected.size !== selectedItems.size) {
      setSelectedItems(newSelected);
    }
  }, [data, getItemId, selectedItems]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchQuery && searchable) {
      filtered = filtered.filter(item => {
        return columns.some(column => {
          if (column.searchable === false) return false;
          const value = (item as Record<string, unknown>)[column.key];
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    }

    // Apply filters
    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter(item => {
        return Object.entries(activeFilters).every(([key, value]) => {
          if (value === 'all' || !value) return true;
          const itemValue = (item as Record<string, unknown>)[key];
          return String(itemValue) === value;
        });
      });
    }

    return filtered;
  }, [data, searchQuery, activeFilters, columns, searchable]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Handle filter change
  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    setActiveFilters(newFilters);
    onFilter?.(newFilters);
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredData.map(getItemId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const isAllSelected = filteredData.length > 0 && selectedItems.size === filteredData.length;
  const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < filteredData.length;

  // Handle bulk actions
  const handleBulkAction = (action: BulkAction<T>) => {
    const selectedData = filteredData.filter(item => selectedItems.has(getItemId(item)));
    action.onClick(selectedData);
    setSelectedItems(new Set()); // Clear selection after action
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
        
        {/* Filters */}
        {filters.map((filter) => (
          <DropdownMenu key={filter.key}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {filter.label}
                {activeFilters[filter.key] && activeFilters[filter.key] !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    {filter.options.find(opt => opt.value === activeFilters[filter.key])?.label}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => handleFilterChange(filter.key, 'all')}
              >
                All {filter.label}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {filter.options.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleFilterChange(filter.key, option.value)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.count && (
                      <Badge variant="outline" className="ml-2">
                        {option.count}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectable && selectedItems.size > 0 && bulkActions.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedItems.size} item{selectedItems.size === 1 ? '' : 's'} selected
          </span>
          <div className="flex gap-2 ml-4">
            {bulkActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'default'}
                  onClick={() => handleBulkAction(action)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              );
            })}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedItems(new Set())}
            className="ml-auto"
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    {...(isPartiallySelected && { 'data-state': 'indeterminate' })}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.title}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="text-right w-32">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="text-center py-8"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => {
                const itemId = getItemId(item);
                const isSelected = selectedItems.has(itemId);
                
                return (
                  <TableRow key={itemId} className={isSelected ? 'bg-muted/50' : ''}>
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectItem(itemId, !!checked)}
                          aria-label={`Select item ${itemId}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = (item as Record<string, unknown>)[column.key];
                      return (
                        <TableCell key={column.key} className={column.className}>
                          {column.render ? column.render(item, value) : String(value || '')}
                        </TableCell>
                      );
                    })}
                    {actions.length > 0 && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {actions
                            .filter(action => !action.show || action.show(item))
                            .slice(0, 3) // Show first 3 actions as buttons
                            .map((action, index) => {
                              const Icon = action.icon;
                              return (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={action.variant || 'ghost'}
                                  onClick={() => action.onClick(item)}
                                  className={`h-8 w-8 p-0 ${action.className || ''}`}
                                  title={action.label}
                                >
                                  <Icon className="h-4 w-4" />
                                </Button>
                              );
                            })}
                          
                          {/* Overflow menu for additional actions */}
                          {actions.filter(action => !action.show || action.show(item)).length > 3 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions
                                  .filter(action => !action.show || action.show(item))
                                  .slice(3) // Show remaining actions in dropdown
                                  .map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                      <DropdownMenuItem
                                        key={index}
                                        onClick={() => action.onClick(item)}
                                        className={action.variant === 'destructive' ? 'text-red-600' : ''}
                                      >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {action.label}
                                      </DropdownMenuItem>
                                    );
                                  })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}