'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, FileCode2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

interface CoreComponent {
  id: string;
  name: string;
  code_name: string;
  type: string;
  source: string;
  created_at: string;
}

export default function ComponentExportPage() {
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // Fetch all components
  const { data: components, isLoading } = useQuery<CoreComponent[]>({
    queryKey: ['core-components'],
    queryFn: async () => {
      const response = await fetch('/api/core-components');
      if (!response.ok) {
        throw new Error('Failed to fetch components');
      }
      return response.json();
    }
  });

  const handleToggleComponent = (id: string) => {
    const newSelected = new Set(selectedComponents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedComponents(newSelected);
  };

  const handleSelectAll = () => {
    if (!components) return;
    if (selectedComponents.size === components.length) {
      setSelectedComponents(new Set());
    } else {
      setSelectedComponents(new Set(components.map(c => c.id)));
    }
  };

  const handleExport = async () => {
    if (selectedComponents.size === 0) {
      toast({
        title: 'No components selected',
        description: 'Please select at least one component to export',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch('/api/admin/components/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          componentIds: Array.from(selectedComponents)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export components');
      }

      const result = await response.json();

      // Download SQL file
      const blob = new Blob([result.sql], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `Exported ${result.componentCount} component(s) to ${result.filename}`
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export Components</h1>
        <p className="text-muted-foreground mt-2">
          Generate SQL migration to deploy components to production
        </p>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">How This Works</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                This tool exports component metadata as SQL migration for production deployment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p><strong>1.</strong> Select components you want to deploy to production</p>
          <p><strong>2.</strong> Click "Export Selected" to download SQL file</p>
          <p><strong>3.</strong> Open PROD Supabase Dashboard → SQL Editor</p>
          <p><strong>4.</strong> Paste the SQL and click "Run"</p>
          <p className="pt-2 text-blue-600 dark:text-blue-400">
            <strong>Note:</strong> Component files must already be deployed to production via Git merge
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Components to Export</CardTitle>
              <CardDescription>
                {selectedComponents.size} of {components?.length || 0} components selected
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleSelectAll}
                disabled={!components || components.length === 0}
              >
                {selectedComponents.size === components?.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedComponents.size === 0 || isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!components || components.length === 0 ? (
            <div className="text-center py-12">
              <FileCode2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No components found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create components in Core to export them
              </p>
              <Button asChild className="mt-4">
                <Link href="/core/add">Create Component</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedComponents.size === components.length && components.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedComponents.has(component.id)}
                        onCheckedChange={() => handleToggleComponent(component.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{component.name}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {component.code_name}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{component.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{component.source}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(component.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}