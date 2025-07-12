import { supabase } from './supabase';

/**
 * Extract all Supabase Storage image URLs from markdown content
 * @param content Markdown content from blog post
 * @returns Array of Supabase Storage image URLs
 */
export const extractImageUrlsFromMarkdown = (content: string): string[] => {
  if (!content) return [];
  
  const urls: string[] = [];
  
  // Match Markdown image syntax: ![alt](url)
  const markdownImageRegex = /!\[.*?\]\((https?:\/\/[^)]+)\)/g;
  let match;
  
  while ((match = markdownImageRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
};

/**
 * Check if a URL is from our Supabase Storage
 * @param url Image URL to check
 * @returns Boolean indicating if the URL is from our Supabase Storage
 */
export const isSupabaseStorageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Get the Supabase URL from environment variable
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return false;
  
  // Check if the URL contains the Supabase URL and storage path
  return url.includes(supabaseUrl) && url.includes('/storage/v1/object/public/');
};

/**
 * Convert a Supabase Storage public URL back to a storage path for deletion
 * @param url Public URL of the image
 * @returns Storage path for the image
 */
export const convertUrlToStoragePath = (url: string): string => {
  if (!isSupabaseStorageUrl(url)) return '';
  
  // Extract path after /public/ in the URL
  const publicPathMatch = url.match(/\/public\/([^?#]+)/);
  if (!publicPathMatch) return '';
  
  return decodeURIComponent(publicPathMatch[1]);
};

/**
 * Delete images from Supabase Storage
 * @param imageUrls Array of image URLs to delete
 * @returns Object with success status and deleted paths or error
 */
export const deleteImagesFromStorage = async (imageUrls: string[]): Promise<{
  success: boolean;
  deletedPaths?: string[];
  error?: any;
}> => {
  try {
    // Filter out non-Supabase URLs and convert to storage paths
    const storagePaths = imageUrls
      .filter(url => isSupabaseStorageUrl(url))
      .map(url => convertUrlToStoragePath(url))
      .filter(path => !!path);
    
    if (storagePaths.length === 0) {
      return { success: true, deletedPaths: [] };
    }
    
    // Group paths by bucket
    const bucketPaths: Record<string, string[]> = {};
    
    storagePaths.forEach(path => {
      // The first segment of the path is the bucket name
      const segments = path.split('/');
      const bucketName = segments[0];
      const restOfPath = segments.slice(1).join('/');
      
      if (!bucketPaths[bucketName]) {
        bucketPaths[bucketName] = [];
      }
      
      bucketPaths[bucketName].push(restOfPath);
    });
    
    // Delete files from each bucket
    const deletionPromises = Object.entries(bucketPaths).map(([bucketName, paths]) => 
      supabase.storage.from(bucketName).remove(paths)
    );
    
    const results = await Promise.all(deletionPromises);
    
    // Check if any deletion failed
    const errors = results
      .filter(result => result.error)
      .map(result => result.error);
    
    if (errors.length > 0) {
      console.error('Some files could not be deleted:', errors);
      return {
        success: false,
        error: errors
      };
    }
    
    return {
      success: true,
      deletedPaths: storagePaths
    };
  } catch (error) {
    console.error('Error deleting images:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Get all image URLs from a blog post (featured image + content images)
 * @param post Blog post object
 * @returns Array of image URLs
 */
export const getAllPostImageUrls = (post: {
  content?: string | null;
  featured_image?: string | null;
}): string[] => {
  const urls: string[] = [];
  
  // Add featured image if it exists
  if (post.featured_image) {
    urls.push(post.featured_image);
  }
  
  // Add content images if there are any
  if (post.content) {
    const contentImageUrls = extractImageUrlsFromMarkdown(post.content);
    urls.push(...contentImageUrls);
  }
  
  // Filter for only Supabase Storage URLs
  return urls.filter(isSupabaseStorageUrl);
};

/**
 * Delete a blog post and all its associated images
 * @param postId ID of the post to delete
 * @returns Object with success status and message or error
 */
export const deletePostWithImages = async (postId: string): Promise<{
  success: boolean;
  message?: string;
  error?: any;
}> => {
  try {
    // First, get the post to extract image URLs
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, featured_image')
      .eq('id', postId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Get all image URLs from the post
    const imageUrls = getAllPostImageUrls(post);
    
    // Delete images from storage
    const { success: deleteImagesSuccess, error: deleteImagesError } = await deleteImagesFromStorage(imageUrls);
    
    if (!deleteImagesSuccess) {
      console.warn('Failed to delete some images:', deleteImagesError);
      // Continue with post deletion even if some images couldn't be deleted
    }
    
    // Delete the post from the database
    const { error: deletePostError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (deletePostError) {
      throw deletePostError;
    }
    
    return {
      success: true,
      message: `Post "${post.title}" and ${imageUrls.length} associated images deleted successfully.`
    };
  } catch (error: any) {
    console.error('Error deleting post with images:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete post and images'
    };
  }
};