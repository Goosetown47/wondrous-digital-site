import React, { useEffect, useRef, useState } from 'react';
import { renderTemplate } from '@/lib/templateRenderer';
import { useSiteStyles } from '@/contexts/SiteStylesContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { generateTemplateCSS, generateTemplateCSSForPreview } from '@/styles/templateStyles';

interface TemplatePreviewProps {
  template: string;
  content: any;
  sectionType: string;
  sectionId: string;
  isMobilePreview?: boolean;
  isPreviewMode?: boolean;
}

// Create a singleton style element for all template previews
let globalStyleElement: HTMLStyleElement | null = null;
let styleElementRefCount = 0;

const getOrCreateStyleElement = (): HTMLStyleElement => {
  if (!globalStyleElement) {
    globalStyleElement = document.createElement('style');
    globalStyleElement.id = 'template-preview-styles';
    document.head.appendChild(globalStyleElement);
  }
  styleElementRefCount++;
  return globalStyleElement;
};

const releaseStyleElement = () => {
  styleElementRefCount--;
  if (styleElementRefCount === 0 && globalStyleElement && globalStyleElement.parentNode) {
    globalStyleElement.parentNode.removeChild(globalStyleElement);
    globalStyleElement = null;
  }
};

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  content,
  sectionType,
  sectionId,
  isMobilePreview = false,
  isPreviewMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { siteStyles, loading: stylesLoading } = useSiteStyles();
  const { isEditMode, handleContentUpdate } = useEditMode();
  const [isStylesReady, setIsStylesReady] = useState(false);
  
  // Manage CSS injection with singleton pattern
  useEffect(() => {
    const styleElement = getOrCreateStyleElement();
    console.log('TemplatePreview: Style element created/retrieved:', styleElement);
    console.log('TemplatePreview: Style element parent:', styleElement.parentNode?.nodeName);
    
    // Cleanup on unmount
    return () => {
      releaseStyleElement();
    };
  }, []); // Only run on mount/unmount
  
  // Update CSS when site styles change
  useEffect(() => {
    if (!globalStyleElement) {
      console.warn('TemplatePreview: No style element available');
      return;
    }
    
    // Wait for styles to be loaded from CSS variables
    if (stylesLoading) {
      console.log('TemplatePreview: Waiting for styles to load from CSS variables...');
      return;
    }
    
    if (!siteStyles && !isPreviewMode) {
      console.log('TemplatePreview: Site styles not loaded yet');
      return;
    }
    
    // In preview mode, generate CSS immediately
    // Otherwise, wait for styles to be loaded
    if (isPreviewMode || !stylesLoading) {
      // In preview mode, try to read styles from CSS variables if siteStyles is not available
      let stylesToUse = siteStyles || {};
      
      if (isPreviewMode && !siteStyles) {
        // Read CSS variables from DOM
        const computedStyle = getComputedStyle(document.documentElement);
        
        // Read all style variables
        stylesToUse = {
          // Main colors
          primary_color: computedStyle.getPropertyValue('--primary-color').trim() || '#007BFF',
          secondary_color: computedStyle.getPropertyValue('--secondary-color').trim() || '#6C757D',
          tertiary_color: computedStyle.getPropertyValue('--tertiary-color').trim() || '#28A745',
          text_color: computedStyle.getPropertyValue('--color-text').trim() || '#000000',
          background_color: computedStyle.getPropertyValue('--background-color').trim() || '#ffffff',
          dark_color: computedStyle.getPropertyValue('--dark-color').trim() || '#343A40',
          light_color: computedStyle.getPropertyValue('--light-color').trim() || '#F8F9FA',
          white_color: computedStyle.getPropertyValue('--white-color').trim() || '#FFFFFF',
          
          // Fonts
          primary_font: computedStyle.getPropertyValue('--primary-font').trim() || 'Inter',
          secondary_font: computedStyle.getPropertyValue('--secondary-font').trim() || 'Inter',
          
          // Primary button
          primary_button_background_color: computedStyle.getPropertyValue('--primary-button-background-color').trim(),
          primary_button_text_color: computedStyle.getPropertyValue('--primary-button-text-color').trim(),
          primary_button_border_color: computedStyle.getPropertyValue('--primary-button-border-color').trim(),
          primary_button_hover_color: computedStyle.getPropertyValue('--primary-button-hover').trim(),
          primary_button_size: computedStyle.getPropertyValue('--primary-button-size').trim() || 'medium',
          primary_button_radius: computedStyle.getPropertyValue('--primary-button-radius').trim() || 'slightly-rounded',
          primary_button_font: computedStyle.getPropertyValue('--primary-button-font').trim(),
          primary_button_font_weight: computedStyle.getPropertyValue('--primary-button-font-weight').trim(),
          
          // Secondary button
          secondary_button_background_color: computedStyle.getPropertyValue('--secondary-button-background-color').trim(),
          secondary_button_text_color: computedStyle.getPropertyValue('--secondary-button-text-color').trim(),
          secondary_button_border_color: computedStyle.getPropertyValue('--secondary-button-border-color').trim(),
          secondary_button_hover_color: computedStyle.getPropertyValue('--secondary-button-hover').trim(),
          secondary_button_size: computedStyle.getPropertyValue('--secondary-button-size').trim() || 'medium',
          secondary_button_radius: computedStyle.getPropertyValue('--secondary-button-radius').trim() || 'slightly-rounded',
          secondary_button_font: computedStyle.getPropertyValue('--secondary-button-font').trim(),
          secondary_button_font_weight: computedStyle.getPropertyValue('--secondary-button-font-weight').trim(),
          
          // Tertiary button
          outline_text_color: computedStyle.getPropertyValue('--outline-text-color').trim(),
          outline_border_color: computedStyle.getPropertyValue('--outline-border-color').trim(),
          outline_hover_bg: computedStyle.getPropertyValue('--outline-hover-bg').trim(),
          tertiary_button_size: computedStyle.getPropertyValue('--tertiary-button-size').trim() || 'medium',
          tertiary_button_radius: computedStyle.getPropertyValue('--tertiary-button-radius').trim() || 'slightly-rounded',
          tertiary_button_font: computedStyle.getPropertyValue('--tertiary-button-font').trim(),
          tertiary_button_font_weight: computedStyle.getPropertyValue('--tertiary-button-font-weight').trim(),
          
          // Text link button
          textlink_button_text_color: computedStyle.getPropertyValue('--text-link-color').trim(),
          textlink_button_hover_color: computedStyle.getPropertyValue('--text-link-hover-color').trim(),
          
          ...stylesToUse
        };
        
        console.log('TemplatePreview: Read comprehensive styles from CSS variables:', stylesToUse);
      }
      
      console.log('TemplatePreview: Generating CSS with site styles:', stylesToUse);
      
      const css = isPreviewMode ? generateTemplateCSSForPreview(stylesToUse) : generateTemplateCSS(stylesToUse);
      
      // Only update if we have valid CSS
      if (css && css.length > 100) {
        // Log the full CSS for debugging
        console.log('TemplatePreview: Generated CSS length:', css.length);
        console.log('TemplatePreview: First 1000 chars of CSS:', css.substring(0, 1000));
        console.log('TemplatePreview: Style element exists:', !!globalStyleElement);
        console.log('TemplatePreview: Style element ID:', globalStyleElement?.id);
        globalStyleElement.textContent = css;
        
        // Force a small delay to ensure styles are applied
        setTimeout(() => {
          setIsStylesReady(true);
        }, 10);
      } else {
        console.warn('TemplatePreview: Generated CSS seems invalid, length:', css?.length);
      }
    }
  }, [siteStyles, stylesLoading, isPreviewMode]);
  
  // Render the template - use the same styles we're using for CSS generation
  const stylesForTemplate = (() => {
    if (siteStyles) return siteStyles;
    
    if (isPreviewMode) {
      // Try to read from CSS variables
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
      if (primaryColor) {
        return {
          // Main colors
          primary_color: primaryColor,
          secondary_color: computedStyle.getPropertyValue('--secondary-color').trim() || '#6C757D',
          text_color: computedStyle.getPropertyValue('--color-text').trim() || '#000000',
          primary_font: computedStyle.getPropertyValue('--primary-font').trim() || 'Inter',
          secondary_font: computedStyle.getPropertyValue('--secondary-font').trim() || 'Inter',
          // Button properties for template rendering
          primary_button_size: computedStyle.getPropertyValue('--primary-button-size').trim() || 'medium',
          primary_button_radius: computedStyle.getPropertyValue('--primary-button-radius').trim() || 'slightly-rounded',
          button_style: computedStyle.getPropertyValue('--button-style').trim() || 'default',
        };
      }
    }
    
    return {}; // Use defaults
  })();
  
  const html = renderTemplate(template, content, stylesForTemplate, sectionType);
  
  useEffect(() => {
    if (!containerRef.current || !isEditMode) return;
    
    // Add click handlers for editable elements
    const editableElements = containerRef.current.querySelectorAll('[data-editable]');
    
    editableElements.forEach((element) => {
      const field = element.getAttribute('data-editable');
      if (!field) return;
      
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        // In a real implementation, this would open an edit tooltip
        // For now, we'll just log the intent
        console.log('Edit field:', field, 'in section:', sectionId);
      });
      
      // Add visual feedback
      element.style.cursor = 'pointer';
      element.addEventListener('mouseenter', () => {
        element.style.outline = '2px dashed #F867AC';
        element.style.outlineOffset = '2px';
      });
      element.addEventListener('mouseleave', () => {
        element.style.outline = 'none';
      });
    });
    
    // Cleanup function
    return () => {
      editableElements.forEach((element) => {
        const newElement = element.cloneNode(true);
        element.parentNode?.replaceChild(newElement, element);
      });
    };
  }, [html, isEditMode, sectionId]);
  
  // Apply mobile preview class if needed
  const className = isMobilePreview ? 'mobile-preview' : '';
  
  // Skip loading state entirely when in preview mode
  if (!isPreviewMode && (!isStylesReady || stylesLoading)) {
    return (
      <div className={`${className} flex items-center justify-center p-8 bg-gray-50`}>
        <div className="text-gray-400">Loading styles...</div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={`template-preview-content ${className}`}
    >
      <div 
        className="template-section"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};