'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export default function SetupPage() {
  const router = useRouter();
  const { user, accounts, loading: authLoading, refreshAccounts } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [personalName, setPersonalName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Initialize form and check user status
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // If user already has accounts, they shouldn't be here
    if (accounts && accounts.length > 0) {
      router.push('/dashboard');
      return;
    }

    // Pre-fill name from email if available
    const emailName = user.email?.split('@')[0] || '';
    setPersonalName(
      user.user_metadata?.full_name || 
      user.user_metadata?.display_name || 
      emailName
    );
    setAccountName(`${emailName}'s Account`);
    setLoading(false);
  }, [user, accounts, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Update user profile
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: personalName,
          phone,
          metadata: {
            address,
          },
        }),
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to update profile');
      }

      // Create account
      const accountResponse = await fetch('/api/accounts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountName,
          settings: {
            contact: {
              phone,
              address,
            },
          },
        }),
      });

      if (!accountResponse.ok) {
        const data = await accountResponse.json();
        throw new Error(data.error || 'Failed to create account');
      }

      // Refresh accounts in context
      await refreshAccounts();
      
      // Success - redirect to dashboard with full reload to ensure clean state
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Wondrous Digital! 🎉</h1>
          <p className="mt-2 text-gray-600">
            Let's set up your account to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Setup</CardTitle>
            <CardDescription>
              Tell us a bit about yourself and your organization
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                      className="w-full min-h-[80px] px-10 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Account Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name *</Label>
                  <Input
                    id="accountName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="My Company"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This is the name of your organization or personal workspace
                  </p>
                </div>
              </div>
            </CardContent>

            <div className="px-6 pb-6">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || !personalName || !accountName}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}