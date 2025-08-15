'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvitationActions } from './invitation-actions';
import { UserPlus, Shield, Users, Building } from 'lucide-react';
import type { InvitationWithAccount } from '@/lib/services/invitations';

interface InvitationCardProps {
  invitation: InvitationWithAccount;
  token: string;
}

export function InvitationCard({ invitation, token }: InvitationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'account_owner':
        return <Shield className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'account_owner':
        return 'You will have full administrative access to manage users, billing, and account settings.';
      case 'user':
        return 'You will have access to view and work on projects within this account.';
      default:
        return 'You will be added as a member of this account.';
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
          <Building className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">You're Invited!</CardTitle>
        <CardDescription className="text-base">
          {invitation.inviter?.user_metadata?.display_name || 
           invitation.inviter?.email?.split('@')[0] || 
           'Someone'} has invited you to join
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Account Name */}
        <div className="text-center">
          <h3 className="text-xl font-semibold">{invitation.accounts?.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">Workspace</p>
        </div>

        {/* Role Information */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Role:</span>
            <Badge variant="default" className="flex items-center gap-1">
              {getRoleIcon(invitation.role)}
              {invitation.role === 'account_owner' ? 'Account Owner' : 'User'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {getRoleDescription(invitation.role)}
          </p>
        </div>

        {/* Inviter Info */}
        <div className="text-sm text-center text-muted-foreground">
          Invited by <strong>{invitation.inviter?.email}</strong>
          <br />
          <span className="text-xs">
            Expires {new Date(invitation.expires_at).toLocaleDateString()}
          </span>
        </div>

        {/* Action Buttons */}
        <InvitationActions 
          token={token}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
      </CardContent>
    </Card>
  );
}