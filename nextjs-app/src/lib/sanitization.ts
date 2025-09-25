/**
 * Centralized sanitization utilities for preventing XSS attacks
 * SSR-safe implementation that works in both client and server environments
 */

// Dynamic DOMPurify loading for SSR compatibility
let DOMPurifyInstance: {
  sanitize: (dirty: string, config?: Record<string, unknown>) => string;
};

if (typeof window !== 'undefined') {
  // Client-side: Use full DOMPurify
  const DOMPurify = require('dompurify');
  DOMPurifyInstance = DOMPurify;
} else {
  // Server-side: Create a basic sanitizer that removes dangerous content
  // This provides basic XSS protection on the server while avoiding SSR issues
  DOMPurifyInstance = {
    sanitize: (dirty: string, config?: Record<string, unknown>) => {
      if (!dirty) return '';

      // Basic server-side sanitization
      // Using simpler, safer regex patterns to avoid ReDoS
      let cleaned = dirty
        // Remove script tags - simplified pattern
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        // Remove on* event handlers - simplified patterns
        .replace(/\bon\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/\bon\w+\s*=\s*'[^']*'/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove data: protocol in src/href - simplified
        .replace(/(?:src|href)\s*=\s*["']?data:/gi, '')
        // Remove iframe tags - simplified pattern
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');

      // If config specifies no tags allowed, strip all HTML
      if (config?.ALLOWED_TAGS && Array.isArray(config.ALLOWED_TAGS) && config.ALLOWED_TAGS.length === 0) {
        cleaned = cleaned.replace(/<[^>]+>/g, '');
      }

      return cleaned;
    }
  };
}

// Use the dynamic instance throughout the file
const DOMPurify = DOMPurifyInstance;

/**
 * Sanitize HTML content for safe rendering
 * Use this when you need to render user-generated HTML content
 */
export function sanitizeHtml(dirty: string): string {
  // Allow only safe HTML tags and attributes
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
      'width', 'height', 'style'
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Decode HTML entities to check for encoded HTML
 * This helps detect attempts to bypass sanitization with entities like &lt;script&gt;
 */
function decodeHtmlEntities(text: string): string {
  // Server-side safe HTML entity decoding
  const entities: { [key: string]: string } = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '='
  };

  return text.replace(/&[#\w]+;/g, (entity) => {
    // Use Object.entries to safely access entities
    const entry = Object.entries(entities).find(([key]) => key === entity);
    return entry ? entry[1] : entity;
  });
}

/**
 * Check if a string contains HTML tags (including encoded ones)
 */
function containsHtml(text: string): boolean {
  // More specific HTML tag pattern - must have tag name after <
  const htmlTagPattern = /<\/?[a-zA-Z][^>]*>/i;

  // Check for actual HTML tags
  if (htmlTagPattern.test(text)) {
    return true;
  }

  // Check for encoded HTML entities that would become tags
  const decoded = decodeHtmlEntities(text);
  if (decoded !== text && htmlTagPattern.test(decoded)) {
    return true;
  }

  // Check for common XSS patterns
  const xssPatterns = [
    /javascript:/i,
    /on\w+\s*=/i,  // Event handlers like onclick=, onerror=
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<svg/i,
    /<img/i
  ];

  return xssPatterns.some(pattern => pattern.test(text) || pattern.test(decoded));
}

/**
 * Sanitize plain text input (removes all HTML)
 * Use this for inputs that should never contain HTML
 */
export function sanitizeText(dirty: string): string {
  // Strip all HTML tags
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize and validate input length
 * Use this for form inputs to prevent overflow attacks
 */
export function sanitizeInput(input: string, maxLength: number = 255): string {
  // First check if input contains any HTML (including encoded)
  if (containsHtml(input)) {
    // If it has encoded HTML entities that would become tags, decode and sanitize
    const decoded = decodeHtmlEntities(input);
    if (decoded !== input && /<[^>]+>/i.test(decoded)) {
      // It has encoded HTML - sanitize the decoded version
      const sanitized = sanitizeText(decoded);
      // Then enforce length limit
      if (sanitized.length > maxLength) {
        return sanitized.substring(0, maxLength);
      }
      return sanitized;
    }

    // It has actual HTML tags - sanitize directly
    const sanitized = sanitizeText(input);
    // Then enforce length limit
    if (sanitized.length > maxLength) {
      return sanitized.substring(0, maxLength);
    }
    return sanitized;
  }

  // No HTML detected, return as-is with length limit
  // Don't run through DOMPurify for plain text to avoid escaping < and >
  if (input.length > maxLength) {
    return input.substring(0, maxLength);
  }

  return input;
}

/**
 * Sanitize rich text content (for builders/editors)
 * More permissive than regular HTML sanitization
 */
export function sanitizeRichText(dirty: string): string {
  // Allow more tags for rich text editors
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'strike', 's', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'span', 'div',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'pre', 'code', 'hr', 'sup', 'sub', 'small', 'mark',
      'figure', 'figcaption', 'article', 'section', 'nav',
      'header', 'footer', 'aside', 'main'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
      'width', 'height', 'style', 'data-*', 'role', 'aria-*',
      'colspan', 'rowspan', 'scope'
    ],
    ALLOW_DATA_ATTR: true,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onsubmit']
  };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  // Only allow http, https, mailto, and relative URLs
  const sanitized = sanitizeText(url);

  // Check for dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
  if (dangerousProtocols.test(sanitized)) {
    return '#';
  }

  return sanitized;
}

/**
 * Sanitize JSON string to prevent injection
 */
export function sanitizeJson(jsonString: string): string {
  try {
    // Parse and re-stringify to ensure valid JSON
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch {
    // If invalid JSON, return empty object
    return '{}';
  }
}

/**
 * Create a safe HTML string for use with dangerouslySetInnerHTML
 * Only use this when absolutely necessary!
 */
export function createSafeHtml(html: string): { __html: string } {
  return { __html: sanitizeRichText(html) };
}

/**
 * Check if input would be modified by sanitization (contains HTML)
 * Use this for validation without modifying the input
 */
export function wouldBeSanitized(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  const sanitized = sanitizeInput(trimmed, 10000); // Use large limit to avoid truncation issues
  return sanitized !== trimmed;
}

/**
 * Input validation and length limits for different field types
 */
export const INPUT_LIMITS = {
  // User inputs
  username: 50,
  email: 255,
  password: 128,
  displayName: 100,

  // Project/Account fields
  projectName: 100,
  projectDescription: 500,
  accountName: 100,
  accountSlug: 50,

  // Content fields
  pageTitle: 100,
  pageSlug: 100,
  metaDescription: 160,
  sectionContent: 5000,

  // General
  shortText: 255,
  longText: 1000,
  richText: 10000,
  url: 2048,
} as const;

/**
 * Validate and sanitize an email address
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email, INPUT_LIMITS.email);
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized.toLowerCase() : '';
}

/**
 * Sanitize a slug (URL-friendly string)
 */
export function sanitizeSlug(slug: string): string {
  return sanitizeInput(slug, INPUT_LIMITS.accountSlug)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}