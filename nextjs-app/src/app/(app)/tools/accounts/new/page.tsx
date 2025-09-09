'use client';

// import { useState } from 'react'; // May be needed later
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAccount } from '@/hooks/useAccounts';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100, 'Account name too long'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .refine(slug => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with hyphen'),
  description: z.string().max(500, 'Description too long').optional(),
});

type CreateAccountForm = z.infer<typeof createAccountSchema>;

export default function NewAccountPage() {
  const router = useRouter();
  const createAccount = useCreateAccount();
  
  const {
    register,
    handleSubmit,
    // watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountForm>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  // const watchName = watch('name'); // For auto-slug generation

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Update slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setValue('slug', slug);
  };

  const onSubmit = async (data: CreateAccountForm) => {
    try {
      const newAccount = await createAccount.mutateAsync({
        name: data.name,
        slug: data.slug,
        tier: 'FREE', // Always create accounts with FREE tier
        settings: data.description ? { description: data.description } : {},
      });
      
      // Redirect to the new account's detail page
      router.push(`/tools/accounts/${newAccount.id}`);
    } catch (error) {
      // Parse error message to set field-specific errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      
      // Map error messages to specific fields
      if (errorMessage.includes('Account name')) {
        setError('name', { message: errorMessage });
      } else if (errorMessage.includes('slug')) {
        setError('slug', { message: errorMessage });
      } else {
        // Show generic error as toast or alert
        setError('root', { message: errorMessage });
      }
    }
  };

  return (
    <PermissionGate
      permission="accounts.create"
      fallback={
        <div className="container mx-auto py-8">
          <p>You don't have permission to create accounts.</p>
        </div>
      }
    >
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Create New Account</h1>
              <p className="text-muted-foreground mt-1">
                Add a new customer account to the platform
              </p>
            </div>
            <Link href="/tools/accounts">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Accounts
              </Button>
            </Link>
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  Basic information about the customer account. All new accounts start with the FREE tier.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    onChange={handleNameChange}
                    placeholder="Acme Corporation"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Account Slug *</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="acme-corporation"
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  <p className="text-sm text-muted-foreground">
                    Used in URLs and internal references. Auto-generated from account name.
                  </p>
                  {errors.slug && (
                    <p className="text-sm text-red-600">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Brief description of the customer or their business..."
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end space-x-4">
              <Link href="/tools/accounts">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting || createAccount.isPending}>
                {isSubmitting || createAccount.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGate>
  );
}