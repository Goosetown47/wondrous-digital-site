import React, { useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditButtonTooltip from './tooltips/EditButtonTooltip';
import Button, { ButtonStyle } from '../ui/Button';
import { useSiteStyles } from '../../contexts/SiteStylesContext';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'text-link';

interface EditableButtonProps {
  fieldName: string;
  text: string;
  href?: string;
  icon?: string;
  className?: string;
  variant?: ButtonVariant;
  children?: React.ReactNode;
}

const EditableButton: React.FC<EditableButtonProps> = ({
  fieldName,
  text,
  href = '#',
  icon,
  className = '',
  variant = 'primary',
  children,
  ...rest
}) => {
  const { editMode, activeEditField, setActiveEditField, onContentUpdate } = useEditMode();
  const { styles } = useSiteStyles();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Use provided children or text
  const content = children || text;
  
  // Handle click to open edit tooltip
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!editMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get element's position for tooltip placement
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.x,
      y: rect.y + rect.height,
    });
    
    setActiveEditField(fieldName);
  };
  
  // Handle updates from the tooltip
  const handleUpdate = (value: { text: string; href: string; variant: ButtonVariant; icon?: string }) => {
    if (onContentUpdate) {
      onContentUpdate(fieldName, value);
    }
    setActiveEditField(null);
  };
  // Generate button styles based on variant
  // Close the tooltip
  const handleClose = () => {
    setActiveEditField(null);
  };
  
  // If not in edit mode, render the button/link normally
  if (!editMode) {
    return (
      <Button
        variant={variant}
        href={href}
        iconName={icon}
        style={(styles.button_style as ButtonStyle) || 'default'}
        className={className}
        {...rest}
      >
        {content}
      </Button>
    );
  }
  
  // In edit mode, add hover indicators and click handlers
  return (
    <>
      <Button
        variant={variant}
        href={href}
        iconName={icon}
        style={(styles.button_style as ButtonStyle) || 'default'}
        editMode={true}
        className={`${className} ${
          isHovered ? 'outline-2 outline-blue-500 outline-dashed' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        {...rest}
      >
        {content}
      </Button>
      
      {/* Edit tooltip */}
      {activeEditField === fieldName && (
        <EditButtonTooltip
          text={typeof content === 'string' ? content : text}
          href={href}
          variant={variant}
          icon={icon}
          position={tooltipPosition}
          onUpdate={handleUpdate}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default EditableButton;