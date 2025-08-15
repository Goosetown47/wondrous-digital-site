import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface RoleBadgeProps {
  role: 'admin' | 'staff' | 'account_owner' | 'user';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

/**
 * Consistent role badge component for displaying user roles
 * throughout the application with standardized colors and styling
 */
export function RoleBadge({ role, size = 'md', showIcon = false }: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0 h-4',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  const roleConfig = {
    admin: {
      label: 'Admin',
      variant: 'destructive' as const,
      className: '',
    },
    staff: {
      label: 'Staff',
      variant: 'default' as const,
      className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    },
    account_owner: {
      label: 'Account Owner',
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    },
    user: {
      label: 'User',
      variant: 'secondary' as const,
      className: '',
    },
  };

  const config = roleConfig[role];

  return (
    <Badge 
      variant={config.variant}
      className={`${sizeClasses[size]} ${config.className}`}
    >
      {showIcon && role === 'account_owner' && (
        <Shield className="mr-1 h-3 w-3" />
      )}
      {config.label}
    </Badge>
  );
}

/**
 * Get the display label for a role
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Admin',
    staff: 'Staff', 
    account_owner: 'Account Owner',
    user: 'User',
  };
  return labels[role] || role;
}

/**
 * Get the color classes for a role (for custom implementations)
 */
export function getRoleColorClasses(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    staff: 'bg-amber-100 text-amber-800',
    account_owner: 'bg-purple-100 text-purple-800',
    user: 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}