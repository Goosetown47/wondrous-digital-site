import React, { useState } from 'react';
import { X, Palette, Grid3X3, Check, Image, Layers, Upload, Navigation } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { SectionType } from './SectionTypeCard';
import SectionTemplateGrid from './SectionTemplateGrid';
import GradientEditor from './GradientEditor';
import NavigationSettingsTab from './NavigationSettingsTab';


interface EnhancedSectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionType: SectionType;
  currentTemplateId?: string;
  initialBgColor: string;
  initialBackgroundType?: 'color' | 'image' | 'gradient';
  initialBackgroundImage?: string;
  initialBackgroundGradient?: string;
  initialBackgroundBlur?: number;
  onSave: (sectionId: string, settings: { 
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundGradient?: string;
    backgroundBlur?: number;
    backgroundType: 'color' | 'image' | 'gradient';
    templateId?: string;
  }) => Promise<void>;
  siteColors?: Record<string, string>;
}

type TabType = 'design' | 'templates' | 'navigation';
type BackgroundType = 'color' | 'image' | 'gradient';

const EnhancedSectionSettingsModal: React.FC<EnhancedSectionSettingsModalProps> = ({
  isOpen,
  onClose,
  sectionId,
  sectionType,
  currentTemplateId,
  initialBgColor = '#FFFFFF',
  initialBackgroundType = 'color',
  initialBackgroundImage = '',
  initialBackgroundGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  initialBackgroundBlur = 0,
  onSave,
  siteColors
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('design');
  const [backgroundType, setBackgroundType] = useState<BackgroundType>(initialBackgroundType);
  const [backgroundColor, setBackgroundColor] = useState(initialBgColor);
  const [backgroundImage, setBackgroundImage] = useState(initialBackgroundImage);
  const [backgroundGradient, setBackgroundGradient] = useState(initialBackgroundGradient);
  const [backgroundBlur, setBackgroundBlur] = useState(initialBackgroundBlur);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(currentTemplateId);
  const [showGradientEditor, setShowGradientEditor] = useState(false);

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


  const getBackgroundStyle = () => {
    const baseStyle: React.CSSProperties = { 
      position: 'relative', 
      overflow: 'hidden',
      '--section-bg-image': backgroundImage ? `url(${backgroundImage})` : 'none',
      '--section-bg-blur': backgroundBlur ? `${backgroundBlur}px` : '0px'
    };
    
    switch (backgroundType) {
      case 'color':
        baseStyle.backgroundColor = backgroundColor;
        break;
      case 'gradient':
        baseStyle.background = backgroundGradient;
        break;
      case 'image':
        if (backgroundImage) {
          baseStyle.backgroundImage = `url(${backgroundImage})`;
          baseStyle.backgroundSize = 'cover';
          baseStyle.backgroundPosition = 'center';
          baseStyle.backgroundRepeat = 'no-repeat';
        } else {
          baseStyle.backgroundColor = backgroundColor;
        }
        break;
    }
    
    return baseStyle;
  };

  const handleSave = async () => {
    try {
      await onSave(sectionId, { 
        backgroundColor: backgroundType === 'color' ? backgroundColor : undefined,
        backgroundImage: backgroundType === 'image' ? backgroundImage : undefined,
        backgroundGradient: backgroundType === 'gradient' ? backgroundGradient : undefined,
        backgroundBlur,
        backgroundType,
        templateId: selectedTemplateId
      });
      onClose();
    } catch (error) {
      console.error('Error saving section settings:', error);
    }
  };

  const handleGradientSave = (gradient: string) => {
    setBackgroundGradient(gradient);
    setShowGradientEditor(false);
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={handleContentClick}
      >
        {/* Header */}
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('design')}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'design'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Palette className="h-4 w-4 mr-2 inline" />
              Design
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Grid3X3 className="h-4 w-4 mr-2 inline" />
              Templates
            </button>
            {((typeof sectionType === 'string' && (sectionType.toLowerCase().includes('navigation') || sectionType.toLowerCase().includes('navbar') || sectionType.toLowerCase().includes('footer'))) ||
             (typeof sectionType === 'object' && (sectionType.id.toLowerCase().includes('navigation') || sectionType.id.toLowerCase().includes('navbar') || sectionType.id.toLowerCase().includes('footer')))) && (
              <button
                onClick={() => setActiveTab('navigation')}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'navigation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Navigation className="h-4 w-4 mr-2 inline" />
                Navigation
              </button>
            )}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'design' && (
            <div className="p-6 space-y-6">
              {/* Background Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Background Preview
                </label>
                <div 
                  className={`w-full h-24 rounded-lg border border-gray-200 ${backgroundType === 'image' && backgroundImage && backgroundBlur > 0 ? 'section-with-blurred-bg' : ''}`}
                  style={getBackgroundStyle()}
                >
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                      Section Background
                    </span>
                  </div>
                </div>
              </div>

              {/* Background Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Background Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setBackgroundType('color')}
                    className={`flex flex-col items-center p-4 border rounded-lg transition-colors ${
                      backgroundType === 'color' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Palette className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Solid Color</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBackgroundType('gradient')}
                    className={`flex flex-col items-center p-4 border rounded-lg transition-colors ${
                      backgroundType === 'gradient' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Layers className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Gradient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBackgroundType('image')}
                    className={`flex flex-col items-center p-4 border rounded-lg transition-colors ${
                      backgroundType === 'image' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Image</span>
                  </button>
                </div>
              </div>

              {/* Background Controls based on type */}
              {backgroundType === 'color' && (
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className={`w-10 h-10 rounded border cursor-pointer hover:scale-110 transition-transform ${backgroundColor === swatch.value ? 'ring-2 ring-blue-500' : 'border-gray-200'}`}
                          style={{ backgroundColor: swatch.value }}
                          title={swatch.name}
                          onClick={() => setBackgroundColor(swatch.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {backgroundType === 'gradient' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Layers className="h-4 w-4 mr-2" />
                    Background Gradient
                  </label>
                  
                  <div 
                    className="w-full h-16 rounded-lg border border-gray-200 mb-4 cursor-pointer hover:border-gray-300 transition-colors"
                    style={{ background: backgroundGradient }}
                    onClick={() => setShowGradientEditor(true)}
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowGradientEditor(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Gradient
                  </button>
                </div>
              )}

              {backgroundType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Image className="h-4 w-4 mr-2" />
                    Background Image
                  </label>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={backgroundImage}
                      onChange={(e) => setBackgroundImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop an image file here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setBackgroundImage(url);
                        }
                      }}
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              )}

              {/* Blur Effect Control */}
              {(backgroundType === 'image') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Blur Effect: {backgroundBlur}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={backgroundBlur}
                    onChange={(e) => setBackgroundBlur(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>No Blur</span>
                    <span>Maximum Blur</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Choose from available {sectionType} templates. The selected template will be applied to this section.
                </p>
              </div>

              <SectionTemplateGrid
                sectionType={sectionType}
                currentTemplateId={selectedTemplateId}
                onTemplateSelect={(template) => setSelectedTemplateId(template.id)}
                className="max-h-96"
              />
            </div>
          )}

          {activeTab === 'navigation' && (
            <NavigationSettingsTab
              sectionId={sectionId}
              sectionType={typeof sectionType === 'string' ? sectionType : sectionType.id}
            />
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <Check className="h-4 w-4 mr-2" /> Save Changes
          </button>
        </div>
      </div>

      {/* Gradient Editor Modal */}
      <GradientEditor
        isOpen={showGradientEditor}
        gradientName="Section Background Gradient"
        initialGradient={backgroundGradient}
        onClose={() => setShowGradientEditor(false)}
        onSave={handleGradientSave}
      />
    </div>
  );
};

export default EnhancedSectionSettingsModal;