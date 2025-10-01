'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ComponentCreationProgress } from '@/components/core/component-creation-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useTypes } from '@/hooks/useTypes';

interface ProgressStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
}

interface FormData {
  name: string;
  type_id: string;
  source: string;
  code: string;
}

export default function AddSectionPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type_id: '',
    source: 'ui.shadcn.com',
    code: '',
  });

  const [showProgress, setShowProgress] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [createdSectionName, setCreatedSectionName] = useState('');

  // Fetch section types using the hook (same as /lab/new)
  const { data: sectionTypes, isLoading: isLoadingTypes } = useTypes('section');

  // Set default type_id when types load
  useEffect(() => {
    if (sectionTypes && sectionTypes.length > 0 && !formData.type_id) {
      setFormData(prev => ({ ...prev, type_id: sectionTypes[0].id }));
    }
  }, [sectionTypes, formData.type_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show progress modal
    setShowProgress(true);
    setCreatedSectionName(formData.name);
    setProgressSteps([
      { step: 'generating_name', status: 'pending' },
      { step: 'saving_to_database', status: 'pending' },
      { step: 'creating_files', status: 'pending' },
      { step: 'updating_registry', status: 'pending' },
      { step: 'finalizing', status: 'pending' }
    ]);

    try {
      const response = await fetch('/api/core-components/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: 'section', // Always section
          type_id: formData.type_id,
          source: formData.source,
          code: formData.code,
          dependencies: [],
          imports: [],
          metadata: {},
        }),
      });

      const result = await response.json();

      // Always update progress steps
      setProgressSteps(result.progress || []);

      if (result.success && result.progress) {
        // Check if ALL steps completed successfully
        const allStepsCompleted = result.progress.every(
          (step: ProgressStep) => step.status === 'completed'
        );

        if (!allStepsCompleted) {
          // Log partial success/errors
          console.warn('Section created with some failures:', result.progress);
        }
        // Never auto-redirect - user must close modal manually
      } else {
        console.error('Failed to create section:', result.error);
      }
    } catch (error) {
      console.error('Failed to create section:', error);
      // Mark all steps as error
      setProgressSteps(prev => prev.map(step => ({
        ...step,
        status: step.status === 'completed' ? 'completed' : 'error'
      })));
    }
  };

  const handleCloseProgress = () => {
    setShowProgress(false);
    // If all successful, navigate to core
    if (progressSteps.every(s => s.status === 'completed')) {
      router.push('/core');
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Add Section</h1>
          <p className="text-muted-foreground">
            Add a new section to Core
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Section name, type, and source
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Section Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Hero with Animated Background"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Section Type</Label>
                  <Select
                    value={formData.type_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type_id: value }))}
                    disabled={isLoadingTypes}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select section type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingTypes && <p className="text-xs text-muted-foreground mt-1">Loading section types...</p>}
                </div>

                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger id="source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ui.shadcn.com">ui.shadcn.com</SelectItem>
                      <SelectItem value="ui.aceternity.com">ui.aceternity.com</SelectItem>
                      <SelectItem value="pro.aceternity.com">pro.aceternity.com</SelectItem>
                      <SelectItem value="skiper-ui.com">skiper-ui.com</SelectItem>
                      <SelectItem value="tweakcn.com">tweakcn.com</SelectItem>
                      <SelectItem value="shadcnblocks.com">shadcnblocks.com</SelectItem>
                      <SelectItem value="reactbits.dev">reactbits.dev</SelectItem>
                      <SelectItem value="shadcnui-expansions.typeart.cc">shadcnui-expansions.typeart.cc</SelectItem>
                      <SelectItem value="21st.dev">21st.dev</SelectItem>
                      <SelectItem value="ai-sdk.dev">ai-sdk.dev</SelectItem>
                      <SelectItem value="motion-primitives.com">motion-primitives.com</SelectItem>
                      <SelectItem value="custom">custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Code */}
          <Card>
            <CardHeader>
              <CardTitle>Section Code</CardTitle>
              <CardDescription>
                Paste the complete section code here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="export function HeroSection({ ...props }) { ... }"
                className="min-h-[300px] font-mono text-sm"
                required
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!formData.name || !formData.code || !formData.type_id}
            >
              <Save className="mr-2 h-4 w-4" />
              Create Section
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/core">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>

      {/* Progress Modal */}
      <ComponentCreationProgress
        isOpen={showProgress}
        onClose={handleCloseProgress}
        componentName={createdSectionName}
        steps={progressSteps}
      />
    </div>
  );
}