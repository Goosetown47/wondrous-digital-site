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

  // Get config without bracket notation
  let config;
  switch (role) {
    case 'admin':
      config = roleConfig.admin;
      break;
    case 'staff':
      config = roleConfig.staff;
      break;
    case 'account_owner':
      config = roleConfig.account_owner;
      break;
    case 'user':
    default:
      config = roleConfig.user;
      break;
  }

  // Get size class without bracket notation
  let sizeClass: string;
  switch (size) {
    case 'sm':
      sizeClass = sizeClasses.sm;
      break;
    case 'lg':
      sizeClass = sizeClasses.lg;
      break;
    case 'md':
    default:
      sizeClass = sizeClasses.md;
      break;
  }
  
  return (
    <Badge 
      variant={config.variant}
      className={`${sizeClass} ${config.className}`}
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
// eslint-disable-next-line react-refresh/only-export-components
export function getRoleLabel(role: string): string {
  // Use switch to avoid bracket notation
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'staff':
      return 'Staff';
    case 'account_owner':
      return 'Account Owner';
    case 'user':
      return 'User';
    default:
      return role;
  }
}

/**
 * Get the color classes for a role (for custom implementations)
 */
// eslint-disable-next-line react-refresh/only-export-components
export function getRoleColorClasses(role: string): string {
  // Use switch to avoid bracket notation
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'staff':
      return 'bg-amber-100 text-amber-800';
    case 'account_owner':
      return 'bg-purple-100 text-purple-800';
    case 'user':
    default:
      return 'bg-gray-100 text-gray-800';
  }
}