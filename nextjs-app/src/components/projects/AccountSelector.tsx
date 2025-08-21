'use client';

import { Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAccounts, useReassignProjectAccount } from '@/hooks/useProjects';

interface AccountSelectorProps {
  projectId: string;
  currentAccount?: {
    id: string;
    name: string;
    slug: string;
    plan?: string;
  } | null;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

export function AccountSelector({ 
  projectId, 
  currentAccount, 
  disabled = false,
  size = 'default'
}: AccountSelectorProps) {
  const { data: accounts, isLoading } = useAccounts();
  const { mutate: reassignAccount, isPending } = useReassignProjectAccount();

  const handleAccountChange = (newAccountId: string) => {
    if (newAccountId === currentAccount?.id) {
      return;
    }

    const newAccount = accounts?.find(acc => acc.id === newAccountId);
    if (!newAccount) return;

    reassignAccount({
      projectId,
      newAccountId,
      reason: `Account changed from ${currentAccount?.name || 'Unknown'} to ${newAccount.name}`
    });
  };

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <Building className="mr-1 h-3 w-3" />
        Loading...
      </Badge>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Badge variant="outline">
        <Building className="mr-1 h-3 w-3" />
        No accounts
      </Badge>
    );
  }

  const isUpdating = isPending;

  return (
    <div className="flex items-center gap-2">
      <Building className={cn("h-4 w-4 text-muted-foreground", size === 'sm' && "h-3 w-3")} />
      <Select
        value={currentAccount?.id || ''}
        onValueChange={handleAccountChange}
        disabled={disabled || isUpdating}
      >
        <SelectTrigger 
          className={cn(
            "min-w-[140px]",
            size === 'sm' ? "h-8 text-xs" : "h-9",
            isUpdating && "opacity-50 cursor-not-allowed"
          )}
        >
          <SelectValue placeholder="Select account..." />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{account.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {account.tier}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}