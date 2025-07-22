import React, { useState, useEffect } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import { useNavigationLinks, NavigationLink as DBNavigationLink } from '../../hooks/useNavigationLinks';
import EditableImage from '../editable/EditableImage';
import EditableButton from '../editable/EditableButton';
import EditableNavLink from '../editable/EditableNavLink';
import EditableNavLinkSlot from '../editable/EditableNavLinkSlot';
import LinkConfigTooltip from '../editable/LinkConfigTooltip';
import EditableLogo from '../editable/EditableLogo';
import DraggableNavLink from '../navigation/DraggableNavLink';
import { Menu, X, ChevronDown } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  defaultDropAnimation,
  pointerWithin,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import '../../styles/section-typography.css';
import '../../styles/drag-drop.css';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

// Use the database NavigationLink type with additional fields for consistency
type NavigationLink = DBNavigationLink;

interface NavigationDesktopProps {
  sectionId?: string; // Add sectionId to fetch navigation links
  content: {
    // Logo
    logo?: {
      type?: 'image' | 'text';
      src?: string;
      alt?: string;
      text?: string;
      href?: string;
    };
    
    // Styling
    backgroundColor?: string;
    textColor?: string;
    
    // CTA Buttons
    ctaButton1?: {
      text?: string;
      href?: string;
      variant?: ButtonVariant;
      icon?: string;
    };
    ctaButton2?: {
      text?: string;
      href?: string;
      variant?: ButtonVariant;
      icon?: string;
    };
  };
  navigationLinks?: NavigationLink[];
  onLinkClick?: (link: NavigationLink | { href?: string }) => void;
  isGlobal?: boolean;
  isMobilePreview?: boolean;
}

