import { createClient } from '@/lib/supabase/client';

export type StorageBucket = 'lab-assets' | 'library-assets' | 'project-assets';

export interface UploadResult {
  url: string | null;
  publicUrl: string | null;
  path: string;
  error: Error | null;
}

export interface StorageFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
}

class StorageService {
  private supabase = createClient();

  /**
   * Upload file to Lab bucket (admin only)
   */
  async uploadToLab(file: File, path: string): Promise<UploadResult> {
    return this.uploadFile('lab-assets', file, path);
  }

  /**
   * Upload file to Library bucket (admin only)
   */
  async uploadToLibrary(file: File, path: string): Promise<UploadResult> {
    return this.uploadFile('library-assets', file, path);
  }

  /**
   * Upload file to Project bucket
   */
  async uploadToProject(file: File, projectId: string, path: string): Promise<UploadResult> {
    const fullPath = `${projectId}/${path}`;
    return this.uploadFile('project-assets', file, fullPath);
  }

  /**
   * Generic upload method
   */
  private async uploadFile(bucket: StorageBucket, file: File, path: string): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (validation.error) {
        return {
          url: null,
          publicUrl: null,
          path,
          error: validation.error
        };
      }

      // Generate unique filename if needed
      const fileName = this.generateFileName(file, path);

      // Upload file
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return {
          url: null,
          publicUrl: null,
          path: fileName,
          error: new Error(error.message)
        };
      }

      // Get public URL (for public buckets)
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      // For private buckets, generate signed URL
      let signedUrl = null;
      if (bucket === 'lab-assets') {
        const { data: signedData } = await this.supabase.storage
          .from(bucket)
          .createSignedUrl(data.path, 3600); // 1 hour expiry
        signedUrl = signedData?.signedUrl || null;
      }

      return {
        url: signedUrl,
        publicUrl: bucket === 'lab-assets' ? null : publicUrl,
        path: data.path,
        error: null
      };
    } catch (error) {
      return {
        url: null,
        publicUrl: null,
        path,
        error: error instanceof Error ? error : new Error('Upload failed')
      };
    }
  }

  /**
   * Delete file from bucket
   */
  async deleteFile(bucket: StorageBucket, path: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Delete failed')
      };
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(bucket: StorageBucket, path: string): Promise<{ files: StorageFile[], error: Error | null }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(path, {
          limit: 100,
          offset: 0
        });

      if (error) {
        return { files: [], error: new Error(error.message) };
      }

      // Map to StorageFile format
      const files: StorageFile[] = (data || []).map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'unknown',
        lastModified: new Date(file.updated_at || file.created_at).getTime()
      }));

      return { files, error: null };
    } catch (error) {
      return { 
        files: [], 
        error: error instanceof Error ? error : new Error('List failed')
      };
    }
  }

  /**
   * Move/rename file
   */
  async moveFile(bucket: StorageBucket, fromPath: string, toPath: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .move(fromPath, toPath);

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Move failed')
      };
    }
  }

  /**
   * Copy file from Lab to Library (publish)
   */
  async publishFromLab(labPath: string, libraryPath: string): Promise<UploadResult> {
    try {
      // Download from lab
      const { data, error: downloadError } = await this.supabase.storage
        .from('lab-assets')
        .download(labPath);

      if (downloadError || !data) {
        return {
          url: null,
          publicUrl: null,
          path: libraryPath,
          error: new Error(downloadError?.message || 'Download failed')
        };
      }

      // Convert blob to File
      const file = new File([data], labPath.split('/').pop() || 'file', {
        type: data.type
      });

      // Upload to library
      return this.uploadToLibrary(file, libraryPath);
    } catch (error) {
      return {
        url: null,
        publicUrl: null,
        path: libraryPath,
        error: error instanceof Error ? error : new Error('Publish failed')
      };
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { error: Error | null } {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { error: new Error('File size exceeds 10MB limit') };
    }

    // Check file type (images only for now)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return { error: new Error(`File type ${file.type} not allowed. Only images are supported.`) };
    }

    return { error: null };
  }

  /**
   * Generate unique filename
   */
  private generateFileName(file: File, path: string): string {
    // If path already includes extension, use as-is
    if (path.includes('.')) {
      return path;
    }

    // Generate timestamp-based name
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const baseName = path.replace(/[^a-zA-Z0-9-_/]/g, '_');
    
    return `${baseName}_${timestamp}.${extension}`;
  }

  /**
   * Get signed URL for private assets
   */
  async getSignedUrl(bucket: StorageBucket, path: string, expiresIn: number = 3600): Promise<{ url: string | null, error: Error | null }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        return { url: null, error: new Error(error.message) };
      }

      return { url: data.signedUrl, error: null };
    } catch (error) {
      return { 
        url: null, 
        error: error instanceof Error ? error : new Error('Failed to generate signed URL')
      };
    }
  }
}

export const storageService = new StorageService();