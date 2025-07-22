'use client';

import React, { useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditIconTooltip from './tooltips/EditIconTooltip';
import * as LucideIcons from 'lucide-react';
import { LucideCrop as LucideProps } from 'lucide-react';

interface EditableIconProps {
  fieldName: string;
  icon: string | React.ComponentType<any>; // Icon name or component
  className?: string;
  size?: number;
  color?: string;
}

const EditableIcon: React.FC<EditableIconProps> = ({
  fieldName,
  icon,
  className = '',
  size = 24,
  color,
  ...rest
}) => {
  const { editMode, activeEditField, setActiveEditField, onContentUpdate } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Handle various icon input formats with defensive programming
  let iconName = "Box"; // Default fallback
  
  // Case 1: Direct string value
  if (typeof icon === 'string' && icon && icon.trim() !== '') {
    // If icon is already a string, use it directly
    iconName = String(icon).trim();
  } 
  // Case 2: Object with icon property
  else if (icon && typeof icon === 'object' && typeof icon.icon === 'string' && icon.icon.trim() !== '') {
    iconName = String(icon.icon).trim();
  }
  
  // Ensure iconName is always a valid string
  iconName = typeof iconName === 'string' ? iconName.trim() : "Box";
  
  // Ensure the iconName is a valid key in LucideIcons
  let IconComponent: React.FC<LucideProps>;
  
  // Check if the iconName exists in LucideIcons and is a valid component
  const requestedIcon = LucideIcons[iconName as keyof typeof LucideIcons];
  if (requestedIcon && 
      typeof requestedIcon === 'object' &&
      requestedIcon.$$typeof &&
      /^[A-Z][A-Za-z0-9]*$/.test(iconName) &&
      !iconName.endsWith('Icon') &&
      iconName !== 'createLucideIcon' &&
      iconName !== 'icons' &&
      iconName !== 'IconNode') {
    IconComponent = requestedIcon;
  } else {
    // Fallback to Square icon if the requested icon doesn't exist
    console.warn(`Icon "${iconName}" not found in Lucide icons, falling back to Square`);
    IconComponent = LucideIcons.Square;
  }
  
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
  const handleUpdate = (value: { icon: string; size: number; color?: string }) => {
    if (onContentUpdate) {
      onContentUpdate(fieldName, value);
    }
    setActiveEditField(null);
  };
  
  // Close the tooltip
  const handleClose = () => {
    setActiveEditField(null);
  };
  
  // If not in edit mode, just render the icon normally
  if (!editMode) {
    return <IconComponent className={className} size={size} color={color} {...rest} />;
  }
  
  // In edit mode, add hover indicators and click handlers
  return (
    <>
      <div
        className={`inline-block ${
          isHovered ? 'outline-2 outline-blue-500 outline-dashed' : ''
        } cursor-pointer transition-all duration-150`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <IconComponent className={className} size={size} color={color} {...rest} />
      </div>
      
      {/* Edit tooltip */}
      {activeEditField === fieldName && (
        <EditIconTooltip
          icon={iconName}
          size={size}
          color={color}
          position={tooltipPosition}
          onUpdate={handleUpdate}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default EditableIcon;