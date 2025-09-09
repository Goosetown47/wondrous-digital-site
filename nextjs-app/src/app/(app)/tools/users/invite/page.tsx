'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PermissionGate } from '@/components/auth/PermissionGate';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'account_owner']),
  accountId: z.string().min(1, 'Please select an account'),
  message: z.string().optional(),
});

type InviteUserForm = z.infer<typeof inviteUserSchema>;

export default function InviteUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InviteUserForm>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      role: 'user',
      message: '',
    },
  });

  const onSubmit = async (data: InviteUserForm) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement invitation sending
      console.log('Sending invitation:', data);
      toast.success(`Invitation sent to ${data.email}`);
      router.push('/tools/users');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PermissionGate
      permission="users:create"
      fallback={
        <div className="flex-1 p-8">
          <p>You don't have permission to invite users.</p>
        </div>
      }
    >
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Invite User</h1>
              <p className="text-muted-foreground mt-1">
                Send an invitation email to join the platform
              </p>
            </div>
            <Link href="/tools/users">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invitation Details</CardTitle>
                <CardDescription>
                  The user will receive an email invitation to join the selected account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="user@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountId">Account *</Label>
                  <Select
                    onValueChange={(value) => setValue('accountId', value)}
                  >
                    <SelectTrigger id="accountId">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Load actual accounts */}
                      <SelectItem value="placeholder">Select an account...</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.accountId && (
                    <p className="text-sm text-red-500">{errors.accountId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    defaultValue="user"
                    onValueChange={(value) => setValue('role', value as 'user' | 'account_owner')}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="account_owner">Account Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    {...register('message')}
                    placeholder="Add a personal message to the invitation..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/tools/users">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGate>
  );
}