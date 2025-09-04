'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateAccount } from '@/hooks/useAccounts';
import { INPUT_LIMITS } from '@/lib/sanitization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2 } from 'lucide-react';
import type { AccountWithStats } from '@/lib/services/accounts';

const updateAccountSchema = z.object({
  name: z.string()
    .min(1, 'Account name is required')
    .max(INPUT_LIMITS.accountName, `Account name must be less than ${INPUT_LIMITS.accountName} characters`),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(INPUT_LIMITS.accountSlug, `Slug must be less than ${INPUT_LIMITS.accountSlug} characters`)
    .refine(slug => slug.length > 0, 'Slug is required')
    .refine(slug => /^[a-z0-9-]+$/.test(slug), 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine(slug => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with hyphen'),
  description: z.string()
    .max(INPUT_LIMITS.projectDescription, `Description must be less than ${INPUT_LIMITS.projectDescription} characters`)
    .optional(),
});

type UpdateAccountForm = z.infer<typeof updateAccountSchema>;

interface AccountSettingsProps {
  account: AccountWithStats;
}

export function AccountSettings({ account }: AccountSettingsProps) {
  const updateAccount = useUpdateAccount();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateAccountForm>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      name: account.name,
      slug: account.slug,
      description: (account.settings as Record<string, unknown>)?.description as string || '',
    },
  });


  // Reset form when account data changes (e.g., after refetch)
  useEffect(() => {
    reset({
      name: account.name,
      slug: account.slug,
      description: (account.settings as Record<string, unknown>)?.description as string || '',
    });
  }, [account, reset]);

  const onSubmit = async (data: UpdateAccountForm) => {
    try {
      await updateAccount.mutateAsync({
        id: account.id,
        updates: {
          name: data.name,
          slug: data.slug,
          settings: {
            ...account.settings,
            description: data.description,
          },
        },
      });
      // Reset the form with the new values so isDirty works correctly
      reset(data);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Failed to update account:', error);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const tierDescriptions: Record<'FREE' | 'BASIC' | 'PRO' | 'SCALE' | 'MAX', string> = {
    FREE: 'Basic features for small projects',
    BASIC: 'Essential features for small businesses',
    PRO: 'Advanced features for growing businesses',
    SCALE: 'High-performance features for scaling businesses',
    MAX: 'Full features with enterprise support',
  };

  const tierPricing: Record<'FREE' | 'BASIC' | 'PRO' | 'SCALE' | 'MAX', string> = {
    FREE: 'Free',
    BASIC: '$39/month',
    PRO: '$89/month',
    SCALE: '$299/month',
    MAX: 'Contact Sales',
  };

  const tierLimits: Record<'FREE' | 'BASIC' | 'PRO' | 'SCALE' | 'MAX', { projects: string | number; users: string | number; storage: string }> = {
    FREE: { projects: 1, users: 1, storage: '100 MB' },
    BASIC: { projects: 3, users: 2, storage: '1 GB' },
    PRO: { projects: 10, users: 5, storage: '10 GB' },
    SCALE: { projects: 50, users: 20, storage: '100 GB' },
    MAX: { projects: 'Unlimited', users: 'Unlimited', storage: '100 GB' },
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Basic account details and identification
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!isDirty || updateAccount.isPending}
                  >
                    {updateAccount.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditing ? (
              // Read-only view
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Account Name</Label>
                  <p className="text-sm text-muted-foreground mt-1">{account.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Slug</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    <code className="bg-muted px-2 py-1 rounded">{account.slug}</code>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(account.settings as Record<string, unknown>)?.description as string || 'No description provided'}
                  </p>
                </div>
              </div>
            ) : (
              // Edit mode
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
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
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  <p className="text-sm text-muted-foreground">
                    Used in URLs and internal references. Must be unique.
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
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Only show subscription plan card in read-only mode */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Current plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {account.tier} Plan
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {tierDescriptions[account.tier]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{tierPricing[account.tier]}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h5 className="font-medium mb-2">Plan Limits</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Projects</p>
                      <p className="font-medium">{tierLimits[account.tier].projects}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Users</p>
                      <p className="font-medium">{tierLimits[account.tier].users}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Storage</p>
                      <p className="font-medium">{tierLimits[account.tier].storage}</p>
                    </div>
                  </div>
                </div>
                
                {account.is_unlocked && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      🔓 This account has all features unlocked
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}