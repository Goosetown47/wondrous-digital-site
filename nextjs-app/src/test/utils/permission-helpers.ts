import { PERMISSIONS } from '@/lib/permissions/constants';
import type { Permission } from '@/lib/permissions/constants';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Helper to generate all permissions for a role
export function getPermissionsForRole(role: 'admin' | 'staff' | 'account_owner' | 'user'): string[] {
  switch (role) {
    case 'admin':
      // Admins have all permissions
      return Object.values(PERMISSIONS).flatMap(group => Object.values(group));
      
    case 'staff':
      // Staff have limited admin permissions
      return [
        PERMISSIONS.PROJECTS.READ,
        PERMISSIONS.THEMES.READ,
        PERMISSIONS.LIBRARY.READ,
        PERMISSIONS.LAB.CREATE,
        PERMISSIONS.LAB.READ,
        PERMISSIONS.LAB.UPDATE,
        PERMISSIONS.LAB.DELETE,
        PERMISSIONS.CORE.READ,
        PERMISSIONS.TOOLS.ACCESS,
        PERMISSIONS.ACCOUNT.READ,
        PERMISSIONS.USERS.READ,
      ];
      
    case 'account_owner':
      // Account owners have full control over their account
      return [
        PERMISSIONS.PROJECTS.CREATE,
        PERMISSIONS.PROJECTS.READ,
        PERMISSIONS.PROJECTS.UPDATE,
        PERMISSIONS.PROJECTS.DELETE,
        PERMISSIONS.PROJECTS.PUBLISH,
        PERMISSIONS.THEMES.CREATE,
        PERMISSIONS.THEMES.READ,
        PERMISSIONS.THEMES.UPDATE,
        PERMISSIONS.THEMES.DELETE,
        PERMISSIONS.LIBRARY.READ,
        PERMISSIONS.ACCOUNT.READ,
        PERMISSIONS.ACCOUNT.UPDATE,
        PERMISSIONS.ACCOUNT.BILLING,
        PERMISSIONS.USERS.INVITE,
        PERMISSIONS.USERS.READ,
        PERMISSIONS.USERS.UPDATE,
        PERMISSIONS.USERS.REMOVE,
      ];
      
    case 'user':
      // Regular users have limited permissions
      return [
        PERMISSIONS.PROJECTS.READ,
        PERMISSIONS.PROJECTS.UPDATE,
        PERMISSIONS.THEMES.READ,
        PERMISSIONS.LIBRARY.READ,
        PERMISSIONS.ACCOUNT.READ,
        PERMISSIONS.USERS.READ,
      ];
  }
}

// Helper to check if a permission is valid
export function isValidPermission(permission: string): permission is Permission {
  const allPermissions = Object.values(PERMISSIONS).flatMap(group => Object.values(group));
  return allPermissions.includes(permission as Permission);
}

// Helper to format permission for display
export function formatPermission(permission: string): string {
  const [resource, action] = permission.split(':');
  return `${resource.charAt(0).toUpperCase() + resource.slice(1)} - ${action.charAt(0).toUpperCase() + action.slice(1)}`;
}

// Test helper to assert permission check
export async function assertHasPermission(
  checkFn: () => Promise<boolean>,
  expected: boolean,
  message?: string
) {
  const result = await checkFn();
  if (result !== expected) {
    throw new Error(
      message || `Expected permission check to be ${expected}, but got ${result}`
    );
  }
}

// Test helper to assert multiple permissions
export async function assertPermissions(
  permissions: Record<string, boolean>,
  checkFn: (permission: string) => Promise<boolean>
) {
  const results: Record<string, { expected: boolean; actual: boolean }> = {};
  
  for (const [permission, expected] of Object.entries(permissions)) {
    const actual = await checkFn(permission);
    results[permission] = { expected, actual };
  }
  
  const failures = Object.entries(results).filter(
    ([, { expected, actual }]) => expected !== actual
  );
  
  if (failures.length > 0) {
    const failureMessages = failures.map(
      ([permission, { expected, actual }]) =>
        `${permission}: expected ${expected}, got ${actual}`
    );
    throw new Error(`Permission check failures:\n${failureMessages.join('\n')}`);
  }
}

// Helper to create a permission test matrix
export function createPermissionMatrix(
  roles: ('admin' | 'staff' | 'account_owner' | 'user')[],
  resources: string[]
) {
  const matrix: Record<string, Record<string, boolean>> = {};
  
  roles.forEach(role => {
    matrix[role] = {};
    const rolePermissions = getPermissionsForRole(role);
    
    resources.forEach(resource => {
      matrix[role][resource] = rolePermissions.includes(resource);
    });
  });
  
  return matrix;
}

// Helper to test cross-account access
export function createCrossAccountTest(
  userAccountId: string,
  targetAccountId: string,
  resource: string
) {
  return {
    name: `User from account ${userAccountId} accessing ${resource} in account ${targetAccountId}`,
    shouldAllow: userAccountId === targetAccountId,
    userAccountId,
    targetAccountId,
    resource,
  };
}

// Helper to generate security boundary test cases
export function generateSecurityTests() {
  return [
    {
      name: 'User cannot elevate own role',
      action: 'update_role',
      from: 'user',
      to: 'account_owner',
      shouldAllow: false,
    },
    {
      name: 'Account owner cannot become platform admin',
      action: 'update_role',
      from: 'account_owner',
      to: 'admin',
      shouldAllow: false,
    },
    {
      name: 'User cannot access other account projects',
      action: 'cross_account_access',
      resource: 'projects',
      shouldAllow: false,
    },
    {
      name: 'Admin can access any account',
      action: 'cross_account_access',
      resource: 'accounts',
      role: 'admin',
      shouldAllow: true,
    },
  ];
}

// Helper to validate RLS policy behavior
export function createRLSTest(
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete',
  scenario: string,
  setup: () => Promise<unknown> | unknown,
  expectedResult: 'allow' | 'deny'
) {
  return {
    table,
    operation,
    scenario,
    setup,
    expectedResult,
    async execute(supabaseClient: SupabaseClient<Database>) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context = await setup() as any;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: { data: any; error: any };
      
      switch (operation) {
        case 'select':
          result = await supabaseClient.from(table).select('*');
          break;
        case 'insert':
          result = await supabaseClient.from(table).insert(context.data).single();
          break;
        case 'update':
          result = await supabaseClient.from(table).update(context.data).eq('id', context.id).single();
          break;
        case 'delete':
          result = await supabaseClient.from(table).delete().eq('id', context.id).single();
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      const { data, error } = result;
      
      if (expectedResult === 'allow') {
        if (error) throw new Error(`Expected operation to succeed but got error: ${error.message}`);
      } else {
        if (!error) throw new Error('Expected operation to fail but it succeeded');
      }
      
      return { success: true, data, error };
    },
  };
}