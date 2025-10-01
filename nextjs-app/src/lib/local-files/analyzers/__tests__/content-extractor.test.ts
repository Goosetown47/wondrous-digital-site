import { describe, it, expect } from 'vitest';
import { extractContent } from '../content-extractor';

describe('ContentExtractor', () => {
  describe('BUG FIX: Main component detection', () => {
    it('should extract from main exported component ONLY', () => {
      const code = `
        const DashedLine = () => {
          return <div>Helper component</div>;
        };

        const Hero186 = () => {
          return (
            <section>
              <h1>Main Component Title</h1>
              <p>Main component description</p>
            </section>
          );
        };

        export { Hero186 };
      `;

      const result = extractContent(code, 'Hero186');

      // Should extract from Hero186, NOT DashedLine
      expect(result.textNodes).toHaveLength(2);
      expect(result.textNodes[0].value).toBe('Main Component Title');
      expect(result.textNodes[1].value).toBe('Main component description');
    });

    it('should ignore helper components completely', () => {
      const code = `
        const DashedLine = ({ orientation, className }: DashedLineProps) => {
          return <div className={className}>Dashed line</div>;
        };

        const Hero186 = () => {
          return <h1>Hero Title</h1>;
        };

        export { Hero186 };
      `;

      const result = extractContent(code, 'Hero186');

      // Should NOT find "Dashed line" text from helper
      expect(result.textNodes).toHaveLength(1);
      expect(result.textNodes[0].value).toBe('Hero Title');
    });

    it('should handle multiple components in file - extract only specified one', () => {
      const code = `
        const Component1 = () => <div>First</div>;
        const Component2 = () => <div>Second</div>;
        const Hero186 = () => <div>Target</div>;

        export { Hero186 };
      `;

      const result = extractContent(code, 'Hero186');

      expect(result.textNodes).toHaveLength(1);
      expect(result.textNodes[0].value).toBe('Target');
    });
  });

  describe('Text node extraction', () => {
    it('should extract h1 text', () => {
      const code = `
        const Hero = () => <h1>Heading One</h1>;
        export { Hero };
      `;

      const result = extractContent(code, 'Hero');

      expect(result.textNodes).toHaveLength(1);
      expect(result.textNodes[0]).toMatchObject({
        type: 'h1',
        value: 'Heading One',
        path: expect.any(String),
      });
    });

    it('should extract all heading levels (h1-h6)', () => {
      const code = `
        const Component = () => (
          <div>
            <h1>H1</h1>
            <h2>H2</h2>
            <h3>H3</h3>
            <h4>H4</h4>
            <h5>H5</h5>
            <h6>H6</h6>
          </div>
        );
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.textNodes).toHaveLength(6);
      expect(result.textNodes[0].type).toBe('h1');
      expect(result.textNodes[1].type).toBe('h2');
      expect(result.textNodes[2].type).toBe('h3');
      expect(result.textNodes[5].type).toBe('h6');
    });

    it('should extract paragraph text', () => {
      const code = `
        const Component = () => <p>Paragraph text here</p>;
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.textNodes).toHaveLength(1);
      expect(result.textNodes[0]).toMatchObject({
        type: 'p',
        value: 'Paragraph text here',
      });
    });

    it('should handle multiline text correctly', () => {
      const code = `
        const Component = () => (
          <p>
            This is a longer paragraph
            that spans multiple lines
            in the source code
          </p>
        );
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.textNodes).toHaveLength(1);
      // Should normalize whitespace
      expect(result.textNodes[0].value).toContain('longer paragraph');
    });
  });

  describe('Image extraction', () => {
    it('should extract image src', () => {
      const code = `
        const Component = () => <img src="https://example.com/image.jpg" />;
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toMatchObject({
        src: 'https://example.com/image.jpg',
        path: expect.any(String),
      });
    });

    it('should extract image alt text', () => {
      const code = `
        const Component = () => (
          <img src="https://example.com/pic.jpg" alt="Hero image" />
        );
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toMatchObject({
        src: 'https://example.com/pic.jpg',
        alt: 'Hero image',
      });
    });

    it('should handle multiple images', () => {
      const code = `
        const Component = () => (
          <div>
            <img src="img1.jpg" alt="First" />
            <img src="img2.jpg" alt="Second" />
            <img src="img3.jpg" alt="Third" />
          </div>
        );
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.images).toHaveLength(3);
    });
  });

  describe('Button extraction', () => {
    it('should extract button text', () => {
      const code = `
        const Component = () => <Button>Click Me</Button>;
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.buttons).toHaveLength(1);
      expect(result.buttons[0]).toMatchObject({
        text: 'Click Me',
        path: expect.any(String),
      });
    });

    it('should extract multiple buttons', () => {
      const code = `
        const Component = () => (
          <div>
            <Button>Get Started</Button>
            <Button>Learn More</Button>
          </div>
        );
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.buttons).toHaveLength(2);
      expect(result.buttons[0].text).toBe('Get Started');
      expect(result.buttons[1].text).toBe('Learn More');
    });

    it('should handle button inside link', () => {
      const code = `
        const Component = () => (
          <a href="#">
            <Button>Documentation</Button>
          </a>
        );
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.buttons).toHaveLength(1);
      expect(result.buttons[0].text).toBe('Documentation');
    });
  });

  describe('URL extraction', () => {
    it('should extract href URLs', () => {
      const code = `
        const Component = () => <a href="https://example.com">Link</a>;
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.urls).toContain('https://example.com');
    });
  });

  describe('Path generation', () => {
    it('should generate unique paths for multiple similar elements', () => {
      const code = `
        const Component = () => (
          <div>
            <h2>First heading</h2>
            <h2>Second heading</h2>
            <h2>Third heading</h2>
          </div>
        );
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.textNodes).toHaveLength(3);
      // Paths should be unique
      const paths = result.textNodes.map(node => node.path);
      expect(new Set(paths).size).toBe(3);
    });

    it('should generate semantic path names', () => {
      const code = `
        const Component = () => (
          <div>
            <h1>Title</h1>
            <p>Description</p>
            <Button>Action</Button>
          </div>
        );
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      // Should have paths like "heading", "description", "button1Text"
      expect(result.textNodes[0].path).toMatch(/heading|title/i);
      expect(result.textNodes[1].path).toMatch(/description|paragraph/i);
      expect(result.buttons[0].path).toMatch(/button/i);
    });
  });

  describe('Edge cases', () => {
    it('should handle component with no hardcoded content', () => {
      const code = `
        const Component = ({ title }: { title: string }) => {
          return <h1>{title}</h1>;
        };
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      // No hardcoded text, should return empty arrays
      expect(result.textNodes).toHaveLength(0);
      expect(result.images).toHaveLength(0);
      expect(result.buttons).toHaveLength(0);
    });

    it('should handle malformed JSX gracefully', () => {
      const code = `
        const Component = () => <div>unclosed div;
        export { Component };
      `;

      // Should not throw, either returns empty or handles gracefully
      expect(() => extractContent(code, 'Component')).not.toThrow();
    });

    it('should handle empty component', () => {
      const code = `
        const Component = () => null;
        export { Component };
      `;

      const result = extractContent(code, 'Component');

      expect(result.textNodes).toHaveLength(0);
      expect(result.images).toHaveLength(0);
      expect(result.buttons).toHaveLength(0);
    });
  });

  describe('Real-world: Hero186 component', () => {
    it('should extract all content from Hero186 with helper components', () => {
      const code = `
        interface DashedLineProps {
          orientation?: 'horizontal' | 'vertical';
          className?: string;
        }

        const DashedLine = ({ orientation, className }: DashedLineProps) => {
          return <div className={className}>Dashed line content</div>;
        };

        const Hero186 = () => {
          return (
            <section>
              <h1>Shadcnblocks components for your next project</h1>
              <p>Streamline is the fit-for-purpose tool for planning and building modern software products.</p>
              <Button>Get started</Button>
              <Button>Documentation</Button>
              <img src="https://example.com/hero.jpg" alt="hero" />
            </section>
          );
        };

        export { Hero186 };
      `;

      const result = extractContent(code, 'Hero186');

      // Should extract from Hero186 only, NOT DashedLine
      expect(result.textNodes.length).toBeGreaterThanOrEqual(2); // h1 + p
      expect(result.buttons).toHaveLength(2);
      expect(result.images).toHaveLength(1);

      // Verify it's Hero186 content, not DashedLine
      const allText = result.textNodes.map(n => n.value).join(' ');
      expect(allText).toContain('Shadcnblocks');
      expect(allText).not.toContain('Dashed line content');
    });
  });
});
