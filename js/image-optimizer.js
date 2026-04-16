/**
 * Image Optimizer — client-side resize, format conversion & WebP compression
 * Supports HEIC (iPhone), PNG, JPEG, WebP, BMP, GIF, TIFF, AVIF
 * Uses Canvas API to compress images before uploading to Supabase Storage
 */

import heic2any from 'heic2any';

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.80;

/**
 * Check if file is HEIC/HEIF format
 */
function isHeic(file) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === 'image/heic' || type === 'image/heif' || 
         name.endsWith('.heic') || name.endsWith('.heif');
}

/**
 * Convert HEIC file to JPEG blob
 */
async function convertHeicToJpeg(file) {
  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.92
  });
  // heic2any can return a single blob or array
  return Array.isArray(result) ? result[0] : result;
}

/**
 * Optimizes an image file: handles HEIC conversion, resizes to max dimensions and converts to WebP
 * @param {File} file - The original image file
 * @returns {Promise<{blob: Blob, filename: string}>} - Optimized blob and suggested filename
 */
export async function optimizeImage(file) {
  let sourceBlob = file;

  // Convert HEIC/HEIF to JPEG first
  if (isHeic(file)) {
    sourceBlob = await convertHeicToJpeg(file);
  }

  // Create bitmap from blob (works with all browser-supported formats)
  const bitmap = await createImageBitmap(sourceBlob);

  let { width, height } = bitmap;

  // Calculate new dimensions maintaining aspect ratio
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Draw onto canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Try WebP first, fall back to JPEG
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) {
          canvas.toBlob(
            (jpegBlob) => {
              if (!jpegBlob) reject(new Error('No se pudo optimizar la imagen'));
              else resolve(jpegBlob);
            },
            'image/jpeg',
            QUALITY
          );
        } else {
          resolve(b);
        }
      },
      'image/webp',
      QUALITY
    );
  });

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const filename = `${baseName}-${Date.now()}.${ext}`;

  return { blob, filename };
}

/**
 * Creates a preview data URL for an image file (handles HEIC too)
 * @param {File} file
 * @returns {Promise<string>} data URL
 */
export async function createPreview(file) {
  let source = file;

  // Convert HEIC for preview
  if (isHeic(file)) {
    source = await convertHeicToJpeg(file);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(source);
  });
}
