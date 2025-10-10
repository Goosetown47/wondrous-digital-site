'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageManagerModal } from './ImageManagerModal';
import { ImagePlaceholder } from './ImagePlaceholder';
import { usePathname } from 'next/navigation';

export type EditContext = 'lab' | 'library' | 'project';

interface EditableImageProps {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  objectPosition?: string;
  onUpdate: (newImageUrl: string | null) => void;
  onUpdateSettings?: (settings: { imageUrl: string | null; objectFit?: string; objectPosition?: string; alt?: string }) => void;
  editable?: boolean;
}

export function EditableImage({
  src,
  alt = 'Image',
  width = 400,
  height = 300,
  className,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  onUpdate,
  onUpdateSettings,
  editable = true,
}: EditableImageProps) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  // Detect editing context based on pathname
  const getEditContext = (): EditContext => {
    if (pathname.includes('/lab')) return 'lab';
    if (pathname.includes('/library')) return 'library';
    if (pathname.includes('/project')) return 'project';
    return 'lab'; // Default to lab
  };

  const context = getEditContext();

  const handleImageUpdate = (newImageUrl: string | null) => {
    onUpdate(newImageUrl);
    setShowModal(false);
  };

  // If no image, show placeholder
  if (!src) {
    return (
      <>
        <ImagePlaceholder
          width={width}
          height={height}
          aspectRatio={aspectRatio}
          onClick={() => editable && setShowModal(true)}
          className={className}
          editable={editable}
        />
        {showModal && (
          <ImageManagerModal
            open={showModal}
            onOpenChange={setShowModal}
            currentImage={src}
            context={context}
            onUpdate={handleImageUpdate}
            initialObjectFit={objectFit}
            initialObjectPosition={objectPosition}
            onUpdateSettings={onUpdateSettings}
          />
        )}
      </>
    );
  }

  // If not editable, just render the image absolutely positioned to fill container
  if (!editable) {
    return (
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: objectFit,
          objectPosition: objectPosition,
        }}
      />
    );
  }

  return (
    <>
      <div
        className={cn(
          'relative group w-full h-full',
          // Ensure block display to avoid inline-block default
          'block'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowModal(true)}
        style={{ cursor: 'pointer' }}
      >
        {/* Use absolutely positioned img to fill container like Next.js Image with fill prop */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: objectFit,
            objectPosition: objectPosition,
          }}
        />

        {/* Hover overlay with upload icon */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
              <Upload className="h-6 w-6 text-gray-700" />
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ImageManagerModal
          open={showModal}
          onOpenChange={setShowModal}
          currentImage={src}
          context={context}
          onUpdate={handleImageUpdate}
          initialObjectFit={objectFit}
          initialObjectPosition={objectPosition}
          onUpdateSettings={onUpdateSettings}
        />
      )}
    </>
  );
}