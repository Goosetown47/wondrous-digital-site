import React from 'react';
import { cn } from '../../lib/utils';
import styles from './Button.module.css';
import { ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { LucideCrop as LucideProps } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'text-link';
export type ButtonRadius = 'squared' | 'slightly-rounded' | 'fully-rounded';
export type ButtonStyle = 'default' | 'floating' | 'brick' | 'modern' | 'offset-background' | 'compact';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  radius?: ButtonRadius;
  style?: ButtonStyle;
  size?: ButtonSize;
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
  iconName?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
  editMode?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  radius, // Will be determined from CSS variables
  style = 'default',
  size, // Will be determined from CSS variables
  showIcon, // Will be determined from CSS variables
  iconPosition, // Will be determined from CSS variables
  iconName,
  href, 
  children, 
  className,
  editMode = false,
  ...props
}) => {
  // Helper function to check if a value is a gradient
  const isGradient = (value: string | undefined) => {
    return value?.includes('linear-gradient') || value?.includes('radial-gradient') || value?.includes('conic-gradient');
  };

  // Get CSS variable value for checking gradients
  const getCSSVariableValue = (variableName: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    }
    return '';
  };

  // Get button-type-specific settings from CSS variables
  const getButtonSettings = () => {
    const settings = {
      radius: radius || (getCSSVariableValue(`--${variant}-button-radius`) as ButtonRadius) || 'slightly-rounded',
      size: size || (getCSSVariableValue(`--${variant}-button-size`) as ButtonSize) || 'medium',
      iconEnabled: showIcon !== undefined ? showIcon : getCSSVariableValue(`--${variant}-button-icon-enabled`) === 'true',
      iconPosition: iconPosition || (getCSSVariableValue(`--${variant}-button-icon-position`) as 'left' | 'right') || 'right'
    };
    return settings;
  };

  const buttonSettings = getButtonSettings();

  // Generate inline styles for gradients and typography
  const getInlineStyles = (variant: ButtonVariant, style: ButtonStyle) => {
    const styles: React.CSSProperties = {};
    
    // Add typography styling for all buttons
    const fontFamilyVar = `--${variant === 'text-link' ? 'textlink' : variant}-button-font-family`;
    const fontWeightVar = `--${variant === 'text-link' ? 'textlink' : variant}-button-font-weight`;
    
    const fontFamily = getCSSVariableValue(fontFamilyVar);
    const fontWeight = getCSSVariableValue(fontWeightVar);
    
    if (fontFamily) {
      styles.fontFamily = fontFamily;
    }
    if (fontWeight) {
      styles.fontWeight = fontWeight;
    }
    
    // For offset-background style, don't override background - let CSS classes handle it
    if (style === 'offset-background') {
      return styles; // Return styles with typography only
    }
    
    if (variant === 'primary') {
      const primaryColor = getCSSVariableValue('--primary-button-background-color');
      const primaryHover = getCSSVariableValue('--primary-button-hover');
      
      if (isGradient(primaryColor)) {
        styles.background = primaryColor;
        styles.transition = 'opacity 0.2s ease-in-out';
      }
    } else if (variant === 'secondary') {
      const secondaryColor = getCSSVariableValue('--secondary-button-background-color');
      const secondaryHover = getCSSVariableValue('--secondary-button-hover');
      
      if (isGradient(secondaryColor)) {
        styles.background = secondaryColor;
        styles.transition = 'opacity 0.2s ease-in-out';
      }
    }
    
    return styles;
  };
  // Style classes based on variant
  const getVariantClasses = (variant: ButtonVariant, style: ButtonStyle) => {
    const baseClasses = "transition-all duration-200 inline-flex items-center justify-center flex-nowrap";
    
    // Check if we need to skip background classes due to gradients
    const primaryIsGradient = variant === 'primary' && isGradient(getCSSVariableValue('--primary-button-background-color'));
    const secondaryIsGradient = variant === 'secondary' && isGradient(getCSSVariableValue('--secondary-button-background-color'));
    
    // Default style (formerly sleek) - minimal and clean
    if (style === 'default') {
      switch (variant) {
        case 'primary':
          return `${baseClasses} ${primaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--primary-button-background-color)] hover:bg-[var(--primary-button-hover)]'} text-[var(--primary-button-text-color)] border border-[var(--primary-button-border-color)]`;
        case 'secondary':
          return `${baseClasses} ${secondaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--secondary-button-background-color)] hover:bg-[var(--secondary-button-hover)]'} text-[var(--secondary-button-text-color)] border border-[var(--secondary-button-border-color)]`;
        case 'tertiary':
          return `${baseClasses} bg-transparent text-[var(--outline-text-color)] hover:bg-[var(--outline-hover-bg)] border border-[var(--outline-border-color)]`;
        case 'text-link':
          return `${baseClasses} text-[var(--text-link-color)] hover:text-[var(--text-link-hover-color)]`;
        default:
          return baseClasses;
      }
    }
    
    // Floating style - enhanced shadows and wider radius (formerly bubble)
    if (style === 'floating') {
      switch (variant) {
        case 'primary':
          return `${baseClasses} ${primaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--primary-button-background-color)] hover:bg-[var(--primary-button-hover)]'} text-[var(--primary-button-text-color)] border border-[var(--primary-button-border-color)] shadow-lg hover:shadow-2xl active:shadow-md transform hover:-translate-y-0.5 transition-all duration-200`;
        case 'secondary':
          return `${baseClasses} ${secondaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--secondary-button-background-color)] hover:bg-[var(--secondary-button-hover)]'} text-[var(--secondary-button-text-color)] border border-[var(--secondary-button-border-color)] shadow-md hover:shadow-xl active:shadow-sm transform hover:-translate-y-0.5 transition-all duration-200`;
        case 'tertiary':
          return `${baseClasses} bg-transparent text-[var(--outline-text-color)] hover:text-white hover:bg-[var(--outline-border-color)] border-2 border-[var(--outline-border-color)] shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`;
        case 'text-link':
          return `${baseClasses} text-[var(--text-link-color)] hover:text-[var(--text-link-hover-color)] underline hover:shadow-sm transform hover:-translate-y-0.5 transition-all duration-200`;
        default:
          return baseClasses;
      }
    }
    
    // Brick style - bold with strong shadows (formerly default)
    if (style === 'brick') {
      switch (variant) {
        case 'primary':
          return `${baseClasses} ${primaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--primary-button-background-color)] hover:bg-[var(--primary-button-hover)]'} text-[var(--primary-button-text-color)] border-2 border-[var(--primary-button-border-color)] shadow-button-primary hover:shadow-button-primary-hover active:translate-x-0.5 active:translate-y-0.5 uppercase tracking-wide`;
        case 'secondary':
          return `${baseClasses} ${secondaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--secondary-button-background-color)] hover:bg-[var(--secondary-button-hover)]'} text-[var(--secondary-button-text-color)] border border-[var(--secondary-button-border-color)] shadow-button-secondary hover:shadow-button-secondary-hover`;
        case 'tertiary':
          return `${baseClasses} bg-transparent text-[var(--outline-text-color)] hover:bg-[var(--outline-hover-bg)] border-2 border-[var(--outline-border-color)]`;
        case 'text-link':
          return `${baseClasses} text-[var(--text-link-color)] hover:text-[var(--text-link-hover-color)] underline`;
        default:
          return baseClasses;
      }
    }
    
    // Modern style - sleek with tight shadow and sharp border
    if (style === 'modern') {
      switch (variant) {
        case 'primary':
          return `${baseClasses} ${primaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--primary-button-background-color)] hover:bg-[var(--primary-button-hover)]'} text-[var(--primary-button-text-color)] border border-[var(--primary-button-border-color)] shadow-[0_2px_4px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.25)] active:shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-200`;
        case 'secondary':
          return `${baseClasses} ${secondaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--secondary-button-background-color)] hover:bg-[var(--secondary-button-hover)]'} text-[var(--secondary-button-text-color)] border border-[var(--secondary-button-border-color)] shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.2)] active:shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-all duration-200`;
        case 'tertiary':
          return `${baseClasses} bg-transparent text-[var(--outline-text-color)] hover:bg-[var(--outline-hover-bg)] border border-[var(--outline-border-color)] shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.15)] transition-all duration-200`;
        case 'text-link':
          return `${baseClasses} text-[var(--text-link-color)] hover:text-[var(--text-link-hover-color)] transition-all duration-200`;
        default:
          return baseClasses;
      }
    }
    
    // Offset Background style - Dual Element approach
    if (style === 'offset-background') {
      // We'll handle this with a wrapper div in the JSX
      switch (variant) {
        case 'primary':
          return `${baseClasses} bg-transparent text-[var(--primary-button-text-color)] border-2 border-[var(--primary-button-border-color)] relative z-10`;
        case 'secondary':
          return `${baseClasses} bg-transparent text-[var(--secondary-button-text-color)] border-2 border-[var(--secondary-button-border-color)] relative z-10`;
        case 'tertiary':
          return `${baseClasses} bg-transparent text-[var(--outline-text-color)] border-2 border-[var(--outline-border-color)] relative z-10`;
        case 'text-link':
          return `${baseClasses} text-[var(--text-link-color)] hover:text-[var(--text-link-hover-color)]`;
        default:
          return baseClasses;
      }
    }
    
    // Compact style - minimal and tight padding
    if (style === 'compact') {
      switch (variant) {
        case 'primary':
          return `${baseClasses} ${primaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--primary-button-background-color)] hover:bg-[var(--primary-button-hover)]'} text-[var(--primary-button-text-color)] border-0 text-sm px-2 py-1 font-medium`;
        case 'secondary':
          return `${baseClasses} ${secondaryIsGradient ? 'hover:opacity-90' : 'bg-[var(--secondary-button-background-color)] hover:bg-[var(--secondary-button-hover)]'} text-[var(--secondary-button-text-color)] border-0 text-sm px-2 py-1 font-medium`;
        case 'tertiary':
          return `${baseClasses} bg-transparent text-[var(--outline-text-color)] hover:bg-[var(--outline-hover-bg)] border border-[var(--outline-border-color)] text-sm px-2 py-1 font-medium`;
        case 'text-link':
          return `${baseClasses} text-[var(--text-link-color)] hover:text-[var(--text-link-hover-color)] text-sm font-medium`;
        default:
          return baseClasses;
      }
    }
    
    return baseClasses;
  };
  
  // Border radius classes based on the radius prop
  const getRadiusClasses = (radius: ButtonRadius, style?: ButtonStyle) => {
    const radiusClass = (() => {
      switch (radius) {
        case 'squared':
          return 'rounded-none';
        case 'slightly-rounded':
          return 'rounded-lg';
        case 'fully-rounded':
          return 'rounded-full';
        default:
          return 'rounded-lg';
      }
    })();
    
    // For offset background, we need to apply radius to the pseudo-element too
    if (style === 'offset-background') {
      const pseudoRadius = radius === 'squared' ? 'before:rounded-none' : 
                          radius === 'fully-rounded' ? 'before:rounded-full' : 
                          'before:rounded-lg';
      return `${radiusClass} ${pseudoRadius}`;
    }
    
    return radiusClass;
  };

  // Size classes based on the size setting
  const getSizeClasses = (size: ButtonSize) => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-xs';
      case 'medium':
        return 'px-6 py-3 text-sm';
      case 'large':
        return 'px-8 py-4 text-base';
      default:
        return 'px-6 py-3 text-sm';
    }
  };
  
  // Get appropriate size classes (compact style overrides, otherwise use button settings)
  const sizeClasses = style === 'compact' ? "" : getSizeClasses(buttonSettings.size);

  // Combine all classes
  const buttonClasses = cn(
    getVariantClasses(variant, style),
    getRadiusClasses(buttonSettings.radius, style),
    sizeClasses,
    className
  );

  // Get inline styles for gradients
  const inlineStyles = getInlineStyles(variant, style);

  // Get background style for offset style using CSS variables
  const getOffsetBackgroundStyle = () => {
    if (variant === 'primary') {
      return { backgroundColor: 'var(--primary-button-background-color)' };
    }
    if (variant === 'secondary') {
      return { backgroundColor: 'var(--secondary-button-background-color)' };
    }
    if (variant === 'tertiary') {
      return { backgroundColor: 'var(--outline-hover-bg)' };
    }
    return { backgroundColor: 'var(--primary-button-background-color)' };
  };

  // Render button content with optional icon
  const renderButtonContent = () => {
    if (!buttonSettings.iconEnabled || variant === 'text-link') {
      return children;
    }

    // Get the icon component
    const IconComponent = iconName && LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<LucideProps>;
    const icon = IconComponent ? <IconComponent className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />;

    if (buttonSettings.iconPosition === 'left') {
      return (
        <>
          {icon}
          <span className="ml-2 inline-block">{children}</span>
        </>
      );
    } else {
      return (
        <>
          <span className="mr-2 inline-block">{children}</span>
          {icon}
        </>
      );
    }
  };

  // For offset background style, wrap with background element
  if (style === 'offset-background' && variant !== 'text-link') {
    const ButtonElement = href && !editMode ? 'a' : 'button';
    const elementProps = href && !editMode ? { href } : { type: 'button' as const, ...props };
    
    return (
      <div className="relative inline-flex group">
        {/* Background element */}
        <div 
          className={`absolute inset-0 transition-transform duration-200 transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 ${getRadiusClasses(buttonSettings.radius)}`}
          style={getOffsetBackgroundStyle()}
        />
        {/* Button element */}
        <ButtonElement 
          className={buttonClasses}
          style={inlineStyles}
          {...elementProps}
        >
          {renderButtonContent()}
        </ButtonElement>
      </div>
    );
  }

  // Regular rendering for other styles
  if (href && !editMode) {
    return (
      <a href={href} className={buttonClasses} style={inlineStyles}>
        {renderButtonContent()}
      </a>
    );
  }

  return (
    <button type="button" className={buttonClasses} style={inlineStyles} {...props}>
      {renderButtonContent()}
    </button>
  );
};

export default Button;