import { render } from '@react-email/components';
import type { ReactElement } from 'react';
import { getAppUrl } from '@/lib/utils/app-url';

/**
 * Preview an email template in development
 * Returns the rendered HTML string
 */
export async function previewEmail(template: ReactElement): Promise<string> {
  try {
    return await render(template);
  } catch (error) {
    console.error('Failed to render email template:', error);
    return '<p>Failed to render email template</p>';
  }
}

/**
 * Format email address with optional name
 */
export function formatEmailAddress(email: string, name?: string): string {
  if (name) {
    // Escape quotes in name
    const escapedName = name.replace(/"/g, '\\"');
    return `"${escapedName}" <${email}>`;
  }
  return email;
}

/**
 * Extract name from email if no display name is available
 */
export function extractNameFromEmail(email: string): string {
  return email.split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get email provider name from email address
 */
export function getEmailProvider(email: string): string {
  const domain = email.split('@')[1];
  if (!domain) return 'Unknown';
  
  const providers: Record<string, string> = {
    'gmail.com': 'Gmail',
    'outlook.com': 'Outlook',
    'hotmail.com': 'Hotmail',
    'yahoo.com': 'Yahoo',
    'icloud.com': 'iCloud',
    'protonmail.com': 'ProtonMail',
    'aol.com': 'AOL',
  };
  
  return providers[domain.toLowerCase()] || domain;
}

/**
 * Generate unsubscribe URL
 */
export function generateUnsubscribeUrl(userId: string, type: string): string {
  const baseUrl = getAppUrl();
  const token = Buffer.from(`${userId}:${type}`).toString('base64');
  return `${baseUrl}/unsubscribe?token=${token}`;
}

/**
 * Parse template variables from a template string
 */
export function parseTemplateVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}