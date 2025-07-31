'use client';

import { useState } from 'react';
import { useTypes, useDeleteType } from '@/hooks/useTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Type, 
  FileText, 
  Globe, 
  Palette, 
  Trash2, 
  Edit, 
  Loader2,
  MoreHorizontal 
} from 'lucide-react';
import Link from 'next/link';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function TypesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: types, isLoading } = useTypes(selectedCategory === 'all' ? undefined : selectedCategory);
  const deleteType = useDeleteType();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteType.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete type:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'section':
        return <Type className="h-4 w-4" />;
      case 'page':
        return <FileText className="h-4 w-4" />;
      case 'site':
        return <Globe className="h-4 w-4" />;
      case 'theme':
        return <Palette className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const groupedTypes = types?.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof types>);

  return (
    <div className="flex-1">
      <div className="border-b">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold">Type Management</h1>
            <p className="text-gray-600 mt-1">
              Define and manage types for sections, pages, sites, and themes
            </p>
          </div>
          <Button asChild>
            <Link href="/tools/types/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Type
            </Link>
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">All Types</TabsTrigger>
            <TabsTrigger value="section">Sections</TabsTrigger>
            <TabsTrigger value="page">Pages</TabsTrigger>
            <TabsTrigger value="site">Sites</TabsTrigger>
            <TabsTrigger value="theme">Themes</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : !types || types.length === 0 ? (
              <div className="text-center py-12">
                <Type className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No types found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first type to get started
                </p>
              </div>
            ) : selectedCategory === 'all' && groupedTypes ? (
              <div className="space-y-6">
                {Object.entries(groupedTypes).map(([category, categoryTypes]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category} Types
                    </h3>
                    <TypesList 
                      types={categoryTypes} 
                      onDelete={(type) => setDeleteConfirm({ id: type.id, name: type.display_name })}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <TypesList 
                types={types} 
                onDelete={(type) => setDeleteConfirm({ id: type.id, name: type.display_name })}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
              Any items using this type will need to be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface TypesListProps {
  types: any[];
  onDelete: (type: any) => void;
}

function TypesList({ types, onDelete }: TypesListProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Display Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {types.map((type) => (
            <tr key={type.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{type.display_name}</div>
                  {type.description && (
                    <div className="text-sm text-gray-500">{type.description}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{type.name}</code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="secondary" className="text-xs">
                  {type.category}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8"
                  >
                    <Link href={`/tools/types/${type.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/tools/types/${type.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(type)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}