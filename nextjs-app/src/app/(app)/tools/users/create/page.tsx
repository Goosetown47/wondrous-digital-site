'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUser } from '@/lib/services/users';
import { useAccounts } from '@/hooks/useAccounts';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { INPUT_LIMITS } from '@/lib/sanitization';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, ArrowLeft, User, Mail, Key, Shield, Building } from 'lucide-react';
import { toast } from 'sonner';

// Form validation schema
const formSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(INPUT_LIMITS.email, `Email must be less than ${INPUT_LIMITS.email} characters`),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(INPUT_LIMITS.password, `Password must be less than ${INPUT_LIMITS.password} characters`),
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(INPUT_LIMITS.displayName, `Name must be less than ${INPUT_LIMITS.displayName} characters`),
  display_name: z.string()
    .max(INPUT_LIMITS.displayName, `Display name must be less than ${INPUT_LIMITS.displayName} characters`)
    .optional(),
  role: z.enum(['admin', 'staff', 'account_owner', 'user']),
  account_id: z.string().optional(),
  auto_confirm_email: z.boolean(),
  send_welcome_email: z.boolean(),
}).refine((data) => {
  // Account ID is required for account_owner and user roles
  if ((data.role === 'account_owner' || data.role === 'user') && !data.account_id) {
    return false;
  }
  return true;
}, {
  message: "Account is required for Account Owner and User roles",
  path: ["account_id"],
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      display_name: '',
      role: 'user',
      account_id: '',
      auto_confirm_email: true,
      send_welcome_email: false,
    },
  });

  const selectedRole = form.watch('role');
  const needsAccount = selectedRole === 'account_owner' || selectedRole === 'user';

  // Generate random password
  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    form.setValue('password', password);
    toast.success('Password generated successfully');
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting user creation form with values:', values);
      
      // Clean up the data - convert empty strings to undefined
      const cleanedValues = {
        ...values,
        display_name: values.display_name || undefined,
        account_id: values.account_id || undefined,
      };
      
      const result = await createUser(cleanedValues);

      if (result.success) {
        toast.success(`User ${values.email} created successfully`);
        router.push('/tools/users');
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch {
      // Error is already logged in the service, just handle it
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PermissionGate permission="users:create" fallback={<div>Access denied</div>}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/tools/users')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Create User</h2>
            <p className="text-muted-foreground">
              Create a new user account with immediate access
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              Enter the user's information and assign their role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Mail className="inline-block w-4 h-4 mr-2" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Key className="inline-block w-4 h-4 mr-2" />
                          Password
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={generatePassword}
                            title="Generate random password"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormDescription>
                          Must be at least 8 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <User className="inline-block w-4 h-4 mr-2" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Display Name */}
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormDescription>
                          How the user's name appears in the UI
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Shield className="inline-block w-4 h-4 mr-2" />
                          Role
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">
                              <div>
                                <div className="font-semibold">Platform Admin</div>
                                <div className="text-sm text-muted-foreground">Full system access</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="staff">
                              <div>
                                <div className="font-semibold">Platform Staff</div>
                                <div className="text-sm text-muted-foreground">Manage templates and support</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="account_owner">
                              <div>
                                <div className="font-semibold">Account Owner</div>
                                <div className="text-sm text-muted-foreground">Full access to their account</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="user">
                              <div>
                                <div className="font-semibold">User</div>
                                <div className="text-sm text-muted-foreground">Standard account access</div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account (conditional) */}
                  {needsAccount && (
                    <FormField
                      control={form.control}
                      name="account_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Building className="inline-block w-4 h-4 mr-2" />
                            Account
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={accountsLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts?.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name} ({account.slug})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Required for Account Owner and User roles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  {/* Auto Confirm Email */}
                  <FormField
                    control={form.control}
                    name="auto_confirm_email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Auto-confirm email address
                          </FormLabel>
                          <FormDescription>
                            User can log in immediately without email verification
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Send Welcome Email */}
                  <FormField
                    control={form.control}
                    name="send_welcome_email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Send welcome email
                          </FormLabel>
                          <FormDescription>
                            Send an email to the user with login instructions
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/tools/users')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}