const NavigationDesktop: React.FC<NavigationDesktopProps> = ({
  sectionId,
  content = {
    logo: {
      type: 'text',
      text: 'Logo',
      href: '/'
    },
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    ctaButton1: {
      text: 'Button',
      href: '#',
      variant: 'secondary'
    },
    ctaButton2: {
      text: 'Button',
      href: '#',
      variant: 'primary'
    }
  },
  navigationLinks = [],
  onLinkClick,
  isGlobal = false,
  isMobilePreview = false
}) => {
  const { editMode, isMobilePreview: contextMobilePreview } = useEditMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isNavHovered, setIsNavHovered] = useState(false);
  
  // Link configuration tooltip state
  const [isLinkTooltipOpen, setIsLinkTooltipOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number>(0);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // DnD sensors with optimized configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced from 8px for quicker response
        delay: 150, // Add slight delay to differentiate from clicks
        tolerance: 5, // Tolerance for touch devices
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Use the navigation links hook to fetch real links
  const { links: dbLinks, loading: linksLoading, createNavigationLink, updateNavigationLink, deleteNavigationLink, reorderNavigationLinks } = useNavigationLinks(sectionId);
  
  // Use contextMobilePreview if available, fallback to prop
  const isActuallyMobile = contextMobilePreview !== undefined ? contextMobilePreview : isMobilePreview;

  // Use real links from database or passed props, no mock data
  const displayLinks: NavigationLink[] = dbLinks.length > 0 ? dbLinks : navigationLinks;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as HTMLElement).closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  // Clear open dropdown when switching between edit and preview modes
  useEffect(() => {
    setOpenDropdownId(null);
  }, [editMode]);

  // Constants
  const MAX_NAV_LINKS = 6; // Maximum number of navigation links to show

  // Handler functions
  const handleAddLink = (slotIndex: number, parentId?: string, event?: React.MouseEvent) => {
    if (event) {
      // Use the event position for child links
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
    } else {
      // Fallback for main navigation slots
      const rect = document.querySelector('.navigation-links-container')?.getBoundingClientRect();
      if (rect) {
        setTooltipPosition({
          x: rect.left + (slotIndex * 120),
          y: rect.bottom
        });
      }
    }
    
    setEditingSlotIndex(slotIndex);
    setEditingParentId(parentId || null);
    setEditingLinkId(null);
    setIsLinkTooltipOpen(true);
  };

  const handleEditLink = (link: NavigationLink, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.bottom
    });
    
    setEditingLinkId(link.id);
    setEditingSlotIndex(link.position || 0);
    setEditingParentId(link.parent_link_id || null);
    setIsLinkTooltipOpen(true);
  };

  const handleSaveLink = async (linkData: Partial<NavigationLink>) => {
    console.log('handleSaveLink called with:', {
      linkData,
      editingLinkId,
      editingParentId,
      editingSlotIndex,
      sectionId
    });
    
    if (!sectionId) {
      console.error('Cannot save link: sectionId is missing');
      alert('Cannot save link: No section ID available');
      return;
    }
    
    try {
      if (editingLinkId) {
        // Update existing link
        const result = await updateNavigationLink(editingLinkId, linkData);
        if (result.error) {
          console.error('Update failed:', result.error);
          alert('Failed to update link: ' + result.error);
          return;
        }
        // If we're updating to a dropdown type, open it automatically
        if (linkData.link_type === 'dropdown') {
          setOpenDropdownId(editingLinkId);
        }
      } else {
        // Create new link - ensure all required fields are present
        const newLinkData = {
          link_text: linkData.link_text || '',
          link_type: linkData.link_type || 'page',
          link_url: linkData.link_url || null,
          page_id: linkData.page_id || null,
          external_new_tab: linkData.external_new_tab || false,
          show_external_icon: linkData.show_external_icon || false,
          external_icon_color: linkData.external_icon_color || null,
          section_id: sectionId!,
          position: editingSlotIndex,
          parent_link_id: editingParentId || null,
        };
        
        const result = await createNavigationLink(newLinkData);
        if (result.error) {
          console.error('Creation failed:', result.error);
          alert('Failed to create link: ' + result.error);
          return;
        }
        
        // If we just created a dropdown, open it automatically
        if (linkData.link_type === 'dropdown' && result.data) {
          setOpenDropdownId(result.data.id);
        }
      }
    } catch (error) {
      console.error('Error saving link:', error);
      alert('Unexpected error saving link: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDeleteLink = async () => {
    console.log('🔍 HANDLE DELETE LINK:', { 
      editingLinkId, 
      editingData: getEditingLinkData(),
      isChildLink: getEditingLinkData()?.parent_link_id 
    });
    
    if (editingLinkId) {
      const result = await deleteNavigationLink(editingLinkId);
      console.log('🔍 DELETE RESULT:', result);
      if (result.error) {
        console.error('Delete failed:', result.error);
        throw new Error('Failed to delete link: ' + result.error);
      }
      // Reset editing state after successful deletion
      setEditingLinkId(null);
      setIsLinkTooltipOpen(false);
    } else {
      console.error('No editing link ID provided for deletion');
      throw new Error('No link selected for deletion');
    }
  };

  const getEditingLinkData = () => {
    if (!editingLinkId) {
      return undefined;
    }
    
    // Search in both parent links and their children
    const findLinkById = (links: NavigationLink[], id: string): NavigationLink | undefined => {
      for (const link of links) {
        if (link.id === id) {
          return link;
        }
        if (link.children) {
          const childResult = findLinkById(link.children, id);
          if (childResult) return childResult;
        }
      }
      return undefined;
    };
    
    const linkData = findLinkById(displayLinks, editingLinkId);
    return linkData;
  };
  
  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Close all dropdowns and tooltips when starting drag
    setOpenDropdownId(null);
    setIsNavHovered(false);
    setIsLinkTooltipOpen(false);
    
    // Add class to body to disable hover effects during drag
    document.body.classList.add('dragging');
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Check if this is a child link drag (both have same parent)
      const activeLink = findLinkById(displayLinks, active.id as string);
      const overLink = findLinkById(displayLinks, over.id as string);
      
      if (activeLink && overLink) {
        // Check if both links have the same parent (child link reordering)
        if (activeLink.parent_link_id && activeLink.parent_link_id === overLink.parent_link_id) {
          // Find parent link
          const parentLink = displayLinks.find(link => link.id === activeLink.parent_link_id);
          if (parentLink && parentLink.children) {
            const oldIndex = parentLink.children.findIndex(child => child.id === active.id);
            const newIndex = parentLink.children.findIndex(child => child.id === over.id);
            
            if (oldIndex !== -1 && newIndex !== -1) {
              // Reorder children
              const newChildren = arrayMove(parentLink.children, oldIndex, newIndex);
              const reorderedChildren = newChildren.map((child, index) => ({
                ...child,
                position: index
              }));
              
              // Update all child positions
              await reorderNavigationLinks(reorderedChildren);
            }
          }
        } else if (!activeLink.parent_link_id && !overLink.parent_link_id) {
          // Parent link reordering
          const oldIndex = displayLinks.findIndex(link => link.id === active.id);
          const newIndex = displayLinks.findIndex(link => link.id === over.id);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            // Reorder the links
            const newLinks = arrayMove(displayLinks, oldIndex, newIndex);
            
            // Update positions based on new order
            const reorderedLinks = newLinks.map((link, index) => ({
              ...link,
              position: index
            }));
            
            // Call the reorder function from the hook
            await reorderNavigationLinks(reorderedLinks);
          }
        }
      }
    }
    
    setActiveId(null);
    // Reset hover state after drag ends
    setIsNavHovered(false);
    
    // Remove dragging class from body
    document.body.classList.remove('dragging');
  };
  
  const handleDragCancel = () => {
    setActiveId(null);
    setIsNavHovered(false);
    document.body.classList.remove('dragging');
  };
  
  // Find active link for DragOverlay
  const findLinkById = (links: NavigationLink[], id: string): NavigationLink | undefined => {
    for (const link of links) {
      if (link.id === id) {
        return link;
      }
      if (link.children) {
        const childResult = findLinkById(link.children, id);
        if (childResult) return childResult;
      }
    }
    return undefined;
  };
  
  const activeLink = activeId ? findLinkById(displayLinks, activeId) : null;
  
  // Custom collision detection for better nested drag behavior
  const collisionDetection = (args: Parameters<typeof pointerWithin>[0]) => {
    // First try pointer within for more accurate detection
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    
    // Fallback to closest center
    return closestCenter(args);
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: content.backgroundColor || '#FFFFFF',
    color: content.textColor || '#000000'
  };

  // Calculate max dropdown height for spacer in edit mode
  const getMaxDropdownHeight = () => {
    if (!editMode) return 0;
    
    const dropdownLinks = displayLinks.filter(link => 
      link.link_type === 'dropdown' && !link.parent_link_id
    );
    
    if (dropdownLinks.length === 0) return 0;
    
    // Calculate height: 40px per child + 40px for add button + padding
    return Math.max(...dropdownLinks.map(link => 
      ((link.children?.length || 0) + 1) * 40 + 24 // 24px for padding
    ));
  };

  const maxDropdownHeight = getMaxDropdownHeight();
  
  // Custom drop animation for smoother experience
  const dropAnimation = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  return (
    <>
      <section className="w-full website-section sticky top-0 z-40 shadow-sm" style={sectionStyle}>
        <div className="section-content-container">
          <div className="px-6 md:px-8 lg:px-12 py-4">
            <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <EditableLogo
                fieldName="logo"
                logo={content.logo || { type: 'text', text: 'Logo', href: '/' }}
                textColor={content.textColor}
                onLogoClick={onLinkClick}
              />
            </div>

            {/* Desktop Navigation - Hide on mobile preview */}
            {!isActuallyMobile && (
              <>
                {/* Navigation Links - Center */}
                <div 
                  className="navigation-links-container flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2"
                  onMouseEnter={() => setIsNavHovered(true)}
                  onMouseLeave={() => setIsNavHovered(false)}
                >
                  {editMode ? (
                    // Edit mode with drag & drop
                    <DndContext
                      sensors={sensors}
                      collisionDetection={collisionDetection}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragCancel={handleDragCancel}
                      autoScroll={{
                        threshold: {
                          x: 0.2,
                          y: 0.2,
                        },
                        acceleration: 10,
                      }}
                    >
                      <SortableContext
                        items={displayLinks.filter(l => !l.parent_link_id).map(l => l.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        {(() => {
                          // Get parent links sorted by position
                          const parentLinks = displayLinks
                            .filter(l => !l.parent_link_id)
                            .sort((a, b) => (a.position || 0) - (b.position || 0));
                          
                          // Render links and slots
                          const elements = [];
                          
                          // Render existing links
                          parentLinks.forEach((link, idx) => {
                            elements.push(
                              <DraggableNavLink
                                key={link.id}
                                link={link}
                                textColor={content.textColor}
                                openDropdownId={openDropdownId}
                                onDropdownToggle={(id) => setOpenDropdownId(openDropdownId === id ? null : id)}
                                onAddChildLink={handleAddLink}
                                onEditLink={handleEditLink}
                                isDragDisabled={false}
                              />
                            );
                          });
                          
                          // Add one slot after all links if we haven't reached max
                          if (parentLinks.length < MAX_NAV_LINKS) {
                            elements.push(
                              <EditableNavLinkSlot
                                key={`slot-${parentLinks.length}`}
                                slotIndex={parentLinks.length}
                                onAddLink={handleAddLink}
                                textColor={content.textColor}
                                isVisible={true} // Always visible in edit mode
                              />
                            );
                          }
                          
                          return elements;
                        })()}
                      </SortableContext>
                      <DragOverlay dropAnimation={dropAnimation}>
                        {activeId && activeLink ? (
                          <div 
                            key={activeId}
                            className="opacity-90 transform scale-105 shadow-lg rounded-lg pointer-events-none"
                            style={{
                              backgroundColor: content.backgroundColor,
                              padding: '8px',
                            }}
                          >
                            <EditableNavLink
                              link={activeLink}
                              textColor={content.textColor}
                              isDragDisabled={true}
                            />
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  ) : (
                    // Non-edit mode without drag & drop
                    displayLinks.filter(l => !l.parent_link_id).map((link) => (
                      <div key={link.id}>
                        <EditableNavLink
                          link={link}
                          textColor={content.textColor}
                          onLinkClick={() => onLinkClick?.(link)}
                        />
                      </div>
                    ))
                  )}
                </div>

                {/* CTA Buttons - Right */}
                <div className="flex items-center space-x-3">
                  <EditableButton
                    fieldName="ctaButton1"
                    text={content.ctaButton1?.text || 'Button'}
                    href={content.ctaButton1?.href || '#'}
                    variant={content.ctaButton1?.variant || 'secondary'}
                    icon={content.ctaButton1?.icon}
                  />
                  <EditableButton
                    fieldName="ctaButton2"
                    text={content.ctaButton2?.text || 'Button'}
                    href={content.ctaButton2?.href || '#'}
                    variant={content.ctaButton2?.variant || 'primary'}
                    icon={content.ctaButton2?.icon}
                  />
                </div>
              </>
            )}

            {/* Mobile Hamburger - Show only in mobile preview */}
            {isActuallyMobile && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
                style={{ color: content.textColor }}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isActuallyMobile && isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50" style={{ backgroundColor: content.backgroundColor }}>
          <div className="section-content-container h-full">
            <div className="px-6 py-4 h-full flex flex-col">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex-shrink-0">
                  <EditableLogo
                    fieldName="logo"
                    logo={content.logo || { type: 'text', text: 'Logo', href: '/' }}
                    textColor={content.textColor}
                    onLogoClick={onLinkClick}
                  />
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2"
                  style={{ color: content.textColor }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex-1 space-y-4">
                {displayLinks.filter(link => !link.parent_link_id).map((link) => (
                  <div key={link.id}>
                    {link.link_type === 'dropdown' ? (
                      <div>
                        <button
                          onClick={() => !editMode && setOpenDropdownId(openDropdownId === link.id ? null : link.id)}
                          className="w-full flex items-center justify-between py-2 text-lg"
                          style={{ color: content.textColor }}
                        >
                          <span>{link.link_text}</span>
                          <ChevronDown className={`h-5 w-5 transition-transform ${
                            openDropdownId === link.id ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        {((!editMode && openDropdownId === link.id) || (editMode && link.link_type === 'dropdown')) && (
                          <div className="pl-4 space-y-2 mt-2">
                            {link.children?.map((childLink) => (
                              <a
                                key={childLink.id}
                                href={childLink.link_url || '#'}
                                className="block py-2 text-gray-600"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {childLink.link_text}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <a
                        href={link.link_url || '#'}
                        className="block py-2 text-lg"
                        style={{ color: content.textColor }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.link_text}
                      </a>
                    )}
                  </div>
                ))}
                
                {/* Mobile Add Link Slots */}
                {editMode && Array.from({ length: Math.min(3, MAX_NAV_LINKS - displayLinks.length) }, (_, index) => (
                  <EditableNavLinkSlot
                    key={`mobile-slot-${displayLinks.length + index}`}
                    slotIndex={displayLinks.length + index}
                    onAddLink={handleAddLink}
                    textColor={content.textColor}
                    position="vertical"
                  />
                ))}
              </div>

              {/* Mobile CTA Buttons */}
              <div className="space-y-3 mt-8">
                <EditableButton
                  fieldName="ctaButton1"
                  text={content.ctaButton1?.text || 'Button'}
                  href={content.ctaButton1?.href || '#'}
                  variant={content.ctaButton1?.variant || 'secondary'}
                  icon={content.ctaButton1?.icon}
                  className="w-full"
                />
                <EditableButton
                  fieldName="ctaButton2"
                  text={content.ctaButton2?.text || 'Button'}
                  href={content.ctaButton2?.href || '#'}
                  variant={content.ctaButton2?.variant || 'primary'}
                  icon={content.ctaButton2?.icon}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Configuration Tooltip */}
      {sectionId && (
        <LinkConfigTooltip
          isOpen={isLinkTooltipOpen}
          onClose={() => setIsLinkTooltipOpen(false)}
          onSave={handleSaveLink}
          onDelete={editingLinkId ? handleDeleteLink : undefined}
          initialData={getEditingLinkData()}
          sectionId={sectionId}
          position={tooltipPosition}
          slotIndex={editingSlotIndex}
          parentLinkId={editingParentId}
        />
      )}
    </section>
    
    {/* Spacer for dropdown editing in PageBuilder */}
    {editMode && maxDropdownHeight > 0 && (
      <div 
        className="w-full bg-gray-100" 
        style={{ height: `${maxDropdownHeight}px` }}
        aria-hidden="true"
      />
    )}
    </>
  );
};

export default NavigationDesktop;