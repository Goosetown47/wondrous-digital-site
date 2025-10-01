import { describe, it, expect, vi } from 'vitest';
import React, { type ReactElement } from 'react';
import {
  analyzeComponentTree,
  findElementByPath,
  injectWrapper,
  preserveStructure,
  attachClickHandlers,
  interceptContent,
  type InterceptorConfig,
  type ElementNode
} from '../content-interceptor';
import type { EditableFieldConfig } from '../component-registry';

// Type helpers for test assertions
interface EditableTextProps {
  value: string;
  type: string;
  onUpdate: () => void;
  editable: boolean;
  children?: React.ReactNode;
}

interface EditableImageProps {
  src: string;
  alt: string;
  onUpdate: () => void;
  editable: boolean;
}

interface TestElementProps {
  className?: string;
  id?: string;
  'data-id'?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  content?: Record<string, unknown>;
  onImageChange?: (url: string) => void;
  onHeadingChange?: (text: string) => void;
}

describe('Content Interceptor', () => {
  describe('analyzeComponentTree', () => {
    it('should identify editable elements in a simple component', () => {
      const element = React.createElement('div', {},
        React.createElement('h1', {}, 'Test Heading'),
        React.createElement('p', {}, 'Test paragraph'),
        React.createElement('button', {}, 'Click me')
      );

      const analysis = analyzeComponentTree(element);

      expect(analysis.editableElements).toHaveLength(3);
      expect(analysis.editableElements[0].type).toBe('h1');
      expect(analysis.editableElements[1].type).toBe('p');
      expect(analysis.editableElements[2].type).toBe('button');
    });

    it('should handle nested components', () => {
      const element = React.createElement('div', {},
        React.createElement('section', {},
          React.createElement('h1', {}, 'Nested Heading'),
          React.createElement('div', {},
            React.createElement('p', {}, 'Deep paragraph')
          )
        )
      );

      const analysis = analyzeComponentTree(element);

      expect(analysis.editableElements).toHaveLength(2);
      expect(analysis.paths).toEqual(['section.h1', 'section.div.p']);
    });

    it('should skip non-editable elements', () => {
      const element = React.createElement('div', {},
        React.createElement('span', {}, 'Not editable'),
        React.createElement('h1', {}, 'Editable'),
        React.createElement('svg', {}, null)
      );

      const analysis = analyzeComponentTree(element);

      expect(analysis.editableElements).toHaveLength(1);
      expect(analysis.editableElements[0].type).toBe('h1');
    });

    it('should handle React.Fragment', () => {
      const element = React.createElement(React.Fragment, {},
        React.createElement('h1', {}, 'In fragment'),
        React.createElement('p', {}, 'Also in fragment')
      );

      const analysis = analyzeComponentTree(element);

      expect(analysis.editableElements).toHaveLength(2);
    });

    it('should handle arrays of elements', () => {
      const elements = [
        React.createElement('h1', { key: '1' }, 'First'),
        React.createElement('p', { key: '2' }, 'Second')
      ];

      const analysis = analyzeComponentTree(elements);

      expect(analysis.editableElements).toHaveLength(2);
    });
  });

  describe('findElementByPath', () => {
    it('should find element by simple path', () => {
      const tree = {
        type: 'div',
        children: [
          { type: 'h1', path: 'h1', content: 'Heading' },
          { type: 'p', path: 'p', content: 'Paragraph' }
        ]
      } as ElementNode;

      const element = findElementByPath(tree, 'h1');

      expect(element).toBeTruthy();
      expect(element?.content).toBe('Heading');
    });

    it('should find element by nested path', () => {
      const tree = {
        type: 'div',
        children: [
          {
            type: 'section',
            path: 'section',
            children: [
              { type: 'h1', path: 'section.h1', content: 'Nested' }
            ]
          }
        ]
      } as ElementNode;

      const element = findElementByPath(tree, 'section.h1');

      expect(element).toBeTruthy();
      expect(element?.content).toBe('Nested');
    });

    it('should return null for non-existent path', () => {
      const tree = {
        type: 'div',
        path: 'div',
        children: []
      } as ElementNode;

      const element = findElementByPath(tree, 'non.existent.path');

      expect(element).toBeNull();
    });

    it('should handle array index paths', () => {
      const tree = {
        type: 'div',
        children: [
          { type: 'p', path: 'p[0]', content: 'First' },
          { type: 'p', path: 'p[1]', content: 'Second' }
        ]
      } as ElementNode;

      const element = findElementByPath(tree, 'p[1]');

      expect(element).toBeTruthy();
      expect(element?.content).toBe('Second');
    });
  });

  describe('injectWrapper', () => {
    it('should wrap element with EditableText for text content', () => {
      const element = React.createElement('h1', {}, 'Original Text');
      const config: InterceptorConfig = {
        fieldPath: 'heading',
        fieldType: 'text',
        onUpdate: vi.fn()
      };

      const wrapped = injectWrapper(element, config);

      // Type assertion for component function
      const componentType = wrapped.type as React.FC<EditableTextProps>;
      expect(componentType.name).toBe('EditableText');

      // Type assertion for props
      const props = wrapped.props as EditableTextProps;
      expect(props.value).toBe('Original Text');
      expect(props.type).toBe('heading');
    });

    it('should wrap element with EditableImage for images', () => {
      const element = React.createElement('img', {
        src: '/test.jpg',
        alt: 'Test Image'
      });
      const config: InterceptorConfig = {
        fieldPath: 'image',
        fieldType: 'image',
        onUpdate: vi.fn()
      };

      const wrapped = injectWrapper(element, config);

      // Type assertion for component function
      const componentType = wrapped.type as React.FC<EditableImageProps>;
      expect(componentType.name).toBe('EditableImage');

      // Type assertion for props
      const props = wrapped.props as EditableImageProps;
      expect(props.src).toBe('/test.jpg');
      expect(props.alt).toBe('Test Image');
    });

    it('should preserve original props', () => {
      const element = React.createElement('h1', {
        className: 'text-lg',
        id: 'main-heading'
      }, 'Text');
      const config: InterceptorConfig = {
        fieldPath: 'heading',
        fieldType: 'text',
        onUpdate: vi.fn()
      };

      const wrapped = injectWrapper(element, config);
      const wrappedProps = wrapped.props as EditableTextProps;
      const innerElement = wrappedProps.children as ReactElement;
      const innerProps = innerElement.props as TestElementProps;

      expect(innerProps.className).toBe('text-lg');
      expect(innerProps.id).toBe('main-heading');
    });

    it('should handle button elements', () => {
      const element = React.createElement('button', {}, 'Click Me');
      const config: InterceptorConfig = {
        fieldPath: 'buttonText',
        fieldType: 'text',
        onUpdate: vi.fn()
      };

      const wrapped = injectWrapper(element, config);

      const componentType = wrapped.type as React.FC<EditableTextProps>;
      expect(componentType.name).toBe('EditableText');

      const props = wrapped.props as EditableTextProps;
      expect(props.type).toBe('button');
      expect(props.value).toBe('Click Me');
    });
  });

  describe('preserveStructure', () => {
    it('should maintain component hierarchy', () => {
      const original = React.createElement('div', { className: 'container' },
        React.createElement('section', { id: 'main' },
          React.createElement('h1', {}, 'Title'),
          React.createElement('p', {}, 'Content')
        )
      );

      const preserved = preserveStructure(original);

      expect(preserved.type).toBe('div');

      const preservedProps = preserved.props as TestElementProps;
      expect(preservedProps.className).toBe('container');

      const childElement = preservedProps.children as ReactElement;
      expect(childElement.type).toBe('section');

      const childProps = childElement.props as TestElementProps;
      expect(childProps.id).toBe('main');
    });

    it('should preserve all props and children', () => {
      const original = React.createElement('article', {
        className: 'post',
        'data-id': '123',
        style: { color: 'red' }
      },
        React.createElement('h2', {}, 'Post Title'),
        React.createElement('div', {},
          React.createElement('p', {}, 'Post content')
        )
      );

      const preserved = preserveStructure(original);

      const preservedProps = preserved.props as TestElementProps;
      expect(preservedProps.className).toBe('post');
      expect(preservedProps['data-id']).toBe('123');
      expect(preservedProps.style).toEqual({ color: 'red' });

      const children = React.Children.toArray(preservedProps.children);
      expect(children).toHaveLength(2);
    });

    it('should handle null and undefined children', () => {
      const original = React.createElement('div', {},
        null,
        React.createElement('p', {}, 'Text'),
        undefined
      );

      const preserved = preserveStructure(original);
      const preservedProps = preserved.props as TestElementProps;
      const children = React.Children.toArray(preservedProps.children);

      expect(children).toHaveLength(1);
      const firstChild = children[0] as ReactElement;
      expect(firstChild.type).toBe('p');
    });
  });

  describe('attachClickHandlers', () => {
    it('should add click handler to editable element', () => {
      const element = React.createElement('h1', {}, 'Editable');
      const handler = vi.fn();

      const result = attachClickHandlers(element, 'heading', handler);

      const resultProps = result.props as TestElementProps;
      expect(resultProps.onClick).toBeDefined();

      // Create a mock event with proper type
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as unknown as React.MouseEvent;

      resultProps.onClick?.(mockEvent);
      expect(handler).toHaveBeenCalledWith('heading');
    });

    it('should preserve existing click handlers', () => {
      const existingHandler = vi.fn();
      const element = React.createElement('button', {
        onClick: existingHandler
      }, 'Click');
      const editHandler = vi.fn();

      const result = attachClickHandlers(element, 'button', editHandler);

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as unknown as React.MouseEvent;

      const resultProps = result.props as TestElementProps;
      resultProps.onClick?.(mockEvent);

      expect(existingHandler).toHaveBeenCalledWith(mockEvent);
      expect(editHandler).toHaveBeenCalledWith('button');
    });

    it('should stop propagation in edit mode', () => {
      const element = React.createElement('a', {
        href: '/link'
      }, 'Link');
      const handler = vi.fn();

      const result = attachClickHandlers(element, 'link', handler, true);

      const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as unknown as React.MouseEvent;

      const resultProps = result.props as TestElementProps;
      resultProps.onClick?.(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('interceptContent', () => {
    it('should intercept and make content editable', () => {
      const component = React.createElement('div', {},
        React.createElement('h1', {}, 'Title'),
        React.createElement('p', {}, 'Description'),
        React.createElement('button', {}, 'Action')
      );

      const fieldConfigs: EditableFieldConfig[] = [
        { path: 'h1', type: 'text' as const, label: 'Title' },
        { path: 'p', type: 'richText' as const, label: 'Description' },
        { path: 'button', type: 'text' as const, label: 'Button Text' }
      ];

      const onUpdate = vi.fn();
      const intercepted = interceptContent(component, fieldConfigs, onUpdate);

      // The intercepted content should have wrappers injected
      expect(intercepted).toBeDefined();
      const interceptedProps = intercepted.props as TestElementProps;
      expect(interceptedProps.children).toBeDefined();
    });

    it('should handle complex nested structures', () => {
      const component = React.createElement('article', {},
        React.createElement('header', {},
          React.createElement('h1', {}, 'Article Title'),
          React.createElement('p', { className: 'meta' }, 'By Author')
        ),
        React.createElement('section', {},
          React.createElement('p', {}, 'First paragraph'),
          React.createElement('p', {}, 'Second paragraph')
        )
      );

      const fieldConfigs: EditableFieldConfig[] = [
        { path: 'header.h1', type: 'text' as const, label: 'Title' },
        { path: 'header.p', type: 'text' as const, label: 'Author' },
        { path: 'section.p[0]', type: 'richText' as const, label: 'First Para' },
        { path: 'section.p[1]', type: 'richText' as const, label: 'Second Para' }
      ];

      const onUpdate = vi.fn();
      const intercepted = interceptContent(component, fieldConfigs, onUpdate);

      expect(intercepted).toBeDefined();
      expect(intercepted.type).toBe('article');
    });

    it('should skip non-matching elements', () => {
      const component = React.createElement('div', {},
        React.createElement('h1', {}, 'Editable'),
        React.createElement('span', {}, 'Not Editable'),
        React.createElement('p', {}, 'Editable')
      );

      const fieldConfigs: EditableFieldConfig[] = [
        { path: 'h1', type: 'text' as const, label: 'Heading' },
        { path: 'p', type: 'text' as const, label: 'Paragraph' }
      ];

      const onUpdate = vi.fn();
      const intercepted = interceptContent(component, fieldConfigs, onUpdate);

      // Span should remain untouched
      const interceptedProps = intercepted.props as TestElementProps;
      const children = React.Children.toArray(interceptedProps.children);
      const spanChild = children[1] as ReactElement;
      expect(spanChild.type).toBe('span');
      const spanProps = spanChild.props as TestElementProps;
      expect(spanProps.children).toBe('Not Editable');
    });
  });
});