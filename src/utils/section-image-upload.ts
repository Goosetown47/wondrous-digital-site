import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles section preview image upload to Supabase storage
 */
export const uploadSectionPreviewImage = async (file: File): Promise<string> => {
  try {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, WEBP and GIF images are allowed');
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Generate a unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}-${Date.now()}.${fileExt || 'jpg'}`;
    const filePath = `section-previews/${fileName}`;
    
    // Upload file directly to the wondrous-admin bucket
    const { data, error } = await supabase.storage
      .from('wondrous-admin')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });
    
    if (error) {
      console.error('Storage upload failed:', error);
      throw error;
    }
    
    if (!data?.path) {
      throw new Error('Upload succeeded but no path returned');
    }
    
    // Get public URL from the wondrous-admin bucket
    const { data: urlData } = supabase.storage
      .from('wondrous-admin')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};