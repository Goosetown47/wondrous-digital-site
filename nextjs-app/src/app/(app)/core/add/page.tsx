'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateComponent } from '@/hooks/useCoreComponents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import type { CreateComponentInput } from '@/lib/supabase/core-components';

export default function AddComponentPage() {
  const router = useRouter();
  const createComponent = useCreateComponent();
  
  const [formData, setFormData] = useState<CreateComponentInput>({
    name: '',
    type: 'component',
    source: 'shadcn',
    code: '',
    dependencies: [],
    imports: [],
    metadata: {},
  });
  
  const [dependencyInput, setDependencyInput] = useState('');
  const [importInput, setImportInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createComponent.mutateAsync(formData);
      router.push('/core');
    } catch (error) {
      console.error('Failed to create component:', error);
    }
  };

  const handleAddDependency = () => {
    if (dependencyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...(prev.dependencies || []), dependencyInput.trim()]
      }));
      setDependencyInput('');
    }
  };

  const handleRemoveDependency = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddImport = () => {
    if (importInput.trim()) {
      setFormData(prev => ({
        ...prev,
        imports: [...(prev.imports || []), importInput.trim()]
      }));
      setImportInput('');
    }
  };

  const handleRemoveImport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imports: prev.imports?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div>
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/core">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Core
          </Link>
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Component</h1>
          <p className="text-muted-foreground">
            Add a new component to the Core library
          </p>
        </div>
      </div>

      {createComponent.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to create component. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Component name, type, and source
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Component Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Button"
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
                    onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as 'shadcn' | 'custom' | 'third-party' }))}
                  >
                    <SelectTrigger id="source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shadcn">shadcn/ui</SelectItem>
                      <SelectItem value="aceternity">Aceternity</SelectItem>
                      <SelectItem value="expansions">Expansions</SelectItem>
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
                Paste the complete component code here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="export function Button({ children, ...props }) { ... }"
                className="min-h-[300px] font-mono text-sm"
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
                  placeholder="@radix-ui/react-dialog"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDependency())}
                />
                <Button type="button" variant="outline" onClick={handleAddDependency}>
                  Add
                </Button>
              </div>
              
              {formData.dependencies && formData.dependencies.length > 0 && (
                <div className="space-y-2">
                  {formData.dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted px-3 py-2 rounded">
                      <code className="text-sm">{dep}</code>
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
              <CardTitle>Required Imports</CardTitle>
              <CardDescription>
                Import statements needed for this component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="import { cn } from '@/lib/utils'"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImport())}
                />
                <Button type="button" variant="outline" onClick={handleAddImport}>
                  Add
                </Button>
              </div>
              
              {formData.imports && formData.imports.length > 0 && (
                <div className="space-y-2">
                  {formData.imports.map((imp, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted px-3 py-2 rounded">
                      <code className="text-sm">{imp}</code>
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

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={createComponent.isPending || !formData.name || !formData.code}
            >
              {createComponent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Component
                </>
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/core">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}