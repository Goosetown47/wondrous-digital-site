'use client';

import { createClient } from '@/lib/supabase/client';
import type { EditContext } from '@/components/shared/content-editor/EditableImage';

export class ImageManager {
  private supabase = createClient();

  /**
   * Upload an image to the appropriate Supabase bucket based on context
   */
  async uploadImage(file: File, context: EditContext): Promise<string> {
    // Determine the bucket name based on context
    const bucketName = `${context}-assets`;

    console.log('Starting upload:', {
      context,
      bucketName,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    // Generate a unique file name
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase storage
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/png'
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    if (!data) {
      throw new Error('Upload succeeded but no data returned');
    }

    // For lab-assets (private bucket), create a signed URL
    // For other buckets, use public URL
    let imageUrl: string;

    if (context === 'lab') {
      // Create a signed URL that expires in 1 year (31536000 seconds)
      const { data: signedData, error: signedError } = await this.supabase.storage
        .from(bucketName)
        .createSignedUrl(data.path, 31536000);

      if (signedError || !signedData) {
        console.error('Failed to create signed URL:', signedError);
        throw new Error('Failed to create signed URL for uploaded image');
      }

      imageUrl = signedData.signedUrl;
      console.log('Upload successful (private bucket):', { fileName, path: data.path, signedUrl: imageUrl });
    } else {
      // For library and project assets (public buckets), use public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      imageUrl = publicUrl;
      console.log('Upload successful (public bucket):', { fileName, path: data.path, publicUrl: imageUrl });
    }

    return imageUrl;
  }

  /**
   * Delete an image from Supabase storage
   */
  async deleteImage(imageUrl: string, context: EditContext): Promise<void> {
    // Extract the file name from the URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      throw new Error('Invalid image URL');
    }

    const bucketName = `${context}-assets`;

    const { error } = await this.supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * List recent images from a bucket
   */
  async getRecentImages(context: EditContext, limit = 20): Promise<string[]> {
    const bucketName = `${context}-assets`;

    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .list(undefined, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('List error:', error);
      return [];
    }

    // Convert file list to URLs (signed for lab, public for others)
    const urls = await Promise.all(
      data?.map(async (file: { name: string }) => {
        if (context === 'lab') {
          // Create signed URL for private lab bucket
          const { data: signedData } = await this.supabase.storage
            .from(bucketName)
            .createSignedUrl(file.name, 31536000); // 1 year expiry
          return signedData?.signedUrl || '';
        } else {
          // Use public URL for library and project buckets
          const { data: { publicUrl } } = this.supabase.storage
            .from(bucketName)
            .getPublicUrl(file.name);
          return publicUrl;
        }
      }) || []
    );

    return urls.filter(url => url !== '');
  }

  /**
   * Check if a bucket exists and is accessible
   */
  async checkBucket(context: EditContext): Promise<boolean> {
    const bucketName = `${context}-assets`;

    try {
      // First check if we're authenticated
      const { data: { user } } = await this.supabase.auth.getUser();
      console.log('Current user:', user?.email || 'Not authenticated');

      const { error } = await this.supabase.storage
        .from(bucketName)
        .list('', { limit: 1 });

      if (error) {
        console.error(`Bucket ${bucketName} check failed:`, error);
        return false;
      }

      console.log(`Bucket ${bucketName} is accessible`);
      return true;
    } catch (err) {
      console.error(`Bucket ${bucketName} check error:`, err);
      return false;
    }
  }
}

// Export singleton instance
export const imageManager = new ImageManager();