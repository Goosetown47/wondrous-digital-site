'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import { useTypes } from '@/hooks/useTypes';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewDraftPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'section' as 'section' | 'page' | 'site' | 'theme',
    type_id: '',
    description: '',
  });

  // Fetch types based on selected category
  const { data: types, isLoading: typesLoading } = useTypes(formData.type);

  // Reset type_id when category changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, type_id: '' }));
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const draft = await labDraftService.create({
        name: formData.name,
        type: formData.type,
        type_id: formData.type_id || null,
        status: 'draft',
        content: getInitialContent(formData.type),
        version: 1,
        metadata: {
          description: formData.description,
        },
      });

      // Navigate based on type
      if (formData.type === 'theme') {
        router.push(`/lab/themes/${draft.id}`);
      } else {
        router.push(`/lab/${draft.id}`);
      }
    } catch (error: unknown) {
      console.error('Failed to create draft:', error);
      alert(`Failed to create draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsCreating(false);
    }
  };

  const getInitialContent = (type: string) => {
    switch (type) {
      case 'section':
        return {
          components: [],
          layout: 'full-width',
          styles: {},
          data: {} // Content data for the section
        };
      case 'page':
        return {
          sections: [],
          metadata: {
            title: formData.name,
            description: formData.description,
          },
        };
      case 'site':
        return {
          pages: [],
          theme: null,
          metadata: {
            name: formData.name,
            description: formData.description,
          },
        };
      case 'theme':
        return {
          variables: {
            colors: {
              primary: '222.2 47.4% 11.2%',
              secondary: '210 40% 96.1%',
              accent: '210 40% 96.1%',
              background: '0 0% 100%',
              foreground: '222.2 47.4% 11.2%',
            },
            radius: '0.5rem',
          },
          description: formData.description,
        };
      default:
        return {};
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/lab">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lab
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Draft</h1>
        <p className="text-muted-foreground">
          Start building a new template or theme
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Draft Details</CardTitle>
          <CardDescription>
            Choose what type of template you want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter draft name"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Category</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as 'section' | 'page' | 'site' | 'theme' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="section" id="section" />
                  <Label htmlFor="section" className="font-normal cursor-pointer">
                    Section - A reusable component for pages
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="page" id="page" />
                  <Label htmlFor="page" className="font-normal cursor-pointer">
                    Page - A complete page template
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="site" id="site" />
                  <Label htmlFor="site" className="font-normal cursor-pointer">
                    Site - A complete website template
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="theme" id="theme" />
                  <Label htmlFor="theme" className="font-normal cursor-pointer">
                    Theme - Colors, fonts, and styling
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.type !== 'theme' && (
              <div className="space-y-2">
                <Label htmlFor="type_id">Type</Label>
                {typesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading types...
                  </div>
                ) : types && types.length > 0 ? (
                  <Select
                    value={formData.type_id}
                    onValueChange={(value) => setFormData({ ...formData, type_id: value })}
                  >
                    <SelectTrigger id="type_id">
                      <SelectValue placeholder={`Select a ${formData.type} type`} />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div>
                            <div className="font-medium">{type.display_name}</div>
                            {type.description && (
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No types available. <Link href="/tools/types/new" className="underline">Create one first</Link>.
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this draft is for"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isCreating || !formData.name || (formData.type !== 'theme' && !formData.type_id)}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Draft'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/lab">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}