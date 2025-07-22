'use client';

import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import EditImageTooltip from './tooltips/EditImageTooltip';

interface EditableImageProps {
  fieldName: string;
  src: string;
  alt?: string;
  className?: string;
  imageScaling?: string;
  containerMode?: 'section-height' | 'fixed-shape';
  containerAspectRatio?: string;
  containerSize?: 'small' | 'medium' | 'large';
}

const EditableImage: React.FC<EditableImageProps> = ({
  fieldName,
  src,
  alt = '',
  className = '',
  imageScaling,
  containerMode = 'section-height',
  containerAspectRatio = '16:9',
  containerSize = 'medium',
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
  const handleUpdate = (value: { src: string; alt: string; imageScaling?: string; containerMode?: string; containerAspectRatio?: string; containerSize?: string }) => {
    if (onContentUpdate) {
      onContentUpdate(fieldName, value);
    }
    setActiveEditField(null);
  };
  
  // Close the tooltip
  const handleClose = () => {
    setActiveEditField(null);
  };

  // Get container dimensions based on mode and settings
  const getContainerDimensions = () => {
    if (containerMode === 'section-height') {
      return {
        className: 'w-full h-full',
        style: {}
      };
    }
    
    // Fixed-shape mode
    const aspectRatioMap = {
      '16:9': { width: 16, height: 9 },
      '4:3': { width: 4, height: 3 },
      '3:2': { width: 3, height: 2 },
      '1:1': { width: 1, height: 1 },
      '9:16': { width: 9, height: 16 }
    };
    
    const sizeMap = {
      small: 320,
      medium: 480,
      large: 640
    };
    
    const ratio = aspectRatioMap[containerAspectRatio] || aspectRatioMap['16:9'];
    const baseWidth = sizeMap[containerSize] || sizeMap.medium;
    const height = Math.round((baseWidth * ratio.height) / ratio.width);
    
    return {
      className: 'relative mx-auto',
      style: {
        width: `${baseWidth}px`,
        height: `${height}px`,
        maxWidth: '100%'
      }
    };
  };

  // Get object-fit style based on imageScaling option
  const getImageStyle = () => {
    const style: React.CSSProperties = {
      width: '100%'
    };
    
    switch (imageScaling) {
      case 'fill-height':
        style.objectFit = 'cover';
        style.objectPosition = 'center';
        style.height = '100%';
        break;
      case 'fit-image':
        style.objectFit = 'contain';
        style.objectPosition = 'center';
        style.height = '100%';
        break;
      case 'center-crop':
        style.objectFit = 'cover';
        style.objectPosition = 'center';
        style.height = '100%';
        break;
      case 'auto-height':
        style.objectFit = 'scale-down';
        style.objectPosition = 'center';
        if (containerMode === 'fixed-shape') {
          style.height = '100%';
          style.maxHeight = '100%';
        } else {
          style.height = 'auto';
          style.maxHeight = '100%';
        }
        break;
      default:
        // Default to fill-height if no option specified
        style.objectFit = 'cover';
        style.objectPosition = 'center';
        style.height = '100%';
    }
    
    return style;
  };
  
  // Get container configuration
  const containerConfig = getContainerDimensions();
  
  // Render image content (used in both edit and non-edit modes)
  const renderImageContent = () => {
    if (src) {
      return (
        <img 
          src={src} 
          alt={alt} 
          className={editMode && isHovered ? 'outline-2 outline-blue-500 outline-dashed' : ''}
          style={getImageStyle()}
          onClick={editMode ? handleClick : undefined}
          onMouseEnter={editMode ? () => setIsHovered(true) : undefined}
          onMouseLeave={editMode ? () => setIsHovered(false) : undefined}
        />
      );
    } else {
      return (
        <div 
          className={`w-full h-full flex items-center justify-center bg-gray-200 ${
            editMode && isHovered ? 'outline-2 outline-blue-500 outline-dashed' : ''
          } ${editMode ? 'cursor-pointer transition-all duration-150' : ''}`}
          onClick={editMode ? handleClick : undefined}
          onMouseEnter={editMode ? () => setIsHovered(true) : undefined}
          onMouseLeave={editMode ? () => setIsHovered(false) : undefined}
        >
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      );
    }
  };

  // Main container wrapper
  return (
    <div 
      className={`${containerConfig.className} ${className} ${editMode ? 'relative' : ''}`}
      style={containerConfig.style}
      {...rest}
    >
      {renderImageContent()}
      
      {/* Edit tooltip */}
      {editMode && activeEditField === fieldName && (
        <EditImageTooltip
          src={src}
          alt={alt}
          imageScaling={imageScaling}
          containerMode={containerMode}
          containerAspectRatio={containerAspectRatio}
          containerSize={containerSize}
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