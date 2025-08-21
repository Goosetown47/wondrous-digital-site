'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, AlertCircle, Users, Shield, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface InvitationData {
  id: string;
  email: string;
  role: 'user' | 'account_owner';
  expires_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  cancelled_at: string | null;
  accounts: {
    name: string;
    slug: string;
  };
}

function InvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email?: string; id: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    checkInvitation();
    checkCurrentUser();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } finally {
      setCheckingUser(false);
    }
  };

  const checkInvitation = async () => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    try {
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
        .single();

      if (fetchError || !data) {
        setError('Invalid invitation token');
        setLoading(false);
        return;
      }

      setInvitation(data);
      setLoading(false);
    } catch {
      setError('Failed to load invitation');
      setLoading(false);
    }
  };

  const handleAcceptNewUser = () => {
    if (!token || !invitation) return;
    // For account_owner invitations, redirect to pricing page to complete payment
    if (invitation.role === 'account_owner') {
      router.push(`/pricing?flow=invitation&token=${token}`);
    } else {
      // For regular user invitations, redirect to profile setup
      router.push(`/profile/setup?token=${token}`);
    }
  };

  const handleAcceptExistingUser = async () => {
    if (!invitation || !token) return;
    
    // For account_owner invitations, redirect to pricing instead of accepting directly
    if (invitation.role === 'account_owner') {
      router.push(`/pricing?flow=invitation&token=${token}`);
      return;
    }
    
    setProcessing(true);
    
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      toast.success('Invitation accepted successfully!');
      router.push(`/tools/accounts/${invitation.accounts.slug}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation || !token) return;
    
    setProcessing(true);
    
    try {
      const response = await fetch('/api/invitations/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invitation');
      }

      toast.success('Invitation declined');
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
      setProcessing(false);
    }
  };


  if (loading || checkingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
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
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              If you need help getting another invitation, please email <a href="mailto:hello@wondrousdigital.com" className="text-primary underline">hello@wondrousdigital.com</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation could not be found. It may have been deleted or the link is incorrect.
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              If you need help getting another invitation, please email <a href="mailto:hello@wondrousdigital.com" className="text-primary underline">hello@wondrousdigital.com</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check invitation status
  const isExpired = new Date(invitation.expires_at) < new Date();
  const isAccepted = invitation.accepted_at !== null;
  const isDeclined = invitation.declined_at !== null;
  const isCancelled = invitation.cancelled_at !== null;

  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Invitation Already Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation has already been accepted. You can access the account from your dashboard.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/tools/accounts">Go to Accounts</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isDeclined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Declined</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation has been declined and is no longer valid.
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              If you need help getting another invitation, please email <a href="mailto:hello@wondrousdigital.com" className="text-primary underline">hello@wondrousdigital.com</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation has been cancelled by the sender and is no longer valid.
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              If you need help getting another invitation, please email <a href="mailto:hello@wondrousdigital.com" className="text-primary underline">hello@wondrousdigital.com</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Clock className="h-5 w-5" />
              Invitation Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation has expired. Please contact the account owner to request a new invitation.
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              If you need help getting another invitation, please email <a href="mailto:hello@wondrousdigital.com" className="text-primary underline">hello@wondrousdigital.com</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Determine user state
  const isLoggedIn = !!currentUser;
  const isCorrectUser = currentUser?.email?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Invitation
          </CardTitle>
          <CardDescription>
            You've been invited to join {invitation.accounts.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account</span>
              <span className="font-medium">{invitation.accounts.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant={invitation.role === 'account_owner' ? 'default' : 'secondary'}>
                {invitation.role === 'account_owner' && <Shield className="mr-1 h-3 w-3" />}
                {invitation.role === 'account_owner' ? 'Account Owner' : 'User'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">For</span>
              <span className="font-medium">{invitation.email}</span>
            </div>
          </div>

          {isLoggedIn && !isCorrectUser && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're logged in as {currentUser.email}. Please log out and use {invitation.email} to accept this invitation.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {!isLoggedIn ? (
            <>
              <Button 
                onClick={handleDecline} 
                variant="outline" 
                className="flex-1"
                disabled={processing}
              >
                Decline
              </Button>
              <Button 
                onClick={handleAcceptNewUser} 
                className="flex-1"
                disabled={processing}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Accept Invitation
              </Button>
            </>
          ) : isCorrectUser ? (
            <>
              <Button 
                onClick={handleDecline} 
                variant="outline" 
                className="flex-1"
                disabled={processing}
              >
                Decline
              </Button>
              <Button 
                onClick={handleAcceptExistingUser} 
                className="flex-1"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Accept & Join Team'}
              </Button>
            </>
          ) : (
            <Button asChild className="w-full">
              <Link href="/logout">Log Out</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function InvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}