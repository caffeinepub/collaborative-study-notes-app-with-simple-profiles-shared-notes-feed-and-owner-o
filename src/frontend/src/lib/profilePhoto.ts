/**
 * Utilities for converting backend ProfilePhoto bytes into renderable image URLs
 * and managing object URL lifecycle.
 */

import type { ProfilePhoto } from '../backend';

/**
 * Convert ProfilePhoto (Uint8Array + mimeType) to a blob URL for rendering
 */
export function profilePhotoToUrl(photo: ProfilePhoto): string {
  // Convert Uint8Array to a standard array buffer for Blob compatibility
  const blob = new Blob([new Uint8Array(photo.data)], { type: photo.mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Cleanup object URL to prevent memory leaks
 */
export function revokeProfilePhotoUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Convert a File to ProfilePhoto format for backend upload
 */
export async function fileToProfilePhoto(file: File): Promise<ProfilePhoto> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  return {
    data,
    mimeType: file.type,
  };
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' };
  }
  
  // Max 5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }
  
  return { valid: true };
}
