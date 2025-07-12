import React from 'react';
import * as ReactDOMServer from 'react-dom/server';

/**
 * Analyzes a React component to find editable fields
 * This is a basic implementation that would need to be expanded
 * for more complex components
 */
export const analyzeComponent = (Component: React.ComponentType<any>, defaultProps: any = {}) => {
  try {
    // Try to render the component with default props to string
    const renderedHtml = ReactDOMServer.renderToString(
      React.createElement(Component, defaultProps)
    );
    
    // Extract data-field attributes (would need to be added to Editable components)
    const fieldRegex = /data-field="([^"]*)"/g;
    const fields = new Set<string>();
    let match;
    
    while ((match = fieldRegex.exec(renderedHtml)) !== null) {
      fields.add(match[1]);
    }
    
    // Convert to array and return
    return Array.from(fields);
  } catch (error) {
    console.error('Failed to analyze component:', error);
    return [];
  }
};

/**
 * Generate customizable fields configuration for a section
 * based on the field names used in the component
 */
export const generateCustomizableFields = (fieldNames: string[]) => {
  const customizableFields: Record<string, any> = {};
  
  fieldNames.forEach(fieldName => {
    // Generate appropriate field type based on field name patterns
    if (fieldName.includes('headline') || fieldName.includes('title')) {
      customizableFields[fieldName] = {
        type: 'text',
        default: {
          text: 'Headline text',
          color: '#000000'
        },
      };
    } else if (fieldName.includes('description') || fieldName.includes('content')) {
      customizableFields[fieldName] = {
        type: 'textarea',
        default: {
          text: 'Description text goes here',
          color: '#6B7280'
        },
      };
    } else if (fieldName.includes('button')) {
      customizableFields[fieldName] = {
        type: 'button',
        default: {
          text: 'Button Text',
          href: '#',
          variant: fieldName.includes('primary') ? 'primary' : 'tertiary',
        },
      };
    } else if (fieldName.includes('image') || fieldName.includes('photo')) {
      customizableFields[fieldName] = {
        type: 'image',
        default: {
          src: '',
          alt: 'Image description'
        },
      };
    } else if (fieldName.includes('icon')) {
      customizableFields[fieldName] = {
        type: 'icon',
        default: {
          icon: 'Box',
          size: 40,
          color: '#000000'
        },
      };
    } else {
      // Default to text for unknown field types
      customizableFields[fieldName] = {
        type: 'text',
        default: 'Content goes here',
      };
    }
  });
  
  return customizableFields;
};