import React, { useState, useEffect } from 'react';
import { GOOGLE_FONTS, FONT_CATEGORIES } from '../../data/google-fonts';
import { cn } from '../../lib/utils';

interface FontPreviewProps {
  fontName: string;
  className?: string;
  showWeights?: boolean;
  showSampleText?: boolean;
  customText?: string;
  size?: 'small' | 'medium' | 'large';
}

const FontPreview: React.FC<FontPreviewProps> = ({
  fontName,
  className,
  showWeights = false,
  showSampleText = true,
  customText,
  size = 'medium'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const fontData = GOOGLE_FONTS.find(font => font.name === fontName);

  useEffect(() => {
    if (!fontName) return;

    // Check if font is already loaded
    const isAlreadyLoaded = document.fonts.check(`16px "${fontName}"`);
    if (isAlreadyLoaded) {
      setIsLoaded(true);
      return;
    }

    // Load font
    const formattedName = fontName.replace(/\s+/g, '+');
    const weights = fontData?.weights.join(';') || '400;700';
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@${weights}&display=swap`;
    link.rel = 'stylesheet';
    
    // Set loaded state when font loads
    link.onload = () => {
      // Use document.fonts.ready for better reliability
      document.fonts.ready.then(() => {
        const isFontLoaded = document.fonts.check(`16px "${fontName}"`);
        if (isFontLoaded) {
          setIsLoaded(true);
        }
      });
    };

    document.head.appendChild(link);

    // Cleanup
    return () => {
      // Note: We don't remove the link as other components might be using the font
    };
  }, [fontName, fontData?.weights]);

  if (!fontName) {
    return null;
  }

  const categoryInfo = FONT_CATEGORIES.find(cat => cat.value === fontData?.category);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          title: 'text-lg',
          sample: 'text-sm',
          weights: 'text-xs'
        };
      case 'large':
        return {
          title: 'text-3xl',
          sample: 'text-lg',
          weights: 'text-sm'
        };
      default:
        return {
          title: 'text-xl',
          sample: 'text-base',
          weights: 'text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const sampleTexts = [
    customText || 'The quick brown fox jumps over the lazy dog',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '1234567890'
  ];

  return (
    <div className={cn('p-4 bg-white border border-gray-200 rounded-lg', className)}>
      {/* Font info header */}
      <div className="mb-4 pb-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-1">{fontName}</h3>
        {categoryInfo && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {categoryInfo.label}
            </span>
            {fontData && (
              <span className="text-xs text-gray-500">
                {fontData.weights.length} weight{fontData.weights.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Font preview */}
      <div className="space-y-3">
        {showSampleText && (
          <div 
            className="space-y-2"
            style={{ 
              fontFamily: isLoaded ? `"${fontName}", ${fontData?.category || 'sans-serif'}` : 'inherit' 
            }}
          >
            {sampleTexts.map((text, index) => (
              <p 
                key={index}
                className={cn(
                  'text-gray-800 transition-all duration-200',
                  index === 0 ? sizeClasses.sample : 'text-sm',
                  !isLoaded && 'opacity-50'
                )}
              >
                {text}
              </p>
            ))}
          </div>
        )}

        {/* Weight variations */}
        {showWeights && fontData && isLoaded && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Available Weights
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {fontData.weights.map(weight => (
                <div 
                  key={weight}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className={cn('text-xs text-gray-600', sizeClasses.weights)}>
                    {getWeightLabel(weight)}
                  </span>
                  <span 
                    className={cn('text-sm', sizeClasses.weights)}
                    style={{ 
                      fontFamily: `"${fontName}", ${fontData.category}`,
                      fontWeight: weight 
                    }}
                  >
                    Aa
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {!isLoaded && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-pink"></div>
            <span className="ml-2 text-xs text-gray-500">Loading font...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get weight label
const getWeightLabel = (weight: string): string => {
  const weightMap: Record<string, string> = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semi Bold',
    '700': 'Bold',
    '800': 'Extra Bold',
    '900': 'Black'
  };
  
  return weightMap[weight] || `Weight ${weight}`;
};

export default FontPreview;