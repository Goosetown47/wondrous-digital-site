'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useAccountUsers, useUpdateUserRole, useRemoveUser } from '@/hooks/useAccountUsers';
import { 
  useAccountInvitations, 
  useCreateInvitation, 
  useCancelInvitation, 
  useResendInvitation 
} from '@/hooks/useInvitations';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PERMISSIONS } from '@/lib/permissions/constants';
import { RoleBadge } from '@/components/ui/role-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  UserPlus, 
  Mail, 
  MoreHorizontal, 
  RefreshCw, 
  X, 
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ProjectAccessDropdown } from '@/components/tools/project-access-dropdown';

export default function AccountUsersPage() {
  const { currentAccount, user: currentUser } = useAuth();
  const { data: users, isLoading: usersLoading } = useAccountUsers(currentAccount?.id || null);
  const { data: invitations, isLoading: invitationsLoading } = useAccountInvitations(currentAccount?.id || null);
  
  const updateRole = useUpdateUserRole();
  const removeUser = useRemoveUser();
  const createInvitation = useCreateInvitation();
  const cancelInvitation = useCancelInvitation();
  const resendInvitation = useResendInvitation();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'account_owner'>('user');
  const [removeUserDialog, setRemoveUserDialog] = useState<{ open: boolean; userId?: string; userEmail?: string }>({ open: false });

  const handleInviteUser = async () => {
    if (!currentAccount || !inviteEmail) return;

    try {
      await createInvitation.mutateAsync({
        accountId: currentAccount.id,
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('user');
    } catch {
      // Error is handled by the mutation's onError
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'account_owner' | 'user') => {
    if (!currentAccount) return;

    try {
      await updateRole.mutateAsync({
        accountId: currentAccount.id,
        userId,
        role: newRole,
      });
      // Success toast handled by hook
    } catch {
      // Error toast handled by hook
    }
  };

  const handleRemoveUser = async () => {
    if (!currentAccount || !removeUserDialog.userId) return;

    try {
      await removeUser.mutateAsync({
        accountId: currentAccount.id,
        userId: removeUserDialog.userId,
      });
      setRemoveUserDialog({ open: false });
    } catch {
      // Error toast handled by hook
    }
  };

  return (
    <PermissionGate permission={PERMISSIONS.USERS.READ} fallback={
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to manage users for this account.</p>
      </div>
    }>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Team Members
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your team members and their permissions
            </p>
          </div>
          
          <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite a team member</DialogTitle>
                <DialogDescription>
                  Send an invitation to add a new member to your account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: 'user' | 'account_owner') => setInviteRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue>
                        {inviteRole && <RoleBadge role={inviteRole} size="sm" />}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <RoleBadge role="user" size="sm" />
                        </div>
                      </SelectItem>
                      <SelectItem value="account_owner">
                        <div className="flex items-center gap-2">
                          <RoleBadge role="account_owner" size="sm" />
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Account owners can manage users, billing, and account settings.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteUser} 
                  disabled={!inviteEmail || createInvitation.isPending}
                >
                  {createInvitation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Team Members */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Team Members</h2>
          {usersLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Project Access</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((accountUser) => (
                    <TableRow key={accountUser.user_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {accountUser.user?.email || 'Unknown User'}
                          </p>
                          {accountUser.user?.user_metadata?.full_name && (
                            <p className="text-sm text-muted-foreground">
                              {accountUser.user.user_metadata.full_name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {currentUser?.id === accountUser.user_id ? (
                          <RoleBadge role={accountUser.role} showIcon={accountUser.role === 'account_owner'} />
                        ) : (
                          <Select
                            value={accountUser.role}
                            onValueChange={(value: 'account_owner' | 'user') => 
                              handleRoleChange(accountUser.user_id, value)
                            }
                            disabled={updateRole.isPending}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue>
                                {accountUser.role && <RoleBadge role={accountUser.role} size="sm" />}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center gap-2">
                                  <RoleBadge role="user" size="sm" />
                                </div>
                              </SelectItem>
                              <SelectItem value="account_owner">
                                <div className="flex items-center gap-2">
                                  <RoleBadge role="account_owner" size="sm" />
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {currentAccount && (
                          <ProjectAccessDropdown 
                            userId={accountUser.user_id}
                            accountId={currentAccount.id}
                            userRole={accountUser.role}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(accountUser.joined_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {currentUser?.id !== accountUser.user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setRemoveUserDialog({ 
                                  open: true, 
                                  userId: accountUser.user_id,
                                  userEmail: accountUser.user?.email 
                                })}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Remove from account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No team members yet. Invite someone to get started!</p>
          )}
        </div>

        {/* Pending Invitations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Invitations</h2>
          {invitationsLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : invitations && invitations.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{invitation.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={invitation.role} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(invitation.invited_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => resendInvitation.mutate({ 
                                invitationId: invitation.id,
                                accountId: currentAccount!.id 
                              })}
                              disabled={resendInvitation.isPending}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Resend invitation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => cancelInvitation.mutate({ 
                                invitationId: invitation.id,
                                accountId: currentAccount!.id 
                              })}
                              disabled={cancelInvitation.isPending}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No pending invitations.</p>
          )}
        </div>

        {/* Remove User Confirmation Dialog */}
        <AlertDialog open={removeUserDialog.open} onOpenChange={(open) => setRemoveUserDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove team member?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove <strong>{removeUserDialog.userEmail}</strong> from this account? 
                They will lose access to all projects and resources.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGate>
  );
}