'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogoFull } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    setResendStatus('idle');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendStatus('success');
        setResendCooldown(60); // 60 second cooldown
        toast.success('Verification email sent! Check your inbox.');
      } else {
        setResendStatus('error');
        toast.error(data.error || 'Failed to resend email');
      }
    } catch (error) {
      setResendStatus('error');
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
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Check your email
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a verification link to
                </p>
                <p className="font-medium text-gray-900">
                  {email || 'your email address'}
                </p>
              </div>

              {/* Instructions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click the link in the email to verify your account. 
                  If you don't see the email, check your spam folder.
                </AlertDescription>
              </Alert>

              {/* Resend Section */}
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the email?
                </p>
                
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0 || !email}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    'Sending...'
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend verification email'
                  )}
                </Button>

                {resendStatus === 'success' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Email sent successfully! Check your inbox.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2">
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
                
                <p className="text-xs text-gray-500">
                  If you continue to have issues, please{' '}
                  <Link href="/contact" className="text-blue-600 hover:text-blue-500">
                    contact support
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}