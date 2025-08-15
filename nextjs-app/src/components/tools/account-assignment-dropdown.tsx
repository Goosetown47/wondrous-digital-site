'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useAddUserToAccount, useUpdateUserRole, useRemoveUserFromAccount } from '@/hooks/useUsers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/ui/role-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import type { UserWithAccounts } from '@/lib/services/users';

interface AccountAssignmentDropdownProps {
  user: UserWithAccounts;
  onManageClick?: () => void;
}

type SortOrder = 'az' | 'za' | 'recent';
type PlanFilter = 'all' | 'free' | 'pro' | 'enterprise';

export function AccountAssignmentDropdown({ user }: AccountAssignmentDropdownProps) {
  const { data: allAccounts, isLoading: accountsLoading } = useAccounts();
  const addUserToAccount = useAddUserToAccount();
  const updateUserRole = useUpdateUserRole();
  const removeUserFromAccount = useRemoveUserFromAccount();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [primaryAccountId, setPrimaryAccountId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('az');
  
  const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
  
  // Check if user is platform admin
  const platformRole = user.accounts.find(acc => 
    acc.account_id === PLATFORM_ACCOUNT_ID && acc.role === 'admin'
  );
  
  // Filter out platform account from user's accounts
  const userAccounts = user.accounts.filter(acc => acc.account_id !== PLATFORM_ACCOUNT_ID);
  const userAccountIds = userAccounts.map(a => a.account_id);
  
  // Set initial primary account
  useEffect(() => {
    if (!primaryAccountId && userAccounts.length > 0) {
      // Set first account as primary if none selected
      setPrimaryAccountId(userAccounts[0].account_id);
    }
  }, [userAccounts, primaryAccountId]);
  
  // Filter available accounts (not yet member of)
  const availableAccounts = useMemo(() => {
    if (!allAccounts) return [];
    
    let filtered = allAccounts.filter(a => 
      a.id !== PLATFORM_ACCOUNT_ID && !userAccountIds.includes(a.id)
    );
    
    // Apply plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(a => a.plan === planFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [allAccounts, userAccountIds, planFilter, searchTerm, sortOrder]);
  
  // Get unique plans from all accounts for filter
  const availablePlans = useMemo(() => {
    if (!allAccounts) return [];
    const plans = new Set(allAccounts.map(a => a.plan));
    return Array.from(plans).filter(Boolean);
  }, [allAccounts]);
  
  const handleAddToAccount = async (accountId: string) => {
    try {
      await addUserToAccount.mutateAsync({
        userId: user.id,
        accounts: [{
          account_id: accountId,
          role: 'user', // Default role
        }],
      });
    } catch (error) {
      console.error('Failed to add user to account:', error);
    }
  };
  
  const handleRemoveFromAccount = async (accountId: string) => {
    // Handle primary account selection when removing accounts
    if (accountId === primaryAccountId) {
      if (userAccounts.length > 1) {
        // Select a different account as primary
        const nextAccount = userAccounts.find(a => a.account_id !== accountId);
        if (nextAccount) {
          setPrimaryAccountId(nextAccount.account_id);
        }
      } else {
        // This was the last account, clear primary
        setPrimaryAccountId('');
      }
    }
    
    try {
      await removeUserFromAccount.mutateAsync({
        userId: user.id,
        accountId,
      });
    } catch (error) {
      console.error('Failed to remove user from account:', error);
    }
  };
  
  const handleRoleChange = async (accountId: string, newRole: string) => {
    try {
      await updateUserRole.mutateAsync({
        user_id: user.id,
        account_id: accountId,
        role: newRole as 'admin' | 'staff' | 'account_owner' | 'user',
      });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };
  
  // Get primary account details
  const primaryAccount = userAccounts.find(acc => acc.account_id === primaryAccountId) || userAccounts[0];
  
  // If admin, just show universal access (check after all hooks)
  if (platformRole?.role === 'admin') {
    return <span className="text-sm text-muted-foreground">Universal Access</span>;
  }
  
  return (
    <div className="relative">
      {/* Selector Box */}
      <Button
        variant="outline"
        size="sm"
        className="h-9 px-3 justify-between min-w-[240px]"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="flex items-center gap-2">
          {primaryAccount ? (
            <>
              <span className="text-sm font-medium">{primaryAccount.account_name}</span>
              <RoleBadge role={primaryAccount.role as 'admin' | 'staff' | 'account_owner' | 'user'} size="sm" />
            </>
          ) : (
            <span className="text-sm text-muted-foreground">No accounts</span>
          )}
        </div>
        {dropdownOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      
      {/* Expanded Dropdown */}
      {dropdownOpen && (
        <div className="absolute top-full mt-1 left-0 z-50 w-[650px] bg-background border rounded-lg shadow-lg">
          <div className="p-6 space-y-6">
            {/* Active Accounts Section */}
            {userAccounts.length > 0 && (
              <div>
                {/* Header row with column labels */}
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Accounts
                  </Label>
                  <div className="flex items-center gap-8">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Primary?</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Access</span>
                  </div>
                </div>
                
                {/* Account rows */}
                <div className="space-y-2">
                  {userAccounts.map((account) => (
                    <div key={account.account_id} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30">
                      {/* Account name on the left */}
                      <span className="text-sm font-medium flex-1">{account.account_name}</span>
                      
                      {/* Controls on the right */}
                      <div className="flex items-center gap-6">
                        {/* Role Dropdown */}
                        <Select
                          value={account.role}
                          onValueChange={(role) => handleRoleChange(account.account_id, role)}
                          disabled={updateUserRole.isPending}
                        >
                          <SelectTrigger className="w-[185px] h-8">
                            <SelectValue>
                              <RoleBadge role={account.role as 'admin' | 'staff' | 'account_owner' | 'user'} size="sm" />
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <RoleBadge role="user" size="sm" />
                            </SelectItem>
                            <SelectItem value="account_owner">
                              <RoleBadge role="account_owner" size="sm" />
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Primary Radio - centered in column */}
                        <div className="flex items-center justify-center w-16">
                          <input
                            type="radio"
                            id={`primary-${account.account_id}`}
                            name="primary-account"
                            checked={primaryAccountId === account.account_id}
                            onChange={() => setPrimaryAccountId(account.account_id)}
                            className="h-4 w-4"
                          />
                        </div>
                        
                        {/* Access Checkbox - centered in column */}
                        <div className="flex items-center justify-center w-12">
                          <Checkbox
                            id={`access-${account.account_id}`}
                            checked={true}
                            onCheckedChange={(checked) => {
                              if (!checked) {
                                handleRemoveFromAccount(account.account_id);
                              }
                            }}
                            disabled={removeUserFromAccount.isPending}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Available Accounts Section */}
            <div>
              {/* Header with filters */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Accounts
                  </Label>
                  
                  {/* Plan Filter */}
                  <Select value={planFilter} onValueChange={(value: PlanFilter) => setPlanFilter(value)}>
                    <SelectTrigger className="w-[90px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Filter</SelectItem>
                      {availablePlans.map(plan => (
                        <SelectItem key={plan} value={plan}>
                          {plan.charAt(0).toUpperCase() + plan.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Sort Dropdown */}
                  <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                    <SelectTrigger className="w-[90px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="az">A-Z</SelectItem>
                      <SelectItem value="za">Z-A</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-[140px] h-8 pl-7 text-xs"
                    />
                  </div>
                </div>
                
                {/* ACCESS column header */}
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider pr-3">
                  Access
                </span>
              </div>
              
              {/* Available Accounts List */}
              <div className="border rounded-md">
                <ScrollArea className="h-[180px] p-3">
                  {accountsLoading ? (
                    <div className="text-sm text-muted-foreground text-center py-4">Loading accounts...</div>
                  ) : availableAccounts.length > 0 ? (
                    <div className="space-y-1">
                      {availableAccounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between py-2 px-2 hover:bg-muted/30 rounded">
                          {/* Account name on left */}
                          <Label
                            htmlFor={`add-${account.id}`}
                            className="text-sm cursor-pointer flex-1 flex items-center"
                          >
                            {account.name}
                            {account.plan && account.plan !== 'free' && (
                              <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">
                                {account.plan}
                              </Badge>
                            )}
                          </Label>
                          
                          {/* Checkbox on right, aligned with Access column */}
                          <div className="pr-3">
                            <Checkbox
                              id={`add-${account.id}`}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleAddToAccount(account.id);
                                }
                              }}
                              disabled={addUserToAccount.isPending}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      {searchTerm || planFilter !== 'all' ? 'No matching accounts' : 'No available accounts'}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}