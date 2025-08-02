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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  plan: z.enum(['free', 'pro', 'enterprise']).describe('Please select a plan'),
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
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountForm>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      slug: '',
      plan: 'free',
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
        plan: data.plan,
        settings: data.description ? { description: data.description } : {},
      });
      
      // Redirect to the new account's detail page
      router.push(`/tools/accounts/${newAccount.id}`);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Failed to create account:', error);
    }
  };

  const planDescriptions = {
    free: 'Basic features for small projects',
    pro: 'Advanced features for growing businesses',
    enterprise: 'Full features with enterprise support',
  };

  const planPricing = {
    free: 'Free',
    pro: '$29/month',
    enterprise: 'Contact Sales',
  };

  return (
    <PermissionGate permission="account:create">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Link href="/tools/accounts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Accounts
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create New Account</h2>
            <p className="text-muted-foreground">
              Set up a new customer account with their preferred plan
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Basic information about the customer account
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

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>
                  Choose the subscription plan for this account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan *</Label>
                  <Select
                    onValueChange={(value: 'free' | 'pro' | 'enterprise') => setValue('plan', value)}
                    defaultValue="free"
                  >
                    <SelectTrigger className={errors.plan ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">Free Plan</div>
                            <div className="text-sm text-muted-foreground">
                              {planDescriptions.free}
                            </div>
                          </div>
                          <div className="font-medium text-green-600 ml-4">
                            {planPricing.free}
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">Pro Plan</div>
                            <div className="text-sm text-muted-foreground">
                              {planDescriptions.pro}
                            </div>
                          </div>
                          <div className="font-medium text-blue-600 ml-4">
                            {planPricing.pro}
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="enterprise">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">Enterprise Plan</div>
                            <div className="text-sm text-muted-foreground">
                              {planDescriptions.enterprise}
                            </div>
                          </div>
                          <div className="font-medium text-purple-600 ml-4">
                            {planPricing.enterprise}
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.plan && (
                    <p className="text-sm text-red-600">{errors.plan.message}</p>
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