import { supabase } from './supabase';

/**
 * Helper function to create/ensure a bucket exists in Supabase storage
 */
export const ensureStorageBucket = async (bucketName: string) => {
  try {
    // Try to get bucket (to check if it exists)
    const { data: bucketExists, error: checkError } = await supabase.storage
      .getBucket(bucketName);
    
    // If bucket doesn't exist, create it
    if (checkError && !bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
      
      // Set bucket public
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true
      });
      
      if (updateError) {
        console.warn('Failed to make bucket public:', updateError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    return false;
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Extract bucket and path from a Supabase storage URL
 */
export const extractStoragePath = (url: string): { bucket: string, path: string } | null => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!url.includes(supabaseUrl)) {
      return null;
    }
    
    // Extract the path after /storage/v1/object/public/
    const regex = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)/;
    const match = url.match(regex);
    
    if (!match) {
      return null;
    }
    
    return {
      bucket: match[1],
      path: match[2]
    };
  } catch (error) {
    console.error('Error parsing storage URL:', error);
    return null;
  }
};