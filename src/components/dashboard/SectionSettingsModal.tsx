import React, { useState } from 'react';
import { X, Palette, Check } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface SectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  initialBgColor: string;
  onSave: (sectionId: string, settings: { backgroundColor: string }) => void;
  siteColors?: Record<string, string>;
}

const SectionSettingsModal: React.FC<SectionSettingsModalProps> = ({
  isOpen,
  onClose,
  sectionId,
  initialBgColor = '#FFFFFF',
  onSave,
  siteColors
}) => {
  const [backgroundColor, setBackgroundColor] = useState(initialBgColor);

  // Default color palette if site colors aren't provided
  const colorSwatches = siteColors ? 
    Object.entries(siteColors)
      .filter(([key]) => key.includes('color'))
      .map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/color/g, '').trim(),
        value
      })) : 
    [
      { name: 'Primary', value: '#F867AC' },
      { name: 'Secondary', value: '#3C33C0' },
      { name: 'Tertiary', value: '#302940' },
      { name: 'Dark', value: '#1F0943' },
      { name: 'Light', value: '#EFD0F2' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Gray 1', value: '#F5F5F5' },
      { name: 'Gray 2', value: '#E5E5E5' },
      { name: 'Gray 3', value: '#D4D4D4' },
      { name: 'Black', value: '#000000' }
    ];

  if (!isOpen) return null;
  
  // Prevent click events on the modal content from closing the modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSave = () => {
    onSave(sectionId, { backgroundColor });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={handleContentClick}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Section Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Background Color
            </label>
            
            <div className="mb-4 flex justify-center">
              <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hex Code
              </label>
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Colors
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorSwatches.map((swatch, index) => (
                  <div 
                    key={index}
                    className={`w-10 h-10 rounded border cursor-pointer hover:scale-110 transition-transform ${backgroundColor === swatch.value ? 'ring-2 ring-primary-pink' : 'border-gray-200'}`}
                    style={{ backgroundColor: swatch.value }}
                    title={swatch.name}
                    onClick={() => setBackgroundColor(swatch.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-primary-dark-purple transition-colors duration-200 flex items-center"
          >
            <Check className="h-4 w-4 mr-2" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionSettingsModal;