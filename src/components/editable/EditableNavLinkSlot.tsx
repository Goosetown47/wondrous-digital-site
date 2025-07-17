import React, { useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import { Plus } from 'lucide-react';

interface EditableNavLinkSlotProps {
  slotIndex: number;
  parentLinkId?: string;
  onAddLink: (slotIndex: number, parentId?: string, event?: React.MouseEvent) => void;
  textColor?: string;
  isVisible?: boolean;
  position?: 'horizontal' | 'vertical';
}

const EditableNavLinkSlot: React.FC<EditableNavLinkSlotProps> = ({
  slotIndex,
  parentLinkId,
  onAddLink,
  textColor = '#000000',
  isVisible = true,
  position = 'horizontal'
}) => {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  
  if (!editMode || !isVisible) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddLink(slotIndex, parentLinkId, e);
  };
  
  const baseClasses = "flex items-center justify-center border-2 border-dashed rounded-full transition-all duration-200 cursor-pointer";
  const sizeClasses = position === 'vertical' 
    ? "w-full h-10 rounded-lg" 
    : "w-8 h-8";
  const colorClasses = isHovered
    ? "border-primary-pink bg-primary-pink/10"
    : "border-gray-300 hover:border-gray-400";
  
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClasses} ${sizeClasses} ${colorClasses}`}
      title={`Add navigation link ${parentLinkId ? 'to dropdown' : ''}`}
    >
      <Plus 
        className={`transition-colors duration-200 ${
          isHovered ? 'text-primary-pink' : 'text-gray-400'
        }`}
        size={position === 'vertical' ? 20 : 16}
      />
    </div>
  );
};

export default EditableNavLinkSlot;