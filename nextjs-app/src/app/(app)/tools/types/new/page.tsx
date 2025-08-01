'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateType, useCheckTypeName } from '@/hooks/useTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const typeFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .regex(/^[a-z][a-z0-9-]*$/, 'Name must start with lowercase letter and contain only lowercase letters, numbers, and hyphens'),
  display_name: z.string().min(1, 'Display name is required'),
  category: z.enum(['section', 'page', 'site', 'theme']),
  description: z.string().optional(),
  icon: z.string().optional(),
});

type TypeFormData = z.infer<typeof typeFormSchema>;

export default function NewTypePage() {
  const router = useRouter();
  const createType = useCreateType();
  const checkName = useCheckTypeName();
  const [isCheckingName, setIsCheckingName] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setError,
  } = useForm<TypeFormData>({
    resolver: zodResolver(typeFormSchema),
    defaultValues: {
      category: 'section',
    },
  });

  const watchName = watch('name');
  const watchCategory = watch('category');

  const handleNameBlur = async () => {
    if (!watchName) return;
    
    setIsCheckingName(true);
    try {
      const isAvailable = await checkName.mutateAsync({ name: watchName });
      if (!isAvailable) {
        setError('name', { message: 'This name is already taken' });
      }
    } catch (error) {
      console.error('Failed to check name:', error);
    } finally {
      setIsCheckingName(false);
    }
  };

  const onSubmit = async (data: TypeFormData) => {
    try {
      await createType.mutateAsync(data);
      router.push('/tools/types');
    } catch (error) {
      console.error('Failed to create type:', error);
      if (error.message?.includes('duplicate')) {
        setError('name', { message: 'This name is already taken' });
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tools/types">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Create New Type</h1>
        </div>
        <p className="text-gray-600">
          Define a new type for your sections, pages, sites, or themes
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={watchCategory}
              onValueChange={(value) => setValue('category', value as 'section' | 'page' | 'site' | 'theme')}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="section">Section</SelectItem>
                <SelectItem value="page">Page</SelectItem>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="theme">Theme</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Type Name</Label>
            <Input
              id="name"
              placeholder="e.g., hero, navbar, footer"
              {...register('name')}
              onBlur={handleNameBlur}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lowercase letters, numbers, and hyphens only
            </p>
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
            {isCheckingName && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking availability...
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              placeholder="e.g., Hero Section, Navigation Bar"
              {...register('display_name')}
            />
            {errors.display_name && (
              <p className="text-sm text-destructive mt-1">{errors.display_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this type is for..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>


          <div>
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              placeholder="e.g., lucide:layout-dashboard"
              {...register('icon')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Icon identifier for UI display (optional)
            </p>
            {errors.icon && (
              <p className="text-sm text-destructive mt-1">{errors.icon.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Type
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/tools/types">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}