import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface EditTextTooltipProps {
  text: string;
  color?: string;
  position: Position;
  onUpdate: (value: { text: string; color?: string }) => void;
  onClose: () => void;
  siteColors?: Record<string, string>; // Site color palette
}

const EditTextTooltip: React.FC<EditTextTooltipProps> = ({
  text,
  color,
  position,
  onUpdate,
  onClose,
  siteColors
}) => {
  const [editedText, setEditedText] = useState(text);
  const [editedColor, setEditedColor] = useState(color || '');
  
  // Default color palette if site colors aren't provided
  const colorSwatches = siteColors ? 
    Object.entries(siteColors).map(([name, value]) => ({ name, value })) : 
    [
      { name: 'Primary', value: '#F867AC' },
      { name: 'Secondary', value: '#3C33C0' },
      { name: 'Tertiary', value: '#302940' },
      { name: 'Dark', value: '#1F0943' },
      { name: 'Light', value: '#EFD0F2' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Black', value: '#000000' },
      { name: 'Gray 1', value: '#F5F5F5' },
      { name: 'Gray 2', value: '#E5E5E5' },
      { name: 'Gray 3', value: '#D4D4D4' }
    ];
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  
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
  }, [position, editedText, editedColor]);
    
  // Handle save
  const handleSave = () => {
    onUpdate({
      text: editedText,
      color: editedColor || undefined
    });
  };
  
  return (
    <div 
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80"
      style={tooltipStyle}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800">Edit Text</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Text input */}
      <div className="mb-3">
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-pink focus:border-primary-pink resize-none"
          rows={3}
        />
      </div>
      
      {/* Color picker toggle */}
      <div className="space-y-4 mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Text Color
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
        
        {/* Color Swatches */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Colors
          </label>
          <div className="grid grid-cols-5 gap-2">
            {colorSwatches.map((swatch, index) => (
              <div 
                key={index}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: swatch.value }}
                title={swatch.name}
                onClick={() => setEditedColor(swatch.value)}
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

export default EditTextTooltip;