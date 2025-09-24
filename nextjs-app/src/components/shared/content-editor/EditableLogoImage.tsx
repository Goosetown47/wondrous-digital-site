'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EditableImage } from './EditableImage';

interface EditableLogoImageProps {
  src?: string | null;
  alt?: string;
  title?: string;
  className?: string;
  fallbackText?: string;
  onUpdate?: (imageUrl: string | null) => void;
  editable?: boolean;
  showFallback?: boolean;
}

export function EditableLogoImage({
  src,
  alt = 'Logo',
  title,
  fallbackText = 'L',
  className,
  onUpdate,
  editable = true,
  showFallback = true,
}: EditableLogoImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleUpdate = (newImageUrl: string | null) => {
    setCurrentSrc(newImageUrl);
    setImageError(false);
    if (onUpdate) {
      onUpdate(newImageUrl);
    }
  };

  // If there's an error or no image, and we should show fallback
  if ((imageError || !currentSrc) && showFallback && !editable) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded bg-primary text-primary-foreground font-bold",
          className || "h-8 w-8"
        )}
        title={title}
      >
        {fallbackText.charAt(0).toUpperCase()}
      </div>
    );
  }

  // In editable mode, always use EditableImage which handles placeholders
  if (editable) {
    return (
      <div className={cn("inline-block", className)}>
        <EditableImage
          src={currentSrc}
          alt={alt}
          width={40}
          height={40}
          className={cn("h-8 w-auto", className)}
          onUpdate={handleUpdate}
          editable={editable}
        />
      </div>
    );
  }

  // Non-editable mode with image
  return (
    <img
      src={currentSrc || ''}
      alt={alt}
      title={title}
      className={cn("h-8", className)}
      onError={() => setImageError(true)}
    />
  );
}