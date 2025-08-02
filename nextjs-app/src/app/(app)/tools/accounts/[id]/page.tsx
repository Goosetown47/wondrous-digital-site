'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { 
  useAccount, 
  // useUpdateAccount,
  useSuspendAccount,
  useActivateAccount,
  useDeleteAccount,
  getAccountStatus,
} from '@/hooks/useAccounts';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Edit, 
  Ban, 
  CheckCircle, 
  Trash2,
  Users,
  Calendar,
  Activity,
  Settings,
  CreditCard,
  // FolderOpen,
  // Shield,
} from 'lucide-react';
import Link from 'next/link';

// Import sub-components (we'll create these)
import { AccountOverview } from './components/AccountOverview';
import { AccountSettings } from './components/AccountSettings';
import { AccountUsers } from './components/AccountUsers';
import { AccountActivity } from './components/AccountActivity';

function AccountDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountId = params.id as string;
  const activeTab = searchParams.get('tab') || 'overview';

  const { data: account, isLoading } = useAccount(accountId);
  const accountStatus = getAccountStatus(account);
  
  // const updateAccount = useUpdateAccount(); // May be needed for editing
  const suspendAccount = useSuspendAccount();
  const activateAccount = useActivateAccount();
  const deleteAccount = useDeleteAccount();

  const [deleteDialog, setDeleteDialog] = useState({ open: false });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Account Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The account you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/tools/accounts" className="mt-4 inline-block">
            <Button>Back to Accounts</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSuspend = () => {
    suspendAccount.mutate(accountId);
  };

  const handleActivate = () => {
    activateAccount.mutate(accountId);
  };

  const handleDelete = () => {
    deleteAccount.mutate(accountId, {
      onSuccess: () => {
        router.push('/tools/accounts');
      },
    });
    setDeleteDialog({ open: false });
  };

  const planColors = {
    free: 'bg-gray-100 text-gray-700',
    pro: 'bg-blue-100 text-blue-700',
    enterprise: 'bg-purple-100 text-purple-700',
  };

  return (
    <PermissionGate permission="account:read">
      <div className="flex-1 space-y-6 p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/tools/accounts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Accounts
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-bold tracking-tight">{account.name}</h2>
                <Badge className={planColors[account.plan] || planColors.free}>
                  {account.plan.charAt(0).toUpperCase() + account.plan.slice(1)}
                </Badge>
                {accountStatus?.isSuspended ? (
                  <Badge variant="destructive">Suspended</Badge>
                ) : (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {account.slug} • Created {format(new Date(account.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            
            {accountStatus?.isSuspended ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleActivate}
                disabled={activateAccount.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSuspend}
                disabled={suspendAccount.isPending}
              >
                <Ban className="mr-2 h-4 w-4" />
                Suspend
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDeleteDialog({ open: true })}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(tab) => {
          const url = new URL(window.location.href);
          url.searchParams.set('tab', tab);
          router.push(url.pathname + url.search);
        }}>
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AccountOverview account={account} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AccountSettings account={account} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AccountUsers accountId={accountId} />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Subscription and billing details for this account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Billing management features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <AccountActivity accountId={accountId} />
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete "{account.name}"?
              </AlertDialogDescription>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>This action cannot be undone</strong> and will remove all account data, including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>All projects and pages ({account.project_count || 0} projects)</li>
                  <li>User memberships ({account.user_count || 0} users)</li>
                  <li>Billing history</li>
                  <li>Activity logs</li>
                </ul>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGate>
  );
}

export default function AccountDetailPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <AccountDetailPageContent />
    </Suspense>
  );
}