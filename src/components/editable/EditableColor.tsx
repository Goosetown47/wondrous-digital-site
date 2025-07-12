import React, { useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditColorTooltip from './tooltips/EditColorTooltip';

interface EditableColorProps {
  fieldName: string;
  defaultValue: string;
  className?: string;
  width?: number;
  height?: number;
}

const EditableColor: React.FC<EditableColorProps> = ({
  fieldName,
  defaultValue,
  className = '',
  width = 75,
  height = 75,
  ...rest
}) => {
  const { editMode, activeEditField, setActiveEditField, onContentUpdate } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Handle click to open edit tooltip
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
  const handleUpdate = (value: { color: string }) => {
    if (onContentUpdate) {
      onContentUpdate(fieldName, value);
    }
    setActiveEditField(null);
  };
  
  // Close the tooltip
  const handleClose = () => {
    setActiveEditField(null);
  };
  
  // If not in edit mode, just render a div with the background color
  if (!editMode) {
    return (
      <div
        className={className}
        style={{
          backgroundColor: defaultValue,
          width: width,
          height: height,
          ...rest.style
        }}
        {...rest}
      />
    );
  }
  
  // In edit mode, add hover indicators and click handlers
  return (
    <>
      <div
        className={`${className} ${
          isHovered ? 'outline-2 outline-blue-500 outline-dashed' : ''
        } cursor-pointer transition-all duration-150 relative`}
        style={{
          backgroundColor: defaultValue,
          width: width,
          height: height,
          ...rest.style
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        {...rest}
      />
      
      {/* Edit tooltip */}
      {activeEditField === fieldName && (
        <EditColorTooltip
          color={defaultValue}
          position={tooltipPosition}
          onUpdate={handleUpdate}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default EditableColor;