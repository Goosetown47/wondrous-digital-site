'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface AccountActivityProps {
  accountId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AccountActivity(_props: AccountActivityProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Account Activity</span>
          </CardTitle>
          <CardDescription>
            Audit log of all actions performed in this account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Activity logging functionality will be enhanced to show detailed audit trails.
            This will include user actions, system events, and security logs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}