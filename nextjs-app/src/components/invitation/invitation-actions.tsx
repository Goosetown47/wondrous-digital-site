'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InvitationActionsProps {
  token: string;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function InvitationActions({ 
  token, 
  isProcessing, 
  setIsProcessing 
}: InvitationActionsProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [action, setAction] = useState<'accept' | 'decline' | null>(null);

  const handleAccept = async () => {
    // Check if user is logged in
    if (!user) {
      // Store token in session storage for after login/signup
      sessionStorage.setItem('pendingInvitation', token);
      // Redirect to login with return URL
      router.push(`/login?invitation=${token}&returnTo=/invitation?token=${token}`);
      return;
    }

    setAction('accept');
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/invitations/by-token/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      toast.success('Invitation accepted successfully!');
      
      // Redirect to the account's dashboard or projects
      router.push('/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
      setIsProcessing(false);
      setAction(null);
    }
  };

  const handleDecline = async () => {
    setAction('decline');
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/invitations/by-token/${token}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invitation');
      }

      toast.success('Invitation declined');
      
      // Redirect to login or home page
      router.push('/login');
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
      setIsProcessing(false);
      setAction(null);
    }
  };

  // Check if invitation was already accepted after login
  useEffect(() => {
    const checkPendingInvitation = async () => {
      if (user) {
        const pendingToken = sessionStorage.getItem('pendingInvitation');
        if (pendingToken && pendingToken === token) {
          // Clear the pending invitation
          sessionStorage.removeItem('pendingInvitation');
          // Auto-accept the invitation
          await handleAccept();
        }
      }
    };

    if (!authLoading) {
      checkPendingInvitation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, token]);

  return (
    <div className="space-y-3">
      <Button
        onClick={handleAccept}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {action === 'accept' && isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Accepting...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            {user ? 'Accept Invitation' : 'Login to Accept'}
          </>
        )}
      </Button>

      <Button
        onClick={handleDecline}
        disabled={isProcessing}
        variant="outline"
        className="w-full"
        size="lg"
      >
        {action === 'decline' && isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Declining...
          </>
        ) : (
          <>
            <X className="mr-2 h-4 w-4" />
            Decline Invitation
          </>
        )}
      </Button>

      {!user && (
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => {
                sessionStorage.setItem('pendingInvitation', token);
                router.push(`/signup?invitation=${token}`);
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      )}
    </div>
  );
}