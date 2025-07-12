import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles image upload to Supabase storage
 */
export const uploadImageToSupabase = async (file: File, projectId: string) => {
  try {
    // Generate a unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}-${Date.now()}.${fileExt || 'jpg'}`;
    
    // Use different path structures based on folder requirements
    let filePath;
    if (projectId.startsWith('featured-images/')) {
      // For featured images, use the provided path
      filePath = `${projectId}/${fileName}`;
    } else {
      // For regular editor uploads, use the standard path
      filePath = `projects/${projectId}/blog/${fileName}`;
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
    let { data, error } = await supabase.storage.from('blog-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });
    
    // If bucket doesn't exist, try public bucket
    if (error && error.message.includes('The resource already exists')) {
      // File exists, try uploading with different name
      const newFileName = `${uuidv4()}_${Date.now()}.${fileExt || 'jpg'}`;
      const newFilePath = `projects/${projectId}/blog/${newFileName}`;
      
      const uploadResult = await supabase.storage.from('blog-images').upload(newFilePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });
      
      data = uploadResult.data;
      error = uploadResult.error;
    } else if (error && error.message.includes('does not exist')) {
      // Try the public bucket instead
      const publicResult = await supabase.storage.from('public').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });
      
      data = publicResult.data;
      error = publicResult.error;
    }
    
    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
    
    const bucketName = data?.Key?.split('/')[0] || 'blog-images';
    const path = data?.Key?.split('/').slice(1).join('/') || filePath;
    
    // Get public URL from the correct bucket
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);
    
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
  
  constructor({ projectId }: { projectId: string }) {
    this.projectId = projectId;
  }
  
  /**
   * Upload file to server and return an uploaded image data
   * @param {File} file - file selected from device or pasted by drag-n-drop
   * @return {Promise.<{success, file: {url}}>}
   */
  async uploadByFile(file: File) {
    try {
      const url = await uploadImageToSupabase(file, this.projectId);
      
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