import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Link as LinkIcon, Palette, Type, Image } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useSiteStyles } from '../../../contexts/SiteStylesContext';
import Button from '../../ui/Button';

// Common icons to display when no search is active
const DEFAULT_ICONS = [
  'Home', 'User', 'Settings', 'Mail', 'Phone',
  'Calendar', 'Search', 'Bell', 'Heart', 'Star',
  'Check', 'X', 'Plus', 'Edit', 'Trash2',
  'ArrowRight', 'Image', 'FileText', 'Save', 'Menu'
];

const EditButtonTooltip: React.FC<any> = ({
  text,
  href,
  variant,
  icon,
  position,
  onUpdate,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'icon'>('content');
  const [editedText, setEditedText] = useState(text);
  const [editedHref, setEditedHref] = useState(href);
  const [editedVariant, setEditedVariant] = useState(variant);
  const [editedIcon, setEditedIcon] = useState(icon || 'ChevronRight');
  const [searchTerm, setSearchTerm] = useState('');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const { styles } = useSiteStyles();
  
  // Get icon enabled setting for current variant
  const iconEnabledField = variant === 'text-link' ? 'textlink_button_icon_enabled' : `${variant}_button_icon_enabled`;
  const isIconEnabled = styles[iconEnabledField] || false;
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Calculate tooltip position to ensure it's visible
  useEffect(() => {
    if (tooltipRef.current) {
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      
      // Initial position below the element
      let newTop = position.y + 10 + scrollY;
      let newLeft = position.x;
      
      // Space available below and above the element
      const spaceBelow = viewportHeight - (position.y - scrollY + 10);
      const spaceAbove = position.y - scrollY - 10;
      
      // Check if tooltip would go below viewport
      if (tooltipRect.height > spaceBelow) {
        // Position above element instead
        if (spaceAbove > tooltipRect.height || spaceAbove > spaceBelow) {
          // If there's more space above than below, position above
          newTop = position.y - tooltipRect.height - 10 + scrollY;
        } else {
          // Otherwise, position at the top of the viewport with margin and ensure it's scrollable
          newTop = scrollY + 10;
        }
      }
      
      // Check if tooltip would go right of viewport
      if (newLeft + tooltipRect.width > viewportWidth) {
        // Align right edge of tooltip with right edge of viewport minus margin
        newLeft = viewportWidth - tooltipRect.width - 10;
      }
      
      // Check if tooltip would go left of viewport
      if (newLeft < 10) {
        newLeft = 10;
      }
      
      // If tooltip is taller than viewport, position at top with a margin
      if (tooltipRect.height > viewportHeight - 20) {
        newTop = scrollY + 10;
      }
      
      setTooltipStyle({
        left: `${newLeft}px`,
        top: `${newTop}px`,
        maxHeight: `${viewportHeight - 20}px`,
        overflowY: 'auto'
      });
    }
  }, [position, editedText, editedHref, editedVariant, editedIcon, activeTab]);
  
  // Handle save
  const handleSave = () => {
    onUpdate({
      text: editedText,
      href: editedHref,
      variant: editedVariant,
      icon: isIconEnabled ? editedIcon : undefined
    });
  };
  
  // Filter icons based on search term
  const iconNames = Object.keys(LucideIcons).filter(
    key => {
      const icon = LucideIcons[key as keyof typeof LucideIcons];
      return icon &&
             typeof icon === 'object' &&
             icon.$$typeof &&
             /^[A-Z][A-Za-z0-9]*$/.test(key) &&
             !key.endsWith('Icon') &&
             key !== 'createLucideIcon' &&
             key !== 'icons' &&
             key !== 'IconNode';
    }
  );
  
  const filteredIcons = iconNames.filter((name) => {
    if (!searchTerm.trim()) {
      return DEFAULT_ICONS.includes(name);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const nameLower = name.toLowerCase();
      const nameParts = name.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
      return nameLower.includes(searchLower) || nameParts.includes(searchLower);
    }
  });
  
  const sortedIcons = filteredIcons.sort();
  const iconsToDisplay = searchTerm ? sortedIcons.slice(0, 40) : sortedIcons;
  
  return (
    <div 
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80"
      style={tooltipStyle}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800">Edit Button</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Tabs - only show icon tab if icons are enabled */}
      {isIconEnabled && (
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'content'
                ? 'text-primary-pink border-b-2 border-primary-pink'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('content')}
          >
            <div className="flex items-center">
              <Type size={14} className="mr-1" />
              Content
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'icon'
                ? 'text-primary-pink border-b-2 border-primary-pink'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('icon')}
          >
            <div className="flex items-center">
              <Image size={14} className="mr-1" />
              Icon
            </div>
          </button>
        </div>
      )}
      
      {/* Content Tab */}
      {activeTab === 'content' && (
        <>
          {/* Button text */}
          <div className="mb-3">
        <label htmlFor="button-text" className="block text-sm font-medium text-gray-700 mb-1">
          Button Text ({editedText.length}/21)
        </label>
        <input
          id="button-text"
          type="text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value.slice(0, 21))}
          maxLength={21}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
        />
      </div>
      
      {/* Button link */}
      <div className="mb-3">
        <label htmlFor="button-link" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center">
            <LinkIcon size={14} className="mr-1" />
            Link URL
          </div>
        </label>
        <input
          id="button-link"
          type="text"
          value={editedHref}
          onChange={(e) => setEditedHref(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
          placeholder="https://example.com or /about"
        />
      </div>
      
      {/* Button style */}
      <div className="mb-4">
        <label htmlFor="button-style" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center">
            <Palette size={14} className="mr-1" />
            Button Style
          </div>
        </label>
        <select
          id="button-style"
          value={editedVariant}
          onChange={(e) => setEditedVariant(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="tertiary">Tertiary</option>
          <option value="text-link">Text Link</option>
        </select>
      </div>
      
          {/* Button preview */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
            <div className="flex items-center justify-center">
              <Button 
                variant={editedVariant}
                style={styles.button_style as any || 'default'}
                iconName={isIconEnabled ? editedIcon : undefined}
              >
                {editedText}
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* Icon Tab */}
      {activeTab === 'icon' && isIconEnabled && (
        <>
          {/* Selected icon preview */}
          <div className="mb-3 p-4 bg-gray-50 rounded-md flex flex-col items-center justify-center">
            {(() => {
              const IconComponent = LucideIcons[editedIcon as keyof typeof LucideIcons] as React.FC<LucideProps>;
              if (!IconComponent) return <div className="text-gray-400">No icon selected</div>;
              return (
                <>
                  <IconComponent size={24} />
                  <span className="text-xs mt-2">{editedIcon}</span>
                </>
              );
            })()}
          </div>
          
          {/* Icon search */}
          <div className="mb-3">
            <label htmlFor="icon-search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Icons
            </label>
            <input
              id="icon-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Lucide icons..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
            />
          </div>
          
          {/* Icon grid */}
          <div className="mb-3 max-h-48 overflow-y-auto p-1">
            <div className="grid grid-cols-5 gap-2">
              {iconsToDisplay.length > 0 ? iconsToDisplay.map((name) => {
                const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.FC<LucideProps>;
                if (!IconComponent) return null;
                return (
                  <div
                    key={name}
                    className={`flex items-center justify-center p-2 rounded-md cursor-pointer ${
                      name === editedIcon ? 'bg-primary-pink bg-opacity-10' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setEditedIcon(name)}
                    title={name}
                  >
                    <IconComponent size={18} color={name === editedIcon ? '#F867AC' : undefined} />
                  </div>
                );
              }) : (
                <div className="col-span-5 text-center py-4 text-gray-500">
                  <span className="text-sm">No icons found. Try a different search term.</span>
                </div>
              )}
            </div>
            {iconsToDisplay.length > 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {searchTerm ? 
                  `Showing ${Math.min(iconsToDisplay.length, 40)} of ${sortedIcons.length} icons` :
                  `Showing common icons. Search for more options.`}
              </p>
            )}
          </div>
        </>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-primary-pink text-white rounded-md text-sm hover:bg-primary-dark-purple flex items-center"
        >
          <Check size={14} className="mr-1" /> Save
        </button>
      </div>
    </div>
  );
};

export default EditButtonTooltip;