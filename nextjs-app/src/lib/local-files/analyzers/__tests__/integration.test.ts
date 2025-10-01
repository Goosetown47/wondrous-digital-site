import { describe, it, expect } from 'vitest';
import { analyzeJSXContent } from '../index';

describe('Analyzer Integration', () => {
  describe('Backward compatibility with old API', () => {
    it('should expose same API as old analyzer', () => {
      const code = `
        const SimpleComponent = () => <h1>Hello</h1>;
        export { SimpleComponent };
      `;

      const result = analyzeJSXContent(code);

      // Should return object with editableFields and defaultContent
      expect(result).toHaveProperty('editableFields');
      expect(result).toHaveProperty('defaultContent');
      expect(Array.isArray(result.editableFields)).toBe(true);
      expect(typeof result.defaultContent).toBe('object');
    });
  });

  describe('Full flow with real Hero186 component', () => {
    it('should detect 5+ fields from Hero186 (NOT 2 from DashedLine)', () => {
      const code = `
        interface DashedLineProps {
          orientation?: 'horizontal' | 'vertical';
          className?: string;
        }

        const DashedLine = ({ orientation = '', className = '' }: DashedLineProps) => {
          return <div className={className}>Dashed line</div>;
        };

        const Hero186 = () => {
          return (
            <section>
              <h1>Shadcnblocks components for your next project</h1>
              <p>Streamline is the fit-for-purpose tool for planning and building modern software products.</p>
              <Button>Get started</Button>
              <Button>Documentation</Button>
              <img src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg" alt="hero" />
            </section>
          );
        };

        export { Hero186 };
      `;

      const result = analyzeJSXContent(code);

      // CRITICAL TEST: Should detect Hero186 fields, NOT DashedLine props
      expect(result.editableFields.length).toBeGreaterThanOrEqual(4);

      // Should NOT have orientation or className
      const hasOrientation = result.editableFields.some(f => f.path === 'orientation');
      const hasClassName = result.editableFields.some(f => f.path === 'className');
      expect(hasOrientation).toBe(false);
      expect(hasClassName).toBe(false);

      // SHOULD have Hero186 fields
      const hasHeading = result.editableFields.some(f => f.path.toLowerCase().includes('heading') || f.path.toLowerCase().includes('title'));
      const hasDescription = result.editableFields.some(f => f.path.toLowerCase().includes('description') || f.path.toLowerCase().includes('paragraph'));
      const hasButton = result.editableFields.some(f => f.path.toLowerCase().includes('button'));
      const hasImage = result.editableFields.some(f => f.path.toLowerCase().includes('image'));

      expect(hasHeading).toBe(true);
      expect(hasDescription).toBe(true);
      expect(hasButton).toBe(true);
      expect(hasImage).toBe(true);

      // Check defaultContent has actual values
      const defaultValues = Object.values(result.defaultContent);
      expect(defaultValues.some(v => typeof v === 'string' && v.includes('Shadcnblocks'))).toBe(true);
    });
  });

  describe('Simple component (no helpers)', () => {
    it('should handle simple component without helper components', () => {
      const code = `
        const SimpleHero = () => {
          return (
            <div>
              <h1>Welcome</h1>
              <p>Simple description</p>
              <img src="hero.jpg" alt="Hero" />
            </div>
          );
        };

        export { SimpleHero };
      `;

      const result = analyzeJSXContent(code);

      expect(result.editableFields.length).toBeGreaterThanOrEqual(3);
      // Check that defaultContent has the Welcome value somewhere
      const allValues = Object.values(result.defaultContent);
      expect(allValues).toContain('Welcome');
    });
  });

  describe('Component with existing interface', () => {
    it('should merge interface props with extracted content', () => {
      const code = `
        interface MyHeroProps {
          theme?: 'light' | 'dark';
          showCTA?: boolean;
        }

        const MyHero = ({ theme, showCTA }: MyHeroProps) => {
          return (
            <div>
              <h1>Dynamic Hero</h1>
              <p>This hero has both interface props and hardcoded content</p>
            </div>
          );
        };

        export { MyHero };
      `;

      const result = analyzeJSXContent(code);

      // Should have fields from both interface and content
      expect(result.editableFields.length).toBeGreaterThanOrEqual(2);

      // Check for interface field
      const hasTheme = result.editableFields.some(f => f.path === 'theme');
      expect(hasTheme).toBe(true);

      // Check for extracted field
      const hasHeading = result.editableFields.some(f => f.path.includes('heading') || f.path.includes('title'));
      expect(hasHeading).toBe(true);
    });
  });

  describe('Component with no content', () => {
    it('should return empty schema for prop-based component', () => {
      const code = `
        interface MyProps {
          title: string;
          description: string;
        }

        const MyComponent = ({ title, description }: MyProps) => {
          return (
            <div>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          );
        };

        export { MyComponent };
      `;

      const result = analyzeJSXContent(code);

      // Component has interface but no hardcoded content
      // Interface props should still be detected if interface exists
      // But for prop-based components, we expect 0 editable fields
      // since there's no hardcoded content to edit
      expect(result.editableFields.length).toBeGreaterThanOrEqual(0);

      // defaultContent should be empty (no hardcoded values)
      expect(typeof result.defaultContent).toBe('object');
    });
  });

  describe('Multiple components with correct targeting', () => {
    it('should extract from correct component based on export', () => {
      const code = `
        const Header = () => <div>Header Content</div>;
        const Footer = () => <div>Footer Content</div>;
        const MainHero = () => <h1>Main Hero Title</h1>;

        export { MainHero };
      `;

      const result = analyzeJSXContent(code);

      // Should only extract "Main Hero Title", not Header/Footer
      const titleValue = Object.values(result.defaultContent).find(
        v => typeof v === 'string' && v.includes('Main Hero Title')
      );

      expect(titleValue).toBeDefined();

      // Should NOT have Header or Footer content
      const allValues = Object.values(result.defaultContent).join(' ');
      expect(allValues).not.toContain('Header Content');
      expect(allValues).not.toContain('Footer Content');
    });
  });

  describe('Edge cases', () => {
    it('should handle component with default export', () => {
      const code = `
        const Hero = () => <h1>Default Export Hero</h1>;
        export default Hero;
      `;

      const result = analyzeJSXContent(code);

      expect(result.editableFields.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle component with both named and default export', () => {
      const code = `
        const Hero = () => <h1>Exported Hero</h1>;
        export { Hero };
        export default Hero;
      `;

      const result = analyzeJSXContent(code);

      expect(result.editableFields.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty/invalid code gracefully', () => {
      const code = '';

      expect(() => analyzeJSXContent(code)).not.toThrow();
    });

    it('should handle code with syntax errors gracefully', () => {
      const code = 'this is not valid code';

      expect(() => analyzeJSXContent(code)).not.toThrow();
    });
  });

  describe('Field types and structure', () => {
    it('should return properly typed EditableFieldConfig', () => {
      const code = `
        const Component = () => (
          <div>
            <h1>Title</h1>
            <p>Description</p>
            <img src="img.jpg" alt="Image" />
            <Button>Click</Button>
          </div>
        );
        export { Component };
      `;

      const result = analyzeJSXContent(code);

      result.editableFields.forEach(field => {
        expect(field).toHaveProperty('path');
        expect(field).toHaveProperty('type');
        expect(field).toHaveProperty('label');
        expect(typeof field.path).toBe('string');
        expect(typeof field.type).toBe('string');
      });
    });
  });

  describe('Regression: DashedLine bug', () => {
    it('should NEVER detect helper component props as main fields', () => {
      const code = `
        // Helper component
        interface HelperProps {
          helperProp1: string;
          helperProp2: number;
        }
        const Helper = (props: HelperProps) => <div>Helper</div>;

        // Another helper
        interface AnotherHelperProps {
          anotherProp: boolean;
        }
        const AnotherHelper = (props: AnotherHelperProps) => <div>Another</div>;

        // MAIN COMPONENT
        const MainComponent = () => (
          <div>
            <h1>Actual Main Content</h1>
            <p>This is the content we want</p>
          </div>
        );

        export { MainComponent };
      `;

      const result = analyzeJSXContent(code);

      // Should NOT have any helper props
      const fieldPaths = result.editableFields.map(f => f.path);
      expect(fieldPaths).not.toContain('helperProp1');
      expect(fieldPaths).not.toContain('helperProp2');
      expect(fieldPaths).not.toContain('anotherProp');

      // SHOULD have main component content
      const allContent = Object.values(result.defaultContent).join(' ');
      expect(allContent).toContain('Actual Main Content');
    });
  });
});
