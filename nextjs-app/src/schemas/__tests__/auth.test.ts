import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema } from '../auth';

describe('Auth Schemas', () => {
  describe('signupSchema', () => {
    it('should sanitize and validate email', () => {
      const result = signupSchema.safeParse({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = signupSchema.safeParse({
        email: longEmail,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid email formats', () => {
      const result = signupSchema.safeParse({
        email: 'not-an-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email');
      }
    });

    it('should reject passwords that are too long', () => {
      const longPassword = 'a'.repeat(130);
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: longPassword,
        confirmPassword: longPassword,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 128');
      }
    });

    it('should reject mismatched passwords', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Passwords do not match');
      }
    });

    it('should reject weak passwords', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Password does not meet requirements');
      }
    });
  });

  describe('loginSchema', () => {
    it('should sanitize and validate email', () => {
      const result = loginSchema.safeParse({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = loginSchema.safeParse({
        email: longEmail,
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });

    it('should accept any non-empty password for login', () => {
      // Login doesn't validate password strength, just checks it's not empty
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'a',
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
    });

    it('should reject passwords that are too long', () => {
      const longPassword = 'a'.repeat(130);
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: longPassword,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 128');
      }
    });
  });
});