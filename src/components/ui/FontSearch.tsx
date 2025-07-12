import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, ExternalLink } from 'lucide-react';
import { searchFonts, FontData } from '../../data/google-fonts';
import { cn } from '../../lib/utils';

interface FontSearchProps {
  onFontSelect: (fontName: string) => void;
  onFontLoad?: (fontName: string) => void;
  className?: string;
  placeholder?: string;
}

const FontSearch: React.FC<FontSearchProps> = ({
  onFontSelect,
  onFontLoad,
  className,
  placeholder = "Search Google Fonts..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FontData[]>([]);
  const [previewFont, setPreviewFont] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search through local Google Fonts database
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      debounceTimeoutRef.current = window.setTimeout(() => {
        const results = searchFonts(searchQuery);
        setSearchResults(results.slice(0, 20)); // Limit to 20 results
        setIsOpen(results.length > 0);
      }, 300);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Load font preview
  const loadFontPreview = (fontName: string) => {
    if (previewFont === fontName) return;

    const formattedName = fontName.replace(/\s+/g, '+');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    link.onload = () => setPreviewFont(fontName);
    document.head.appendChild(link);
  };

  // Handle font selection
  const handleFontSelect = (fontName: string) => {
    onFontSelect(fontName);
    setIsOpen(false);
    setSearchQuery('');
    if (onFontLoad) {
      onFontLoad(fontName);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sans-serif': return 'Sans Serif';
      case 'serif': return 'Serif';
      case 'display': return 'Display';
      case 'handwriting': return 'Handwriting';
      case 'monospace': return 'Monospace';
      default: return category;
    }
  };

  return (
    <div className={cn('relative', className)} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
        />
      </div>

      {/* Search results dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-hidden">
          {searchResults.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-sm text-gray-500 mb-2">
                No fonts found matching "{searchQuery}"
              </div>
              <div className="text-xs text-gray-400 mb-3">
                Try searching for popular fonts like "Playwrite", "Inter", "Roboto", or "Montserrat"
              </div>
              <a
                href={`https://fonts.google.com/?query=${encodeURIComponent(searchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary-pink hover:text-primary-dark-purple"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Browse on Google Fonts website
              </a>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <div className="px-3 py-2 text-xs text-gray-500 bg-blue-50 border-b">
                💡 Found {searchResults.length} Google Fonts matching your search
              </div>
              {searchResults.map((font) => (
                <div
                  key={font.name}
                  className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  onMouseEnter={() => loadFontPreview(font.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 
                          className="text-base font-medium text-gray-900 truncate"
                          style={{ 
                            fontFamily: previewFont === font.name ? `'${font.name}', sans-serif` : 'inherit' 
                          }}
                        >
                          {font.name}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          {getCategoryLabel(font.category)}
                        </span>
                        {font.popular && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      {previewFont === font.name && (
                        <p 
                          className="text-sm text-gray-600 mb-2"
                          style={{ fontFamily: `'${font.name}', ${font.category}` }}
                        >
                          The quick brown fox jumps over the lazy dog
                        </p>
                      )}
                      <div className="text-xs text-gray-500">
                        {font.weights.length} weight{font.weights.length !== 1 ? 's' : ''} available
                      </div>
                    </div>
                    <button
                      onClick={() => handleFontSelect(font.name)}
                      className="ml-3 flex items-center px-3 py-1 text-xs bg-primary-pink text-white rounded hover:bg-primary-dark-purple transition-colors"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Search through 1790 Google Fonts. Start typing to find any font from the complete Google Fonts library.
      </div>
    </div>
  );
};

export default FontSearch;