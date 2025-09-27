'use client';

import { useState } from 'react';
import { Plus, Layout } from 'lucide-react';
import Image from 'next/image';

interface TemplateCardProps {
  id: string;
  name: string;
  type: 'section' | 'page' | 'site';
  category?: string;
  previewImage?: string | null;
  onClick: (template: {
    id: string;
    name: string;
    type: string;
    category?: string;
  }) => void;
}

export function TemplateCard({
  id,
  name,
  type,
  category,
  previewImage,
  onClick,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick({ id, name, type, category });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const getBadgeColors = () => {
    switch (type) {
      case 'section':
        return 'bg-blue-100 text-blue-800';
      case 'page':
        return 'bg-green-100 text-green-800';
      case 'site':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      data-testid={`template-card-${id}`}
      className="relative rounded-lg border bg-white shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Add ${name} ${type}`}
    >
      {/* Preview Image or Placeholder */}
      <div className="relative w-full h-48 bg-gray-50">
        {previewImage ? (
          <Image
            src={previewImage}
            alt={`${name} preview`}
            fill
            className="object-cover"
          />
        ) : (
          <div
            data-testid="placeholder-image"
            className="w-full h-full bg-gray-100 flex items-center justify-center"
          >
            <Layout className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Hover Overlay */}
        <div
          data-testid="hover-overlay"
          className={`
            absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center
            transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div
            data-testid="plus-button"
            className="rounded-full bg-white p-3 shadow-lg"
          >
            <Plus className="w-6 h-6 text-gray-800" />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getBadgeColors()}`}>
            {type}
          </span>
          {category && (
            <span className="text-xs text-gray-500">{category}</span>
          )}
        </div>
      </div>
    </div>
  );
}