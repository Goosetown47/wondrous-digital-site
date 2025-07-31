'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

export function ProfileForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement profile update
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getUserInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={undefined} />
            <AvatarFallback className="text-lg">
              {user?.email ? getUserInitials(user.email) : 'U'}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full"
            disabled
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium">Profile Photo</h3>
          <p className="text-sm text-muted-foreground">
            Profile photo upload coming soon
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
            Email cannot be changed
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Display name customization coming soon
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        Save Changes
      </Button>
    </form>
  );
}