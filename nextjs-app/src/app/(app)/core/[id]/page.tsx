'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCoreComponent, useDeleteComponent } from '@/hooks/useCoreComponents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Copy, 
  Trash2, 
  Edit, 
  Package, 
  Code,
  FileCode,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function ComponentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const componentId = params.id as string;
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { data: component, isLoading, error } = useCoreComponent(componentId);
  const deleteComponent = useDeleteComponent();

  const handleCopyCode = async () => {
    if (component?.code) {
      await navigator.clipboard.writeText(component.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
      try {
        await deleteComponent.mutateAsync(componentId);
        router.push('/core');
      } catch (error) {
        console.error('Failed to delete component:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !component) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load component. Please try again.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/core">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Core
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/core">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Core
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{component.name}</h1>
              <Badge variant="secondary">{component.source}</Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              {component.type === 'component' ? (
                <Package className="h-4 w-4" />
              ) : (
                <Code className="h-4 w-4" />
              )}
              {component.type}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDelete}
              disabled={deleteComponent.isPending}
            >
              {deleteComponent.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Component Details */}
      <Tabs defaultValue="code" className="space-y-4">
        <TabsList>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Component Code</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyCode}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copySuccess ? 'Copied!' : 'Copy Code'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto p-4 bg-muted rounded-lg">
                <code className="text-sm">{component.code}</code>
              </pre>
            </CardContent>
          </Card>

          {component.imports && component.imports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Imports</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto p-4 bg-muted rounded-lg">
                  <code className="text-sm">{component.imports.join('\n')}</code>
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
              <CardDescription>
                NPM packages required for this component
              </CardDescription>
            </CardHeader>
            <CardContent>
              {component.dependencies && component.dependencies.length > 0 ? (
                <div className="space-y-2">
                  {component.dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {dep}
                      </code>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Install command:</p>
                    <code className="text-sm">
                      npm install {component.dependencies.join(' ')}
                    </code>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No external dependencies required.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>
                Additional information about this component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                  <dd className="text-sm mt-1 font-mono">{component.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="text-sm mt-1">
                    {new Date(component.created_at).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Updated</dt>
                  <dd className="text-sm mt-1">
                    {new Date(component.updated_at).toLocaleString()}
                  </dd>
                </div>
                {component.metadata && Object.keys(component.metadata).length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-2">
                      Custom Metadata
                    </dt>
                    <dd>
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(component.metadata, null, 2)}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}