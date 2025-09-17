'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  onUpdate: (newImageUrl: string | null) => void;
  editable?: boolean;
}

export function EditableImage({
  src,
  alt = 'Image',
  width = 400,
  height = 300,
  className,
  aspectRatio,
  onUpdate,
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
        />
        {showModal && (
          <ImageManagerModal
            open={showModal}
            onOpenChange={setShowModal}
            currentImage={src}
            context={context}
            onUpdate={handleImageUpdate}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className={cn('relative group inline-block', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => editable && setShowModal(true)}
        style={{ cursor: editable ? 'pointer' : 'default' }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="object-cover"
        />

        {/* Hover overlay with upload icon */}
        {editable && isHovered && (
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
        />
      )}
    </>
  );
}