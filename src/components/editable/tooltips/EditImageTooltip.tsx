import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Position {
  x: number;
  y: number;
}

interface Position {
  x: number;
  y: number;
}

interface EditImageTooltipProps {
  src: string;
  alt: string;
  position: Position;
  onUpdate: (data: { src: string; alt: string }) => void;
  onClose: () => void;
  bucketName?: string;
}

const EditImageTooltip: React.FC<EditImageTooltipProps> = ({
  src,
  alt,
  position,
  onUpdate,
  onClose,
  bucketName = 'customer-sites'
}) => {
  const [editedSrc, setEditedSrc] = useState(src);
  const [editedAlt, setEditedAlt] = useState(alt);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Calculate tooltip position to ensure it's visible
  useEffect(() => {
    if (tooltipRef.current) {
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      
      // Initial position below the element
      let newTop = position.y + 10 + scrollY;
      let newLeft = position.x;
      
      // Space available below and above the element
      const spaceBelow = viewportHeight - (position.y - scrollY + 10);
      const spaceAbove = position.y - scrollY - 10;
      
      // Check if tooltip would go below viewport
      if (tooltipRect.height > spaceBelow) {
        // Position above element instead
        if (spaceAbove > tooltipRect.height || spaceAbove > spaceBelow) {
          // If there's more space above than below, position above
          newTop = position.y - tooltipRect.height - 10 + scrollY;
        } else {
          // Otherwise, position at the top of the viewport with margin and ensure it's scrollable
          newTop = scrollY + 10;
        }
      }
      
      // Check if tooltip would go right of viewport
      if (newLeft + tooltipRect.width > viewportWidth) {
        // Align right edge of tooltip with right edge of viewport minus margin
        newLeft = viewportWidth - tooltipRect.width - 10;
      }
      
      // Check if tooltip would go left of viewport
      if (newLeft < 10) {
        newLeft = 10;
      }
      
      // If tooltip is taller than viewport, position at top with a margin
      if (tooltipRect.height > viewportHeight - 20) {
        newTop = scrollY + 10;
      }
      
      setTooltipStyle({
        left: `${newLeft}px`,
        top: `${newTop}px`,
        maxHeight: `${viewportHeight - 20}px`,
        overflowY: 'auto'
      });
    }
  }, [position, editedSrc, editedAlt, isUploading]);
  
  // Open file selector
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, PNG, GIF and WEBP images are allowed');
      }
      
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }
      
      // Upload to Supabase storage
      const customPath = `sections/${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`${customPath}/${uuidv4()}-${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      // Get the URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);
      
      const url = urlData.publicUrl;
      setEditedSrc(url);
      
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setUploadError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle URL input submission
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput) {
      setEditedSrc(urlInput);
    }
  };
  
  // Handle save
  const handleSave = () => {
    onUpdate({
      src: editedSrc,
      alt: editedAlt
    });
  };
  
  return (
    <div 
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80"
      style={tooltipStyle}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800">Edit Image</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Current image preview */}
      <div className="relative mb-3">
        {editedSrc ? (
          <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={editedSrc} 
              alt={editedAlt}
              className="w-full h-full object-cover"
              onError={() => setUploadError('Failed to load image')}
            />
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageIcon size={24} className="text-gray-400" />
          </div>
        )}
        {editedSrc && (
          <button
            type="button"
            onClick={() => setEditedSrc('')}
            className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm text-gray-500 hover:text-red-500"
            title="Remove image"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {/* Upload controls */}
      <div className="mb-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
        />
        <button
          onClick={handleFileSelect}
          disabled={isUploading}
          className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={14} className="mr-2" />
              {editedSrc ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </button>
        {uploadError && (
          <p className="text-xs text-red-500 mt-1">{uploadError}</p>
        )}
      </div>

      {/* Or Use URL option */}
      <div className="mb-3">
        <div className="relative flex items-center">
          <div className="flex-grow flex items-center rounded-md border border-gray-300 focus-within:border-primary-pink">
            <input
              type="text"
              placeholder="Or paste an image URL here"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3 py-2 rounded-l-md focus:outline-none focus:ring-0 text-sm"
            />
            <button
              onClick={handleUrlSubmit}
              className="px-3 py-2 bg-primary-pink text-white rounded-r-md hover:bg-primary-dark-purple transition-colors text-sm"
              disabled={!urlInput}
            >
              Use URL
            </button>
          </div>
        </div>
      </div>
      
      {/* Alt text */}
      <div className="mb-4">
        <label htmlFor="alt-text" className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text
        </label>
        <input
          id="alt-text"
          type="text"
          value={editedAlt}
          onChange={(e) => setEditedAlt(e.target.value)}
          placeholder="Describe this image"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-pink focus:border-primary-pink"
        />
        <p className="text-xs text-gray-500 mt-1">
          Describe the image for accessibility
        </p>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-3 py-1.5 bg-primary-pink text-white rounded-md text-sm hover:bg-primary-dark-purple flex items-center"
        >
          <Check size={14} className="mr-1" /> Save
        </button>
      </div>
    </div>
  );
};

export default EditImageTooltip;