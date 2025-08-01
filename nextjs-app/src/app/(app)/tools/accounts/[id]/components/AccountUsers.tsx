'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

interface AccountUsersProps {
  accountId: string;
}

export function AccountUsers(_props: AccountUsersProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Account Users</span>
              </CardTitle>
              <CardDescription>
                Manage users who have access to this account
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            User management functionality will be implemented in Phase 2E.
            This will include user listing, role management, and invitation system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}