'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserPlus, Upload, Building2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AccountInfo {
  id: string;
  name: string;
  slug: string;
  owner?: {
    email: string;
    display_name?: string;
  };
}

function WelcomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [inviterName, setInviterName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  
  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadAccountInfo() {
      try {
        const accountId = searchParams.get('account');
        if (!accountId) {
          // No account ID, redirect to dashboard
          router.push('/dashboard');
          return;
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Pre-fill display name from email
        setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Get account information
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('id, name, slug')
          .eq('id', accountId)
          .single();

        if (accountError || !accountData) {
          console.error('Failed to load account:', accountError);
          toast.error('Failed to load account information');
          router.push('/dashboard');
          return;
        }

        // Get user's role in this account
        const { data: memberData } = await supabase
          .from('account_users')
          .select('role, invited_by')
          .eq('account_id', accountId)
          .eq('user_id', user.id)
          .single();

        if (memberData) {
          setUserRole(memberData.role);
          
          // Get inviter information if available
          if (memberData.invited_by) {
            const { data: inviterData } = await supabase
              .from('user_profiles')
              .select('display_name')
              .eq('user_id', memberData.invited_by)
              .single();
            
            if (inviterData?.display_name) {
              setInviterName(inviterData.display_name);
            } else {
              // Fall back to auth user data if no profile
              const { data: { user: inviter } } = await supabase.auth.admin.getUserById(memberData.invited_by);
              setInviterName(inviter?.email?.split('@')[0] || 'a team member');
            }
          }
        }

        // Get account owner information
        const { data: ownerData } = await supabase
          .from('account_users')
          .select('user_id')
          .eq('account_id', accountId)
          .eq('role', 'account_owner')
          .single();

        if (ownerData) {
          const { data: ownerProfile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('user_id', ownerData.user_id)
            .single();

          const { data: { user: owner } } = await supabase.auth.admin.getUserById(ownerData.user_id);
          
          setAccountInfo({
            ...accountData,
            owner: {
              email: owner?.email || '',
              display_name: ownerProfile?.display_name
            }
          });
        } else {
          setAccountInfo(accountData);
        }

        // Check if user already has a completed profile
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingProfile?.profile_completed) {
          // User already completed their profile, redirect to dashboard
          router.push('/dashboard');
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading account info:', error);
        toast.error('Failed to load account information');
        router.push('/dashboard');
      }
    }

    loadAccountInfo();
  }, [searchParams, router]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (skip = false) => {
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create or update user profile
      const profileData = {
        user_id: user.id,
        display_name: skip ? (user.email?.split('@')[0] || 'User') : displayName,
        phone: skip ? null : phone,
        avatar_url: skip ? null : avatarUrl,
        profile_completed: true,  // Mark as completed even if skipped
        metadata: {
          welcomed: true,
          setup_skipped: skip
        }
      };

      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      toast.success(skip ? 'Proceeding to dashboard...' : 'Profile created successfully!');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!accountInfo) {
    return null;
  }

  const roleDisplay = userRole === 'account_owner' ? 'Account Owner' : 
                      userRole === 'admin' ? 'Administrator' : 'Team Member';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl font-bold text-gray-900">
            Welcome to {accountInfo.name}!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {inviterName ? `${inviterName} invited you to join as a ${roleDisplay}` : `You've joined as a ${roleDisplay}`}
          </p>
        </div>

        {/* Account Info Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>You're now a member of this account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Account Name:</dt>
                <dd className="text-sm text-gray-900">{accountInfo.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Your Role:</dt>
                <dd className="text-sm text-gray-900">{roleDisplay}</dd>
              </div>
              {accountInfo.owner && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Account Owner:</dt>
                  <dd className="text-sm text-gray-900">
                    {accountInfo.owner.display_name || accountInfo.owner.email}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Profile Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Help your team recognize you by adding your details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById('avatar')?.click()}
                    type="button"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </Label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF (max 2MB)
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we address you?"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-xs text-muted-foreground">
                For account recovery and important notifications
              </p>
            </div>
          </CardContent>

          <div className="px-6 pb-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={submitting || !displayName.trim()}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Info Alert */}
        <Alert>
          <AlertDescription>
            You can always update your profile information later in your account settings.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <WelcomePageContent />
    </Suspense>
  );
}