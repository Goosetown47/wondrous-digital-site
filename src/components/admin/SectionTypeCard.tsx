import React from 'react';
import * as LucideIcons from 'lucide-react';
import { GripVertical } from 'lucide-react';

// Define the section type to icon mapping
const SECTION_TYPE_ICONS = {
  'hero': LucideIcons.Crown,
  'header': LucideIcons.Menu,
  'features': LucideIcons.Grid3X3,
  'careers': LucideIcons.Briefcase,
  'gallery': LucideIcons.Images,
  'contact': LucideIcons.Phone,
  'faq': LucideIcons.HelpCircle,
  'pricing': LucideIcons.DollarSign,
  'testimonials': LucideIcons.MessageSquare,
  'team': LucideIcons.Users,
  'blog-landing': LucideIcons.FileText,
  'blog-article': LucideIcons.Newspaper,
  'banners': LucideIcons.AlertCircle,
  'product-compare': LucideIcons.BarChart3,
  'card-grid': LucideIcons.LayoutGrid,
  'events': LucideIcons.Calendar,
  'stats': LucideIcons.TrendingUp,
  'links': LucideIcons.Link,
  'forms': LucideIcons.ClipboardList,
  'lists': LucideIcons.List,
  'navigation': LucideIcons.Navigation,
  'other': LucideIcons.MoreHorizontal,
} as const;

// Define the display names for section types
const SECTION_TYPE_NAMES = {
  'hero': 'Hero',
  'header': 'Header',
  'features': 'Features',
  'careers': 'Careers',
  'gallery': 'Gallery',
  'contact': 'Contact',
  'faq': 'FAQ',
  'pricing': 'Pricing',
  'testimonials': 'Testimonials',
  'team': 'Team',
  'blog-landing': 'Blog Landing',
  'blog-article': 'Blog Article',
  'banners': 'Banners',
  'product-compare': 'Product Compare',
  'card-grid': 'Card Grid',
  'events': 'Events',
  'stats': 'Stats',
  'links': 'Links',
  'forms': 'Forms',
  'lists': 'Lists',
  'navigation': 'Navigation',
} as const;

export type SectionType = keyof typeof SECTION_TYPE_ICONS;

interface SectionTypeCardProps {
  sectionType: SectionType;
  displayName?: string;
  iconName?: string;
  description?: string | null;
  onDragStart: (sectionType: SectionType | string) => void;
  onDragEnd: () => void;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isActive?: boolean;
  className?: string;
}

const SectionTypeCard: React.FC<SectionTypeCardProps> = ({
  sectionType,
  displayName,
  iconName,
  description,
  onDragStart,
  onDragEnd,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  isActive = true,
  className = ''
}) => {
  // Try to get icon dynamically from LucideIcons
  let IconComponent = LucideIcons.MoreHorizontal; // Default icon
  
  if (iconName && iconName in LucideIcons) {
    IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
  } else if (sectionType in SECTION_TYPE_ICONS) {
    IconComponent = SECTION_TYPE_ICONS[sectionType as keyof typeof SECTION_TYPE_ICONS];
  }
  
  const finalDisplayName = displayName || SECTION_TYPE_NAMES[sectionType as SectionType] || sectionType;

  const handleDragStart = (e: React.DragEvent) => {
    if (!isActive) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', sectionType);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(sectionType);
  };

  return (
    <div
      draggable={isActive}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        group relative flex flex-col items-center justify-center p-4 
        bg-white border-2 border-gray-200 rounded-lg 
        transition-all duration-200
        min-h-[120px] w-full
        ${isActive ? (
          isHovered 
            ? 'border-gray-400 shadow-lg cursor-move hover:border-gray-300 hover:shadow-md' 
            : 'hover:border-gray-300 hover:shadow-md cursor-move'
        ) : (
          'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50'
        )}
        ${className}
      `}
    >
      {/* Drag Handle - Shows on hover in center (only if active) */}
      {isActive && (
        <div className={`
          absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100
          transition-opacity duration-200 z-10
          text-gray-600 group-hover:text-gray-800
        `}>
          <div className="bg-white bg-opacity-90 rounded-full p-2 shadow-sm">
            <GripVertical size={20} />
          </div>
        </div>
      )}

      {/* Icon */}
      <div className={`flex items-center justify-center w-12 h-12 mb-3 rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-gray-100 group-hover:bg-gray-200' : 'bg-gray-50'
      }`}>
        <IconComponent 
          size={24} 
          className={`transition-colors duration-200 ${
            isActive ? 'text-gray-600 group-hover:text-gray-700' : 'text-gray-400'
          }`}
        />
      </div>

      {/* Section Type Name */}
      <span className={`text-sm font-medium text-center leading-tight ${
        isActive ? 'text-gray-800' : 'text-gray-400'
      }`}>
        {finalDisplayName}
      </span>

      {/* Drag feedback overlay (only if active) */}
      {isActive && (
        <div className={`
          absolute inset-0 bg-pink-50 border-2 border-pink-300 rounded-lg
          transition-opacity duration-200 pointer-events-none
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `} />
      )}
    </div>
  );
};

export default SectionTypeCard;
export { SECTION_TYPE_ICONS, SECTION_TYPE_NAMES };
export type { SectionTypeCardProps };