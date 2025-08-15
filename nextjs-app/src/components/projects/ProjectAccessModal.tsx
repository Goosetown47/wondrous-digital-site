'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAccountUsers } from '@/hooks/useAccountUsers';
import { useProjectAccess, useGrantProjectAccess, useRevokeProjectAccess, useUpdateProjectAccess } from '@/hooks/useProjectAccess';
import { Users, Plus, X, UserPlus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ProjectAccessModalProps {
  projectId: string;
  projectName: string;
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectAccessModal({ 
  projectId, 
  projectName,
  accountId,
  open, 
  onOpenChange 
}: ProjectAccessModalProps) {
  const { data: accountUsers, isLoading: usersLoading } = useAccountUsers(accountId);
  const { data: projectAccess, isLoading: accessLoading } = useProjectAccess(projectId);
  const grantAccess = useGrantProjectAccess();
  const revokeAccess = useRevokeProjectAccess();
  const updateAccess = useUpdateProjectAccess();
  
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkAccessLevel, setBulkAccessLevel] = useState<'viewer' | 'editor' | 'admin'>('viewer');

  // Get users who don't have access yet
  const usersWithoutAccess = accountUsers?.filter(au => 
    au.role === 'user' && // Only show regular users, not account owners
    !projectAccess?.some(pa => pa.user_id === au.user_id)
  ) || [];

  const handleGrantAccess = async (userId: string, accessLevel: 'viewer' | 'editor' | 'admin' = 'viewer') => {
    try {
      await grantAccess.mutateAsync({
        projectId,
        userId,
        accountId,
        accessLevel,
      });
      toast.success('Access granted successfully');
    } catch {
      toast.error('Failed to grant access');
    }
  };

  const handleBulkGrantAccess = async () => {
    if (selectedUsers.size === 0) return;
    
    try {
      const promises = Array.from(selectedUsers).map(userId =>
        grantAccess.mutateAsync({
          projectId,
          userId,
          accountId,
          accessLevel: bulkAccessLevel,
        })
      );
      
      await Promise.all(promises);
      toast.success(`Granted access to ${selectedUsers.size} users`);
      setSelectedUsers(new Set());
    } catch {
      toast.error('Failed to grant access to some users');
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    try {
      await revokeAccess.mutateAsync({
        projectId,
        userId,
        accountId,
      });
      toast.success('Access revoked successfully');
    } catch {
      toast.error('Failed to revoke access');
    }
  };

  const handleUpdateAccess = async (userId: string, accessLevel: 'viewer' | 'editor' | 'admin') => {
    try {
      await updateAccess.mutateAsync({
        projectId,
        userId,
        accessLevel,
      });
      toast.success('Access level updated');
    } catch {
      toast.error('Failed to update access level');
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
    if (selectedUsers.size === usersWithoutAccess.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(usersWithoutAccess.map(u => u.user_id)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Project Access</DialogTitle>
          <DialogDescription>
            Control who can access <strong>{projectName}</strong>. Account owners always have full access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Access List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current Access</h3>
            {accessLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : projectAccess && projectAccess.length > 0 ? (
              <ScrollArea className="h-[250px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Granted</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectAccess.map((access) => (
                      <TableRow key={access.user_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{access.user_display_name || 'Unknown User'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={access.access_level}
                            onValueChange={(value: 'viewer' | 'editor' | 'admin') => 
                              handleUpdateAccess(access.user_id, value)
                            }
                            disabled={updateAccess.isPending}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">
                                <span className="flex items-center gap-1">
                                  Viewer
                                </span>
                              </SelectItem>
                              <SelectItem value="editor">
                                <span className="flex items-center gap-1">
                                  Editor
                                </span>
                              </SelectItem>
                              <SelectItem value="admin">
                                <span className="flex items-center gap-1">
                                  Admin
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(access.granted_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeAccess(access.user_id)}
                            disabled={revokeAccess.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-6 border rounded-lg">
                <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No users have been granted specific access to this project yet.
                </p>
              </div>
            )}
          </div>

          {/* Grant Access Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Grant Access to Users</h3>
            {usersLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : usersWithoutAccess.length > 0 ? (
              <div className="space-y-3">
                {/* Bulk Action Bar */}
                {selectedUsers.size > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">
                      {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={bulkAccessLevel}
                        onValueChange={(value: 'viewer' | 'editor' | 'admin') => 
                          setBulkAccessLevel(value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleBulkGrantAccess}
                        disabled={grantAccess.isPending}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Grant Access
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* User List */}
                <ScrollArea className="h-[200px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedUsers.size === usersWithoutAccess.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="w-[150px]">Quick Grant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersWithoutAccess.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.has(user.user_id)}
                              onCheckedChange={() => handleSelectUser(user.user_id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {user.profile?.display_name || user.user?.user_metadata?.full_name || user.user?.email}
                              </p>
                              {user.user?.email && (
                                <p className="text-sm text-muted-foreground">
                                  {user.user.email}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGrantAccess(user.user_id, 'viewer')}
                              disabled={grantAccess.isPending}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Grant
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-6 border rounded-lg">
                <UserCheck className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  All team members already have access or are account owners.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}