'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  useUsers, 
  // useBulkUserOperations,
  useUpdateUserRole,
  useRemoveUserFromAccount,
} from '@/hooks/useUsers';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { EnhancedTable } from '@/components/ui/enhanced-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { UserAccountsDialog } from '@/components/tools/user-accounts-dialog';
import { 
  Plus, 
  Eye, 
  UserCog,
  UserMinus,
  Mail,
  Shield,
  CheckCircle,
  Users,
} from 'lucide-react';
import type { UserWithAccounts } from '@/lib/services/users';

export default function UsersPage() {
  const router = useRouter();
  const { data: users, isLoading } = useUsers();
  // const { 
  //   updateUserRoles, 
  //   removeUsersFromAccount, 
  //   isLoading: bulkLoading 
  // } = useBulkUserOperations();
  
  const updateUserRole = useUpdateUserRole();
  const removeUserFromAccount = useRemoveUserFromAccount();

  const [removeDialog, setRemoveDialog] = useState<{ 
    open: boolean; 
    user?: UserWithAccounts;
    accountId?: string;
    bulk?: boolean;
    selectedUsers?: UserWithAccounts[];
  }>({ open: false });
  
  const [accountsDialog, setAccountsDialog] = useState<{
    open: boolean;
    user: UserWithAccounts | null;
  }>({ open: false, user: null });

  // Table columns configuration
  const columns = [
    {
      key: 'email',
      title: 'User',
      render: (user: UserWithAccounts) => (
        <div className="flex items-center space-x-3">
          <div>
            <Link 
              href={`/tools/users/${user.id}`}
              className="font-medium hover:underline flex items-center gap-2"
            >
              {user.display_name || user.email}
              {user.email_confirmed_at && (
                <CheckCircle className="h-3 w-3 text-green-600" />
              )}
            </Link>
            <div className="text-sm text-muted-foreground">
              {user.display_name && user.email}
              {user.display_name && <br />}
              ID: {user.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      ),
      searchable: true,
    },
    {
      key: 'role',
      title: 'Role',
      render: (user: UserWithAccounts) => {
        const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
        
        // Check if user has platform role (admin/staff)
        const platformRole = user.accounts.find(acc => 
          acc.account_id === PLATFORM_ACCOUNT_ID && ['admin', 'staff'].includes(acc.role)
        );
        
        if (platformRole) {
          return (
            <Badge variant={platformRole.role === 'admin' ? 'destructive' : 'default'}>
              {platformRole.role === 'admin' ? (
                <>
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </>
              ) : (
                'Staff'
              )}
            </Badge>
          );
        }
        
        // For account-level users, show their highest role (excluding platform account)
        const regularAccounts = user.accounts.filter(acc => acc.account_id !== PLATFORM_ACCOUNT_ID);
        const highestRole = regularAccounts.reduce((highest, acc) => {
          const roleHierarchy = { account_owner: 2, user: 1 };
          const currentLevel = roleHierarchy[acc.role as keyof typeof roleHierarchy] || 0;
          const highestLevel = roleHierarchy[highest as keyof typeof roleHierarchy] || 0;
          return currentLevel > highestLevel ? acc.role : highest;
        }, 'user');
        
        return (
          <Badge variant="secondary">
            {highestRole === 'account_owner' ? 'Account Owner' : 'User'}
          </Badge>
        );
      },
    },
    {
      key: 'accounts',
      title: 'Account Access',
      render: (user: UserWithAccounts) => {
        const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
        const platformRole = user.accounts.find(acc => 
          acc.account_id === PLATFORM_ACCOUNT_ID && ['admin', 'staff'].includes(acc.role)
        );
        
        // Admins have universal access
        if (platformRole?.role === 'admin') {
          return <span className="text-sm text-muted-foreground">Universal Access</span>;
        }
        
        // Staff - show assigned accounts or "Manage" button
        if (platformRole?.role === 'staff') {
          // TODO: Show specific accounts staff is assigned to
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAccountsDialog({ open: true, user })}
            >
              Manage Assignments
            </Button>
          );
        }
        
        // Account Owners/Users - show accounts with inline management
        if (user.accounts.length === 0) {
          return <span className="text-muted-foreground">No accounts</span>;
        }
        
        if (user.accounts.length === 1) {
          const account = user.accounts[0];
          return (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{account.account_name}</Badge>
              <RoleSelector 
                user={user} 
                accountId={account.account_id} 
                currentRole={account.role} 
              />
            </div>
          );
        }
        
        // Multiple accounts
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {user.accounts.length} accounts
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAccountsDialog({ open: true, user })}
            >
              Manage
            </Button>
          </div>
        );
      },
    },
    {
      key: 'last_sign_in',
      title: 'Last Sign In',
      render: (user: UserWithAccounts) => (
        <div className="text-sm">
          {user.last_sign_in_at ? (
            format(new Date(user.last_sign_in_at), 'MMM d, yyyy HH:mm')
          ) : (
            <span className="text-muted-foreground">Never</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (user: UserWithAccounts) => (
        <div className="text-sm">
          {format(new Date(user.created_at), 'MMM d, yyyy')}
        </div>
      ),
    },
  ];

  // Table actions configuration
  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (user: UserWithAccounts) => router.push(`/tools/users/${user.id}`),
      variant: 'ghost' as const,
    },
    {
      label: 'Manage Roles',
      icon: UserCog,
      onClick: (user: UserWithAccounts) => router.push(`/tools/users/${user.id}?tab=roles`),
      variant: 'ghost' as const,
    },
    {
      label: 'Send Invitation',
      icon: Mail,
      onClick: (user: UserWithAccounts) => {
        // TODO: Implement invitation dialog
        console.log('Send invitation to', user.email);
      },
      variant: 'ghost' as const,
    },
    {
      label: 'Remove from Account',
      icon: UserMinus,
      onClick: (user: UserWithAccounts) => {
        if (user.primary_account) {
          setRemoveDialog({ 
            open: true, 
            user, 
            accountId: user.primary_account.account_id 
          });
        }
      },
      variant: 'ghost' as const,
      className: 'text-red-600 hover:text-red-700',
      show: (user: UserWithAccounts) => user.accounts.length > 0,
    },
  ];

  // Bulk actions configuration
  const bulkActions = [
    {
      label: 'Change Role',
      icon: Shield,
      onClick: (selectedUsers: UserWithAccounts[]) => {
        // TODO: Implement bulk role change dialog
        console.log('Change role for', selectedUsers.length, 'users');
      },
      variant: 'secondary' as const,
    },
    {
      label: 'Remove from Account',
      icon: UserMinus,
      onClick: (selectedUsers: UserWithAccounts[]) => {
        setRemoveDialog({ 
          open: true, 
          bulk: true, 
          selectedUsers 
        });
      },
      variant: 'destructive' as const,
    },
  ];

  // Get unique accounts for filtering
  const uniqueAccounts = Array.from(
    new Set(users?.flatMap(u => u.accounts.map(a => JSON.stringify({ 
      id: a.account_id, 
      name: a.account_name 
    }))) || [])
  ).map(str => JSON.parse(str));

  // Filter options
  const filters = [
    {
      key: 'primary_account',
      label: 'Account',
      options: uniqueAccounts.map(acc => ({
        label: acc.name,
        value: acc.id,
        count: users?.filter(u => u.accounts.some(a => a.account_id === acc.id)).length,
      })),
    },
    {
      key: 'role',
      label: 'Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
        { label: 'Account Owner', value: 'account_owner' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { 
          label: 'Confirmed', 
          value: 'confirmed',
          count: users?.filter(u => u.email_confirmed_at).length,
        },
        { 
          label: 'Unconfirmed', 
          value: 'unconfirmed',
          count: users?.filter(u => !u.email_confirmed_at).length,
        },
      ],
    },
  ];

  const handleRemoveConfirm = () => {
    if (removeDialog.bulk && removeDialog.selectedUsers) {
      // TODO: Implement bulk removal with account selection
      console.log('Bulk remove users');
    } else if (removeDialog.user && removeDialog.accountId) {
      removeUserFromAccount.mutate({
        userId: removeDialog.user.id,
        accountId: removeDialog.accountId,
      });
    }
    setRemoveDialog({ open: false });
  };

  // Helper function for role badge colors
  // function getRoleBadgeColor(role: string) {
  //   switch (role) {
  //     case 'admin':
  //       return 'bg-red-100 text-red-700';
  //     case 'staff':
  //       return 'bg-orange-100 text-orange-700';
  //     case 'account_owner':
  //       return 'bg-blue-100 text-blue-700';
  //     default:
  //       return 'bg-gray-100 text-gray-700';
  //   }
  // }

  // Role selector component for inline editing
  const RoleSelector = ({ user, accountId, currentRole }: { 
    user: UserWithAccounts; 
    accountId: string; 
    currentRole: string;
  }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    
    return (
      <Select
        value={currentRole}
        disabled={isUpdating || updateUserRole.isPending}
        onValueChange={(newRole) => {
          setIsUpdating(true);
          updateUserRole.mutate(
            {
              user_id: user.id,
              account_id: accountId,
              role: newRole as 'admin' | 'staff' | 'account_owner' | 'user',
            },
            {
              onSettled: () => setIsUpdating(false),
            }
          );
        }}
      >
        <SelectTrigger className="w-36 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="account_owner">Account Owner</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  return (
    <PermissionGate permission="users:read">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">
              Manage users across all accounts
            </p>
          </div>
          <Button onClick={() => router.push('/tools/users/invite')}>
            <Plus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        <EnhancedTable
          data={users || []}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          filters={filters}
          searchPlaceholder="Search users by email..."
          loading={isLoading}
          emptyMessage="No users found"
          getItemId={(user) => user.id}
        />

        {/* Remove Confirmation Dialog */}
        <AlertDialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove User{removeDialog.bulk ? 's' : ''} from Account</AlertDialogTitle>
              <AlertDialogDescription>
                {removeDialog.bulk ? (
                  <>
                    Are you sure you want to remove {removeDialog.selectedUsers?.length} user{removeDialog.selectedUsers?.length === 1 ? '' : 's'} from their accounts?
                  </>
                ) : (
                  <>
                    Are you sure you want to remove "{removeDialog.user?.email}" from {removeDialog.user?.primary_account?.account_name}?
                  </>
                )}
                <br /><br />
                This will revoke their access to all projects and resources in the account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRemoveConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove {removeDialog.bulk ? 'Users' : 'User'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* User Accounts Management Dialog */}
        <UserAccountsDialog
          user={accountsDialog.user}
          open={accountsDialog.open}
          onOpenChange={(open) => setAccountsDialog({ open, user: open ? accountsDialog.user : null })}
        />
      </div>
    </PermissionGate>
  );
}