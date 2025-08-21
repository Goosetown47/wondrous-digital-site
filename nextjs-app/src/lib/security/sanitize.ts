import DOMPurify from 'isomorphic-dompurify';

// Configuration for different sanitization contexts
const SANITIZE_CONFIGS = {
  // For plain text fields (names, titles, etc.)
  plain: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  
  // For rich text content (descriptions, comments)
  rich: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    KEEP_CONTENT: true,
  },
  
  // For HTML content (blog posts, pages)
  html: {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'img', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id'],
    KEEP_CONTENT: true,
  },
};

export function sanitizeInput(input: string, type: 'plain' | 'rich' | 'html' = 'plain'): string {
  if (!input) return '';
  
  // eslint-disable-next-line security/detect-object-injection
  const config = SANITIZE_CONFIGS[type];
  return DOMPurify.sanitize(input, config);
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
        // eslint-disable-next-line security/detect-object-injection
        sanitized[key] = sanitizeObjectKeys(value as Record<string, unknown>);
      } else {
        // eslint-disable-next-line security/detect-object-injection
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized as T;
}