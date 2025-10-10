'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { imageManager } from '@/lib/services/image-manager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { EditContext } from './EditableImage';

export interface ImageSettings {
  imageUrl: string | null;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  objectPosition?: string;
  alt?: string;
}

interface ImageManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage?: string | null;
  context: EditContext;
  onUpdate: (imageUrl: string | null) => void;
  // Optional: Initial settings for display tab
  initialObjectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  initialObjectPosition?: string;
  onUpdateSettings?: (settings: ImageSettings) => void;
}

export function ImageManagerModal({
  open,
  onOpenChange,
  currentImage,
  context,
  onUpdate,
  initialObjectFit = 'cover',
  initialObjectPosition = 'center',
  onUpdateSettings,
}: ImageManagerModalProps) {
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<string[]>([]);

  // Display settings state
  const [objectFit, setObjectFit] = useState<'cover' | 'contain' | 'fill' | 'scale-down' | 'none'>(initialObjectFit);
  const [objectPosition, setObjectPosition] = useState(initialObjectPosition);

  // Fetch recent images when modal opens
  useEffect(() => {
    if (open) {
      imageManager.getRecentImages(context, 12)
        .then(images => setRecentImages(images))
        .catch(error => console.error('Failed to fetch recent images:', error));
    }
  }, [open, context]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    // Create preview URL for immediate feedback
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload to Supabase
      const uploadedUrl = await imageManager.uploadImage(file, context);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update with the actual uploaded URL
      onUpdate(uploadedUrl);
      onOpenChange(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Clean up the preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreviewUrl(null);
    }
  }, [context, onUpdate, onOpenChange]);

  const handleDelete = async () => {
    if (currentImage) {
      try {
        // Delete from Supabase storage
        await imageManager.deleteImage(currentImage, context);
        onUpdate(null);
        onOpenChange(false);
      } catch (error) {
        console.error('Delete failed:', error);
        // Even if delete fails, we can still remove the reference
        onUpdate(null);
        onOpenChange(false);
      }
    }
  };

  const handleSaveDisplaySettings = () => {
    if (onUpdateSettings && currentImage) {
      const settings: ImageSettings = {
        imageUrl: currentImage,
        objectFit,
        objectPosition,
        alt: altText || undefined,
      };
      onUpdateSettings(settings);
      onOpenChange(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    },
    maxFiles: 1,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Image</DialogTitle>
          <DialogDescription>
            Upload a new image, select from recent uploads, or manage the current image.
            Images are stored in {context}-assets.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="display" disabled={!currentImage}>
              Display
            </TabsTrigger>
            <TabsTrigger value="current" disabled={!currentImage}>
              Current
            </TabsTrigger>
            <TabsTrigger value="recent" disabled={recentImages.length === 0}>
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
                isDragActive || dragActive
                  ? 'border-module-primary bg-module-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <input {...getInputProps()} />

              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-module-primary" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-module-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, GIF, WebP, SVG up to 10MB
                  </p>
                </>
              )}

              {previewUrl && !uploading && (
                <div className="mt-4 mx-auto w-48 h-48 relative">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="alt-text">Alt Text (for accessibility)</Label>
                <Input
                  id="alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image..."
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="mt-4">
            {currentImage && (
              <div className="space-y-6">
                {/* Live Preview */}
                <div>
                  <Label className="mb-2 block">Preview</Label>
                  <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border border-border">
                    <Image
                      src={currentImage}
                      alt="Preview with settings"
                      fill
                      className={cn("transition-all duration-200")}
                      style={{
                        objectFit: objectFit,
                        objectPosition: objectPosition,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Preview of how your image will display with current settings
                  </p>
                </div>

                {/* Object Fit Control */}
                <div>
                  <Label htmlFor="object-fit">Image Fit</Label>
                  <Select value={objectFit} onValueChange={(value) => setObjectFit(value as typeof objectFit)}>
                    <SelectTrigger id="object-fit" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Cover</span>
                          <span className="text-xs text-muted-foreground">Fills container, may crop</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="contain">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Contain</span>
                          <span className="text-xs text-muted-foreground">Fits inside, no cropping</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fill">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Fill</span>
                          <span className="text-xs text-muted-foreground">Stretches to fill</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="scale-down">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Scale Down</span>
                          <span className="text-xs text-muted-foreground">Never larger than original</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="none">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">None</span>
                          <span className="text-xs text-muted-foreground">Original size</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Object Position Control */}
                <div>
                  <Label htmlFor="object-position">Image Position</Label>
                  <Select value={objectPosition} onValueChange={setObjectPosition}>
                    <SelectTrigger id="object-position" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="top left">Top Left</SelectItem>
                      <SelectItem value="top right">Top Right</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="bottom left">Bottom Left</SelectItem>
                      <SelectItem value="bottom right">Bottom Right</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Position of the image within its container
                  </p>
                </div>

                {/* Alt Text */}
                <div>
                  <Label htmlFor="display-alt-text">Alt Text (for accessibility)</Label>
                  <Input
                    id="display-alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Helps screen readers describe the image to visually impaired users
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDisplaySettings}>
                    Apply Settings
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="current" className="mt-4">
            {currentImage && (
              <div className="space-y-4">
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={currentImage}
                    alt="Current image"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    <p>Current image in {context}-assets</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Image
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-3 gap-4">
                {recentImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-module-primary transition-all"
                    onClick={() => {
                      onUpdate(image);
                      onOpenChange(false);
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Recent upload ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {recentImages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No recent uploads in {context}-assets
                </p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}