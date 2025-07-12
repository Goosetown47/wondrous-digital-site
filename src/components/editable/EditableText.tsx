import React, { useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditTextTooltip from './tooltips/EditTextTooltip';

interface EditableTextProps {
  fieldName: string;
  defaultValue: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  className?: string;
  children?: React.ReactNode;
  color?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  fieldName,
  defaultValue,
  as = 'p',
  className = '',
  children,
  color,
  ...rest
}) => {
  const { editMode, activeEditField, setActiveEditField, onContentUpdate } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Use provided children or defaultValue
  const content = children || defaultValue;
  
  const Element = as as keyof JSX.IntrinsicElements;
  
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
  const handleUpdate = (value: { text: string; color?: string }) => {
    if (onContentUpdate) {
      onContentUpdate(fieldName, value);
    }
    setActiveEditField(null);
  };
  
  // Close the tooltip
  const handleClose = () => {
    setActiveEditField(null);
  };
  
  // If not in edit mode, just render the element normally
  if (!editMode) {
    return (
      <Element className={className} style={{ color }} {...rest}>
        {content}
      </Element>
    );
  }
  
  // In edit mode, add hover indicators and click handlers
  return (
    <>
      <Element
        className={`${className} ${
          isHovered ? 'outline-2 outline-blue-500 outline-dashed' : ''
        } cursor-pointer transition-all duration-150 relative`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        style={{ color }}
        {...rest}
      >
        {content}
      </Element>
      
      {/* Edit tooltip */}
      {activeEditField === fieldName && (
        <EditTextTooltip
          text={typeof content === 'string' ? content : defaultValue}
          color={color}
          position={tooltipPosition}
          onUpdate={handleUpdate}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default EditableText;