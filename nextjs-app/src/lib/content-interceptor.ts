import React, { ReactElement, ReactNode, isValidElement, Children, cloneElement } from 'react';
import type { EditableFieldConfig } from './component-registry';

// Types for React props
type ReactProps = {
  children?: ReactNode;
  src?: string;
  [key: string]: unknown;
};

// Types for the content interceptor system
export interface ElementNode {
  type: string;
  path: string;
  content?: string;
  props?: Record<string, unknown>;
  children?: ElementNode[];
}

export interface InterceptorConfig {
  fieldPath: string;
  fieldType: string;
  onUpdate: (value: unknown) => void;
  editable?: boolean;
}

export interface ComponentAnalysis {
  editableElements: ElementNode[];
  paths: string[];
  structure: ElementNode;
}

// List of HTML elements that typically contain editable content
const EDITABLE_ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', 'a', 'li', 'img'];

/**
 * Analyzes a React component tree to identify editable elements
 */
export function analyzeComponentTree(element: ReactNode): ComponentAnalysis {
  const editableElements: ElementNode[] = [];
  const paths: string[] = [];

  function traverse(node: ReactNode, parentPath = ''): ElementNode | null {
    if (!node) return null;

    // Handle arrays
    if (Array.isArray(node)) {
      const children = node.map((child, index) =>
        traverse(child, parentPath ? `${parentPath}[${index}]` : `[${index}]`)
      ).filter(Boolean) as ElementNode[];

      return {
        type: 'array',
        path: parentPath,
        children
      };
    }

    // Handle React elements
    if (isValidElement(node)) {
      const elementType = typeof node.type === 'string' ? node.type :
                          node.type === React.Fragment ? 'fragment' :
                          'component';

      // For fragments, traverse children directly without adding to path
      if (elementType === 'fragment') {
        const children = Children.toArray((node.props as ReactProps).children)
          .map(child => traverse(child, parentPath))
          .filter(Boolean) as ElementNode[];

        // Fragment children are already processed by traverse
        return {
          type: 'fragment',
          path: parentPath,
          children
        };
      }

      // Build path for this element
      // Skip root div but include structural divs
      const currentPath = !parentPath && elementType === 'div' ?
        '' :
        (parentPath ? `${parentPath}.${elementType}` : elementType);

      // Extract text content for editable elements
      let content: string | undefined;
      const props = node.props as ReactProps;
      if (EDITABLE_ELEMENTS.includes(elementType) &&
          typeof props.children === 'string') {
        content = props.children;
      } else if (elementType === 'img' && props.src) {
        content = props.src as string;
      }

      // Traverse children
      const children = Children.toArray((node.props as ReactProps).children)
        .map(child => traverse(child, currentPath))
        .filter(Boolean) as ElementNode[];

      const elementNode: ElementNode = {
        type: elementType,
        path: currentPath,
        content,
        props: (node.props as ReactProps) || {},
        children
      };

      // Add to editable elements if it's an editable type
      if (EDITABLE_ELEMENTS.includes(elementType)) {
        editableElements.push(elementNode);
        paths.push(currentPath);
      }

      return elementNode;
    }

    // Handle text nodes
    if (typeof node === 'string' || typeof node === 'number') {
      return {
        type: 'text',
        path: parentPath,
        content: String(node)
      };
    }

    return null;
  }

  const structure = traverse(element) || { type: 'root', path: '', children: [] };

  return {
    editableElements,
    paths,
    structure
  };
}

/**
 * Finds an element in the tree by its path
 */
