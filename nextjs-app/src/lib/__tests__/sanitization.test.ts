import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeInput,
  sanitizeRichText,
  sanitizeUrl,
  sanitizeJson,
  createSafeHtml,
  sanitizeEmail,
  sanitizeSlug,
  INPUT_LIMITS,
} from '../sanitization';

describe('Sanitization Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = '<p>Hello</p><script>alert("XSS")</script>';
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe('<p>Hello</p>');
      expect(clean).not.toContain('<script>');
    });

    it('should remove dangerous event handlers', () => {
      const dirty = '<div onclick="alert(\'XSS\')">Click me</div>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('onclick');
    });

    it('should allow safe HTML tags', () => {
      const safe = '<p>Hello <strong>world</strong></p>';
      const clean = sanitizeHtml(safe);
      expect(clean).toBe(safe);
    });

    it('should remove iframe tags', () => {
      const dirty = '<iframe src="evil.com"></iframe>';
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const dirty = '<p>Hello <script>alert("XSS")</script>world</p>';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('Hello world');
    });

    it('should preserve plain text', () => {
      const text = 'Hello world!';
      const clean = sanitizeText(text);
      expect(clean).toBe(text);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize and enforce length limits', () => {
      const longText = 'a'.repeat(300);
      const clean = sanitizeInput(longText, 255);
      expect(clean.length).toBe(255);
    });

    it('should remove HTML from input', () => {
      const dirty = '<script>alert("XSS")</script>Hello';
      const clean = sanitizeInput(dirty);
      expect(clean).toBe('Hello');
    });

    it('should handle empty strings', () => {
      const clean = sanitizeInput('');
      expect(clean).toBe('');
    });
  });

  describe('sanitizeRichText', () => {
    it('should allow more HTML tags than sanitizeHtml', () => {
      const rich = '<article><section><header>Title</header></section></article>';
      const clean = sanitizeRichText(rich);
      expect(clean).toBe(rich);
    });

    it('should still remove script tags', () => {
      const dirty = '<article>Content<script>alert("XSS")</script></article>';
      const clean = sanitizeRichText(dirty);
      expect(clean).toBe('<article>Content</article>');
    });

    it('should allow data attributes', () => {
      const html = '<div data-id="123">Content</div>';
      const clean = sanitizeRichText(html);
      expect(clean).toContain('data-id');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow http and https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should block javascript: protocol', () => {
      const dirty = 'javascript:alert("XSS")';
      const clean = sanitizeUrl(dirty);
      expect(clean).toBe('#');
    });

    it('should block data: protocol', () => {
      const dirty = 'data:text/html,<script>alert("XSS")</script>';
      const clean = sanitizeUrl(dirty);
      expect(clean).toBe('#');
    });

    it('should allow relative URLs', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
      expect(sanitizeUrl('../relative/path')).toBe('../relative/path');
    });

    it('should remove HTML from URLs', () => {
      const dirty = 'https://example.com/<script>alert("XSS")</script>';
      const clean = sanitizeUrl(dirty);
      expect(clean).toBe('https://example.com/');
    });
  });

  describe('sanitizeJson', () => {
    it('should return valid JSON', () => {
      const valid = '{"key": "value"}';
      const clean = sanitizeJson(valid);
      expect(() => JSON.parse(clean)).not.toThrow();
      expect(JSON.parse(clean)).toEqual({ key: 'value' });
    });

    it('should return empty object for invalid JSON', () => {
      const invalid = 'not json';
      const clean = sanitizeJson(invalid);
      expect(clean).toBe('{}');
    });

    it('should preserve complex JSON structures', () => {
      const complex = JSON.stringify({
        nested: { key: 'value' },
        array: [1, 2, 3],
      });
      const clean = sanitizeJson(complex);
      expect(JSON.parse(clean)).toEqual(JSON.parse(complex));
    });
  });

  describe('createSafeHtml', () => {
    it('should return object with __html property', () => {
      const html = '<p>Hello world</p>';
      const safe = createSafeHtml(html);
      expect(safe).toHaveProperty('__html');
      expect(safe.__html).toBe(html);
    });

    it('should sanitize content before creating safe HTML', () => {
      const dirty = '<p>Hello</p><script>alert("XSS")</script>';
      const safe = createSafeHtml(dirty);
      expect(safe.__html).toBe('<p>Hello</p>');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase email addresses', () => {
      const email = 'TEST@EXAMPLE.COM';
      const clean = sanitizeEmail(email);
      expect(clean).toBe('test@example.com');
    });

    it('should reject invalid email formats', () => {
      expect(sanitizeEmail('not-an-email')).toBe('');
      expect(sanitizeEmail('missing@domain')).toBe('');
    });

    it('should sanitize and validate email', () => {
      const dirty = '<script>test@example.com</script>';
      const clean = sanitizeEmail(dirty);
      expect(clean).toBe('');
    });

    it('should enforce length limits', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const clean = sanitizeEmail(longEmail);
      expect(clean.length).toBeLessThanOrEqual(INPUT_LIMITS.email);
    });
  });

  describe('sanitizeSlug', () => {
    it('should convert to lowercase', () => {
      const slug = 'MySlug';
      const clean = sanitizeSlug(slug);
      expect(clean).toBe('myslug');
    });

    it('should replace spaces with hyphens', () => {
      const slug = 'my slug name';
      const clean = sanitizeSlug(slug);
      expect(clean).toBe('my-slug-name');
    });

    it('should remove special characters', () => {
      const slug = 'my@slug#name!';
      const clean = sanitizeSlug(slug);
      expect(clean).toBe('my-slug-name');
    });

    it('should collapse multiple hyphens', () => {
      const slug = 'my---slug';
      const clean = sanitizeSlug(slug);
      expect(clean).toBe('my-slug');
    });

    it('should trim hyphens from start and end', () => {
      const slug = '-my-slug-';
      const clean = sanitizeSlug(slug);
      expect(clean).toBe('my-slug');
    });

    it('should enforce length limits', () => {
      const longSlug = 'a'.repeat(100);
      const clean = sanitizeSlug(longSlug);
      expect(clean.length).toBeLessThanOrEqual(INPUT_LIMITS.accountSlug);
    });
  });

  describe('INPUT_LIMITS', () => {
    it('should have reasonable limits defined', () => {
      expect(INPUT_LIMITS.username).toBeLessThanOrEqual(100);
      expect(INPUT_LIMITS.email).toBeLessThanOrEqual(255);
      expect(INPUT_LIMITS.password).toBeLessThanOrEqual(128);
      expect(INPUT_LIMITS.url).toBeLessThanOrEqual(2048);
      expect(INPUT_LIMITS.richText).toBeGreaterThan(INPUT_LIMITS.longText);
    });
  });
});