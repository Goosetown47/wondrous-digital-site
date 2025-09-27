'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCoreComponent, useUpdateComponent } from '@/hooks/useCoreComponents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EditComponentPage() {
  const params = useParams();
  const router = useRouter();
  const componentId = params.id as string;
  const { data: component, isLoading } = useCoreComponent(componentId);
  const updateComponent = useUpdateComponent();

  const [formData, setFormData] = useState({
    name: '',
    type: 'component' as 'component' | 'section',
    source: 'shadcn' as 'shadcn' | 'aceternity' | 'expansions' | 'custom',
    code: '',
    dependencies: [] as string[],
    imports: [] as string[],
    metadata: {},
  });

  const [dependencyInput, setDependencyInput] = useState('');
  const [importInput, setImportInput] = useState('');

  // Load component data when it arrives
  useEffect(() => {
    if (component) {
      setFormData({
        name: component.name || '',
        type: component.type || 'component',
        source: component.source || 'shadcn',
        code: component.code || '',
        dependencies: component.dependencies || [],
        imports: component.imports || [],
        metadata: component.metadata || {},
      });
    }
  }, [component]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateComponent.mutateAsync({
        id: componentId,
        ...formData,
      });
      toast.success('Component updated successfully');
      router.push(`/core/${componentId}`);
    } catch (error) {
      console.error('Failed to update component:', error);
      toast.error('Failed to update component');
    }
  };

  const handleAddDependency = () => {
    if (dependencyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, dependencyInput.trim()]
      }));
      setDependencyInput('');
    }
  };

  const handleRemoveDependency = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter((_, i) => i !== index)
    }));
  };

  const handleAddImport = () => {
    if (importInput.trim()) {
      setFormData(prev => ({
        ...prev,
        imports: [...prev.imports, importInput.trim()]
      }));
      setImportInput('');
    }
  };

  const handleRemoveImport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imports: prev.imports.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!component) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Component not found. Please try again.
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href={`/core/${componentId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Component
          </Link>
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Edit Component</h1>
        <p className="text-muted-foreground mt-2">
          Modify the component code and metadata
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Component name and type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Component Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Hero Section"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'component' | 'section' }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="component">Component</SelectItem>
                    <SelectItem value="section">Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source">Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as 'shadcn' | 'aceternity' | 'expansions' | 'custom' }))}
                >
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shadcn">shadcn/ui</SelectItem>
                    <SelectItem value="aceternity">Aceternity</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Code */}
        <Card>
          <CardHeader>
            <CardTitle>Component Code</CardTitle>
            <CardDescription>
              The React component code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Paste your component code here..."
              className="font-mono text-sm min-h-[400px]"
              required
            />
          </CardContent>
        </Card>

        {/* Dependencies */}
        <Card>
          <CardHeader>
            <CardTitle>Dependencies</CardTitle>
            <CardDescription>
              NPM packages required for this component
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={dependencyInput}
                onChange={(e) => setDependencyInput(e.target.value)}
                placeholder="e.g., npm install lucide-react"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDependency();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddDependency}
              >
                Add
              </Button>
            </div>

            {formData.dependencies.length > 0 && (
              <div className="space-y-2">
                {formData.dependencies.map((dep, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-muted px-2 py-1 rounded">
                      {dep}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDependency(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Imports */}
        <Card>
          <CardHeader>
            <CardTitle>Imports</CardTitle>
            <CardDescription>
              Additional import statements needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="e.g., import { Button } from '@/components/ui/button'"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImport();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddImport}
              >
                Add
              </Button>
            </div>

            {formData.imports.length > 0 && (
              <div className="space-y-2">
                {formData.imports.map((imp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-muted px-2 py-1 rounded">
                      {imp}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImport(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={updateComponent.isPending}
          >
            {updateComponent.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href={`/core/${componentId}`}>
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}