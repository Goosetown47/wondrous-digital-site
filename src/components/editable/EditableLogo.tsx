import React, { useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditLogoTooltip from './tooltips/EditLogoTooltip';
import EditableImage from './EditableImage';
import EditableText from './EditableText';

interface EditableLogoProps {
  fieldName: string;
  logo: {
    type?: 'image' | 'text';
    src?: string;
    alt?: string;
    text?: string;
    href?: string;
  };
  textColor?: string;
  className?: string;
}

const EditableLogo: React.FC<EditableLogoProps> = ({
  fieldName,
  logo = { type: 'text', text: 'Logo', href: '/' },
  textColor = '#000000',
  className = ''
}) => {
  const { editMode, activeEditField, setActiveEditField, onContentUpdate } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
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
  const handleUpdate = (value: typeof logo) => {
    if (onContentUpdate) {
      onContentUpdate(fieldName, value);
    }
    setActiveEditField(null);
  };
  
  // Close the tooltip
  const handleClose = () => {
    setActiveEditField(null);
  };
  
  // Logo content rendering
  const logoContent = logo.type === 'image' ? (
    <img
      src={logo.src || ''}
      alt={logo.alt || 'Logo'}
      className="h-10 w-auto"
    />
  ) : (
    <span 
      className="text-2xl font-bold"
      style={{ color: textColor }}
    >
      {logo.text || 'Logo'}
    </span>
  );
  
  // If not in edit mode, just render the logo normally
  if (!editMode) {
    return (
      <a href={logo.href || '/'} className={`inline-block ${className}`}>
        {logoContent}
      </a>
    );
  }
  
  // In edit mode, add hover indicators and click handlers
  return (
    <>
      <div
        className={`inline-block ${className} ${
          isHovered ? 'outline-2 outline-blue-500 outline-dashed' : ''
        } cursor-pointer transition-all duration-150 relative`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <a href="#" onClick={(e) => e.preventDefault()} className="inline-block">
          {logoContent}
        </a>
      </div>
      
      {/* Edit tooltip */}
      {activeEditField === fieldName && (
        <EditLogoTooltip
          logo={logo}
          position={tooltipPosition}
          onUpdate={handleUpdate}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default EditableLogo;