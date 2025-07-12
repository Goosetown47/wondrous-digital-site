import React, { useState, useEffect } from 'react';
import { X, Palette, Pipette } from 'lucide-react';

interface EnhancedColorPickerProps {
  isOpen: boolean;
  colorName: string;
  initialColor: string;
  siteStyles: { [key: string]: string | null }; // Current site styles for palette
  onClose: () => void;
  onSave: (color: string) => void;
}

const EnhancedColorPicker: React.FC<EnhancedColorPickerProps> = ({
  isOpen,
  colorName,
  initialColor,
  siteStyles,
  onClose,
  onSave
}) => {
  const [colorValue, setColorValue] = useState(initialColor);
  const [activeTab, setActiveTab] = useState<'palette' | 'custom'>('palette');
  
  // Update internal state when initialColor changes
  useEffect(() => {
    setColorValue(initialColor);
  }, [initialColor]);
  
  if (!isOpen) return null;
  
  // Check if gradients should be disabled for this color field
  const isTextColor = colorName.includes('text') || 
    colorName.includes('primary_button_text') || 
    colorName.includes('secondary_button_text') ||
    colorName.includes('outline_text') ||
    colorName.includes('text_link') ||
    colorName.includes('shadow') || // Also disable for shadows
    colorName.includes('border'); // Also disable for borders
  
  // Format color name for display
  const formattedColorName = colorName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Get brand color palette from site styles
  const brandColors = [
    { name: 'Primary', color: siteStyles?.primary_color || '#F867AC' },
    { name: 'Secondary', color: siteStyles?.secondary_color || '#3C33C0' },
    { name: 'Tertiary', color: siteStyles?.tertiary_color || '#302940' },
    { name: 'Dark', color: siteStyles?.dark_color || '#1F0943' },
    { name: 'Light', color: siteStyles?.light_color || '#EFD0F2' },
    { name: 'White', color: siteStyles?.white_color || '#FFFFFF' },
  ];
  
  // Soft shades
  const softShades = [
    { name: 'Soft 1', color: siteStyles?.soft_shade_1 || '#F5F5F5' },
    { name: 'Soft 2', color: siteStyles?.soft_shade_2 || '#E5E5E5' },
    { name: 'Soft 3', color: siteStyles?.soft_shade_3 || '#D4D4D4' },
  ];
  
  // Gradients
  const gradients = [
    { 
      name: 'Gradient 1', 
      color: siteStyles?.gradient_1 || 'linear-gradient(135deg, #000000 0%, #F9FAFB 100%)',
      display: '#000000' // Use primary color for display
    },
    { 
      name: 'Gradient 2', 
      color: siteStyles?.gradient_2 || 'linear-gradient(135deg, #F9FAFB 0%, #000000 100%)',
      display: '#374151' // Use secondary color for display
    },
  ];
  
  // Common neutral colors
  const neutralColors = [
    { name: 'Black', color: '#000000' },
    { name: 'Gray 900', color: '#111827' },
    { name: 'Gray 800', color: '#1F2937' },
    { name: 'Gray 700', color: '#374151' },
    { name: 'Gray 600', color: '#4B5563' },
    { name: 'Gray 500', color: '#6B7280' },
    { name: 'Gray 400', color: '#9CA3AF' },
    { name: 'Gray 300', color: '#D1D5DB' },
    { name: 'Gray 200', color: '#E5E7EB' },
    { name: 'Gray 100', color: '#F3F4F6' },
    { name: 'Gray 50', color: '#F9FAFB' },
    { name: 'White', color: '#FFFFFF' },
  ];
  
  // Handle color selection from palette
  const handlePaletteColorSelect = (color: string) => {
    setColorValue(color);
  };
  
  // Handle gradient selection from palette
  const handleGradientSelect = (gradient: string) => {
    // For gradients, we pass the full gradient string as the color value
    setColorValue(gradient);
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
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
        
        {/* Tab Navigation */}
        <div className="flex mb-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'palette'
                ? 'text-primary-pink border-b-2 border-primary-pink'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('palette')}
          >
            <div className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Brand Palette
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'custom'
                ? 'text-primary-pink border-b-2 border-primary-pink'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('custom')}
          >
            <div className="flex items-center">
              <Pipette className="h-4 w-4 mr-2" />
              Custom Color
            </div>
          </button>
        </div>
        
        {activeTab === 'palette' && (
          <div className="space-y-6">
            {/* Brand Colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Brand Colors</h4>
              <div className="grid grid-cols-3 gap-3">
                {brandColors.map((colorItem, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      colorValue === colorItem.color
                        ? 'border-primary-pink shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePaletteColorSelect(colorItem.color)}
                  >
                    <div
                      className="w-full h-12 rounded-md mb-2 border border-gray-200"
                      style={{ backgroundColor: colorItem.color }}
                    />
                    <p className="text-xs font-medium text-center text-gray-700">
                      {colorItem.name}
                    </p>
                    <p className="text-xs text-center text-gray-500">
                      {colorItem.color}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Soft Shades */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Soft Shades</h4>
              <div className="grid grid-cols-3 gap-3">
                {softShades.map((colorItem, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      colorValue === colorItem.color
                        ? 'border-primary-pink shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePaletteColorSelect(colorItem.color)}
                  >
                    <div
                      className="w-full h-12 rounded-md mb-2 border border-gray-200"
                      style={{ backgroundColor: colorItem.color }}
                    />
                    <p className="text-xs font-medium text-center text-gray-700">
                      {colorItem.name}
                    </p>
                    <p className="text-xs text-center text-gray-500">
                      {colorItem.color}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Gradients */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Gradients</h4>
              <div className="grid grid-cols-2 gap-3">
                {gradients.map((gradientItem, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isTextColor 
                        ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' 
                        : `cursor-pointer hover:scale-105 ${
                            colorValue === gradientItem.color
                              ? 'border-primary-pink shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`
                    }`}
                    onClick={() => !isTextColor && handleGradientSelect(gradientItem.color)}
                  >
                    <div
                      className={`w-full h-12 rounded-md mb-2 border border-gray-200 ${
                        isTextColor ? 'grayscale' : ''
                      }`}
                      style={{ background: gradientItem.color }}
                    />
                    <p className={`text-xs font-medium text-center ${
                      isTextColor ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {gradientItem.name}
                    </p>
                    <p className={`text-xs text-center truncate ${
                      isTextColor ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {isTextColor ? 'Not compatible' : 'Gradient'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Neutral Colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Neutral Colors</h4>
              <div className="grid grid-cols-4 gap-2">
                {neutralColors.map((colorItem, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                      colorValue === colorItem.color
                        ? 'border-primary-pink shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePaletteColorSelect(colorItem.color)}
                  >
                    <div
                      className="w-full h-8 rounded-md mb-1 border border-gray-200"
                      style={{ backgroundColor: colorItem.color }}
                    />
                    <p className="text-xs text-center text-gray-600 truncate">
                      {colorItem.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'custom' && (
          <div className="space-y-4">
            {/* Color Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Picker
              </label>
              <input
                type="color"
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                className="w-full h-16 p-1 border border-gray-200 rounded-lg cursor-pointer"
              />
            </div>
            
            {/* Hex Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hex Code
              </label>
              <input
                type="text"
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-mono"
                placeholder="#000000"
              />
            </div>
            
            {/* Color Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div
                className="w-full h-16 rounded-lg border border-gray-200"
                style={{ backgroundColor: colorValue }}
              />
            </div>
          </div>
        )}
        
        {/* Current Selection Display */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-md border border-gray-200"
              style={{ backgroundColor: colorValue }}
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Selected Color</p>
              <p className="text-sm text-gray-500">{colorValue}</p>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
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

export default EnhancedColorPicker;