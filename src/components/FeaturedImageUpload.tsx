import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { uploadImageToSupabase } from '../utils/editorjs-image-upload';

interface FeaturedImageUploadProps {
  projectId: string;
  currentImageUrl: string;
  onImageUploaded: (url: string) => void;
}

const FeaturedImageUpload: React.FC<FeaturedImageUploadProps> = ({
  projectId,
  currentImageUrl,
  onImageUploaded
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await uploadFile(file);
  };

  // Handle file drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  // Prevent default behavior for drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  };
  
  // Clear current image
  const handleClearImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Upload file to Supabase
  const uploadFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, GIF and WEBP images are allowed');
      return;
    }
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }
    
    try {
      setError(null);
      setIsUploading(true);
      
      // Create a local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Upload to "featured-images" folder in the blog-images bucket
      const customPath = `featured-images/${projectId}`;
      const url = await uploadImageToSupabase(file, customPath);
      
      // Set the final URL from Supabase
      onImageUploaded(url);
      
      // Clean up the object URL
      URL.revokeObjectURL(objectUrl);
    } catch (err: unknown) {
      console.error('Error uploading featured image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      // Remove preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* If we have an image preview or existing image */}
      {previewUrl ? (
        <div className="relative">
          <div className="w-full h-48 relative border border-gray-200 rounded-lg overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Featured" 
              className="w-full h-full object-cover"
              onError={() => setError('Failed to load image')}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="mt-2 flex justify-between">
            <button
              type="button"
              onClick={handleClearImage}
              className="text-red-500 hover:text-red-700 text-sm flex items-center"
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-1" />
              Remove image
            </button>
            <button
              type="button"
              onClick={triggerFileInput}
              className="text-primary-pink hover:text-primary-dark-purple text-sm flex items-center"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-1" />
              Change image
            </button>
          </div>
        </div>
      ) : (
        // Upload area when no image is selected
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-48 transition-colors
            ${dragActive ? 'border-primary-pink bg-primary-pink/5' : 'border-gray-300 hover:border-gray-400'}
            ${error ? 'border-red-300' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center text-center">
            <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              {isUploading ? 'Uploading...' : 'Drop your image here, or click to browse'}
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, GIF or WEBP (max. 5MB)
            </p>
          </div>
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        disabled={isUploading}
      />
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default FeaturedImageUpload;