import { describe, it, expect } from 'vitest';
import { analyzeInterface } from '../interface-analyzer';

describe('InterfaceAnalyzer', () => {
  describe('Component with TypeScript interface', () => {
    it('should return interface props when interface exists', () => {
      const code = `
        interface Hero186Props {
          heading: string;
          description?: string;
          count: number;
        }

        const Hero186 = ({ heading, description, count }: Hero186Props) => {
          return <div>{heading}</div>;
        };
      `;

      const result = analyzeInterface(code, 'Hero186');

      expect(result).not.toBeNull();
      expect(result?.interfaceName).toBe('Hero186Props');
      expect(result?.properties).toHaveLength(3);
      expect(result?.properties[0]).toMatchObject({
        name: 'heading',
        type: 'string',
        optional: false,
      });
      expect(result?.properties[1]).toMatchObject({
        name: 'description',
        type: 'string',
        optional: true,
      });
      expect(result?.properties[2]).toMatchObject({
        name: 'count',
        type: 'number',
        optional: false,
      });
    });

    it('should handle interface with optional props', () => {
      const code = `
        interface MyComponentProps {
          required: string;
          optional?: boolean;
        }
      `;

      const result = analyzeInterface(code, 'MyComponent');

      expect(result).not.toBeNull();
      expect(result?.properties).toHaveLength(2);
      expect(result?.properties[0].optional).toBe(false);
      expect(result?.properties[1].optional).toBe(true);
    });
  });

  describe('Component without TypeScript interface', () => {
    it('should return null when no interface exists', () => {
      const code = `
        const SimpleComponent = () => {
          return <div>Hello</div>;
        };
      `;

      const result = analyzeInterface(code, 'SimpleComponent');

      expect(result).toBeNull();
    });
  });

  describe('Multiple interfaces in file', () => {
    it('should return correct interface matching component name', () => {
      const code = `
        interface DashedLineProps {
          orientation: string;
          className?: string;
        }

        interface Hero186Props {
          heading: string;
          description: string;
        }

        const DashedLine = ({ orientation }: DashedLineProps) => <div />;
        const Hero186 = ({ heading }: Hero186Props) => <div />;
      `;

      const result = analyzeInterface(code, 'Hero186');

      expect(result).not.toBeNull();
      expect(result?.interfaceName).toBe('Hero186Props');
      expect(result?.properties).toHaveLength(2);
      expect(result?.properties[0].name).toBe('heading');
    });

    it('should ignore helper component interfaces', () => {
      const code = `
        interface DashedLineProps {
          orientation: string;
        }

        const Hero186 = () => <div />;
      `;

      const result = analyzeInterface(code, 'Hero186');

      expect(result).toBeNull();
    });
  });

  describe('Malformed code', () => {
    it('should handle malformed interface gracefully', () => {
      const code = `
        interface BrokenProps {
          name string // missing colon
        }
      `;

      const result = analyzeInterface(code, 'Broken');

      // Should either return null or handle gracefully
      expect(result).toBeNull();
    });

    it('should handle invalid syntax gracefully', () => {
      const code = `this is not valid TypeScript`;

      expect(() => analyzeInterface(code, 'Invalid')).not.toThrow();
    });
  });

  describe('Complex types', () => {
    it('should handle union types', () => {
      const code = `
        interface MyProps {
          variant: 'primary' | 'secondary' | 'outline';
        }
      `;

      const result = analyzeInterface(code, 'My');

      expect(result).not.toBeNull();
      expect(result?.properties[0].name).toBe('variant');
      // Type might be represented as string or union, just check it exists
      expect(result?.properties[0].type).toBeDefined();
    });

    it('should handle object types', () => {
      const code = `
        interface MyProps {
          button: { text: string; url: string };
        }
      `;

      const result = analyzeInterface(code, 'My');

      expect(result).not.toBeNull();
      expect(result?.properties[0].name).toBe('button');
    });

    it('should handle array types', () => {
      const code = `
        interface MyProps {
          items: string[];
          counts: Array<number>;
        }
      `;

      const result = analyzeInterface(code, 'My');

      expect(result).not.toBeNull();
      expect(result?.properties).toHaveLength(2);
    });
  });
});
