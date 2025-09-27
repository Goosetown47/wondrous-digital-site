'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  bucket?: string;
  path?: string;
  className?: string;
  onUpload?: (result: { publicUrl?: string; url?: string }) => void;
  currentImage?: string;
  onRemove?: () => void;
}

export function ImageUpload({ 
  // bucket, 
  // path, 
  className,
  onUpload,
  currentImage,
  onRemove
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      // For now, create a local URL for the image
      const localUrl = URL.createObjectURL(file);
      onUpload({ url: localUrl, publicUrl: localUrl });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {currentImage ? (
        <div className="relative">
          <img 
            src={currentImage} 
            alt="Uploaded" 
            className="w-full h-32 object-cover rounded-lg"
          />
          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Click to upload an image
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}