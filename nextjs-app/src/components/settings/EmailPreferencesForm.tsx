'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useEmailPreferences, useUpdateEmailPreferences } from '@/hooks/useEmailPreferences';
import type { EmailPreferences } from '@/hooks/useEmailPreferences';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Mail, Shield, CreditCard, Megaphone, Calendar } from 'lucide-react';

interface EmailCategory {
  key: keyof Omit<EmailPreferences, 'user_id' | 'created_at' | 'updated_at'>;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
}

const emailCategories: EmailCategory[] = [
  {
    key: 'security_alerts',
    label: 'Security Alerts',
    description: 'Important notifications about your account security, including password changes and new device logins',
    icon: Shield,
    required: true,
  },
  {
    key: 'billing_notifications',
    label: 'Billing Notifications',
    description: 'Invoices, payment confirmations, and subscription updates',
    icon: CreditCard,
    required: true,
  },
  {
    key: 'product_updates',
    label: 'Product Updates',
    description: 'New features, improvements, and important announcements about our platform',
    icon: AlertCircle,
  },
  {
    key: 'marketing_emails',
    label: 'Marketing Emails',
    description: 'Tips, best practices, and promotional offers to help you get the most out of our platform',
    icon: Megaphone,
  },
  {
    key: 'weekly_digest',
    label: 'Weekly Activity Digest',
    description: 'A summary of your account activity and project updates delivered every Monday',
    icon: Calendar,
  },
];

export function EmailPreferencesForm() {
  const { data: preferences, isLoading, error } = useEmailPreferences();
  const updatePreferences = useUpdateEmailPreferences();
  const [localPreferences, setLocalPreferences] = useState<EmailPreferences | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggle = (key: keyof Omit<EmailPreferences, 'user_id' | 'created_at' | 'updated_at'>, value: boolean) => {
    if (!localPreferences) return;

    const newPreferences = { ...localPreferences, [key]: value };
    setLocalPreferences(newPreferences);
    setHasChanges(true);

    // Auto-save with debounce
    const timeoutId = setTimeout(() => {
      updatePreferences.mutate(
        { [key]: value },
        {
          onSuccess: () => {
            toast({
              title: 'Preferences updated',
              description: 'Your email notification preferences have been saved.',
            });
            setHasChanges(false);
          },
          onError: (error) => {
            toast({
              title: 'Update failed',
              description: 'Failed to update your preferences. Please try again.',
              variant: 'destructive',
            });
            // Revert the change
            setLocalPreferences(preferences || null);
          },
        }
      );
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleUnsubscribeAll = () => {
    if (!localPreferences) return;

    const newPreferences: EmailPreferences = {
      ...localPreferences,
      marketing_emails: false,
      product_updates: false,
      weekly_digest: false,
      // Keep required notifications enabled
      security_alerts: true,
      billing_notifications: true,
    };

    setLocalPreferences(newPreferences);
    
    updatePreferences.mutate(
      {
        marketing_emails: false,
        product_updates: false,
        weekly_digest: false,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Unsubscribed',
            description: 'You have been unsubscribed from all optional emails.',
          });
        },
        onError: () => {
          toast({
            title: 'Update failed',
            description: 'Failed to update your preferences. Please try again.',
            variant: 'destructive',
          });
          setLocalPreferences(preferences || null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="h-6 w-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-destructive">Failed to load email preferences.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!localPreferences) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {emailCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.key} className="flex items-start space-x-3">
              <div className="mt-0.5">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={category.key}
                    className="text-base font-medium cursor-pointer"
                  >
                    {category.label}
                    {category.required && (
                      <span className="ml-2 text-xs text-muted-foreground">(Required)</span>
                    )}
                  </Label>
                  <Switch
                    id={category.key}
                    checked={localPreferences[category.key]}
                    onCheckedChange={(value) => handleToggle(category.key, value)}
                    disabled={category.required || updatePreferences.isPending}
                  />
                </div>
                <p className="text-sm text-muted-foreground pr-12">
                  {category.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={handleUnsubscribeAll}
          disabled={updatePreferences.isPending}
          className="w-full sm:w-auto"
        >
          <Mail className="mr-2 h-4 w-4" />
          Unsubscribe from all optional emails
        </Button>

        {preferences?.updated_at && (
          <p className="text-xs text-muted-foreground">
            Last updated {formatDistanceToNow(new Date(preferences.updated_at), { addSuffix: true })}
          </p>
        )}
      </div>

      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Account invitations and critical security notifications cannot be disabled 
          for your protection. All other email preferences can be customized to your liking.
        </p>
      </div>
    </div>
  );
}