'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import { LogoFull } from '@/components/ui/logo';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check for email and verified params on mount
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const verifiedParam = searchParams.get('verified');
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    
    if (verifiedParam === 'true') {
      toast.success('Email verified! Please log in to continue.');
    }
  }, [searchParams]);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Form validation
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      email.length > 0 &&
      emailRegex.test(email) &&
      password.length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.signIn({ email, password });
      
      // After successful sign in, check for pending invitations
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check for any pending invitations for this user
        const { data: pendingInvitation } = await supabase
          .from('account_invitations')
          .select('token, account_id, role, accounts!inner(slug)')
          .eq('email', user.email?.toLowerCase())
          .is('accepted_at', null)
          .is('declined_at', null)
          .is('cancelled_at', null)
          .gt('expires_at', new Date().toISOString())
          .order('invited_at', { ascending: false })
          .limit(1)
          .single();
        
        if (pendingInvitation) {
          console.log('[Login] Found pending invitation for user, accepting...');
          
          // Accept the invitation
          const acceptResponse = await fetch('/api/invitations/accept-after-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              token: pendingInvitation.token,
              email: user.email 
            })
          });
          
          if (acceptResponse.ok) {
            console.log('[Login] Successfully accepted invitation');
            toast.success('Invitation accepted! Setting up your profile...');
            
            // Check if user already has a profile
            const profileResponse = await fetch('/api/user/profile', {
              method: 'GET',
              credentials: 'include',
            });
            
            const profileData = await profileResponse.json();
            
            if (!profileData.profile) {
              // No profile exists, redirect to welcome page for first-time setup
              window.location.href = `/profile/welcome?account=${pendingInvitation.account_id}`;
              return;
            } else {
              // Profile exists, go directly to dashboard
              window.location.href = '/dashboard';
              return;
            }
          } else {
            const errorData = await acceptResponse.json();
            console.error('[Login] Failed to accept invitation:', errorData.error);
            // Continue with normal flow even if invitation acceptance fails
          }
        }
      }
      
      // If no invitation or invitation acceptance failed, check where to redirect normally
      const response = await fetch('/api/auth/post-login', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const { redirect } = await response.json();
        // Use window.location for full page reload to ensure middleware runs
        window.location.href = redirect;
      } else {
        // Fallback to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail || resendCooldown > 0) return;

    setIsResending(true);
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification email sent! Check your inbox.');
        setResendCooldown(60); // 60 second cooldown
        setShowResend(false);
        setResendEmail('');
      } else {
        toast.error(data.error || 'Failed to resend email');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <LogoFull size="xl" />
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your Wondrous Digital account
            </CardDescription>
          </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            
            {/* Public signup disabled for MVP - manually created accounts only */}
            
            {/* Resend Verification Section */}
            <Collapsible open={showResend} onOpenChange={setShowResend}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Didn't receive verification email?
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="resendEmail">Email address</Label>
                  <Input
                    id="resendEmail"
                    type="email"
                    placeholder="name@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    disabled={isResending}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0 || !resendEmail}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <LoginPageContent />
    </Suspense>
  );
}