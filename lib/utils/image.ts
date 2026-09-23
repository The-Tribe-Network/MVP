/**
 * Image validation utilities
 */

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB ceiling for validateImageFile; routes apply tighter limits
/**
 * Vercel Functions reject any request or response body over 4.5 MB with 413 FUNCTION_PAYLOAD_TOO_LARGE
 * before the handler runs (https://vercel.com/docs/functions/limitations#request-body-size). Multipart
 * upload routes check Content-Length against this up front so local/dev behaves like production and the
 * client gets a clear code; full-size phone photos must use the signed direct-upload flow (TRI-160).
 */
export const MULTIPART_BODY_LIMIT_BYTES = Math.floor(4.5 * 1024 * 1024);
/** Absolute ceiling on one media asset whatever a tribe's maxMediaFileSize says (MEDIA-12: 25 MB). */
export const MAX_UPLOAD_BYTES_HARD_CAP = 25 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  code?: 'FILE_TOO_LARGE' | 'INVALID_TYPE';
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxBytes: number = MAX_FILE_SIZE): ImageValidationResult {
  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      code: 'INVALID_TYPE',
    };
  }

  // Check file size
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${Math.round((maxBytes / 1024 / 1024) * 10) / 10}MB`,
      code: 'FILE_TOO_LARGE',
    };
  }

  return { valid: true };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

