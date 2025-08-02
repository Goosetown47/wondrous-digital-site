import { z } from 'zod';
import { validatePassword, isValidEmail } from '@/lib/validation/password';

export const signupSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .refine(isValidEmail, 'Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .refine((password) => {
      const result = validatePassword(password);
      return result.isValid;
    }, (password: string) => {
      const result = validatePassword(password);
      // Return the first unmet requirement as the error message
      const firstError = result.errors[0];
      return { message: firstError || 'Password does not meet requirements' };
    }),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .refine(isValidEmail, 'Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required'),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;