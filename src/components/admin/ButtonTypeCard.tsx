import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ButtonVariant } from '../ui/Button';
import ButtonPreview from '../ui/ButtonPreview';
import EnhancedColorPicker from './EnhancedColorPicker';

interface SiteStyles {
  primary_color?: string | null;
  secondary_color?: string | null;
  tertiary_color?: string | null;
  button_radius?: 'squared' | 'slightly-rounded' | 'fully-rounded' | null;
  button_style?: 'default' | 'floating' | 'brick' | 'modern' | 'offset-background' | 'compact' | null;
  primary_button_background_color?: string | null;
  secondary_button_background_color?: string | null;
  primary_button_text_color?: string | null;
  secondary_button_text_color?: string | null;
  primary_button_border_color?: string | null;
  secondary_button_border_color?: string | null;
  [key: string]: string | null | undefined;
}

interface ButtonTypeCardProps {
  variant: ButtonVariant;
  title: string;
  siteStyles: SiteStyles;
  onStyleChange: (field: string, value: string | boolean | null) => void;
}

const ButtonTypeCard: React.FC<ButtonTypeCardProps> = ({
  variant,
  title,
  siteStyles,
  onStyleChange
}) => {
  const [activeColorField, setActiveColorField] = useState<string | null>(null);
  const [colorPickerValue, setColorPickerValue] = useState<string>('');

  // Get button-specific field names
  const getFieldName = (property: string) => {
    if (variant === 'text-link') {
      return property === 'font' ? 'textlink_button_font' : 
             property === 'weight' ? 'textlink_button_weight' :
             property === 'text' ? 'text_link_color' :
             property === 'hover' ? 'text_link_hover_color' : property;
    }
    const prefix = variant === 'tertiary' ? 'outline' : variant;
    
    // Handle tertiary (outline) button fields specially
    if (variant === 'tertiary') {
      return property === 'text' ? 'outline_text_color' :
             property === 'border' ? 'outline_border_color' :
             property === 'hover' ? 'outline_hover_bg' :
             property === 'background' ? 'outline_background_color' :
             property === 'shadow' ? 'outline_shadow_color' :
             property === 'radius' ? `${variant}_button_radius` :
             property === 'size' ? `${variant}_button_size` :
             property === 'icon_enabled' ? `${variant}_button_icon_enabled` :
             property === 'icon_position' ? `${variant}_button_icon_position` :
             property === 'font' ? `${variant}_button_font` :
             property === 'weight' ? `${variant}_button_weight` :
             `${prefix}_${property}`;
    }
    
    return property === 'background' ? `${variant}_button_background_color` :
           property === 'hover' ? `${variant}_button_hover_color` :
           property === 'text' ? `${variant}_button_text_color` :
           property === 'border' ? `${variant}_button_border_color` :
           property === 'shadow' ? `${variant}_button_shadow_color` :
           property === 'radius' ? `${variant}_button_radius` :
           property === 'size' ? `${variant}_button_size` :
           property === 'icon_enabled' ? `${variant}_button_icon_enabled` :
           property === 'icon_position' ? `${variant}_button_icon_position` :
           property === 'font' ? `${variant}_button_font` :
           property === 'weight' ? `${variant}_button_weight` :
           `${prefix}_${property}`;
  };

  // Get current values
  const getValue = (property: string) => {
    const fieldName = getFieldName(property);
    return siteStyles[fieldName];
  };

  // Handle color picker
  const handleColorClick = (property: string) => {
    const fieldName = getFieldName(property);
    const currentValue = siteStyles[fieldName] || '';
    setColorPickerValue(currentValue);
    setActiveColorField(fieldName);
  };

  const handleColorSave = (color: string) => {
    if (activeColorField) {
      onStyleChange(activeColorField, color);
      setActiveColorField(null);
    }
  };

  // Color swatches based on variant
  const getColorSwatches = () => {
    if (variant === 'text-link') {
      return [
        { label: 'Text', property: 'text', color: getValue('text') || '#000000' },
        { label: 'Hover', property: 'hover', color: getValue('hover') || '#374151' }
      ];
    }
    if (variant === 'tertiary') {
      return [
        { label: 'Text', property: 'text', color: getValue('text') || '#000000' },
        { label: 'Hover', property: 'hover', color: getValue('hover') || '#F3F4F6' },
        { label: 'Border', property: 'border', color: getValue('border') || '#000000' }
      ];
    }
    return [
      { label: 'Background', property: 'background', color: getValue('background') || '#000000' },
      { label: 'Hover', property: 'hover', color: getValue('hover') || '#374151' },
      { label: 'Text', property: 'text', color: getValue('text') || '#FFFFFF' },
      { label: 'Border', property: 'border', color: getValue('border') || '#000000' },
      { label: 'Shadow', property: 'shadow', color: getValue('shadow') || '#374151' }
    ];
  };

  const colorSwatches = getColorSwatches();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 min-w-[280px]">
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* Button Preview */}
      <div className="mb-6">
        <ButtonPreview
          variant={variant}
          radius={getValue('radius') || 'slightly-rounded'}
          style={siteStyles.button_style || 'default'}
        />
      </div>

      {/* Colors Section */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Colors</h4>
        <div className="grid grid-cols-5 gap-2">
          {colorSwatches.map((swatch, index) => (
            <div key={index}>
              <div
                className="w-12 h-12 rounded-md border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: swatch.color }}
                onClick={() => handleColorClick(swatch.property)}
              />
              <p className="text-xs text-gray-600 mt-1 text-left">{swatch.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Radius Section */}
      {variant !== 'text-link' && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Radius</h4>
          <div className="flex items-center space-x-4">
            {['squared', 'slightly-rounded', 'fully-rounded'].map((radiusOption) => (
              <label key={radiusOption} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`${variant}-radius`}
                  value={radiusOption}
                  checked={getValue('radius') === radiusOption}
                  onChange={(e) => onStyleChange(getFieldName('radius'), e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                  getValue('radius') === radiusOption ? 'bg-primary-pink border-primary-pink' : 'border-gray-300'
                }`} />
                <span className="text-sm text-gray-700 capitalize">
                  {radiusOption.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Size, Icon, Text Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Size */}
        {variant !== 'text-link' && (
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Size</h4>
            <div className="space-y-2">
              {['large', 'medium', 'small'].map((sizeOption) => (
                <label key={sizeOption} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`${variant}-size`}
                    value={sizeOption}
                    checked={getValue('size') === sizeOption}
                    onChange={(e) => onStyleChange(getFieldName('size'), e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                    getValue('size') === sizeOption ? 'bg-primary-pink border-primary-pink' : 'border-gray-300'
                  }`} />
                  <span className="text-sm text-gray-700 capitalize">{sizeOption}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Icon */}
        {variant !== 'text-link' && (
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Icon</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`${variant}-icon`}
                      value={option === 'Yes'}
                      checked={getValue('icon_enabled') === (option === 'Yes')}
                      onChange={() => onStyleChange(getFieldName('icon_enabled'), option === 'Yes')}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                      getValue('icon_enabled') === (option === 'Yes') ? 'bg-primary-pink border-primary-pink' : 'border-gray-300'
                    }`} />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              
              {getValue('icon_enabled') && (
                <div className="relative">
                  <select
                    value={getValue('icon_position') || 'right'}
                    onChange={(e) => onStyleChange(getFieldName('icon_position'), e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent appearance-none bg-white"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3">Text</h4>
          <div className="space-y-3">
            <div className="relative">
              <select
                value={getValue('font') || 'primary'}
                onChange={(e) => onStyleChange(getFieldName('font'), e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent appearance-none bg-white"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={getValue('weight') || '500'}
                onChange={(e) => onStyleChange(getFieldName('weight'), e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent appearance-none bg-white"
              >
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
                <option value="800">Extrabold</option>
                <option value="900">Black</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      <EnhancedColorPicker
        isOpen={!!activeColorField}
        colorName={activeColorField || ''}
        initialColor={colorPickerValue}
        siteStyles={siteStyles}
        onClose={() => setActiveColorField(null)}
        onSave={handleColorSave}
      />
    </div>
  );
};

export default ButtonTypeCard;