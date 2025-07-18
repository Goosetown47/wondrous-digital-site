/**
 * Central export for all validation schemas
 * These are NOT integrated yet - Day 1 setup only
 * 
 * Usage (when ready to integrate):
 * import { projectSchemas, customerSchemas } from '@/schemas';
 */

// Re-export all common utilities
export * from './common';

// Re-export all project schemas
export * as projectSchemas from './project';
export * from './project';

// Re-export all customer schemas  
export * as customerSchemas from './customer';
export * from './customer';

// Example usage for Day 2+ integration:
// 
// import { createProjectSchema } from '@/schemas';
// 
// const validationResult = createProjectSchema.safeParse(formData);
// if (!validationResult.success) {
//   console.warn('Validation issues:', validationResult.error);
// }