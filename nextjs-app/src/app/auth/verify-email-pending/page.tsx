'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowRight, Users } from 'lucide-react';
import { toast } from 'sonner';
import { LogoFull } from '@/components/ui/logo';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const accountName = searchParams.get('account');
  const invitationToken = searchParams.get('token');
  
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Store invitation token in localStorage for after verification
    if (invitationToken) {
      localStorage.setItem('pending_invitation', invitationToken);
    }

    // Check if user is already verified
    checkVerificationStatus();

    // Start cooldown countdown if needed
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkVerificationStatus = async () => {
    if (!email) return;

    try {
      // Try to get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email === email && user.email_confirmed_at) {
        setVerified(true);
        
        // If there's a pending invitation, accept it
        if (invitationToken) {
          handleInvitationAcceptance();
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleInvitationAcceptance = async () => {
    if (!invitationToken) return;

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: invitationToken }),
      });

      if (response.ok) {
        await response.json();
        localStorage.removeItem('pending_invitation');
        toast.success('Email verified and invitation accepted!');
        router.push(`/tools/accounts`);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;

    setResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      toast.success('Verification email resent! Please check your inbox.');
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      toast.error('Failed to resend verification email');
      console.error('Resend error:', error);
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been verified successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {accountName ? (
                  <>Your invitation to join <strong>{accountName}</strong> has been accepted.</>
                ) : (
                  <>You can now log in to access your account.</>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/tools/accounts">
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LogoFull className="h-10" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center p-8 bg-blue-50 rounded-lg">
            <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">{email}</p>
            <p className="text-sm text-muted-foreground">
              Please check your inbox and click the verification link to continue
            </p>
          </div>

          {accountName && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                After verifying your email, you'll automatically join <strong>{accountName}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2 mt-1">
                <span className="text-sm font-semibold text-blue-700">1</span>
              </div>
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  We sent a verification link to {email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2 mt-1">
                <span className="text-sm font-semibold text-blue-700">2</span>
              </div>
              <div>
                <p className="font-medium">Click the verification link</p>
                <p className="text-sm text-muted-foreground">
                  The link will verify your email and activate your account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2 mt-1">
                <span className="text-sm font-semibold text-blue-700">3</span>
              </div>
              <div>
                <p className="font-medium">Start using the platform</p>
                <p className="text-sm text-muted-foreground">
                  {accountName 
                    ? `You'll be added to ${accountName} and can start collaborating`
                    : "You'll be able to access all features"}
                </p>
              </div>
            </div>
          </div>

          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Didn't receive the email?</strong> Check your spam folder or click the button below to resend.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleResendEmail}
            disabled={resending || resendCooldown > 0}
            variant="outline"
            className="w-full"
          >
            {resending ? (
              <>Sending...</>
            ) : resendCooldown > 0 ? (
              <>Resend available in {resendCooldown}s</>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Already verified?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}