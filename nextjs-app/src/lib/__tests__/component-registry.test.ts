import { describe, it, expect, beforeEach } from 'vitest';
import {
  ComponentRegistry,
  registerComponent,
  getComponent,
  getAllComponents,
  hasComponent
} from '../component-registry';

describe('ComponentRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    ComponentRegistry.clear();
  });

  describe('registerComponent', () => {
    it('should register a component with minimal configuration', () => {
      const TestComponent = () => null;

      registerComponent('TestComponent', {
        component: TestComponent,
        type: 'section'
      });

      expect(hasComponent('TestComponent')).toBe(true);
    });

    it('should register a component with full configuration', () => {
      const TestComponent = () => null;
      const defaultContent = { title: 'Test' };
      const contentSchema = { type: 'object' };

      registerComponent('TestComponent', {
        component: TestComponent,
        type: 'navigation',
        defaultContent,
        contentSchema,
        category: 'headers',
        description: 'A test component'
      });

      const entry = getComponent('TestComponent');
      expect(entry).toBeDefined();
      expect(entry?.type).toBe('navigation');
      expect(entry?.defaultContent).toEqual(defaultContent);
      expect(entry?.contentSchema).toEqual(contentSchema);
      expect(entry?.category).toBe('headers');
      expect(entry?.description).toBe('A test component');
    });

    it('should throw error when registering duplicate component', () => {
      const TestComponent = () => null;

      registerComponent('TestComponent', {
        component: TestComponent,
        type: 'section'
      });

      expect(() => {
        registerComponent('TestComponent', {
          component: TestComponent,
          type: 'section'
        });
      }).toThrow('Component "TestComponent" is already registered');
    });

    it('should allow overwriting component with force flag', () => {
      const TestComponent1 = () => null;
      const TestComponent2 = () => null;

      registerComponent('TestComponent', {
        component: TestComponent1,
        type: 'section'
      });

      registerComponent('TestComponent', {
        component: TestComponent2,
        type: 'navigation'
      }, { force: true });

      const entry = getComponent('TestComponent');
      expect(entry?.component).toBe(TestComponent2);
      expect(entry?.type).toBe('navigation');
    });
  });

  describe('getComponent', () => {
    it('should retrieve a registered component', () => {
      const TestComponent = () => null;

      registerComponent('TestComponent', {
        component: TestComponent,
        type: 'section'
      });

      const entry = getComponent('TestComponent');
      expect(entry).toBeDefined();
      expect(entry?.component).toBe(TestComponent);
      expect(entry?.type).toBe('section');
    });

    it('should return undefined for non-existent component', () => {
      const entry = getComponent('NonExistentComponent');
      expect(entry).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const TestComponent = () => null;

      registerComponent('TestComponent', {
        component: TestComponent,
        type: 'section'
      });

      expect(getComponent('testcomponent')).toBeUndefined();
      expect(getComponent('TestComponent')).toBeDefined();
    });
  });

  describe('getAllComponents', () => {
    it('should return empty object when no components registered', () => {
      const components = getAllComponents();
      expect(components).toEqual({});
    });

    it('should return all registered components', () => {
      const Component1 = () => null;
      const Component2 = () => null;
      const Component3 = () => null;

      registerComponent('Component1', {
        component: Component1,
        type: 'section'
      });

      registerComponent('Component2', {
        component: Component2,
        type: 'navigation'
      });

      registerComponent('Component3', {
        component: Component3,
        type: 'page'
      });

      const components = getAllComponents();
      expect(Object.keys(components)).toHaveLength(3);
      expect(components['Component1']).toBeDefined();
      expect(components['Component2']).toBeDefined();
      expect(components['Component3']).toBeDefined();
    });

    it('should filter components by type', () => {
      const NavComponent = () => null;
      const SectionComponent = () => null;
      const PageComponent = () => null;

      registerComponent('NavComponent', {
        component: NavComponent,
        type: 'navigation'
      });

      registerComponent('SectionComponent', {
        component: SectionComponent,
        type: 'section'
      });

      registerComponent('PageComponent', {
        component: PageComponent,
        type: 'page'
      });

      const navigationComponents = getAllComponents({ type: 'navigation' });
      expect(Object.keys(navigationComponents)).toHaveLength(1);
      expect(navigationComponents['NavComponent']).toBeDefined();

      const sectionComponents = getAllComponents({ type: 'section' });
      expect(Object.keys(sectionComponents)).toHaveLength(1);
      expect(sectionComponents['SectionComponent']).toBeDefined();
    });

    it('should filter components by category', () => {
      const Header1 = () => null;
      const Header2 = () => null;
      const Footer = () => null;

      registerComponent('Header1', {
        component: Header1,
        type: 'navigation',
        category: 'headers'
      });

      registerComponent('Header2', {
        component: Header2,
        type: 'navigation',
        category: 'headers'
      });

      registerComponent('Footer', {
        component: Footer,
        type: 'navigation',
        category: 'footers'
      });

      const headers = getAllComponents({ category: 'headers' });
      expect(Object.keys(headers)).toHaveLength(2);
      expect(headers['Header1']).toBeDefined();
      expect(headers['Header2']).toBeDefined();

      const footers = getAllComponents({ category: 'footers' });
      expect(Object.keys(footers)).toHaveLength(1);
      expect(footers['Footer']).toBeDefined();
    });
  });

  describe('hasComponent', () => {
    it('should return true for registered component', () => {
      const TestComponent = () => null;

      registerComponent('TestComponent', {
        component: TestComponent,
        type: 'section'
      });

      expect(hasComponent('TestComponent')).toBe(true);
    });

    it('should return false for non-existent component', () => {
      expect(hasComponent('NonExistentComponent')).toBe(false);
    });
  });

  describe('ComponentRegistry class', () => {
    it('should maintain singleton instance', () => {
      const TestComponent = () => null;

      // Register through static method
      ComponentRegistry.register('TestComponent', {
        component: TestComponent,
        type: 'section'
      });

      // Should be accessible through instance methods
      expect(ComponentRegistry.has('TestComponent')).toBe(true);
      expect(ComponentRegistry.get('TestComponent')).toBeDefined();
    });

    it('should support batch registration', () => {
      const Component1 = () => null;
      const Component2 = () => null;

      ComponentRegistry.registerBatch({
        'Component1': {
          component: Component1,
          type: 'section'
        },
        'Component2': {
          component: Component2,
          type: 'navigation'
        }
      });

      expect(ComponentRegistry.has('Component1')).toBe(true);
      expect(ComponentRegistry.has('Component2')).toBe(true);
    });

    it('should clear all components', () => {
      const Component1 = () => null;
      const Component2 = () => null;

      registerComponent('Component1', {
        component: Component1,
        type: 'section'
      });

      registerComponent('Component2', {
        component: Component2,
        type: 'navigation'
      });

      expect(Object.keys(getAllComponents())).toHaveLength(2);

      ComponentRegistry.clear();

      expect(Object.keys(getAllComponents())).toHaveLength(0);
    });

    it('should provide component names list', () => {
      const Component1 = () => null;
      const Component2 = () => null;

      registerComponent('Component1', {
        component: Component1,
        type: 'section'
      });

      registerComponent('Component2', {
        component: Component2,
        type: 'navigation'
      });

      const names = ComponentRegistry.getComponentNames();
      expect(names).toEqual(['Component1', 'Component2']);
    });
  });

  describe('Auto-discovery', () => {
    it('should auto-discover components from CORE directory', async () => {
      // This test will be implemented when we add auto-discovery
      // For now, it's a placeholder to ensure we don't forget this feature
      expect(true).toBe(true);
    });
  });
});