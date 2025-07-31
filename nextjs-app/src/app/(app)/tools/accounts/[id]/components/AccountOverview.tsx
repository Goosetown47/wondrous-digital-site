'use client';

import { format } from 'date-fns';
import { useAccountStats } from '@/hooks/useAccounts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FolderOpen, 
  FileText, 
  Activity,
  Calendar,
  HardDrive,
} from 'lucide-react';
import type { AccountWithStats } from '@/lib/services/accounts';

interface AccountOverviewProps {
  account: AccountWithStats;
}

export function AccountOverview({ account }: AccountOverviewProps) {
  const { data: stats, isLoading: statsLoading } = useAccountStats(account.id);

  const statCards = [
    {
      title: 'Total Projects',
      value: account.project_count || 0,
      description: `${account.active_projects || 0} active, ${(account.project_count || 0) - (account.active_projects || 0)} archived`,
      icon: FolderOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Users',
      value: account.user_count || 0,
      description: 'Account members',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Total Pages',
      value: stats?.total_pages || 0,
      description: 'Across all projects',
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      title: 'Storage Used',
      value: '0 MB', // TODO: Calculate actual storage
      description: 'Files and assets',
      icon: HardDrive,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Basic details about this account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Account Name</span>
              <span className="text-sm">{account.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Slug</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{account.slug}</code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Plan</span>
              <Badge className={
                account.plan === 'free' ? 'bg-gray-100 text-gray-700' :
                account.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }>
                {account.plan.charAt(0).toUpperCase() + account.plan.slice(1)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Created</span>
              <span className="text-sm">{format(new Date(account.created_at), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last Updated</span>
              <span className="text-sm">{format(new Date(account.updated_at), 'MMM d, yyyy')}</span>
            </div>
            {stats?.last_activity && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Last Activity</span>
                <span className="text-sm">{format(new Date(stats.last_activity), 'MMM d, yyyy HH:mm')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Configuration and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {account.settings && typeof account.settings === 'object' ? (
              Object.entries(account.settings).map(([key, value]) => (
                <div key={key} className="flex justify-between items-start">
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-right max-w-[200px] break-words">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No custom settings configured
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Latest actions performed in this account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            View the Activity tab for detailed audit logs and user actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}