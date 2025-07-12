import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { GOOGLE_FONTS, FONT_CATEGORIES, getFontsByCategory, searchFonts, FontData } from '../../data/google-fonts';
import { fontPreloader } from '../../utils/font-preloader';
import { cn } from '../../lib/utils';

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onFontLoad?: (fontName: string) => void;
  label?: string;
  description?: string;
  className?: string;
  showSearch?: boolean;
  showCategories?: boolean;
}

const FontSelector: React.FC<FontSelectorProps> = ({
  value,
  onChange,
  onFontLoad,
  label,
  description,
  className,
  showSearch = true,
  showCategories = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('sans-serif');
  const [hoveredFont, setHoveredFont] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens and preload category fonts
  useEffect(() => {
    if (isOpen) {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      // Preload fonts for the active tab when dropdown opens
      fontPreloader.preloadCategoryFonts(activeTab);
    }
  }, [isOpen, activeTab]);

  // Preload fonts for a category when tab is switched
  useEffect(() => {
    if (isOpen) {
      fontPreloader.preloadCategoryFonts(activeTab);
    }
  }, [activeTab, isOpen]);

  // Handle font selection
  const handleFontSelect = (fontName: string) => {
    onChange(fontName);
    setIsOpen(false);
    setSearchQuery('');
    // Load full font when selected
    fontPreloader.loadFont(fontName);
    if (onFontLoad) {
      onFontLoad(fontName);
    }
  };

  // Handle tab change
  const handleTabChange = (category: string) => {
    setActiveTab(category);
    setSearchQuery(''); // Clear search when switching tabs
  };

  // Get fonts for display based on search or active tab
  const getDisplayFonts = (): FontData[] => {
    if (searchQuery) {
      return searchFonts(searchQuery);
    }
    return getFontsByCategory(activeTab as FontData['category']);
  };

  const displayFonts = getDisplayFonts();
  const selectedFont = GOOGLE_FONTS.find(f => f.name === value);

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div ref={dropdownRef}>
        {/* Dropdown trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
        >
          <span 
            className="truncate"
            style={{ fontFamily: value ? `'${value}', sans-serif` : 'inherit' }}
          >
            {value || 'Select a font...'}
          </span>
          <ChevronDown className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            isOpen && 'transform rotate-180'
          )} />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[450px] overflow-hidden">
            {/* Search input */}
            {showSearch && (
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fonts..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-pink focus:border-primary-pink text-sm"
                  />
                </div>
              </div>
            )}

            {/* Category Tabs */}
            {showCategories && !searchQuery && (
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex overflow-x-auto">
                  {FONT_CATEGORIES.map(category => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleTabChange(category.value)}
                      className={cn(
                        'flex-shrink-0 px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                        activeTab === category.value
                          ? 'border-primary-pink text-primary-pink bg-white'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Font list */}
            <div className="max-h-[320px] overflow-y-auto">
              {displayFonts.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-500 text-center">
                  {searchQuery ? `No fonts found matching "${searchQuery}"` : 'No fonts in this category'}
                </div>
              ) : (
                <div className="py-1">
                  {displayFonts.map(font => (
                    <button
                      key={font.name}
                      type="button"
                      onClick={() => handleFontSelect(font.name)}
                      onMouseEnter={() => setHoveredFont(font.name)}
                      onMouseLeave={() => setHoveredFont(null)}
                      className={cn(
                        'w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors',
                        value === font.name && 'bg-primary-pink/5'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-base font-medium truncate"
                            style={{ 
                              fontFamily: fontPreloader.isFontPreloaded(font.name) 
                                ? `'${font.name}', ${font.category}` 
                                : 'inherit' 
                            }}
                          >
                            {font.name}
                          </span>
                          {font.popular && (
                            <span className="px-1.5 py-0.5 text-xs bg-primary-pink/10 text-primary-pink rounded">
                              Popular
                            </span>
                          )}
                        </div>
                        {fontPreloader.isFontPreloaded(font.name) && (
                          <p 
                            className="text-sm text-gray-500 mt-1 truncate"
                            style={{ fontFamily: `'${font.name}', ${font.category}` }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </p>
                        )}
                      </div>
                      {value === font.name && (
                        <Check className="h-4 w-4 text-primary-pink flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hover preview */}
            {hoveredFont && fontPreloader.isFontPreloaded(hoveredFont) && (
              <div className="absolute left-full top-0 ml-2 p-5 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[350px] pointer-events-none z-10">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{hoveredFont}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {GOOGLE_FONTS.find(f => f.name === hoveredFont)?.category.replace('-', ' ')}
                    </p>
                  </div>
                  <div 
                    className="space-y-3"
                    style={{ fontFamily: `'${hoveredFont}', sans-serif` }}
                  >
                    <p className="text-3xl leading-tight">The quick brown fox</p>
                    <p className="text-lg">jumps over the lazy dog</p>
                    <p className="text-base">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                    <p className="text-base">abcdefghijklmnopqrstuvwxyz</p>
                    <p className="text-base">1234567890 !@#$%^&*()</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};

export default FontSelector;