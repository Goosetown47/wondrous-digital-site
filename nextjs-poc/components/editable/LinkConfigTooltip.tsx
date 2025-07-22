'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { NavigationLink } from '../../hooks/useNavigationLinks';
import { useProject } from '../../contexts/ProjectContext';
import { supabase } from '../../utils/supabase';

interface Page {
  id: string;
  page_name: string;
  slug: string;
}

interface LinkConfigTooltipProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: Partial<NavigationLink>) => void;
  onDelete?: () => void;
  initialData?: Partial<NavigationLink>;
  sectionId: string;
  position: { x: number; y: number };
  slotIndex?: number;
  parentLinkId?: string;
}

const LinkConfigTooltip: React.FC<LinkConfigTooltipProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  sectionId,
  position,
  slotIndex = 0,
  parentLinkId
}) => {
  const { selectedProject } = useProject();
  const [pages, setPages] = useState<Page[]>([]);
  const [activeTab, setActiveTab] = useState<'link' | 'dropdown'>('link');
  const [linkData, setLinkData] = useState<Partial<NavigationLink>>({
    link_text: '',
    link_type: 'page',
    link_url: null,
    page_id: null,
    external_new_tab: false,
    show_external_icon: false,
    external_icon_color: '#666666',
    dropdown_behavior: 'passthrough',
    section_id: sectionId,
    parent_link_id: parentLinkId || null,
    position: slotIndex,
    ...initialData
  });
  const [hasDropdown, setHasDropdown] = useState(false);
  const [originalLinkType, setOriginalLinkType] = useState<'page' | 'external'>('page');
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Don't show dropdown tab for child links
  const showDropdownTab = !parentLinkId;

  useEffect(() => {
    if (isOpen) {
      fetchPages();
      
      // Update linkData and dropdown state when initialData changes
      if (initialData) {
        // Set dropdown state based on link_type
        const isDropdown = initialData.link_type === 'dropdown';
        setHasDropdown(isDropdown);
        
        // Track the original link type (for when dropdown is toggled off)
        if (!isDropdown && (initialData.link_type === 'page' || initialData.link_type === 'external')) {
          setOriginalLinkType(initialData.link_type);
        }
        
        setLinkData({
          link_text: initialData.link_text || '',
          link_type: initialData.link_type || 'page',
          link_url: initialData.link_url || null,
          page_id: initialData.page_id || null,
          external_new_tab: initialData.external_new_tab || false,
          show_external_icon: initialData.show_external_icon || false,
          external_icon_color: initialData.external_icon_color || '#666666',
          dropdown_behavior: initialData.dropdown_behavior || 'passthrough',
          section_id: sectionId,
          parent_link_id: initialData.parent_link_id || parentLinkId || null,
          position: initialData.position ?? slotIndex,
          ...initialData
        });
        
        // Set active tab to dropdown if it's a dropdown link
        if (isDropdown && showDropdownTab) {
          setActiveTab('dropdown');
        }
      } else {
        // Reset to defaults for new link
        setHasDropdown(false);
        setOriginalLinkType('page');
        setActiveTab('link');
        setLinkData({
          link_text: '',
          link_type: 'page',
          link_url: null,
          page_id: null,
          external_new_tab: false,
          show_external_icon: false,
          external_icon_color: '#666666',
          dropdown_behavior: 'passthrough',
          section_id: sectionId,
          parent_link_id: parentLinkId || null,
          position: slotIndex
        });
      }
    }
  }, [isOpen, initialData, sectionId, parentLinkId, slotIndex, showDropdownTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchPages = async () => {
    if (!selectedProject?.id) {
      console.error('No selected project - cannot fetch pages');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, page_name, slug')
        .eq('project_id', selectedProject.id)
        .order('page_name');

      if (error) throw error;
      console.log('Fetched pages for project', selectedProject.id, ':', data);
      setPages(data || []);
    } catch (err) {
      console.error('Error fetching pages:', err);
    }
  };

  const handleSave = () => {
    // Determine link type based on dropdown setting
    let finalLinkType: 'page' | 'external' | 'dropdown';
    if (hasDropdown) {
      finalLinkType = 'dropdown';
    } else {
      // Use the current link type from the form (which might have been changed)
      finalLinkType = linkData.link_type === 'dropdown' ? originalLinkType : (linkData.link_type as 'page' | 'external');
    }
    
    // Build the final data object with proper null values
    const finalData: Partial<NavigationLink> = {
      link_text: linkData.link_text,
      link_type: finalLinkType,
      section_id: linkData.section_id,
      parent_link_id: linkData.parent_link_id || null,
      position: linkData.position ?? 0,
      external_new_tab: linkData.external_new_tab || false,
      show_external_icon: linkData.show_external_icon || false,
      external_icon_color: linkData.external_icon_color || null,
      dropdown_behavior: linkData.dropdown_behavior || 'passthrough',
      // Keep URL/page data even for dropdowns (for when they're toggled back)
      link_url: linkData.link_url || null,
      page_id: linkData.page_id || null
    };

    onSave(finalData);
    onClose();
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete();
        // Only close tooltip after successful deletion
        onClose();
      } catch (error) {
        console.error('Error deleting navigation link:', error);
        // Show error to user without modal
        alert('Failed to delete navigation link. Please try again.');
      }
    } else {
      console.error('No onDelete function provided!');
    }
  };

  if (!isOpen) return null;

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y + 10, window.innerHeight - 400),
    zIndex: 1000,
  };

  return (
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {initialData?.id ? 'Edit Link' : 'Add Link'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs - Always show for main links */}
      {showDropdownTab && (
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('link')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'link'
                ? 'text-primary-pink border-primary-pink'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('dropdown')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'dropdown'
                ? 'text-primary-pink border-primary-pink'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Dropdown
          </button>
        </div>
      )}

      <div className="space-y-3">
        {/* Tab Content */}
        {(activeTab === 'link' || !showDropdownTab) && (
          <>
            {/* Nav Text - Always visible in General tab */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nav Text
              </label>
              <input
                type="text"
                value={linkData.link_text || ''}
                onChange={(e) => setLinkData({ ...linkData, link_text: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-pink focus:border-transparent"
                placeholder="Enter navigation text"
                autoFocus
              />
            </div>

            {/* Link configuration fields - Only show when NOT dropdown OR when dropdown with 'link' behavior */}
            {(!hasDropdown || (hasDropdown && linkData.dropdown_behavior === 'link')) && (
              <>
                {/* Link Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Link Type
                  </label>
                  <select
                    value={linkData.link_type === 'dropdown' ? originalLinkType : (linkData.link_type || 'page')}
                    onChange={(e) => {
                      const newType = e.target.value as 'page' | 'external';
                      setLinkData({ 
                        ...linkData, 
                        link_type: newType
                      });
                      setOriginalLinkType(newType);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-pink focus:border-transparent"
                  >
                    <option value="page">Internal Page</option>
                    <option value="external">External URL</option>
                  </select>
                </div>

                {/* Page Selection */}
                {(linkData.link_type === 'page' || (linkData.link_type === 'dropdown' && originalLinkType === 'page')) && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Select Page
                    </label>
                    <select
                      value={linkData.page_id || ''}
                      onChange={(e) => setLinkData({ ...linkData, page_id: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-pink focus:border-transparent"
                    >
                      <option value="">Select a page...</option>
                      {pages.map(page => (
                        <option key={page.id} value={page.id}>
                          {page.page_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* External URL */}
                {(linkData.link_type === 'external' || (linkData.link_type === 'dropdown' && originalLinkType === 'external')) && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    External URL
                  </label>
                  <input
                    type="url"
                    value={linkData.link_url || ''}
                    onChange={(e) => setLinkData({ ...linkData, link_url: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-pink focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={linkData.external_new_tab || false}
                      onChange={(e) => setLinkData({ ...linkData, external_new_tab: e.target.checked })}
                      className="mr-2"
                    />
                    Open in new tab
                  </label>
                  
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={linkData.show_external_icon || false}
                      onChange={(e) => setLinkData({ ...linkData, show_external_icon: e.target.checked })}
                      className="mr-2"
                    />
                    Show external icon
                  </label>
                </div>
                  </>
                )}
              </>
            )}

            {/* Dropdown Behavior Setting - Only show when dropdown is enabled */}
            {hasDropdown && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dropdown Click Behavior
                  </label>
                  <select
                    value={linkData.dropdown_behavior || 'passthrough'}
                    onChange={(e) => setLinkData({ 
                      ...linkData, 
                      dropdown_behavior: e.target.value as 'link' | 'passthrough'
                    })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-pink focus:border-transparent"
                  >
                    <option value="passthrough">Menu only (Passthrough)</option>
                    <option value="link">Navigate to page (Link)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {linkData.dropdown_behavior === 'link' 
                      ? 'Click navigates to page, hover shows dropdown menu'
                      : 'Click does nothing, hover shows dropdown menu'}
                  </p>
                </div>

                {/* Dropdown notice */}
                {linkData.dropdown_behavior === 'passthrough' && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <p className="text-xs text-amber-700">
                      Note: With "Menu only" selected, link settings above are saved but not used for navigation.
                      The link will only open the dropdown menu.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        {/* Dropdown Tab Content */}
        {activeTab === 'dropdown' && showDropdownTab && (
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasDropdown"
                checked={hasDropdown}
                onChange={(e) => setHasDropdown(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="hasDropdown" className="text-xs font-medium text-gray-700">
                Enable dropdown menu
              </label>
            </div>
            
            {hasDropdown && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p className="text-xs text-blue-700">
                  {initialData?.id 
                    ? "Save to update this link as a dropdown. Then you can add child links."
                    : "Save to create the dropdown. Then you can add child links."}
                </p>
              </div>
            )}
            
            {!hasDropdown && (
              <div className="text-xs text-gray-500">
                Enable dropdown to convert this link into a dropdown menu. The link will no longer navigate to a page but will instead show a submenu.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <div>
          {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 rounded"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </button>
            )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!linkData.link_text?.trim()}
            className="flex items-center px-3 py-1 text-xs bg-primary-pink text-white rounded hover:bg-primary-dark-purple disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkConfigTooltip;