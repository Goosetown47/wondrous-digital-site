import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles image upload to Supabase storage
 * @param file File to upload
 * @param pathPrefix Path prefix for the file (project ID or folder)
 * @param bucketName Optional bucket name (defaults to 'blog-images')
 * @returns Public URL of the uploaded image
 */
export const uploadImageToSupabase = async (
  file: File, 
  pathPrefix: string, 
  bucketName: string = 'blog-images'
): Promise<string> => {
  try {
    // Generate a unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}-${Date.now()}.${fileExt || 'jpg'}`;
    
    // Determine the path based on the context
    let filePath;
    if (pathPrefix.includes('/')) {
      // If pathPrefix contains slashes, use it directly
      filePath = `${pathPrefix}/${fileName}`;
    } else {
      // Otherwise build a path based on context
      filePath = `${pathPrefix}/${fileName}`;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, GIF and WEBP images are allowed');
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }
    
    // Upload file to Supabase Storage
    let { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });
    
    // Try with upsert if the file already exists
    if (error && error.message.includes('The resource already exists')) {
      // File exists, try uploading with upsert
      const uploadResult = await supabase.storage.from(bucketName).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      
      data = uploadResult.data;
      error = uploadResult.error;
    }
    
    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data?.path || filePath);
    
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Image uploader tool for Editor.js
 */
export class ImageUploader {
  private readonly projectId: string;
  private readonly bucketName: string;
  
  constructor({ projectId, bucketName = 'blog-images' }: { projectId: string, bucketName?: string }) {
    this.projectId = projectId;
    this.bucketName = bucketName;
  }
  
  /**
   * Upload file to server and return an uploaded image data
   * @param {File} file - file selected from device or pasted by drag-n-drop
   * @return {Promise.<{success, file: {url}}>}
   */
  async uploadByFile(file: File) {
    try {
      const url = await uploadImageToSupabase(file, this.projectId, this.bucketName);
      
      return {
        success: 1,
        file: {
          url,
        }
      };
    } catch (error: any) {
      console.error('Error uploading by file:', error);
      return {
        success: 0,
        file: {
          url: '',
        },
        message: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Upload image by URL
   * @param {string} url - image URL
   * @return {Promise.<{success, file: {url}}>}
   */
  async uploadByUrl(url: string) {
    try {
      // For URL uploads, we just return the URL directly since it's already hosted
      return {
        success: 1,
        file: {
          url,
        }
      };
    } catch (error: any) {
      console.error('Error uploading by url:', error);
      return {
        success: 0,
        file: {
          url: '',
        },
        message: error.message || 'Invalid URL'
      };
    }
  }
}