import { z } from 'zod';

/**
 * Common validation schemas and utilities
 * These are NOT integrated yet - Day 1 setup only
 */

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Non-empty string validation
export const nonEmptyString = z.string().trim().min(1, 'This field is required');

// Safe string validation (prevents injection)
export const safeString = z.string()
  .trim()
  .min(1, 'This field is required')
  .max(255, 'Text too long (max 255 characters)')
  .regex(/^[a-zA-Z0-9\s\-_.,!?()&]+$/, 'Contains invalid characters');

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Domain validation
export const domainSchema = z.string()
  .trim()
  .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, 'Invalid domain format')
  .optional();

// Subdomain validation
export const subdomainSchema = z.string()
  .trim()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Invalid subdomain format')
  .optional();

// Business name validation (more permissive than safeString)
export const businessNameSchema = z.string()
  .trim()
  .min(1, 'Business name is required')
  .max(100, 'Business name too long (max 100 characters)')
  .regex(/^[a-zA-Z0-9\s\-_.,!?()&']+$/, 'Business name contains invalid characters');

// Project name validation
export const projectNameSchema = z.string()
  .trim()
  .min(1, 'Project name is required')
  .max(100, 'Project name too long (max 100 characters)')
  .regex(/^[a-zA-Z0-9\s\-_.,!?()&']+$/, 'Project name contains invalid characters');

// Enum validation helper
export function createEnumSchema<T extends readonly [string, ...string[]]>(values: T) {
  return z.enum(values);
}

// Optional UUID (for nullable foreign keys)
export const optionalUuid = z.string().uuid().optional().nullable();

// Timestamp validation
export const timestampSchema = z.string().datetime();

// Array of UUIDs (for bulk operations)
export const uuidArraySchema = z.array(uuidSchema).min(1, 'At least one item must be selected');