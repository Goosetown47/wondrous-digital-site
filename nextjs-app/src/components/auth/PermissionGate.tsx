'use client';

import { ReactNode } from 'react';
import { useHasPermission, useHasPermissions } from '@/hooks/usePermissions';
import { useIsAdmin } from '@/hooks/useRole';
import type { Permission } from '@/lib/permissions/constants';

interface PermissionGateProps {
  permission: Permission | string;
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

/**
 * Component that conditionally renders children based on permissions
 * 
 * Usage:
 * <PermissionGate permission={PERMISSIONS.PROJECTS.DELETE}>
 *   <DeleteButton />
 * </PermissionGate>
 */
export function PermissionGate({ 
  permission, 
  children, 
  fallback = null,
  loading = null 
}: PermissionGateProps) {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: hasPermission, isLoading: isPermissionLoading } = useHasPermission(permission);
  
  const isLoading = isAdminLoading || isPermissionLoading;
  
  if (isLoading) {
    return <>{loading}</>;
  }
  
  // Platform admins bypass all permission checks
  if (isAdmin) {
    return <>{children}</>;
  }
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface MultiPermissionGateProps {
  permissions: (Permission | string)[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

/**
 * Component that checks multiple permissions
 * 
 * Usage:
 * <MultiPermissionGate 
 *   permissions={[PERMISSIONS.PROJECTS.UPDATE, PERMISSIONS.PROJECTS.DELETE]}
 *   requireAll={true}
 * >
 *   <EditAndDeleteButtons />
 * </MultiPermissionGate>
 */
export function MultiPermissionGate({ 
  permissions, 
  requireAll = false,
  children, 
  fallback = null,
  loading = null 
}: MultiPermissionGateProps) {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: permissionResults, isLoading: isPermissionLoading } = useHasPermissions(permissions);
  
  const isLoading = isAdminLoading || isPermissionLoading;
  
  if (isLoading) {
    return <>{loading}</>;
  }
  
  // Platform admins bypass all permission checks
  if (isAdmin) {
    return <>{children}</>;
  }
  
  const hasAccess = requireAll
    ? permissions.every(p => permissionResults?.[p])
    : permissions.some(p => permissionResults?.[p]);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}