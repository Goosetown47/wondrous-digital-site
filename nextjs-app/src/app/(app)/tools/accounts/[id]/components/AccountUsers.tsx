'use client';

import { useState } from 'react';
import { useAccountUsers, useUpdateUserRole, useRemoveUser } from '@/hooks/useAccountUsers';
import { 
  useAccountInvitations, 
  useCreateInvitation, 
  useCancelInvitation, 
  useResendInvitation 
} from '@/hooks/useInvitations';
import { useUserProjectCounts, useAccountProjectCount } from '@/hooks/useUserProjectCounts';
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
import { Checkbox } from '@/components/ui/checkbox';
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
  ChevronDown,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AccountUsersProps {
  accountId: string;
}

export function AccountUsers({ accountId }: AccountUsersProps) {
  const { data: users, isLoading: usersLoading } = useAccountUsers(accountId);
  const { data: invitations, isLoading: invitationsLoading } = useAccountInvitations(accountId);
  const { data: userProjectCounts } = useUserProjectCounts(accountId);
  const { data: totalProjects } = useAccountProjectCount(accountId);
  
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
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'role' | 'remove' | null>(null);
  const [bulkNewRole, setBulkNewRole] = useState<'user' | 'account_owner'>('user');

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
    // If changing from account_owner to user, check if it's the last account_owner
    if (newRole === 'user') {
      const accountOwners = users?.filter(u => u.role === 'account_owner') || [];
      if (accountOwners.length <= 1) {
        toast.error('Cannot remove the last account owner');
        return;
      }
    }
    
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

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users?.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users?.map(u => u.user_id) || []));
    }
  };

  const handleBulkRoleChange = async () => {
    if (selectedUsers.size === 0) return;

    // Check if trying to remove all account owners
    if (bulkNewRole === 'user') {
      const selectedAccountOwners = users?.filter(u => 
        selectedUsers.has(u.user_id) && u.role === 'account_owner'
      ) || [];
      const remainingAccountOwners = users?.filter(u => 
        !selectedUsers.has(u.user_id) && u.role === 'account_owner'
      ) || [];
      
      if (selectedAccountOwners.length > 0 && remainingAccountOwners.length === 0) {
        toast.error('Cannot remove all account owners');
        return;
      }
    }

    try {
      const promises = Array.from(selectedUsers).map(userId => 
        updateRole.mutateAsync({
          accountId,
          userId,
          role: bulkNewRole,
        })
      );
      
      await Promise.all(promises);
      toast.success(`Updated ${selectedUsers.size} users successfully`);
      setSelectedUsers(new Set());
      setBulkActionModalOpen(false);
      setBulkAction(null);
    } catch {
      toast.error('Failed to update some users');
    }
  };

  const handleBulkRemove = async () => {
    if (selectedUsers.size === 0) return;

    // Check if trying to remove account owners
    const selectedAccountOwners = users?.filter(u => 
      selectedUsers.has(u.user_id) && u.role === 'account_owner'
    ) || [];
    const remainingAccountOwners = users?.filter(u => 
      !selectedUsers.has(u.user_id) && u.role === 'account_owner'
    ) || [];
    
    if (selectedAccountOwners.length > 0 && remainingAccountOwners.length === 0) {
      toast.error('Cannot remove all account owners');
      return;
    }

    try {
      const promises = Array.from(selectedUsers).map(userId => 
        removeUser.mutateAsync({
          accountId,
          userId,
        })
      );
      
      await Promise.all(promises);
      toast.success(`Removed ${selectedUsers.size} users successfully`);
      setSelectedUsers(new Set());
      setBulkActionModalOpen(false);
      setBulkAction(null);
    } catch {
      toast.error('Failed to remove some users');
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
              {/* Bulk Actions Toolbar */}
              {selectedUsers.size > 0 && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUsers(new Set())}
                    >
                      Clear selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm">
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setBulkNewRole('account_owner');
                            setBulkAction('role');
                            setBulkActionModalOpen(true);
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Make Account Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setBulkNewRole('user');
                            setBulkAction('role');
                            setBulkActionModalOpen(true);
                          }}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Make User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setBulkAction('remove');
                        setBulkActionModalOpen(true);
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}

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
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedUsers.size === users.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Project Access</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((accountUser) => (
                        <TableRow key={accountUser.user_id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.has(accountUser.user_id)}
                              onCheckedChange={() => handleSelectUser(accountUser.user_id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {accountUser.profile?.display_name || accountUser.user?.user_metadata?.full_name || accountUser.user?.email || 'Unknown User'}
                              </p>
                              {accountUser.user?.email && (
                                <p className="text-sm text-muted-foreground">
                                  {accountUser.user.email}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {accountUser.role === 'account_owner' ? (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Account Owner
                                </Badge>
                              ) : accountUser.role === 'admin' ? (
                                <Badge className="bg-red-100 text-red-800">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Admin
                                </Badge>
                              ) : accountUser.role === 'staff' ? (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Staff
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Users className="mr-1 h-3 w-3" />
                                  User
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              {(() => {
                                const userCount = userProjectCounts?.find(c => c.user_id === accountUser.user_id);
                                
                                if (accountUser.role === 'account_owner') {
                                  return (
                                    <Badge className="bg-green-100 text-green-800">
                                      <FolderOpen className="mr-1 h-3 w-3" />
                                      All Projects
                                    </Badge>
                                  );
                                }
                                
                                if (!userCount) {
                                  return (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      Loading...
                                    </Badge>
                                  );
                                }
                                
                                if (userCount.project_count === 0) {
                                  return (
                                    <Badge variant="outline" className="text-orange-600">
                                      <FolderOpen className="mr-1 h-3 w-3" />
                                      No Access
                                    </Badge>
                                  );
                                }
                                
                                return (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="cursor-help">
                                        <FolderOpen className="mr-1 h-3 w-3" />
                                        {userCount.project_count} of {totalProjects || 0} projects
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        <p className="font-medium">Accessible Projects:</p>
                                        {userCount.project_names.map((name, idx) => (
                                          <p key={idx} className="text-sm">• {name}</p>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })()}
                            </TooltipProvider>
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
                                  onClick={() => 
                                    handleRoleChange(accountUser.user_id, 
                                      accountUser.role === 'user' ? 'account_owner' : 'user')
                                  }
                                  disabled={updateRole.isPending}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  {accountUser.role === 'user' ? 'Make Account Owner' : 'Make User'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
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

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={bulkActionModalOpen} onOpenChange={setBulkActionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'role' ? 'Change roles for selected users?' : 'Remove selected users?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'role' ? (
                <>
                  You are about to change the role of <strong>{selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''}</strong> to{' '}
                  <strong>{bulkNewRole === 'account_owner' ? 'Account Owner' : 'User'}</strong>.
                  {bulkNewRole === 'account_owner' && ' Account owners have full control over the account and all projects.'}
                </>
              ) : (
                <>
                  Are you sure you want to remove <strong>{selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''}</strong> from this account?
                  They will lose access to all projects and resources.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={bulkAction === 'role' ? handleBulkRoleChange : handleBulkRemove}
              className={bulkAction === 'remove' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {bulkAction === 'role' ? 'Change Roles' : 'Remove Users'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}