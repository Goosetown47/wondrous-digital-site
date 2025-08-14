'use client';

import { useState } from 'react';
import { useAccountUsers, useUpdateUserRole, useRemoveUser } from '@/hooks/useAccountUsers';
import { 
  useAccountInvitations, 
  useCreateInvitation, 
  useCancelInvitation, 
  useResendInvitation 
} from '@/hooks/useInvitations';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Users, 
  Mail, 
  MoreHorizontal, 
  RefreshCw, 
  X, 
  Shield,
  UserPlus,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface AccountUsersProps {
  accountId: string;
}

export function AccountUsers({ accountId }: AccountUsersProps) {
  const { data: users, isLoading: usersLoading } = useAccountUsers(accountId);
  const { data: invitations, isLoading: invitationsLoading } = useAccountInvitations(accountId);
  
  const updateRole = useUpdateUserRole();
  const removeUser = useRemoveUser();
  const createInvitation = useCreateInvitation();
  const cancelInvitation = useCancelInvitation();
  const resendInvitation = useResendInvitation();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'account_owner'>('user');
  const [inviteError, setInviteError] = useState<string>('');
  const [removeUserDialog, setRemoveUserDialog] = useState<{ open: boolean; userId?: string; userEmail?: string }>({ open: false });

  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    
    // Clear any previous errors
    setInviteError('');

    try {
      await createInvitation.mutateAsync({
        accountId,
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('user');
      setInviteError('');
      toast.success('Invitation sent successfully');
    } catch (error) {
      // Display error in the form instead of throwing
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      setInviteError(errorMessage);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'account_owner' | 'user') => {
    try {
      await updateRole.mutateAsync({
        accountId,
        userId,
        role: newRole,
      });
      toast.success('Role updated successfully');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveUser = async () => {
    if (!removeUserDialog.userId) return;

    try {
      await removeUser.mutateAsync({
        accountId,
        userId: removeUserDialog.userId,
      });
      toast.success('User removed successfully');
      setRemoveUserDialog({ open: false });
    } catch {
      toast.error('Failed to remove user');
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitation.mutateAsync({
        invitationId,
        accountId,
      });
      toast.success('Invitation resent successfully');
    } catch {
      toast.error('Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation.mutateAsync({
        invitationId,
        accountId,
      });
      toast.success('Invitation cancelled');
    } catch {
      toast.error('Failed to cancel invitation');
    }
  };

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
            <Dialog open={inviteModalOpen} onOpenChange={(open) => {
              setInviteModalOpen(open);
              if (!open) {
                // Reset form when modal closes
                setInviteEmail('');
                setInviteRole('user');
                setInviteError('');
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Invite a team member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to add a new member to this account.
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
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setInviteError(''); // Clear error when user types
                      }}
                      className={inviteError ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                    {inviteError && (
                      <p className="text-sm text-red-500 mt-1">{inviteError}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: 'user' | 'account_owner') => setInviteRole(value)}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="account_owner">Account Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Account owners can manage users, billing, and account settings.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setInviteModalOpen(false);
                    setInviteEmail('');
                    setInviteRole('user');
                    setInviteError('');
                  }}>
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
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Members
                {users && <Badge variant="secondary" className="ml-1">{users.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="invitations" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Invitations
                {invitations && invitations.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{invitations.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
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
                        <TableHead>Status</TableHead>
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
                                {accountUser.user?.user_metadata?.full_name || accountUser.user?.email || 'Unknown User'}
                              </p>
                              {accountUser.user?.email && (
                                <p className="text-sm text-muted-foreground">
                                  {accountUser.user.email}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={accountUser.role}
                              onValueChange={(value: 'account_owner' | 'user') => 
                                handleRoleChange(accountUser.user_id, value)
                              }
                              disabled={updateRole.isPending}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="account_owner">
                                  <span className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    Account Owner
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {accountUser.user?.email_confirmed_at ? (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600">
                                <Clock className="mr-1 h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDistanceToNow(new Date(accountUser.joined_at), { addSuffix: true })}
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No users yet. Invite someone to get started!
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4">
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
                        <TableHead>Status</TableHead>
                        <TableHead>Invited</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => {
                        const isExpired = new Date(invitation.expires_at) < new Date();
                        return (
                          <TableRow key={invitation.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{invitation.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={invitation.role === 'account_owner' ? 'default' : 'secondary'}>
                                {invitation.role === 'account_owner' ? 'Account Owner' : 'User'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {isExpired ? (
                                <Badge variant="outline" className="text-red-600">
                                  Expired
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-yellow-600">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(invitation.invited_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!isExpired && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleResendInvitation(invitation.id)}
                                        disabled={resendInvitation.isPending}
                                      >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Resend invitation
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleCancelInvitation(invitation.id)}
                                    disabled={cancelInvitation.isPending}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel invitation
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No pending invitations.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
  );
}