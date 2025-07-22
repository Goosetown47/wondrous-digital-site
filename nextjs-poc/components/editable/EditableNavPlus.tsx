'use client';

import React, { useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import { Plus } from 'lucide-react';

interface EditableNavPlusProps {
  position: 'after-link' | 'end-of-nav' | 'vertical';
  parentLinkId?: string;
  onAddLink?: (position: string, parentId?: string) => void;
  textColor?: string;
}

const EditableNavPlus: React.FC<EditableNavPlusProps> = ({
  position,
  parentLinkId,
  onAddLink,
  textColor = '#000000'
}) => {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  
  if (!editMode) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddLink) {
      onAddLink(position, parentLinkId);
    } else {
      // TODO: Open LinkConfigModal in create mode
    }
  };
  
  // Different styles based on position
  const getButtonStyles = () => {
    switch (position) {
      case 'vertical':
        // For mobile/footer vertical layouts
        return 'w-full flex items-center justify-center py-2 border-2 border-dashed border-gray-300 rounded-lg';
      case 'end-of-nav':
        // At the end of horizontal navigation
        return 'ml-8';
      default:
        // Between navigation items
        return '';
    }
  };
  
  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group transition-all duration-200 ${getButtonStyles()}`}
    >
      <div
        className={`
          ${position === 'vertical' ? '' : 'w-8 h-8'}
          flex items-center justify-center rounded-full
          ${isHovered ? 'bg-blue-500' : 'bg-gray-300'}
          transition-colors duration-200
        `}
      >
        <Plus 
          className={`
            ${position === 'vertical' ? 'h-5 w-5' : 'h-4 w-4'}
            ${isHovered ? 'text-white' : 'text-gray-600'}
          `}
        />
      </div>
      {position === 'vertical' && (
        <span 
          className={`ml-2 ${isHovered ? 'text-blue-500' : 'text-gray-500'}`}
        >
          Add Link
        </span>
      )}
    </button>
  );
};

export default EditableNavPlus;