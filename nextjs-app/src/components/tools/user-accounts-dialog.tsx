'use client';

import { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useUpdateUserRole, useRemoveUserFromAccount } from '@/hooks/useUsers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import type { UserWithAccounts } from '@/lib/services/users';

interface UserAccountsDialogProps {
  user: UserWithAccounts | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserAccountsDialog({ user, open, onOpenChange }: UserAccountsDialogProps) {
  const { data: allAccounts } = useAccounts();
  const updateUserRole = useUpdateUserRole();
  const removeUserFromAccount = useRemoveUserFromAccount();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [addingAccounts, setAddingAccounts] = useState(false);

  if (!user) return null;

  const userAccountIds = user.accounts.map(a => a.account_id);
  const availableAccounts = allAccounts?.filter(a => !userAccountIds.includes(a.id)) || [];

  const handleRoleChange = (accountId: string, newRole: string) => {
    updateUserRole.mutate({
      user_id: user.id,
      account_id: accountId,
      role: newRole as any,
    });
  };

  const handleRemoveFromAccount = (accountId: string) => {
    if (confirm('Are you sure you want to remove this user from the account?')) {
      removeUserFromAccount.mutate({
        userId: user.id,
        accountId,
      });
    }
  };

  const handleAddToAccounts = async () => {
    // TODO: Implement bulk add to accounts
    console.log('Add to accounts:', selectedAccounts);
    setSelectedAccounts([]);
    setAddingAccounts(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Account Memberships</DialogTitle>
          <DialogDescription>
            {user.display_name || user.email} - Manage roles across all accounts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Accounts */}
          <div>
            <h3 className="text-sm font-medium mb-3">Current Accounts ({user.accounts.length})</h3>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-3">
                {user.accounts.map((account) => (
                  <div key={account.account_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{account.account_name}</Badge>
                      <Select
                        value={account.role}
                        onValueChange={(role) => handleRoleChange(account.account_id, role)}
                        disabled={updateUserRole.isPending}
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
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromAccount(account.account_id)}
                      disabled={removeUserFromAccount.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {user.accounts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    This user is not assigned to any accounts.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Add to Accounts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Add to Accounts</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddingAccounts(!addingAccounts)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Accounts
              </Button>
            </div>

            {addingAccounts && (
              <div className="space-y-3">
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="space-y-2">
                    {availableAccounts.map((account) => (
                      <div key={account.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={account.id}
                          checked={selectedAccounts.includes(account.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAccounts([...selectedAccounts, account.id]);
                            } else {
                              setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={account.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {account.name}
                        </label>
                      </div>
                    ))}
                    {availableAccounts.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No available accounts to add.
                      </p>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAccounts([]);
                      setAddingAccounts(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddToAccounts}
                    disabled={selectedAccounts.length === 0}
                  >
                    Add to {selectedAccounts.length} Account{selectedAccounts.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}