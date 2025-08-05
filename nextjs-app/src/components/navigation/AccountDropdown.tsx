'use client';

import { Check, ChevronsUpDown, Building2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/auth-provider';

export function AccountDropdown() {
  const router = useRouter();
  const { user, accounts, isAdmin: isAdminUser, currentAccount, setCurrentAccount, loading } = useAuth();

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="h-8 w-full animate-pulse bg-muted rounded" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="px-3 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {currentAccount?.name || 'No account selected'}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
          <DropdownMenuLabel>
            {isAdminUser ? 'All Accounts (Admin)' : 'Your Accounts'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accounts.length === 0 ? (
            <DropdownMenuItem disabled>
              No accounts available
            </DropdownMenuItem>
          ) : (
            accounts.map((account) => (
              <DropdownMenuItem
                key={account.id}
                onSelect={() => {
                  setCurrentAccount(account);
                  // Navigate to dashboard to refresh context
                  router.push('/dashboard');
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>{account.name}</span>
                  {isAdminUser && (
                    <Shield className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                {currentAccount?.id === account.id && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}