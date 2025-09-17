import { describe, it, expect, vi } from 'vitest';
import {
  detectComponentType,
  parseTypeScriptInterface,
  extractDefaultProps,
  generateEditableConfig,
  validateComponent,
  importComponent,
  bulkImportComponents,
  type ParsedInterface
} from '../component-import-pipeline';

describe('Component Import Pipeline', () => {
  describe('detectComponentType', () => {
    it('should detect section components from folder structure', () => {
      const code = `export function HeroSection() { return <div>Hero</div>; }`;
      const filePath = '/components/sections/hero-section.tsx';

      const type = detectComponentType(code, filePath);

      expect(type).toBe('section');
    });

    it('should detect navigation components', () => {
      const code = `export function Navbar() { return <nav>Nav</nav>; }`;
      const filePath = '/components/navigation/navbar.tsx';

      const type = detectComponentType(code, filePath);

      expect(type).toBe('navigation');
    });

    it('should detect layout components', () => {
      const code = `export function Footer() { return <footer>Footer</footer>; }`;
      const filePath = '/components/layout/footer.tsx';

      const type = detectComponentType(code, filePath);

      expect(type).toBe('layout');
    });

    it('should detect from component name patterns', () => {
      const code = `export function TestimonialsSection() { return <div>Testimonials</div>; }`;
      const filePath = '/components/ui/testimonials.tsx';

      const type = detectComponentType(code, filePath);

      expect(type).toBe('section');
    });

    it('should default to component for unknown types', () => {
      const code = `export function SomeWidget() { return <div>Widget</div>; }`;
      const filePath = '/components/widgets/some-widget.tsx';

      const type = detectComponentType(code, filePath);

      expect(type).toBe('component');
    });
  });

  describe('parseTypeScriptInterface', () => {
    it('should parse simple interface', () => {
      const code = `
        interface HeroProps {
          title: string;
          subtitle?: string;
          image: string | null;
          showButton: boolean;
        }

        export function Hero({ title, subtitle, image, showButton }: HeroProps) {
          return <div>{title}</div>;
        }
      `;

      const parsed = parseTypeScriptInterface(code);

      expect(parsed).toEqual({
        name: 'HeroProps',
        properties: [
          { name: 'title', type: 'string', required: true },
          { name: 'subtitle', type: 'string', required: false },
          { name: 'image', type: 'string | null', required: true },
          { name: 'showButton', type: 'boolean', required: true }
        ]
      });
    });

    it('should parse type alias', () => {
      const code = `
        type ButtonProps = {
          text: string;
          onClick?: () => void;
          variant: 'primary' | 'secondary';
        };
      `;

      const parsed = parseTypeScriptInterface(code);

      expect(parsed).toEqual({
        name: 'ButtonProps',
        properties: [
          { name: 'text', type: 'string', required: true },
          { name: 'onClick', type: '() => void', required: false },
          { name: 'variant', type: "'primary' | 'secondary'", required: true }
        ]
      });
    });

    it('should handle extended interfaces', () => {
      const code = `
        interface BaseProps {
          id: string;
          className?: string;
        }

        interface CardProps extends BaseProps {
          title: string;
          content: string;
        }
      `;

      const parsed = parseTypeScriptInterface(code);

      expect(parsed?.properties).toContainEqual(
        { name: 'title', type: 'string', required: true }
      );
    });

    it('should return null for no interface', () => {
      const code = `export function Component() { return <div>No props</div>; }`;

      const parsed = parseTypeScriptInterface(code);

      expect(parsed).toBeNull();
    });
  });

  describe('extractDefaultProps', () => {
    it('should extract default props from component', () => {
      const code = `
        export function Hero({
          title = "Welcome",
          subtitle = "Build amazing things",
          showCTA = true
        }) {
          return <div>{title}</div>;
        }
      `;

      const defaults = extractDefaultProps(code);

      expect(defaults).toEqual({
        title: 'Welcome',
        subtitle: 'Build amazing things',
        showCTA: true
      });
    });

    it('should extract from defaultProps', () => {
      const code = `
        function Button({ text, variant }) {
          return <button>{text}</button>;
        }

        Button.defaultProps = {
          text: 'Click me',
          variant: 'primary'
        };
      `;

      const defaults = extractDefaultProps(code);

      expect(defaults).toEqual({
        text: 'Click me',
        variant: 'primary'
      });
    });

    it('should handle complex default values', () => {
      const code = `
        export function Card({
          padding = { top: 16, bottom: 16 },
          items = ['one', 'two', 'three'],
          config = null
        }) {
          return <div>Card</div>;
        }
      `;

      const defaults = extractDefaultProps(code);

      expect(defaults).toEqual({
        padding: { top: 16, bottom: 16 },
        items: ['one', 'two', 'three'],
        config: null
      });
    });
  });

  describe('generateEditableConfig', () => {
    it('should generate config from interface', () => {
      const parsedInterface: ParsedInterface = {
        name: 'HeroProps',
        properties: [
          { name: 'heading', type: 'string', required: true },
          { name: 'description', type: 'string', required: false },
          { name: 'imageUrl', type: 'string', required: false },
          { name: 'buttonText', type: 'string', required: false }
        ]
      };

      const config = generateEditableConfig(parsedInterface);

      expect(config).toHaveLength(4);
      expect(config[0]).toEqual({
        path: 'heading',
        type: 'text',
        label: 'Heading',
        required: true
      });
      expect(config[1].type).toBe('richText');
      expect(config[2].type).toBe('image');
      expect(config[3].type).toBe('text');
    });

    it('should handle nested properties', () => {
      const parsedInterface: ParsedInterface = {
        name: 'NavProps',
        properties: [
          { name: 'logo.src', type: 'string', required: true },
          { name: 'logo.alt', type: 'string', required: false },
          { name: 'menu.items', type: 'array', required: true }
        ]
      };

      const config = generateEditableConfig(parsedInterface);

      expect(config[0].path).toBe('logo.src');
      expect(config[0].type).toBe('image');
      expect(config[2].type).toBe('array');
    });

    it('should handle boolean and number types', () => {
      const parsedInterface: ParsedInterface = {
        name: 'SettingsProps',
        properties: [
          { name: 'enabled', type: 'boolean', required: true },
          { name: 'maxItems', type: 'number', required: false },
          { name: 'theme', type: "'light' | 'dark'", required: true }
        ]
      };

      const config = generateEditableConfig(parsedInterface);

      expect(config[0].type).toBe('boolean');
      expect(config[1].type).toBe('number');
      expect(config[2].type).toBe('select');
    });
  });

  describe('validateComponent', () => {
    it('should validate a valid component', () => {
      const code = `
        import React from 'react';

        interface HeroProps {
          title: string;
        }

        export function Hero({ title }: HeroProps) {
          return <h1>{title}</h1>;
        }
      `;

      const result = validateComponent(code, 'Hero');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect missing export', () => {
      const code = `
        function InternalComponent() {
          return <div>Not exported</div>;
        }
      `;

      const result = validateComponent(code, 'InternalComponent');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Component is not exported');
    });

    it('should detect missing React import', () => {
      const code = `
        export function Component() {
          return <div>No React import</div>;
        }
      `;

      const result = validateComponent(code, 'Component');

      expect(result.warnings).toContain('Missing React import');
    });

    it('should detect class components', () => {
      const code = `
        import React from 'react';

        export class OldComponent extends React.Component {
          render() {
            return <div>Class component</div>;
          }
        }
      `;

      const result = validateComponent(code, 'OldComponent');

      expect(result.warnings).toContain('Class components are not recommended');
    });

    it('should validate prop types', () => {
      const code = `
        import React from 'react';

        interface Props {
          items: any;
        }

        export function List({ items }: Props) {
          return <ul>{items}</ul>;
        }
      `;

      const result = validateComponent(code, 'List');

      expect(result.warnings).toContain('Prop "items" uses "any" type');
    });
  });

  describe('importComponent', () => {
    it('should import a valid component', async () => {
      const code = `
        import React from 'react';

        interface TestProps {
          title: string;
          subtitle?: string;
        }

        export function TestComponent({ title, subtitle = "Default" }: TestProps) {
          return (
            <div>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
          );
        }
      `;

      const result = await importComponent({
        name: 'TestComponent',
        code,
        path: '/components/test.tsx'
      });

      expect(result.success).toBe(true);
      expect(result.component).toBeDefined();
      expect(result.component?.name).toBe('TestComponent');
      expect(result.component?.type).toBe('component');
      expect(result.component?.editableFields).toHaveLength(2);
      expect(result.component?.defaultContent).toEqual({
        title: '',
        subtitle: 'Default'
      });
    });

    it('should handle import errors', async () => {
      const code = `
        function BrokenComponent() {
          return <div>{undefinedVariable}</div>;
        }
      `;

      const result = await importComponent({
        name: 'BrokenComponent',
        code,
        path: '/components/broken.tsx'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Component is not exported');
    });

    it('should auto-detect component name', async () => {
      const code = `
        import React from 'react';

        export function AutoDetectedComponent() {
          return <div>Auto</div>;
        }

        export default AutoDetectedComponent;
      `;

      const result = await importComponent({
        code,
        path: '/components/auto.tsx'
      });

      expect(result.success).toBe(true);
      expect(result.component?.name).toBe('AutoDetectedComponent');
    });
  });

  describe('bulkImportComponents', () => {
    it('should import multiple components', async () => {
      const components = [
        {
          name: 'Component1',
          code: 'export function Component1() { return <div>1</div>; }',
          path: '/components/c1.tsx'
        },
        {
          name: 'Component2',
          code: 'export function Component2() { return <div>2</div>; }',
          path: '/components/c2.tsx'
        }
      ];

      const results = await bulkImportComponents(components);

      expect(results).toHaveLength(2);
      expect(results.filter(r => r.success)).toHaveLength(2);
    });

    it('should continue on error', async () => {
      const components = [
        {
          name: 'GoodComponent',
          code: 'export function GoodComponent() { return <div>Good</div>; }',
          path: '/components/good.tsx'
        },
        {
          name: 'BadComponent',
          code: 'function BadComponent() { broken code }',
          path: '/components/bad.tsx'
        },
        {
          name: 'AnotherGood',
          code: 'export function AnotherGood() { return <div>Also good</div>; }',
          path: '/components/another.tsx'
        }
      ];

      const results = await bulkImportComponents(components);

      expect(results).toHaveLength(3);
      expect(results.filter(r => r.success)).toHaveLength(2);
      expect(results.filter(r => !r.success)).toHaveLength(1);
    });

    it('should handle progress callback', async () => {
      const components = [
        {
          name: 'Test1',
          code: 'export function Test1() { return <div>1</div>; }',
          path: '/components/t1.tsx'
        },
        {
          name: 'Test2',
          code: 'export function Test2() { return <div>2</div>; }',
          path: '/components/t2.tsx'
        }
      ];

      const progressCallback = vi.fn();

      await bulkImportComponents(components, progressCallback);

      expect(progressCallback).toHaveBeenCalledTimes(2);
      expect(progressCallback).toHaveBeenCalledWith(1, 2, 'Test1');
      expect(progressCallback).toHaveBeenCalledWith(2, 2, 'Test2');
    });
  });
});