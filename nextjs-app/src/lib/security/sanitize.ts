/**
 * Server-safe sanitization utilities for API routes
 * Provides XSS protection without DOM dependencies
 */

// Helper function to escape HTML entities
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

// Helper function to strip HTML tags
function stripTags(text: string): string {
  // Remove script tags and their content
  let cleaned = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and their content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&');

  return cleaned.trim();
}

export function sanitizeInput(input: string, type: 'plain' | 'rich' | 'html' = 'plain'): string {
  if (!input) return '';

  if (type === 'plain') {
    // For plain text, strip all HTML and escape
    return stripTags(input);
  } else if (type === 'rich') {
    // For rich text, strip tags but preserve some formatting
    // This is a simplified version - in production you might want sanitize-html package
    return stripTags(input);
  } else if (type === 'html') {
    // For HTML content, escape dangerous characters
    // In production, consider using sanitize-html package for more robust filtering
    return escapeHtml(input);
  }

  return stripTags(input);
}

export function sanitizeEmail(email: string): string {
  if (!email) return '';

  // Remove any HTML tags
  const sanitized = sanitizeInput(email, 'plain');

  // Additional email-specific validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized.toLowerCase().trim();
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';

  // Remove any HTML tags
  const sanitized = sanitizeInput(url, 'plain');

  // Validate URL format
  try {
    const urlObj = new URL(sanitized);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    // If not a valid URL, return empty
    return '';
  }
}

export function sanitizeFormData<T extends Record<string, unknown>>(
  data: T,
  fieldTypes: Partial<Record<keyof T, 'plain' | 'rich' | 'html' | 'email' | 'url'>>
): T {
  const sanitized = { ...data };

  for (const [key, value] of Object.entries(data)) {
    const fieldType = fieldTypes[key as keyof T];

    if (typeof value === 'string') {
      if (fieldType === 'email') {
        sanitized[key as keyof T] = sanitizeEmail(value) as T[keyof T];
      } else if (fieldType === 'url') {
        sanitized[key as keyof T] = sanitizeUrl(value) as T[keyof T];
      } else if (fieldType) {
        sanitized[key as keyof T] = sanitizeInput(value, fieldType) as T[keyof T];
      } else {
        // Default to plain sanitization for unknown fields
        sanitized[key as keyof T] = sanitizeInput(value, 'plain') as T[keyof T];
      }
    }
  }

  return sanitized;
}

// SQL injection prevention helper
export function escapeSQLIdentifier(identifier: string): string {
  // Remove any characters that aren't alphanumeric or underscore
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
}

// Prevent NoSQL injection in object keys
export function sanitizeObjectKeys<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Remove any keys that start with $ or contain dots (MongoDB operators)
    if (!key.startsWith('$') && !key.includes('.')) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {

        sanitized[key] = sanitizeObjectKeys(value as Record<string, unknown>);
      } else {

        sanitized[key] = value;
      }
    }
  }

  return sanitized as T;
}