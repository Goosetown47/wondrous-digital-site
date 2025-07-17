import React, { useState, useEffect } from 'react';
import { Search, X, Loader } from 'lucide-react';
import SectionTypeCard from './SectionTypeCard';
import { supabase } from '../../utils/supabase';
import { useSectionTypes } from '../../hooks/useSectionTypes';

interface SectionLibrarySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const SectionLibrarySidebar: React.FC<SectionLibrarySidebarProps> = ({
  isOpen,
  onToggle,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredSectionType, setHoveredSectionType] = useState<string | null>(null);
  const [activeSectionTypes, setActiveSectionTypes] = useState<Set<string>>(new Set());
  const { sectionTypes, loading: typesLoading, error: typesError } = useSectionTypes();

  // Fetch which section types have active templates
  useEffect(() => {
    if (isOpen) {
      fetchActiveSectionTypes().catch(err => {
        console.error('Failed to fetch active section types:', err);
        // Continue with empty set to prevent crash
        setActiveSectionTypes(new Set());
      });
    }
  }, [isOpen]);

  const fetchActiveSectionTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('section_templates')
        .select('section_type')
        .eq('status', 'active');
        
      if (error) throw error;
      
      const activeTypes = new Set(data?.map(item => item.section_type) || []);
      setActiveSectionTypes(activeTypes);
    } catch (err) {
      console.error('Error fetching active section types:', err);
    }
  };

  // Filter section types based on search term
  const filteredSectionTypes = sectionTypes.filter(sectionType => {
    if (!searchTerm) return true;
    const displayName = sectionType.display_name.toLowerCase();
    const description = sectionType.description?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    return displayName.includes(searchLower) || description.includes(searchLower);
  });

  const handleSectionTypeDragStart = (sectionType: string) => {
    // No need for setDraggedSectionType as it's not defined in this component
  };

  const handleSectionTypeDragEnd = () => {
    // No need for setDraggedSectionType as it's not defined in this component
  };

  const handleSectionTypeMouseEnter = (sectionType: string) => {
    setHoveredSectionType(sectionType);
  };

  const handleSectionTypeMouseLeave = () => {
    setHoveredSectionType(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`
      w-80 bg-white border-r border-gray-200 flex flex-col h-full
      ${className}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Section Library</h2>
          <button
            onClick={onToggle}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search section types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Section Type Cards */}
      <div className="flex-1 overflow-y-auto p-4">
        {typesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : typesError ? (
          <div className="text-center py-8 text-red-500">
            <p className="text-sm">Error loading section types</p>
            <p className="text-xs mt-1">{typesError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredSectionTypes.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <p className="text-sm">No section types found</p>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredSectionTypes.map((sectionType) => (
                <SectionTypeCard
                  key={sectionType.id}
                  sectionType={sectionType.type_key}
                  displayName={sectionType.display_name}
                  iconName={sectionType.icon_name}
                  description={sectionType.description}
                  onDragStart={handleSectionTypeDragStart}
                  onDragEnd={handleSectionTypeDragEnd}
                  isHovered={hoveredSectionType === sectionType.type_key}
                  onMouseEnter={() => handleSectionTypeMouseEnter(sectionType.type_key)}
                  onMouseLeave={handleSectionTypeMouseLeave}
                  isActive={activeSectionTypes.has(sectionType.type_key)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          Drag a section type onto the canvas to add it to your page
        </p>
      </div>
    </div>
  );
};

export default SectionLibrarySidebar;
export type { SectionLibrarySidebarProps };