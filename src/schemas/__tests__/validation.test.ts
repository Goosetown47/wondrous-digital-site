import { describe, it, expect } from 'vitest';
import {
  createProjectSchema,
  statusChangeSchema,
  validateStatusTransition,
  createAccountSchema,
  validateAccountTransition
} from '../index';

describe('Project Validation', () => {
  describe('createProjectSchema', () => {
    it('should validate valid project data', () => {
      const result = createProjectSchema.safeParse({
        project_name: 'Test Project',
        project_type: 'main_site',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        niche: 'technology'
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty project name', () => {
      const result = createProjectSchema.safeParse({
        project_name: '',
        project_type: 'main_site',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        niche: 'technology'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().project_name?._errors).toContain('Required');
      }
    });

    it('should reject non-template project without customer', () => {
      const result = createProjectSchema.safeParse({
        project_name: 'Test Project',
        project_type: 'main_site',
        customer_id: null,
        niche: 'technology'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format()._errors).toContain('Customer is required for non-template projects');
      }
    });

    it('should allow template project without customer', () => {
      const result = createProjectSchema.safeParse({
        project_name: 'Template Project',
        project_type: 'template',
        customer_id: null,
        niche: 'technology'
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const result = createProjectSchema.safeParse({
        project_name: 'Test Project',
        project_type: 'main_site',
        customer_id: 'not-a-uuid',
        niche: 'technology'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().customer_id?._errors[0]).toContain('Invalid uuid');
      }
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow valid transitions', () => {
      expect(validateStatusTransition('draft', 'template-internal').valid).toBe(true);
      expect(validateStatusTransition('prospect-staging', 'live-customer').valid).toBe(true);
      expect(validateStatusTransition('live-customer', 'paused-maintenance').valid).toBe(true);
    });

    it('should reject invalid transitions', () => {
      const result = validateStatusTransition('draft', 'live-customer');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Cannot transition from draft to live-customer');
    });

    it('should reject transitions from archived', () => {
      const result = validateStatusTransition('archived', 'draft');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Cannot transition from archived status');
    });
  });
});

describe('Account Validation', () => {
  describe('createAccountSchema', () => {
    it('should validate valid account data', () => {
      const result = createAccountSchema.safeParse({
        business_name: 'Test Company',
        contact_email: 'test@example.com',
        domain: 'example.com',
        account_type: 'prospect',
        notes: 'Some notes'
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = createAccountSchema.safeParse({
        business_name: 'Test Company',
        contact_email: 'not-an-email',
        domain: 'example.com',
        account_type: 'prospect',
        notes: ''
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().contact_email?._errors[0]).toContain('Invalid email');
      }
    });

    it('should reject invalid domain format', () => {
      const result = createAccountSchema.safeParse({
        business_name: 'Test Company',
        contact_email: 'test@example.com',
        domain: 'not a domain!',
        account_type: 'prospect',
        notes: ''
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().domain?._errors[0]).toContain('Invalid domain format');
      }
    });

    it('should allow empty optional fields', () => {
      const result = createAccountSchema.safeParse({
        business_name: 'Test Company',
        contact_email: 'test@example.com',
        domain: '',
        account_type: 'prospect',
        notes: ''
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('validateAccountTransition', () => {
    it('should allow valid transitions', () => {
      expect(validateAccountTransition('prospect', 'customer').valid).toBe(true);
      expect(validateAccountTransition('customer', 'inactive').valid).toBe(true);
      expect(validateAccountTransition('prospect', 'inactive').valid).toBe(true);
    });

    it('should reject backward transitions', () => {
      const result = validateAccountTransition('customer', 'prospect');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Cannot downgrade from customer to prospect');
    });

    it('should reject reactivation from inactive', () => {
      const result = validateAccountTransition('inactive', 'prospect');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Cannot reactivate from inactive status');
    });
  });
});