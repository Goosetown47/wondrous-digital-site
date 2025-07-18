import { z } from 'zod';
import { 
  uuidSchema, 
  optionalUuid,
  projectNameSchema,
  domainSchema,
  subdomainSchema,
  createEnumSchema,
  uuidArraySchema
} from './common';

/**
 * Project validation schemas
 * These are NOT integrated yet - Day 1 setup only
 */

// Project type enum
export const projectTypeSchema = createEnumSchema([
  'main_site',
  'landing_page', 
  'template'
] as const);

// Project status enum
export const projectStatusSchema = createEnumSchema([
  'draft',
  'template-internal',
  'template-public',
  'prospect-staging',
  'live-customer',
  'paused-maintenance',
  'archived'
] as const);

// Deployment status enum
export const deploymentStatusSchema = createEnumSchema([
  'none',
  'pending',
  'deploying',
  'deployed',
  'failed'
] as const);

// Niche/industry enum
export const nicheSchema = z.enum([
  'restaurant',
  'legal',
  'healthcare',
  'dental',
  'veterinary',
  'fitness',
  'beauty',
  'real_estate',
  'automotive',
  'retail',
  'consulting',
  'technology',
  'other'
]).optional().nullable();

// Create project form validation
export const createProjectSchema = z.object({
  project_name: projectNameSchema,
  project_type: projectTypeSchema,
  customer_id: z.string().uuid().optional().nullable(),
  niche: nicheSchema
}).refine(
  (data) => {
    // Templates don't require customer_id
    if (data.project_type === 'template') {
      return true;
    }
    // Other project types require customer_id
    return !!data.customer_id;
  },
  {
    message: 'Customer is required for non-template projects',
    path: ['customer_id']
  }
);

// Status change validation
export const statusChangeSchema = z.object({
  project_id: uuidSchema,
  new_status: projectStatusSchema,
  reason: z.string().optional()
});

// Bulk status change validation
export const bulkStatusChangeSchema = z.object({
  project_ids: uuidArraySchema,
  new_status: projectStatusSchema,
  reason: z.string().optional()
});

// Project update validation
export const updateProjectSchema = z.object({
  project_name: projectNameSchema.optional(),
  domain: domainSchema,
  subdomain: subdomainSchema,
  niche: nicheSchema
}).partial();

// Validate status transitions (business rules)
export function validateStatusTransition(
  currentStatus: z.infer<typeof projectStatusSchema>,
  newStatus: z.infer<typeof projectStatusSchema>
): { valid: boolean; message?: string } {
  // Draft can go anywhere
  if (currentStatus === 'draft') {
    return { valid: true };
  }
  
  // Archived can only be resurrected to draft
  if (currentStatus === 'archived' && newStatus !== 'draft') {
    return { 
      valid: false, 
      message: 'Archived projects can only be moved back to draft status' 
    };
  }
  
  // Live customer requires maintenance before archive
  if (currentStatus === 'live-customer' && newStatus === 'archived') {
    return { 
      valid: false, 
      message: 'Live customer projects must be set to maintenance before archiving' 
    };
  }
  
  // All other transitions are allowed
  return { valid: true };
}

// Bulk operation validation
export const bulkOperationSchema = z.object({
  project_ids: uuidArraySchema,
  operation: z.enum(['change-status', 'archive', 'delete'])
});

// Export all project types
export type ProjectType = z.infer<typeof projectTypeSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type StatusChangeInput = z.infer<typeof statusChangeSchema>;