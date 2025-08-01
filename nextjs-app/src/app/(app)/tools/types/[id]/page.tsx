'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useType, useUpdateType, useCheckTypeName } from '@/hooks/useTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  description: z.string().optional(),
  icon: z.string().optional(),
});

type TypeFormData = z.infer<typeof typeFormSchema>;

export default function EditTypePage() {
  const router = useRouter();
  const params = useParams();
  const typeId = params.id as string;
  
  const { data: type, isLoading } = useType(typeId);
  const updateType = useUpdateType(typeId);
  const checkName = useCheckTypeName();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setError,
  } = useForm<TypeFormData>({
    resolver: zodResolver(typeFormSchema),
  });

  useEffect(() => {
    if (type) {
      reset({
        name: type.name,
        display_name: type.display_name,
        description: type.description || '',
        icon: type.icon || '',
      });
    }
  }, [type, reset]);

  const watchName = watch('name');

  const handleNameBlur = async () => {
    if (!watchName || watchName === type?.name) return;
    
    try {
      const isAvailable = await checkName.mutateAsync({ 
        name: watchName, 
        excludeId: typeId 
      });
      if (!isAvailable) {
        setError('name', { message: 'This name is already taken' });
      }
    } catch (error) {
      console.error('Failed to check name:', error);
    }
  };

  const onSubmit = async (data: TypeFormData) => {
    try {
      await updateType.mutateAsync(data);
      router.push('/tools/types');
    } catch (error) {
      console.error('Failed to update type:', error);
      if (error.message?.includes('duplicate')) {
        setError('name', { message: 'This name is already taken' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!type) {
    return (
      <div className="p-6">
        <p>Type not found</p>
        <Button asChild className="mt-4">
          <Link href="/tools/types">Back to Types</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tools/types">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Type</h1>
        </div>
        <p className="text-gray-600">
          Update the {type.category} type definition
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Category</Label>
            <div className="mt-1 px-3 py-2 bg-gray-100 rounded-md text-sm">
              {type.category}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Category cannot be changed after creation
            </p>
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
            Save Changes
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/tools/types">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}