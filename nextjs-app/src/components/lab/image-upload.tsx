'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { storageService, type UploadResult } from '@/lib/services/storage-service';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploadProps {
  onUpload?: (result: UploadResult) => void;
  bucket?: 'lab' | 'library' | 'project';
  projectId?: string;
  path?: string;
  className?: string;
  accept?: string;
  maxSize?: number;
}

export function ImageUpload({
  onUpload,
  bucket = 'lab',
  projectId,
  path = 'uploads',
  className,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
}: ImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      let result: UploadResult;
      
      if (bucket === 'lab') {
        result = await storageService.uploadToLab(file, `${path}/${file.name}`);
      } else if (bucket === 'library') {
        result = await storageService.uploadToLibrary(file, `${path}/${file.name}`);
      } else if (bucket === 'project' && projectId) {
        result = await storageService.uploadToProject(file, projectId, `${path}/${file.name}`);
      } else {
        throw new Error('Invalid bucket configuration');
      }

      if (result.error) {
        throw result.error;
      }

      setUploadedUrl(result.publicUrl || result.url);
      
      toast({
        title: 'Upload successful',
        description: `Image uploaded to ${bucket} bucket`,
      });

      if (onUpload) {
        onUpload(result);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [bucket, projectId, path, maxSize, toast, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const clearUpload = useCallback(() => {
    setPreview(null);
    setUploadedUrl(null);
  }, []);

  return (
    <Card
      className={cn(
        'relative border-2 border-dashed transition-colors',
        isDragging && 'border-primary bg-primary/5',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {preview || uploadedUrl ? (
        <div className="relative p-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={preview || uploadedUrl || ''}
              alt="Upload preview"
              className="h-full w-full object-contain"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
          
          {!uploading && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2"
              onClick={clearUpload}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {uploadedUrl && (
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-medium">Upload successful!</p>
              <p className="text-muted-foreground truncate">
                {bucket === 'lab' ? 'Private URL (signed)' : 'Public URL'}
              </p>
              <input
                type="text"
                value={uploadedUrl}
                readOnly
                className="w-full rounded border bg-muted px-2 py-1 text-xs"
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center p-8">
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center space-y-2 text-center">
            {isDragging ? (
              <Upload className="h-10 w-10 text-primary" />
            ) : (
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            )}
            
            <div>
              <p className="font-medium">
                {isDragging ? 'Drop image here' : 'Upload image'}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max size: {maxSize / (1024 * 1024)}MB
              </p>
            </div>

            <Button size="sm" variant="outline" disabled={uploading}>
              Select Image
            </Button>
          </div>
        </label>
      )}
    </Card>
  );
}