import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface EditColorTooltipProps {
  color: string;
  position: Position;
  onUpdate: (value: { color: string }) => void;
  onClose: () => void;
  siteColors?: Record<string, string>; // Site color palette
}

// Default color palette if site colors aren't provided
const DEFAULT_COLORS = [
  '#F867AC', '#3C33C0', '#302940', '#1F0943', '#EFD0F2',
  '#FFFFFF', '#F5F5F5', '#E5E5E5', '#D4D4D4', '#000000'
];

const EditColorTooltip: React.FC<EditColorTooltipProps> = ({
  color,
  position,
  onUpdate,
  onClose,
  siteColors
}) => {
  const [editedColor, setEditedColor] = useState(color || '');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  
  // Prepare color swatches from site colors or use defaults
  const colorSwatches = siteColors ? 
    Object.entries(siteColors).map(([name, value]) => ({ name, value })) : 
    DEFAULT_COLORS.map(color => ({ name: color, value: color }));
  
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
  }, [position, editedColor]);
  
  // Handle save
  const handleSave = () => {
    onUpdate({ color: editedColor });
  };
  
  return (
    <div 
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80"
      style={tooltipStyle}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800">Edit Color</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Color Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Color
        </label>
        <input
          type="color"
          value={editedColor}
          onChange={(e) => setEditedColor(e.target.value)}
          className="w-full h-12 p-1 border border-gray-200 rounded-lg cursor-pointer"
        />
      </div>
      
      {/* Hex Code Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hex Code
        </label>
        <input
          type="text"
          value={editedColor}
          onChange={(e) => setEditedColor(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      
      {/* Color Swatches */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Colors
        </label>
        <div className="grid grid-cols-5 gap-2">
          {colorSwatches.map((swatch, index) => (
            <div 
              key={index}
              className="w-10 h-10 rounded border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: swatch.value }}
              title={swatch.name}
              onClick={() => setEditedColor(swatch.value)}
            />
          ))}
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-primary-dark-purple transition-colors duration-200"
        >
          Save Color
        </button>
      </div>
    </div>
  );
};

export default EditColorTooltip;