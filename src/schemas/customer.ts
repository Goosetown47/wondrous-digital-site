import { z } from 'zod';
import { 
  uuidSchema,
  businessNameSchema,
  emailSchema,
  domainSchema,
  createEnumSchema,
  uuidArraySchema
} from './common';

/**
 * Customer validation schemas
 * These are NOT integrated yet - Day 1 setup only
 */

// Account type enum
export const accountTypeSchema = createEnumSchema([
  'prospect',
  'customer',
  'inactive'
] as const);

// Subscription status enum
export const subscriptionStatusSchema = createEnumSchema([
  'active',
  'paused',
  'cancelled',
  'none'
] as const);

// Create account form validation
export const createAccountSchema = z.object({
  business_name: businessNameSchema,
  contact_email: emailSchema,
  account_type: accountTypeSchema.default('prospect'),
  domain: domainSchema,
  notes: z.string().max(500, 'Notes too long (max 500 characters)').optional()
});

// Update account validation
export const updateAccountSchema = z.object({
  business_name: businessNameSchema.optional(),
  contact_email: emailSchema.optional(),
  account_type: accountTypeSchema.optional(),
  domain: domainSchema,
  subscription_status: subscriptionStatusSchema.optional(),
  notes: z.string().max(500, 'Notes too long (max 500 characters)').optional()
}).partial();

// Account status change validation
export const accountStatusChangeSchema = z.object({
  account_id: uuidSchema,
  new_type: accountTypeSchema,
  reason: z.string().optional()
});

// Bulk account status change
export const bulkAccountStatusChangeSchema = z.object({
  account_ids: uuidArraySchema,
  new_type: accountTypeSchema,
  reason: z.string().optional()
});

// Validate account transitions (business rules)
export function validateAccountTransition(
  currentType: z.infer<typeof accountTypeSchema>,
  newType: z.infer<typeof accountTypeSchema>
): { valid: boolean; message?: string } {
  // Inactive accounts should be reviewed before reactivation
  if (currentType === 'inactive' && newType === 'customer') {
    return { 
      valid: false, 
      message: 'Inactive accounts should be set to prospect first for review' 
    };
  }
  
  // All other transitions are allowed
  return { valid: true };
}

// Bulk account operation validation
export const bulkAccountOperationSchema = z.object({
  account_ids: uuidArraySchema,
  operation: z.enum(['change-status', 'delete'])
});

// Account selection validation (for project creation)
export const accountSelectionSchema = z.string()
  .uuid('Please select a valid customer')
  .refine(val => val !== '', {
    message: 'Customer selection is required'
  });

// Delete account validation
export const deleteAccountSchema = z.object({
  account_id: uuidSchema,
  confirmation_text: z.string()
});

// Validate account deletion (business rules)
export function validateAccountDeletion(
  account: {
    account_type: z.infer<typeof accountTypeSchema>;
    project_count?: number;
  }
): { canDelete: boolean; message?: string } {
  // Only inactive accounts can be deleted
  if (account.account_type !== 'inactive') {
    return {
      canDelete: false,
      message: 'Only inactive accounts can be deleted. Please change the account status to inactive first.'
    };
  }
  
  // Cannot delete if there are associated projects
  if (account.project_count && account.project_count > 0) {
    return {
      canDelete: false,
      message: `This account has ${account.project_count} project${account.project_count > 1 ? 's' : ''} associated with it. All projects must be deleted or reassigned first.`
    };
  }
  
  return { canDelete: true };
}

// Export all customer types
export type AccountType = z.infer<typeof accountTypeSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;