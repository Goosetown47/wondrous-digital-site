'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface HoverZoneProps {
  position: number;
  onAddClick: (position: number) => void;
  isEmpty?: boolean;
}

export function HoverZone({ position, onAddClick, isEmpty = false }: HoverZoneProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onAddClick(position);
  };

  if (isEmpty) {
    // Special empty state - centered with minimum height
    return (
      <div
        data-testid="hover-zone-empty"
        className="flex items-center justify-center min-h-[200px] w-full"
      >
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            transition-all duration-200 ease-in-out
            ${isHovered ? 'opacity-100 scale-110' : 'opacity-50 scale-100'}
          `}
          aria-label={`Add section at position ${position}`}
        >
          <div className="rounded-full bg-gray-200 hover:bg-gray-300 p-3 shadow-md">
            <Plus className="w-6 h-6 text-gray-700" />
          </div>
        </button>
      </div>
    );
  }

  // Regular hover zone between sections
  return (
    <div
      data-testid={`hover-zone-${position}`}
      className={`
        relative h-12 w-full flex items-center justify-center
        transition-opacity duration-200 cursor-pointer
        ${isHovered ? 'opacity-100' : 'opacity-0'}
        hover:opacity-100
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <button
        className="rounded-full bg-gray-200 hover:bg-gray-300 p-2 shadow-md transition-all duration-200 hover:scale-110"
        aria-label={`Add section at position ${position}`}
      >
        <Plus className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}