import React, { useState, useRef, useEffect } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import { ChevronDown, ExternalLink } from 'lucide-react';
import EditableNavLinkSlot from './EditableNavLinkSlot';
import DraggableNavLink from '../navigation/DraggableNavLink';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface NavigationLink {
  id: string;
  link_text: string;
  link_type: 'page' | 'external' | 'dropdown';
  link_url?: string;
  page_id?: string;
  external_new_tab?: boolean;
  show_external_icon?: boolean;
  external_icon_color?: string;
  dropdown_behavior?: 'link' | 'passthrough';
  children?: NavigationLink[];
}

interface EditableNavLinkProps {
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

const EditableNavLink: React.FC<EditableNavLinkProps> = ({
  link,
  textColor = '#000000',
  isChild = false,
  openDropdownId,
  onDropdownToggle,
  onLinkClick,
  onAddChildLink,
  onEditLink
}) => {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Reset hover states when editMode changes
  useEffect(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
    setIsDropdownHovered(false);
  }, [editMode, link.link_text]);
  
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    // Add a small delay before hiding the dropdown
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100); // 100ms delay
  };
  
  const handleDropdownMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsDropdownHovered(true);
  };
  
  const handleDropdownMouseLeave = () => {
    setIsDropdownHovered(false);
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (editMode) {
      // In edit mode, don't handle the click here - let it bubble up to parent
      // The parent NavigationDesktop component handles the edit click
      return;
    } else if (link.link_type === 'dropdown') {
      // Check dropdown behavior
      if (link.dropdown_behavior === 'link' && link.link_url) {
        // Navigate to the link URL
        window.location.href = link.link_url;
      } else if (onDropdownToggle) {
        // Passthrough behavior or no URL - just toggle dropdown
        e.preventDefault();
        onDropdownToggle(link.id);
      }
    } else if (onLinkClick) {
      e.preventDefault();
      onLinkClick();
    }
  };

  const linkStyle = {
    color: isChild ? '#374151' : textColor,
  };

  const hoverClass = editMode && isHovered ? 'outline-2 outline-blue-500 outline-dashed' : '';
  
  if (link.link_type === 'dropdown') {
    return (
      <div 
        className="relative dropdown-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={(e) => {
            if (editMode) {
              e.preventDefault(); // Prevent default in edit mode
              // Let the click bubble up to parent
              return;
            }
            handleClick(e);
          }}
          className={`flex items-center space-x-1 hover:opacity-70 transition-opacity ${hoverClass} ${
            editMode ? 'cursor-pointer' : ''
          }`}
          style={linkStyle}
        >
          <span>{link.link_text}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${
            openDropdownId === link.id ? 'rotate-180' : ''
          }`} />
        </button>
        
        {/* Dropdown Menu - Show based on mode and interaction */}
        {(() => {
          // SIMPLE LOGIC: Only show dropdown in these cases:
          // 1. Edit mode AND dropdown type (for configuration)
          // 2. NOT edit mode AND hovering (for preview/browser)
          const shouldShow = (editMode && link.link_type === 'dropdown') || 
                            (!editMode && (isHovered || isDropdownHovered));
          
          // Debug logging
          if (link.link_type === 'dropdown') {
            console.log(`🔍 DROPDOWN DEBUG (${link.link_text}):`, {
              editMode: editMode,
              linkType: link.link_type,
              isHovered: isHovered,
              isDropdownHovered: isDropdownHovered,
              openDropdownId: openDropdownId,
              linkId: link.id,
              shouldShow: shouldShow,
              calculation: `(editMode=${editMode} && dropdown=${link.link_type==='dropdown'}) = ${editMode && link.link_type === 'dropdown'} || (!editMode=${!editMode} && hover=${isHovered || isDropdownHovered}) = ${!editMode && (isHovered || isDropdownHovered)}`
            });
          }
          
          return shouldShow;
        })() && (
          <div 
            className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            {editMode ? (
              // Edit mode: Show existing children with drag capability and slots for new ones
              <div className="space-y-1">
                <SortableContext
                  items={link.children?.map(c => c.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {/* Existing children with drag support */}
                  {link.children?.map((childLink, index) => (
                    <div key={childLink.id} className="px-2 py-1">
                      <DraggableNavLink
                        link={{...childLink, position: index}}
                        textColor="#374151"
                        isChild={true}
                        onEditLink={onEditLink}
                        onAddChildLink={onAddChildLink}
                        isDragDisabled={false}
                      />
                    </div>
                  ))}
                </SortableContext>
                
                {/* Add single child link slot */}
                {((link.children?.length || 0) < 5) && (
                  <div className="flex justify-center px-2 mt-2">
                    <EditableNavLinkSlot
                      slotIndex={link.children?.length || 0}
                      onAddLink={(slotIndex, _, event) => onAddChildLink?.(link.id, slotIndex, event)}
                      textColor={textColor}
                      position="horizontal"
                      isVisible={true}
                      parentLinkId={link.id}
                    />
                  </div>
                )}
              </div>
            ) : (
              // View mode: Show children normally
              link.children?.map((childLink) => (
                <EditableNavLink
                  key={childLink.id}
                  link={childLink}
                  isChild={true}
                  onLinkClick={onLinkClick}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Regular link
  const LinkElement = (
    <a
      href={editMode ? '#' : (link.link_url || '#')}
      onClick={(e) => {
        if (editMode) {
          e.preventDefault(); // Prevent navigation in edit mode
        } else if (onLinkClick) {
          e.preventDefault(); // Prevent default navigation when using custom handler
        }
        handleClick(e);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      target={link.external_new_tab ? '_blank' : undefined}
      rel={link.external_new_tab ? 'noopener noreferrer' : undefined}
      className={`${isChild ? 'block px-4 py-2 hover:bg-gray-50' : 'hover:opacity-70'} transition-opacity ${hoverClass} ${
        editMode ? 'cursor-pointer' : ''
      }`}
      style={linkStyle}
    >
      <span className="flex items-center space-x-1">
        <span>{link.link_text}</span>
        {link.link_type === 'external' && link.show_external_icon && (
          <ExternalLink 
            className="h-3 w-3" 
            style={{ color: link.external_icon_color || '#666666' }}
          />
        )}
      </span>
    </a>
  );

  return isChild ? LinkElement : <div className="dropdown-container">{LinkElement}</div>;
};

export default EditableNavLink;