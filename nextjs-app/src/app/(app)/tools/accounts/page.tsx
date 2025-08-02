'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  useAccounts, 
  useBulkAccountOperations,
  useSuspendAccount,
  useActivateAccount,
  useDeleteAccount,
  getAccountStatus,
} from '@/hooks/useAccounts';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { EnhancedTable } from '@/components/ui/enhanced-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Plus, 
  Edit, 
  Eye, 
  Ban, 
  CheckCircle, 
  Trash2,
  Users,
  FolderOpen,
} from 'lucide-react';
import type { AccountWithStats } from '@/lib/services/accounts';

export default function AccountsPage() {
  const router = useRouter();
  const { data: accounts, isLoading } = useAccounts(true);
  const { 
    suspendAccounts, 
    activateAccounts, 
    deleteAccounts
  } = useBulkAccountOperations();
  
  const suspendAccount = useSuspendAccount();
  const activateAccount = useActivateAccount();
  const deleteAccount = useDeleteAccount();

  const [deleteDialog, setDeleteDialog] = useState<{ 
    open: boolean; 
    account?: AccountWithStats;
    bulk?: boolean;
    selectedIds?: string[];
  }>({ open: false });

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      title: 'Account Name',
      render: (account: AccountWithStats) => (
        <div className="flex items-center space-x-3">
          <div>
            <Link 
              href={`/tools/accounts/${account.id}`}
              className="font-medium hover:underline"
            >
              {account.name}
            </Link>
            <div className="text-sm text-muted-foreground">
              {account.slug}
            </div>
          </div>
        </div>
      ),
      searchable: true,
    },
    {
      key: 'plan',
      title: 'Plan',
      render: (account: AccountWithStats) => {
        const planColors = {
          free: 'bg-gray-100 text-gray-700',
          pro: 'bg-blue-100 text-blue-700',
          enterprise: 'bg-purple-100 text-purple-700',
        };
        return (
          <Badge className={planColors[account.plan] || planColors.free}>
            {account.plan.charAt(0).toUpperCase() + account.plan.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'project_count',
      title: 'Projects',
      render: (account: AccountWithStats) => (
        <div className="flex items-center space-x-1">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span>{account.project_count || 0}</span>
          <span className="text-xs text-muted-foreground">
            ({account.active_projects || 0} active)
          </span>
        </div>
      ),
    },
    {
      key: 'user_count',
      title: 'Users',
      render: (account: AccountWithStats) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{account.user_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (account: AccountWithStats) => {
        // Get the account status
        const status = getAccountStatus(account);
        if (status?.isSuspended) {
          return <Badge variant="destructive">Suspended</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
      },
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (account: AccountWithStats) => (
        <div className="text-sm">
          {format(new Date(account.created_at), 'MMM d, yyyy')}
        </div>
      ),
    },
  ];

  // Table actions configuration
  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (account: AccountWithStats) => router.push(`/tools/accounts/${account.id}`),
      variant: 'ghost' as const,
    },
    {
      label: 'Edit Account',
      icon: Edit,
      onClick: (account: AccountWithStats) => router.push(`/tools/accounts/${account.id}?tab=settings`),
      variant: 'ghost' as const,
    },
    {
      label: 'Suspend Account',
      icon: Ban,
      onClick: (account: AccountWithStats) => suspendAccount.mutate(account.id),
      variant: 'ghost' as const,
      className: 'text-orange-600 hover:text-orange-700',
      show: (account: AccountWithStats) => !getAccountStatus(account)?.isSuspended,
    },
    {
      label: 'Activate Account',
      icon: CheckCircle,
      onClick: (account: AccountWithStats) => activateAccount.mutate(account.id),
      variant: 'ghost' as const,
      className: 'text-green-600 hover:text-green-700',
      show: (account: AccountWithStats) => !!getAccountStatus(account)?.isSuspended,
    },
    {
      label: 'Delete Account',
      icon: Trash2,
      onClick: (account: AccountWithStats) => setDeleteDialog({ open: true, account }),
      variant: 'ghost' as const,
      className: 'text-red-600 hover:text-red-700',
    },
  ];

  // Bulk actions configuration
  const bulkActions = [
    {
      label: 'Suspend Selected',
      icon: Ban,
      onClick: (selectedAccounts: AccountWithStats[]) => {
        const activeAccountIds = selectedAccounts
          .filter(account => !getAccountStatus(account)?.isSuspended)
          .map(account => account.id);
        if (activeAccountIds.length > 0) {
          suspendAccounts(activeAccountIds);
        }
      },
      variant: 'secondary' as const,
    },
    {
      label: 'Activate Selected',
      icon: CheckCircle,
      onClick: (selectedAccounts: AccountWithStats[]) => {
        const suspendedAccountIds = selectedAccounts
          .filter(account => getAccountStatus(account)?.isSuspended)
          .map(account => account.id);
        if (suspendedAccountIds.length > 0) {
          activateAccounts(suspendedAccountIds);
        }
      },
      variant: 'secondary' as const,
    },
    {
      label: 'Delete Selected',
      icon: Trash2,
      onClick: (selectedAccounts: AccountWithStats[]) => {
        setDeleteDialog({ 
          open: true, 
          bulk: true, 
          selectedIds: selectedAccounts.map(a => a.id)
        });
      },
      variant: 'destructive' as const,
    },
  ];

  // Filter options
  const filters = [
    {
      key: 'plan',
      label: 'Plan',
      options: [
        { label: 'Free', value: 'free', count: accounts?.filter(a => a.plan === 'free').length },
        { label: 'Pro', value: 'pro', count: accounts?.filter(a => a.plan === 'pro').length },
        { label: 'Enterprise', value: 'enterprise', count: accounts?.filter(a => a.plan === 'enterprise').length },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { 
          label: 'Active', 
          value: 'active', 
          count: accounts?.filter(a => !getAccountStatus(a)?.isSuspended).length 
        },
        { 
          label: 'Suspended', 
          value: 'suspended', 
          count: accounts?.filter(a => getAccountStatus(a)?.isSuspended).length 
        },
      ],
    },
  ];

  const handleDeleteConfirm = () => {
    if (deleteDialog.bulk && deleteDialog.selectedIds) {
      deleteAccounts(deleteDialog.selectedIds);
    } else if (deleteDialog.account) {
      deleteAccount.mutate(deleteDialog.account.id);
    }
    setDeleteDialog({ open: false });
  };

  return (
    <PermissionGate permission="account:read">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
            <p className="text-muted-foreground">
              Manage customer accounts and their settings
            </p>
          </div>
          <Button onClick={() => router.push('/tools/accounts/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </div>

        <EnhancedTable
          data={accounts || []}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          filters={filters}
          searchPlaceholder="Search accounts..."
          loading={isLoading}
          emptyMessage="No accounts found"
          getItemId={(account) => account.id}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account{deleteDialog.bulk ? 's' : ''}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDialog.bulk ? (
                  <>
                    Are you sure you want to permanently delete {deleteDialog.selectedIds?.length} account{deleteDialog.selectedIds?.length === 1 ? '' : 's'}?
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete "{deleteDialog.account?.name}"?
                  </>
                )}
              </AlertDialogDescription>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>This action cannot be undone</strong> and will remove all account data, including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>All projects and pages</li>
                  <li>User memberships</li>
                  <li>Billing history</li>
                  <li>Activity logs</li>
                </ul>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
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