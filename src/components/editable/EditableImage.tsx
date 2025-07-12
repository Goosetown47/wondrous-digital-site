import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditImageTooltip from './tooltips/EditImageTooltip';

interface EditableImageProps {
  fieldName: string;
  src: string;
  alt?: string;
  className?: string;
}

const EditableImage: React.FC<EditableImageProps> = ({
  fieldName,
  src,
  alt = '',
  className = '',
  ...rest
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
  const handleUpdate = (value: { src: string; alt: string }) => {
    if (onContentUpdate) {
      onContentUpdate(fieldName, value);
    }
    setActiveEditField(null);
  };
  
  // Close the tooltip
  const handleClose = () => {
    setActiveEditField(null);
  };
  
  // If not in edit mode, just render the image normally
  if (!editMode) {
    return src ? (
      <img src={src} alt={alt} className={className} {...rest} />
    ) : (
      <div className={`${className} flex items-center justify-center bg-gray-200`} {...rest}>
        <ImageIcon className="h-12 w-12 text-gray-400" />
      </div>
    );
  }
  
  // In edit mode, add hover indicators and click handlers
  return (
    <div className="relative">
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className={`${className} ${isHovered ? 'outline-2 outline-blue-500 outline-dashed' : ''}`}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...rest}
        />
      ) : (
        <div 
          className={`${className} flex items-center justify-center bg-gray-200 ${
            isHovered ? 'outline-2 outline-blue-500 outline-dashed' : ''
          } cursor-pointer transition-all duration-150`}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...rest}
        >
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      {/* Edit tooltip */}
      {activeEditField === fieldName && (
        <EditImageTooltip
          src={src}
          alt={alt}
          position={tooltipPosition}
          onUpdate={handleUpdate}
          onClose={handleClose}
          bucketName="customer-sites"
        />
      )}
    </div>
  );
};

export default EditableImage;