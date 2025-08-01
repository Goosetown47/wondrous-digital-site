'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useUser, useUpdateUserRole, useRemoveUserFromAccount } from '@/hooks/useUsers';
import { useQueryClient } from '@tanstack/react-query';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Activity,
  Settings,
  Save,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { data: user, isLoading } = useUser(userId);
  const updateUserRole = useUpdateUserRole();
  const removeUserFromAccount = useRemoveUserFromAccount();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
        notes: user.user_metadata?.notes || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      console.log('🔍 [UserDetails] Saving profile data:', formData);
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: formData.display_name,
          phone: formData.phone,
          metadata: {
            address: formData.address,
            notes: formData.notes,
          },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [UserDetails] API error:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const result = await response.json();
      console.log('✅ [UserDetails] Profile updated:', result);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('❌ [UserDetails] Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleRoleChange = (accountId: string, newRole: string) => {
    updateUserRole.mutate({
      user_id: userId,
      account_id: accountId,
      role: newRole as 'account_owner' | 'admin' | 'user',
    });
  };

  const handleRemoveFromAccount = (accountId: string, accountName: string) => {
    if (confirm(`Remove user from ${accountName}?`)) {
      removeUserFromAccount.mutate({
        userId: userId,
        accountId,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">User not found</div>
      </div>
    );
  }

  // Determine if user has platform role
  const hasPlatformRole = user.accounts.some(acc => ['admin', 'staff'].includes(acc.role));
  const highestRole = user.accounts.reduce((highest, acc) => {
    const roleHierarchy = { admin: 4, staff: 3, account_owner: 2, user: 1 };
    const currentLevel = roleHierarchy[acc.role as keyof typeof roleHierarchy] || 0;
    const highestLevel = roleHierarchy[highest as keyof typeof roleHierarchy] || 0;
    return currentLevel > highestLevel ? acc.role : highest;
  }, 'user');

  return (
    <PermissionGate permission="users:read">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/tools/users')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {user.display_name || user.email}
              </h2>
              <p className="text-muted-foreground">
                {user.display_name && user.email}
                {user.email_confirmed_at && (
                  <CheckCircle className="inline h-4 w-4 ml-2 text-green-600" />
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={hasPlatformRole ? "default" : "secondary"}>
              {highestRole}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="accounts">
              <Shield className="h-4 w-4 mr-2" />
              Accounts & Roles
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>
                      Manage user information and contact details
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input 
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter display name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input value={user.id} disabled />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Textarea 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter address"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Internal notes about this user"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Created</Label>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Sign In</Label>
                    <div className="text-sm text-muted-foreground">
                      {user.last_sign_in_at 
                        ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy HH:mm')
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>Account Memberships</CardTitle>
                <CardDescription>
                  Manage user access and roles across accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.accounts.map((account) => (
                      <TableRow key={account.account_id}>
                        <TableCell>
                          <Badge variant="outline">{account.account_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={account.role}
                            onValueChange={(role) => handleRoleChange(account.account_id, role)}
                            disabled={updateUserRole.isPending}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="account_owner">Account Owner</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(account.joined_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromAccount(account.account_id, account.account_name)}
                            disabled={removeUserFromAccount.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {user.accounts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No account memberships
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Recent activity and audit trail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  Activity tracking coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>User Settings</CardTitle>
                <CardDescription>
                  Advanced settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  User settings coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  );
}