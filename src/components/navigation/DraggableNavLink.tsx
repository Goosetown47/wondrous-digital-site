import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import EditableNavLink from '../editable/EditableNavLink';
import { NavigationLink } from '../../hooks/useNavigationLinks';

interface DraggableNavLinkProps {
  link: NavigationLink;
  textColor?: string;
  isChild?: boolean;
  openDropdownId?: string | null;
  onDropdownToggle?: (id: string) => void;
  onLinkClick?: () => void;
  onAddChildLink?: (parentId: string, slotIndex: number, event?: React.MouseEvent) => void;
  onEditLink?: (link: NavigationLink, event?: React.MouseEvent) => void;
  isDragDisabled?: boolean;
}

const DraggableNavLink: React.FC<DraggableNavLinkProps> = ({
  link,
  textColor,
  isChild,
  openDropdownId,
  onDropdownToggle,
  onLinkClick,
  onAddChildLink,
  onEditLink,
  isDragDisabled = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: link.id,
    disabled: isDragDisabled,
    animateLayoutChanges: () => false, // Disable layout animations for smoother drag
  });

  // Use translate3d for hardware acceleration
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scaleX}, ${transform.scaleY})` : undefined,
    transition: transition || 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    opacity: isDragging ? 0.9 : 1,
    cursor: isDragging ? 'grabbing' : 'auto',
    willChange: isDragging ? 'transform' : 'auto',
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
  };

  const handleClick = (e: React.MouseEvent) => {
    // If clicking on the link itself (not the drag handle), trigger edit
    if (onEditLink && !isDragDisabled) {
      onEditLink(link, e);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center draggable-container ${isDragging ? 'z-50 shadow-lg scale-105 dragging-item' : ''} transition-shadow`}
      onClick={handleClick}
    >
      {!isDragDisabled && (
        <div
          {...attributes}
          {...listeners}
          className="drag-handle cursor-grab hover:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 mr-2 transition-all"
          onClick={(e) => e.stopPropagation()} // Prevent edit when dragging
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <EditableNavLink
        link={link}
        textColor={textColor}
        isChild={isChild}
        openDropdownId={openDropdownId}
        onDropdownToggle={onDropdownToggle}
        onLinkClick={onLinkClick}
        onAddChildLink={onAddChildLink}
        onEditLink={onEditLink}
      />
    </div>
  );
};

export default React.memo(DraggableNavLink);