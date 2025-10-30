/**
 * AWS S3 Upload Client for Dashboard
 * Handles image uploads to S3 from the browser
 */

import { createClient } from '@/lib/supabase-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface S3UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Get authentication token from Supabase session
 */
const getAuthToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Check if S3 is configured on the server
 */
export const checkS3Status = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.warn('⚠️ No auth token available for S3 status check');
      return false;
    }

    console.log('📡 Calling API endpoint:', `${API_URL}/api/upload/status`);
    const response = await fetch(`${API_URL}/api/upload/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('❌ S3 status check failed with status:', response.status);
      return false;
    }

    const data = await response.json();
    console.log('✅ S3 status response:', data);
    return data.s3Configured === true;
  } catch (error) {
    console.error('❌ Error checking S3 status:', error);
    return false;
  }
};

/**
 * Upload image directly to S3 using presigned URL (Recommended - Faster)
 * File goes directly from browser to S3, bypassing the server
 */
export const uploadToS3WithPresignedUrl = async (
  file: File,
  vehicleId: string,
  imageType: 'gallery' | 'image_360' | 'cr_paper'
): Promise<S3UploadResult> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Step 1: Get presigned URL from server
    const presignedResponse = await fetch(`${API_URL}/api/upload/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        vehicleId,
        imageType,
        fileName: file.name,
        mimeType: file.type,
      }),
    });

    if (!presignedResponse.ok) {
      throw new Error('Failed to get presigned URL');
    }

    const { presignedUrl, publicUrl, key } = await presignedResponse.json();

    // Step 2: Upload directly to S3
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to S3');
    }

    return {
      success: true,
      url: publicUrl,
      key,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

/**
 * Upload image via server (Alternative method)
 * File goes through your server first, then to S3
 */
export const uploadToS3ViaServer = async (
  file: File,
  vehicleId: string,
  imageType: 'gallery' | 'image_360' | 'cr_paper'
): Promise<S3UploadResult> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('vehicleId', vehicleId);
    formData.append('imageType', imageType);

    const response = await fetch(`${API_URL}/api/upload/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return {
      success: true,
      url: data.url,
      key: data.key,
    };
  } catch (error) {
    console.error('Error uploading via server:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

/**
 * Upload multiple images at once
 */
export const uploadMultipleToS3 = async (
  files: File[],
  vehicleId: string,
  imageType: 'gallery' | 'image_360' | 'cr_paper',
  onProgress?: (completed: number, total: number) => void
): Promise<S3UploadResult[]> => {
  const results: S3UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await uploadToS3WithPresignedUrl(files[i], vehicleId, imageType);
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  
  return results;
};

/**
 * Delete image from S3
 */
export const deleteFromS3 = async (key: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (!token) return false;

    const response = await fetch(`${API_URL}/api/upload/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ key }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
};

/**
 * Delete all images for a vehicle
 */
export const deleteVehicleImagesFromS3 = async (vehicleId: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (!token) return false;

    const response = await fetch(`${API_URL}/api/upload/delete-vehicle/${vehicleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error deleting vehicle images:', error);
    return false;
  }
};

/**
 * List all images for a vehicle
 */
export const listVehicleImages = async (
  vehicleId: string,
  imageType?: 'gallery' | 'image_360' | 'cr_paper'
): Promise<string[]> => {
  try {
    const token = await getAuthToken();
    if (!token) return [];

    const url = new URL(`${API_URL}/api/upload/list/${vehicleId}`);
    if (imageType) {
      url.searchParams.append('imageType', imageType);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.success ? data.images : [];
  } catch (error) {
    console.error('Error listing vehicle images:', error);
    return [];
  }
};
