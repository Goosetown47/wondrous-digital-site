import { z } from 'zod';
import { validatePassword, isValidEmail } from '@/lib/validation/password';
import { INPUT_LIMITS } from '@/lib/sanitization';

export const signupSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .max(INPUT_LIMITS.email, `Email must be less than ${INPUT_LIMITS.email} characters`)
    .transform((email) => email.trim().toLowerCase())
    .refine(isValidEmail, 'Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .max(INPUT_LIMITS.password, `Password must be less than ${INPUT_LIMITS.password} characters`)
    .refine((password) => {
      const result = validatePassword(password);
      return result.isValid;
    }, {
      message: 'Password does not meet requirements'
    }),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
    .max(INPUT_LIMITS.password, `Password must be less than ${INPUT_LIMITS.password} characters`),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .max(INPUT_LIMITS.email, `Email must be less than ${INPUT_LIMITS.email} characters`)
    .transform((email) => email.trim().toLowerCase())
    .refine(isValidEmail, 'Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .max(INPUT_LIMITS.password, `Password must be less than ${INPUT_LIMITS.password} characters`),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;