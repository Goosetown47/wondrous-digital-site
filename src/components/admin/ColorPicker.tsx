import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ColorPickerProps {
  isOpen: boolean;
  colorName: string;
  initialColor: string;
  onClose: () => void;
  onSave: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  isOpen,
  colorName,
  initialColor,
  onClose,
  onSave
}) => {
  const [colorValue, setColorValue] = useState(initialColor);
  
  // Update internal state when initialColor changes
  useEffect(() => {
    setColorValue(initialColor);
  }, [initialColor]);
  
  if (!isOpen) return null;
  
  // Format color name for display
  const formattedColorName = colorName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {formattedColorName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Color Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Color
          </label>
          <input
            type="color"
            value={colorValue}
            onChange={(e) => setColorValue(e.target.value)}
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
            value={colorValue}
            onChange={(e) => setColorValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
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
            onClick={() => onSave(colorValue)}
            className="px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-primary-dark-purple transition-colors duration-200"
          >
            Save Color
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;