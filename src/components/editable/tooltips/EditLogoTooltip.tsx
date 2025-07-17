import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Image as ImageIcon, Type } from 'lucide-react';

interface LogoData {
  type: 'image' | 'text';
  src?: string;
  alt?: string;
  text?: string;
  href?: string;
}

interface EditLogoTooltipProps {
  logo: LogoData;
  position: { x: number; y: number };
  onUpdate: (value: LogoData) => void;
  onClose: () => void;
}

const EditLogoTooltip: React.FC<EditLogoTooltipProps> = ({
  logo,
  position,
  onUpdate,
  onClose,
}) => {
  const [logoData, setLogoData] = useState<LogoData>(logo);
  const tooltipRef = useRef<HTMLDivElement>(null);

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

  const handleSave = () => {
    onUpdate(logoData);
  };

  const handleTypeChange = (newType: 'image' | 'text') => {
    setLogoData({
      ...logoData,
      type: newType,
      // Reset content for new type
      ...(newType === 'image' ? { src: '', alt: 'Logo' } : { text: 'Logo' })
    });
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y + 10, window.innerHeight - 300),
    zIndex: 1000,
  };

  return (
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Edit Logo</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Logo Type Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Logo Type
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleTypeChange('text')}
              className={`flex items-center space-x-2 px-3 py-2 rounded border transition-colors ${
                logoData.type === 'text'
                  ? 'bg-primary-pink text-white border-primary-pink'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Type className="h-4 w-4" />
              <span className="text-sm">Text</span>
            </button>
            <button
              onClick={() => handleTypeChange('image')}
              className={`flex items-center space-x-2 px-3 py-2 rounded border transition-colors ${
                logoData.type === 'image'
                  ? 'bg-primary-pink text-white border-primary-pink'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm">Image</span>
            </button>
          </div>
        </div>

        {/* Text Logo Settings */}
        {logoData.type === 'text' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Logo Text
            </label>
            <input
              type="text"
              value={logoData.text || ''}
              onChange={(e) => setLogoData({ ...logoData, text: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-pink focus:border-transparent"
              placeholder="Enter logo text"
              autoFocus
            />
          </div>
        )}

        {/* Image Logo Settings */}
        {logoData.type === 'image' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={logoData.src || ''}
                onChange={(e) => setLogoData({ ...logoData, src: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-pink focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={logoData.alt || ''}
                onChange={(e) => setLogoData({ ...logoData, alt: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-pink focus:border-transparent"
                placeholder="Logo alt text"
              />
            </div>
          </>
        )}

        {/* Link URL */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Link URL
          </label>
          <input
            type="text"
            value={logoData.href || ''}
            onChange={(e) => setLogoData({ ...logoData, href: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-pink focus:border-transparent"
            placeholder="/"
          />
          <p className="text-xs text-gray-500 mt-1">Where the logo should link when clicked</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={
            (logoData.type === 'text' && !logoData.text?.trim()) ||
            (logoData.type === 'image' && !logoData.src?.trim())
          }
          className="flex items-center px-3 py-1 text-xs bg-primary-pink text-white rounded hover:bg-primary-dark-purple disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3 mr-1" />
          Save
        </button>
      </div>
    </div>
  );
};

export default EditLogoTooltip;