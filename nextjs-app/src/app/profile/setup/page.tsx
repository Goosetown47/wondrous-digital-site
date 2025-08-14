'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PasswordStrength } from '@/components/ui/password-strength';
import { AlertCircle, User, Mail, Lock, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { LogoFull } from '@/components/ui/logo';

interface InvitationData {
  id: string;
  email: string;
  role: 'user' | 'account_owner';
  accounts: {
    name: string;
    slug: string;
  };
}

function ProfileSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }
    
    loadInvitation();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInvitation = async () => {
    if (!token) return;
    
    try {
      // Fetch invitation details
      const { data, error: fetchError } = await supabase
        .from('account_invitations')
        .select(`
          *,
          accounts!inner(
            name,
            slug
          )
        `)
        .eq('token', token)
        .is('accepted_at', null)
        .is('declined_at', null)
        .is('cancelled_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (fetchError || !data) {
        setError('Invalid or expired invitation');
        setLoading(false);
        return;
      }

      setInvitation(data);
      setEmail(data.email);
      setLoading(false);
    } catch {
      setError('Failed to load invitation');
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !invitation || !token) return;
    
    setSubmitting(true);
    setFormErrors({});
    
    try {
      // Step 1: Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('Failed to create account');
      }

      // Check if email confirmation is required
      const needsEmailConfirmation = signUpData.user && !signUpData.user.confirmed_at;

      if (needsEmailConfirmation) {
        // Redirect to email verification page
        toast.success('Account created! Please check your email to verify your account.');
        
        const verifyUrl = new URL('/auth/verify-email-pending', window.location.origin);
        verifyUrl.searchParams.set('email', email);
        verifyUrl.searchParams.set('account', invitation.accounts.name);
        verifyUrl.searchParams.set('token', token);
        
        router.push(verifyUrl.toString());
      } else {
        // Email already confirmed (rare case), accept invitation immediately
        const response = await fetch('/api/invitations/accept-after-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            token,
            email: email 
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to accept invitation');
        }

        toast.success('Account created and invitation accepted!');
        
        // Redirect to the account page
        router.push(`/tools/accounts/${invitation.accounts.slug}`);
      }
    } catch (error) {
      console.error('Setup error:', error);
      const message = error instanceof Error ? error.message : 'Failed to complete setup';
      
      // Check for specific error cases
      if (message.includes('User already registered')) {
        setFormErrors({ email: 'An account with this email already exists. Please log in instead.' });
      } else {
        setFormErrors({ submit: message });
      }
      
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Setup Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LogoFull className="h-10" />
          </div>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Set up your account to join {invitation.accounts.name}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Invitation Info */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Users className="h-4 w-4" />
                <span>You're joining <strong>{invitation.accounts.name}</strong> as {invitation.role === 'account_owner' ? 'an Account Owner' : 'a User'}</span>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting}
                className={formErrors.fullName ? 'border-red-500' : ''}
              />
              {formErrors.fullName && (
                <p className="text-sm text-red-500">{formErrors.fullName}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="inline h-4 w-4 mr-1" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className={formErrors.password ? 'border-red-500' : ''}
              />
              {password && <PasswordStrength password={password} />}
              {formErrors.password && (
                <p className="text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                <Lock className="inline h-4 w-4 mr-1" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className={formErrors.confirmPassword ? 'border-red-500' : ''}
              />
              {formErrors.confirmPassword && (
                <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* General form error */}
            {formErrors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formErrors.submit}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>Creating Account...</>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Account & Join Team
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ProfileSetupContent />
    </Suspense>
  );
}