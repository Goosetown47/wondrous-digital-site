import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts } from '@/hooks/useAccounts';
import { useStaffAssignments, useAssignStaff } from '@/hooks/useStaffAssignments';
import { useStaffMembers } from '@/hooks/useStaffAssignments';
import {
  Search,
  Building2,
  Users,
  Check,
  X,
} from 'lucide-react';

interface AssignStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffUserId: string | null;
  onSuccess?: () => void;
}

export function AssignStaffDialog({
  open,
  onOpenChange,
  staffUserId,
  onSuccess,
}: AssignStaffDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: staffMembers } = useStaffMembers();
  const { data: currentAssignments } = useStaffAssignments(staffUserId || undefined);
  const assignStaff = useAssignStaff();

  const staffMember = staffMembers?.find(s => s.id === staffUserId);

  // Initialize selected accounts when dialog opens
  useEffect(() => {
    if (open && currentAssignments) {
      setSelectedAccounts(currentAssignments.map(a => a.account_id));
      // Set notes from the first assignment if available
      const firstNote = currentAssignments.find(a => a.assignment_notes)?.assignment_notes;
      setNotes(firstNote || '');
    } else {
      setSelectedAccounts([]);
      setNotes('');
    }
  }, [open, currentAssignments]);

  // Filter accounts based on search, excluding platform account
  const filteredAccounts = accounts?.filter(account => 
    account.id !== '00000000-0000-0000-0000-000000000000' &&
    (account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     account.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleToggleAccount = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === filteredAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(filteredAccounts.map(a => a.id));
    }
  };

  const handleSubmit = async () => {
    if (!staffUserId) return;

    try {
      await assignStaff.mutateAsync({
        staffUserId,
        accountIds: selectedAccounts,
        notes: notes.trim() || undefined,
      });
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isChanged = () => {
    const currentIds = currentAssignments?.map(a => a.account_id) || [];
    if (selectedAccounts.length !== currentIds.length) return true;
    return !selectedAccounts.every(id => currentIds.includes(id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Account Assignments</DialogTitle>
          <DialogDescription>
            Assign {staffMember?.display_name || staffMember?.email || 'staff member'} to accounts they should manage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                <Building2 className="h-3 w-3 mr-1" />
                {selectedAccounts.length} selected
              </Badge>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {filteredAccounts.length} available
              </Badge>
            </div>
            {filteredAccounts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedAccounts.length === filteredAccounts.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>

          {/* Account List */}
          <ScrollArea className="h-[300px] rounded-md border">
            {accountsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No accounts found</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredAccounts.map((account) => {
                  const isSelected = selectedAccounts.includes(account.id);
                  const currentAssignment = currentAssignments?.find(a => a.account_id === account.id);
                  
                  return (
                    <div
                      key={account.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleToggleAccount(account.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleAccount(account.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">{account.slug}</p>
                      </div>
                      {currentAssignment && !isChanged() && (
                        <Badge variant="secondary" className="text-xs">
                          Currently Assigned
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Assignment Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or instructions for this staff member..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={assignStaff.isPending || !isChanged()}
          >
            {assignStaff.isPending ? 'Updating...' : 'Update Assignments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}