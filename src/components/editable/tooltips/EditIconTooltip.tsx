import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Common icons to display when no search is active
const DEFAULT_ICONS = [
  'Home', 'User', 'Settings', 'Mail', 'Phone',
  'Calendar', 'Search', 'Bell', 'Heart', 'Star',
  'Check', 'X', 'Plus', 'Edit', 'Trash2',
  'ArrowRight', 'Image', 'FileText', 'Save', 'Menu'
];

interface Position {
  x: number;
  y: number;
}

interface Position {
  x: number;
  y: number;
}

interface EditIconTooltipProps {
  icon: any; // Accept any type to handle all possible inputs
  size: number;
  color?: string;
  position: Position;
  onUpdate: (props: { icon: any; size: number; color?: string }) => void;
  onClose: () => void;
}

// Get a list of all available icon names
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

// Debug: Log icon count
console.log('Total available Lucide icons:', iconNames.length);
console.log('Sample icons:', iconNames.slice(0, 10));

const EditIconTooltip: React.FC<EditIconTooltipProps> = ({
  icon,
  size,
  color,
  position,
  onUpdate,
  onClose
}) => {
  // Extract and validate icon name with multiple fallbacks
  const initialIconName = typeof icon === 'string' ? icon : 
                         (icon && typeof icon === 'object' && typeof icon.icon === 'string') ? 
                         icon.icon : 'Box';
                         
  const [editedIcon, setEditedIcon] = useState(initialIconName);
  const [editedSize, setEditedSize] = useState(size);
  const [editedColor, setEditedColor] = useState(color || '');
  const [searchTerm, setSearchTerm] = useState('');
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    width: '320px',
  });

  // Filter icons based on search term or show default icons
  const filteredIcons = iconNames.filter((name) => {
    if (!searchTerm.trim()) {
      // When no search term, show default icons
      return DEFAULT_ICONS.includes(name);
    } else {
      // For search, normalize both the search term and icon name
      const searchLower = searchTerm.toLowerCase();
      const nameLower = name.toLowerCase();
      
      // Direct match
      if (nameLower.includes(searchLower)) {
        return true;
      }
      
      // Split camelCase names into parts for better matching
      // E.g., "ArrowRight" -> "arrow right"
      const nameParts = name.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
      if (nameParts.includes(searchLower)) {
        return true;
      }
      
      // Special case handling for common icon types
      if (nameLower.includes('arrow') && searchLower.includes('arrow')) {
        return true;
      }
      
      return false;
    }
  });

  // Sort the icons alphabetically
  const sortedIcons = filteredIcons.sort();

  // Limit the number of icons displayed to prevent overwhelming the UI
  const iconsToDisplay = searchTerm 
    ? sortedIcons.slice(0, 40) 
    : sortedIcons;
  
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
        width: '320px',
        maxHeight: `${viewportHeight - 20}px`,
        overflowY: 'auto'
      });
    }
  }, [position, editedIcon, editedSize, editedColor, searchTerm]);
    
  // Handle save
  const handleSave = () => {
    onUpdate({
      icon: editedIcon,
      size: editedSize,
      color: editedColor || undefined
    });
  };
  
  // Render selected icon
  const renderSelectedIcon = () => {
    const IconComponent = LucideIcons[editedIcon as keyof typeof LucideIcons] as React.FC<LucideProps>;
    if (!IconComponent) return null;
    
    return (
      <div className="p-4 bg-gray-50 rounded-md flex flex-col items-center justify-center">
        <IconComponent size={editedSize} color={editedColor || undefined} />
        <span className="text-xs mt-2">{editedIcon}</span>
      </div>
    );
  };
  
  return (
    <div 
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
      style={tooltipStyle}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800">Edit Icon</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Selected icon preview */}
      <div className="mb-3">
        {renderSelectedIcon()}
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
      
      {/* Icon size */}
      <div className="mb-3">
        <label htmlFor="icon-size" className="block text-sm font-medium text-gray-700 mb-1">
          Size
        </label>
        <input
          id="icon-size"
          type="range"
          min="12"
          max="48"
          value={editedSize}
          onChange={(e) => setEditedSize(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>12px</span>
          <span>{editedSize}px</span>
          <span>48px</span>
        </div>
      </div>
      
      {/* Color picker toggle */}
      <div className="mb-4 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Icon Color
        </label>
        
        {/* Color picker */}
        <div>
          <input
            type="color"
            value={editedColor}
            onChange={(e) => setEditedColor(e.target.value)}
            className="w-full h-8 cursor-pointer rounded"
          />
          <input
            type="text"
            value={editedColor}
            onChange={(e) => setEditedColor(e.target.value)}
            placeholder="#000000 or rgba(0,0,0,1)"
            className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
          />
        </div>
        
        {/* Color presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Common Colors
          </label>
          <div className="grid grid-cols-5 gap-2">
            {['#F867AC', '#3C33C0', '#302940', '#1F0943', '#EFD0F2', 
              '#FFFFFF', '#000000', '#F5F5F5', '#E5E5E5', '#D4D4D4'].map((color, index) => (
              <div 
                key={index}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => setEditedColor(color)}
              />
            ))}
          </div>
        </div>
      </div>
      
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

export default EditIconTooltip;