'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function ProfileForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || '');
    }
  }, [userProfile]);

  const updateProfile = useMutation({
    mutationFn: async (updates: { display_name?: string; avatar_url?: string }) => {
      if (!user?.id) throw new Error('No user');
      
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      console.error('Profile update error:', error);
      // Don't show toast here to avoid duplicates
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateProfile.mutateAsync({ display_name: displayName });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Create user folder path with avatar filename
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase storage (will overwrite existing avatar)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      await updateProfile.mutateAsync({ avatar_url: publicUrl });
      
    } catch (error) {
      // Only show error if it's not from updateProfile (which logs to console)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      if (!errorMessage.includes('user_profiles')) {
        toast.error(errorMessage);
      } else {
        toast.error('Failed to update profile. Please try saving your profile first.');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getUserInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      const parts = name.split(' ');
      return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      const parts = email.split('@')[0].split('.');
      return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback className="text-lg">
              {getUserInitials(userProfile?.display_name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <Button
              type="button"
              variant="default"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full hover:scale-110 transition-transform"
              disabled={uploadingAvatar}
              asChild
            >
              <span className="flex items-center justify-center">
                {uploadingAvatar ? (
                  <Upload className="h-4 w-4 animate-pulse" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </span>
            </Button>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploadingAvatar}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium">Profile Photo</h3>
          <p className="text-sm text-muted-foreground">
            Click the camera icon to upload a new photo (max 5MB)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Contact support to change your email address
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            This name will be shown across the platform
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isLoading || updateProfile.isPending}>
        {isLoading || updateProfile.isPending ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}