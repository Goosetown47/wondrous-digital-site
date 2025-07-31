/**
 * Permission constants for the application
 * Format: "resource:action"
 */

export const PERMISSIONS = {
  // Project permissions
  PROJECTS: {
    CREATE: 'projects:create',
    READ: 'projects:read',
    UPDATE: 'projects:update',
    DELETE: 'projects:delete',
    PUBLISH: 'projects:publish',
  },
  
  // Theme permissions
  THEMES: {
    CREATE: 'themes:create',
    READ: 'themes:read',
    UPDATE: 'themes:update',
    DELETE: 'themes:delete',
  },
  
  // Library permissions
  LIBRARY: {
    CREATE: 'library:create',
    READ: 'library:read',
    UPDATE: 'library:update',
    DELETE: 'library:delete',
    PUBLISH: 'library:publish',
  },
  
  // Lab permissions
  LAB: {
    CREATE: 'lab:create',
    READ: 'lab:read',
    UPDATE: 'lab:update',
    DELETE: 'lab:delete',
  },
  
  // Core permissions
  CORE: {
    CREATE: 'core:create',
    READ: 'core:read',
    UPDATE: 'core:update',
    DELETE: 'core:delete',
  },
  
  // Tools permissions
  TOOLS: {
    ACCESS: 'tools:access',
    MANAGE: 'tools:manage',
  },
  
  // Account permissions
  ACCOUNT: {
    READ: 'account:read',
    UPDATE: 'account:update',
    DELETE: 'account:delete',
    BILLING: 'account:billing',
  },
  
  // User management permissions
  USERS: {
    INVITE: 'users:invite',
    READ: 'users:read',
    UPDATE: 'users:update',
    REMOVE: 'users:remove',
  },
} as const;

// Type for all possible permissions
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

// Helper to get all permissions as a flat array
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap(group => 
  Object.values(group)
) as Permission[];