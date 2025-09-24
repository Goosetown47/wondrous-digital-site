'use client';

import { useState } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  width?: number;
  height?: number;
  aspectRatio?: string;
  onClick?: () => void;
  className?: string;
}

export function ImagePlaceholder({
  width = 400,
  height = 300,
  aspectRatio,
  onClick,
  className,
}: ImagePlaceholderProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate dimensions based on aspect ratio if provided
  const getStyle = () => {
    if (aspectRatio) {
      const [w, h] = aspectRatio.split(':').map(Number);
      return {
        width: width || '100%',
        aspectRatio: `${w} / ${h}`,
      };
    }
    return {
      width,
      height,
    };
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center cursor-pointer transition-all duration-200',
        'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
        'border-2 border-dashed',
        isHovered ? 'border-gray-400 dark:border-gray-500' : 'border-gray-300 dark:border-gray-700',
        'rounded-lg overflow-hidden',
        className
      )}
      style={getStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.1) 10px, rgba(0,0,0,.1) 20px)`,
        }} />
      </div>

      {/* Center content */}
      <div className="relative flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-600">
        <div className="relative">
          <ImageIcon className={cn(
            'transition-all duration-200',
            isHovered ? 'h-12 w-12' : 'h-10 w-10'
          )} />
          {isHovered && (
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg animate-in zoom-in duration-200">
              <Upload className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </div>
          )}
        </div>

        {isHovered && (
          <p className="text-sm font-medium animate-in fade-in slide-in-from-bottom-1 duration-200">
            Click to upload image
          </p>
        )}
      </div>

      {/* Hover overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 pointer-events-none" />
      )}
    </div>
  );
}