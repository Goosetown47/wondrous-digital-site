'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useUsers, useUpdateUserRole } from '@/hooks/useUsers';
import { useIsAdmin } from '@/hooks/useRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Shield, UserX, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useUsers();
  const { data: isCurrentUserAdmin } = useIsAdmin();
  const updateUserRole = useUpdateUserRole();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId?: string;
    userEmail?: string;
    action?: 'promote' | 'demote';
  }>({ open: false });

  const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

  // Filter to show only platform admins
  const adminUsers = users?.filter(user => 
    user.accounts.some(acc => 
      acc.account_id === PLATFORM_ACCOUNT_ID && acc.role === 'admin'
    )
  ) || [];

  // Filter platform staff members who could be promoted
  const staffUsers = users?.filter(user => 
    user.accounts.some(acc => 
      acc.account_id === PLATFORM_ACCOUNT_ID && acc.role === 'staff'
    )
  ) || [];

  const handlePromoteToAdmin = (userId: string, userEmail: string) => {
    setConfirmDialog({
      open: true,
      userId,
      userEmail,
      action: 'promote',
    });
  };

  const handleDemoteFromAdmin = (userId: string, userEmail: string) => {
    setConfirmDialog({
      open: true,
      userId,
      userEmail,
      action: 'demote',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.userId || !confirmDialog.action) return;

    try {
      if (confirmDialog.action === 'promote') {
        // Use platform API to promote to admin
        const response = await fetch('/api/platform/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: confirmDialog.userId }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to promote admin');
        }
        
        toast.success('User promoted to admin successfully');
        // Invalidate users query to refresh the list
        await queryClient.invalidateQueries({ queryKey: ['users'] });
        router.refresh();
      } else {
        // Use platform API to demote from admin
        const response = await fetch(`/api/platform/admins?user_id=${confirmDialog.userId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('Demote admin error:', error);
          throw new Error(error.error || 'Failed to demote admin');
        }
        
        toast.success('Admin demoted to staff successfully');
        // Invalidate users query to refresh the list
        await queryClient.invalidateQueries({ queryKey: ['users'] });
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update admin status');
    }

    setConfirmDialog({ open: false });
  };

  // Security check - only admins can view this page
  if (!isCurrentUserAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Only administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
          <p className="text-muted-foreground">
            Manage platform administrators with extreme caution
          </p>
        </div>
      </div>

      {/* Warning Card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-900">Security Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800">
            Administrators have full access to the entire platform, including all accounts, 
            projects, and user data. Only grant admin access to trusted team members. 
            Changes to admin roles are logged for security purposes.
          </p>
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Current Administrators ({adminUsers.length})</CardTitle>
          <CardDescription>
            Users with full platform access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Admin Since</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((user) => {
                const adminAccount = user.accounts.find(acc => acc.role === 'admin');
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {user.display_name || user.email.split('@')[0]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.email}
                        {user.email_confirmed_at && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {adminAccount?.joined_at 
                        ? format(new Date(adminAccount.joined_at), 'MMM d, yyyy')
                        : 'Unknown'
                      }
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.last_sign_in_at 
                        ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy')
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDemoteFromAdmin(user.id, user.email)}
                        disabled={adminUsers.length === 1}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Demote
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Potential Admins (Staff) */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            Staff members who can be promoted to administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staffUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff members available for promotion
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Staff Since</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffUsers.map((user) => {
                  const staffAccount = user.accounts.find(acc => acc.role === 'staff');
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <span className="font-medium">
                          {user.display_name || user.email.split('@')[0]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.email}
                          {user.email_confirmed_at && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {staffAccount?.joined_at 
                          ? format(new Date(staffAccount.joined_at), 'MMM d, yyyy')
                          : 'Unknown'
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePromoteToAdmin(user.id, user.email)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Promote to Admin
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'promote' ? 'Promote to Administrator' : 'Remove Administrator'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'promote' ? (
                <>
                  Are you sure you want to promote <strong>{confirmDialog.userEmail}</strong> to administrator?
                  <br /><br />
                  This will grant them full access to all platform features, accounts, and user data.
                </>
              ) : (
                <>
                  Are you sure you want to remove <strong>{confirmDialog.userEmail}</strong> as an administrator?
                  <br /><br />
                  They will be demoted to staff level and lose access to admin-only features.
                  {adminUsers.length === 1 && (
                    <>
                      <br /><br />
                      <strong className="text-red-600">
                        Warning: This is the last administrator. You cannot remove the last admin.
                      </strong>
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={confirmDialog.action === 'demote' ? 'bg-red-600 hover:bg-red-700' : ''}
              disabled={confirmDialog.action === 'demote' && adminUsers.length === 1}
            >
              {confirmDialog.action === 'promote' ? 'Promote' : 'Remove Admin'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}