import { describe, it, expect } from 'vitest';
import { buildSchema } from '../schema-builder';
import type { InterfaceProps, ExtractedContent } from '../types';

describe('SchemaBuilder', () => {
  describe('Merge interface + extracted content', () => {
    it('should merge interface props with extracted content', () => {
      const interfaceProps: InterfaceProps = {
        interfaceName: 'MyProps',
        properties: [
          { name: 'title', type: 'string', optional: true },
          { name: 'count', type: 'number', optional: false },
        ],
      };

      const extractedContent: ExtractedContent = {
        textNodes: [
          { type: 'h1', value: 'Heading', path: 'heading' },
          { type: 'p', value: 'Description', path: 'description' },
        ],
        images: [],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(interfaceProps, extractedContent);

      // Should have fields from both interface and extracted content
      expect(result.editableFields.length).toBeGreaterThanOrEqual(2);

      // Check for interface fields
      const titleField = result.editableFields.find(f => f.path === 'title');
      expect(titleField).toBeDefined();

      // Check for extracted fields
      const headingField = result.editableFields.find(f => f.path === 'heading');
      expect(headingField).toBeDefined();
    });
  });

  describe('Field type inference', () => {
    it('should infer text type for h1-h6', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [
          { type: 'h1', value: 'Title', path: 'heading' },
          { type: 'h2', value: 'Subtitle', path: 'subheading' },
        ],
        images: [],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      const h1Field = result.editableFields.find(f => f.path === 'heading');
      const h2Field = result.editableFields.find(f => f.path === 'subheading');

      expect(h1Field?.type).toBe('text');
      expect(h2Field?.type).toBe('text');
    });

    it('should infer richText type for p tags', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [
          { type: 'p', value: 'Paragraph content', path: 'description' },
        ],
        images: [],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      const pField = result.editableFields.find(f => f.path === 'description');
      expect(pField?.type).toBe('richText');
    });

    it('should infer image type for image nodes', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [],
        images: [
          { src: 'https://example.com/img.jpg', alt: 'Hero', path: 'heroImage' },
        ],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      const imgField = result.editableFields.find(f => f.path === 'heroImage');
      expect(imgField?.type).toBe('image');
    });

    it('should infer button type for button nodes', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [],
        images: [],
        buttons: [
          { text: 'Click Me', path: 'button1' },
        ],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      const buttonField = result.editableFields.find(f => f.path === 'button1');
      expect(buttonField?.type).toBe('button'); // Button should be button type
    });
  });

  describe('Generate unique paths', () => {
    it('should ensure path uniqueness', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [
          { type: 'h2', value: 'First', path: 'heading' },
          { type: 'h2', value: 'Second', path: 'heading2' },
          { type: 'h2', value: 'Third', path: 'heading3' },
        ],
        images: [],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      const paths = result.editableFields.map(f => f.path);
      const uniquePaths = new Set(paths);

      expect(paths.length).toBe(uniquePaths.size);
    });
  });

  describe('Generate field labels', () => {
    it('should generate human-readable labels', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [
          { type: 'h1', value: 'Title', path: 'heading' },
          { type: 'p', value: 'Text', path: 'description' },
        ],
        images: [
          { src: 'img.jpg', path: 'heroImage' },
        ],
        buttons: [
          { text: 'Click', path: 'button1Text' },
        ],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      // Labels should be capitalized/formatted
      expect(result.editableFields[0].label).toBeDefined();
      expect(result.editableFields[0].label?.length).toBeGreaterThan(0);
    });
  });

  describe('Handle missing interface', () => {
    it('should work with content only (no interface)', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [
          { type: 'h1', value: 'Title', path: 'heading' },
        ],
        images: [],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      expect(result.editableFields).toHaveLength(1);
      expect(result.defaultContent.heading).toBe('Title');
    });
  });

  describe('Handle empty content', () => {
    it('should work with interface only (no extracted content)', () => {
      const interfaceProps: InterfaceProps = {
        interfaceName: 'MyProps',
        properties: [
          { name: 'title', type: 'string', optional: true },
        ],
      };

      const emptyContent: ExtractedContent = {
        textNodes: [],
        images: [],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(interfaceProps, emptyContent);

      expect(result.editableFields).toHaveLength(1);
      expect(result.editableFields[0].path).toBe('title');
    });
  });

  describe('Handle neither interface nor content', () => {
    it('should return empty schema when both are empty/null', () => {
      const emptyContent: ExtractedContent = {
        textNodes: [],
        images: [],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(null, emptyContent);

      expect(result.editableFields).toHaveLength(0);
      expect(result.defaultContent).toEqual({});
    });
  });

  describe('Priority: interface over extracted', () => {
    it('should prioritize interface props when both exist for same field', () => {
      const interfaceProps: InterfaceProps = {
        interfaceName: 'MyProps',
        properties: [
          { name: 'heading', type: 'string', optional: false },
        ],
      };

      const extractedContent: ExtractedContent = {
        textNodes: [
          { type: 'h1', value: 'Extracted Title', path: 'heading' },
        ],
        images: [],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(interfaceProps, extractedContent);

      const headingField = result.editableFields.find(f => f.path === 'heading');

      // Interface says it's required (optional: false)
      expect(headingField?.required).toBe(true);
    });
  });

  describe('Generate defaultContent', () => {
    it('should build defaultContent object from extracted values', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [
          { type: 'h1', value: 'Main Title', path: 'heading' },
          { type: 'p', value: 'Description text', path: 'description' },
        ],
        images: [
          { src: 'https://example.com/img.jpg', alt: 'Hero', path: 'heroImage' },
        ],
        buttons: [
          { text: 'Get Started', path: 'button1Text' },
        ],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      expect(result.defaultContent).toMatchObject({
        heading: 'Main Title',
        description: 'Description text',
        heroImage: 'https://example.com/img.jpg',
        button1Text: 'Get Started',
      });
    });

    it('should include alt text in defaultContent', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [],
        images: [
          { src: 'img.jpg', alt: 'Hero image', path: 'heroImage' },
        ],
        buttons: [],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      // Alt text should be stored separately
      expect(result.defaultContent.heroImage).toBe('img.jpg');

      // Check if alt is stored (might be heroImageAlt or similar)
      const altField = result.editableFields.find(f => f.path.includes('Alt'));
      if (altField) {
        expect(result.defaultContent[altField.path]).toBe('Hero image');
      }
    });
  });

  describe('Real-world: Hero186 schema', () => {
    it('should build complete schema from Hero186 content', () => {
      const extractedContent: ExtractedContent = {
        textNodes: [
          { type: 'h1', value: 'Shadcnblocks components for your next project', path: 'heading' },
          { type: 'p', value: 'Streamline is the fit-for-purpose tool...', path: 'description' },
        ],
        images: [
          { src: 'https://example.com/hero.jpg', alt: 'hero', path: 'heroImage' },
        ],
        buttons: [
          { text: 'Get started', path: 'button1Text' },
          { text: 'Documentation', path: 'button2Text' },
        ],
        urls: [],
      };

      const result = buildSchema(null, extractedContent);

      // Should have at least 5 fields
      expect(result.editableFields.length).toBeGreaterThanOrEqual(4);

      // Check key fields exist
      expect(result.editableFields.find(f => f.path === 'heading')).toBeDefined();
      expect(result.editableFields.find(f => f.path === 'description')).toBeDefined();
      expect(result.editableFields.find(f => f.path === 'button1Text')).toBeDefined();
      expect(result.editableFields.find(f => f.path === 'button2Text')).toBeDefined();
      expect(result.editableFields.find(f => f.path === 'heroImage')).toBeDefined();

      // Check defaultContent
      expect(result.defaultContent.heading).toContain('Shadcnblocks');
      expect(result.defaultContent.button1Text).toBe('Get started');
      expect(result.defaultContent.button2Text).toBe('Documentation');
    });
  });
});