export function findElementByPath(tree: ElementNode, path: string): ElementNode | null {
  if (tree.path === path) {
    return tree;
  }

  if (tree.children) {
    for (const child of tree.children) {
      const found = findElementByPath(child, path);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Injects an editable wrapper around an element
 */
export function injectWrapper(
  element: ReactElement,
  config: InterceptorConfig
): ReactElement {
  // Mock wrapper components for testing
  // In production, these would be actual imports
  function EditableText(props: Record<string, unknown>) {
    const { children, ...restProps } = props;
    return React.createElement('div', {
      'data-testid': 'EditableText',
      ...restProps
    }, children as ReactNode);
  }

  function EditableImage(props: Record<string, unknown>) {
    return React.createElement('div', {
      'data-testid': 'EditableImage',
      ...props
    });
  }

  const elementType = typeof element.type === 'string' ? element.type : 'component';
  const props = element.props as ReactProps;

  // Determine the wrapper based on element and field type
  if (config.fieldType === 'image' || elementType === 'img') {
    return React.createElement(EditableImage, {
      src: props.src || props.children as string,
      alt: (props.alt as string) || '',
      onUpdate: config.onUpdate,
      editable: config.editable !== false,
      className: props.className
    });
  }

  // For text elements
  const textContent = typeof props.children === 'string'
    ? props.children
    : '';

  // Determine text type based on element
  let textType: string = 'plain';
  if (elementType === 'h1' || elementType === 'h2' || elementType === 'h3') {
    textType = 'heading';
  } else if (elementType === 'p') {
    textType = 'paragraph';
  } else if (elementType === 'button') {
    textType = 'button';
  } else if (elementType === 'a') {
    textType = 'link';
  }

  return React.createElement(EditableText, {
    value: textContent,
    type: textType,
    onUpdate: config.onUpdate,
    editable: config.editable !== false
  }, element);
}

/**
 * Preserves the original structure of a component
 */
export function preserveStructure(original: ReactElement): ReactElement {
  // Clone the element with all its props and children
  return cloneElement(original, original.props as ReactProps);
}

/**
 * Attaches click handlers for editing
 */
export function attachClickHandlers(
  element: ReactElement,
  fieldPath: string,
  handler: (path: string) => void,
  editMode = false
): ReactElement {
  const originalOnClick = (element.props as ReactProps).onClick as ((event: React.MouseEvent) => void) | undefined;

  const newOnClick = (event: React.MouseEvent) => {
    if (editMode) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Call original handler if it exists
    if (originalOnClick) {
      originalOnClick(event);
    }

    // Call edit handler
    handler(fieldPath);
  };

  return cloneElement(element, {
    ...(element.props as ReactProps),
    onClick: newOnClick
  } as ReactProps);
}

/**
 * Main function to intercept content and make it editable
 */
export function interceptContent(
  component: ReactElement,
  fieldConfigs: EditableFieldConfig[],
  onUpdate: (path: string, value: unknown) => void
): ReactElement {
  // Create a map of paths to field configs for efficient lookup
  const configMap = new Map<string, EditableFieldConfig>();
  fieldConfigs.forEach(config => {
    configMap.set(config.path, config);
  });

  // Recursively process the component tree
  function processElement(element: ReactNode, currentPath = ''): ReactNode {
    if (!element) return null;

    // Handle arrays
    if (Array.isArray(element)) {
      return element.map((child, index) =>
        processElement(child, `${currentPath}[${index}]`)
      );
    }

    // Handle React elements
    if (isValidElement(element)) {
      const elementType = typeof element.type === 'string' ? element.type : 'component';
      const elementPath = currentPath ? `${currentPath}.${elementType}` : elementType;

      // Check if this element matches a field config
      const config = configMap.get(elementPath);
      if (config && EDITABLE_ELEMENTS.includes(elementType)) {
        // Inject wrapper for this element
        return injectWrapper(element as ReactElement, {
          fieldPath: elementPath,
          fieldType: config.type,
          onUpdate: (value) => onUpdate(elementPath, value),
          editable: true
        });
      }

      // Process children recursively
      const processedChildren = Children.map(
        (element.props as ReactProps).children,
        child => processElement(child, elementPath)
      );

      // Clone element with processed children
      // If there's only one child and it's a string, keep it as a string
      const finalChildren = processedChildren && processedChildren.length === 1 &&
                           typeof processedChildren[0] === 'string'
                           ? processedChildren[0]
                           : processedChildren;

      return cloneElement(element, {
        ...(element.props as ReactProps),
        children: finalChildren
      } as ReactProps);
    }

    // Return other types as-is
    return element;
  }

  return processElement(component) as ReactElement;
}

/**
 * Higher-order function to create an interceptor for a specific component
 */
export function createInterceptor(
  fieldConfigs: EditableFieldConfig[]
) {
  return function intercept(
    component: ReactElement,
    onUpdate: (path: string, value: unknown) => void
  ): ReactElement {
    return interceptContent(component, fieldConfigs, onUpdate);
  };
}