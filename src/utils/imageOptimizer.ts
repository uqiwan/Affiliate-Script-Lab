/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OptimizedImageResult {
  name: string;
  mimeType: string;
  base64Data: string;
  size: number;
  previewUrl: string;
}

/**
 * Optimizes an uploaded image file on the client-side:
 * - Resizes high-resolution camera photos (e.g., 4000x3000px) to max 1280px on the longest edge.
 * - Compresses to JPEG with 0.82 quality.
 * - Reduces payload size from 4-8 MB down to ~120-250 KB (95% bandwidth and memory reduction).
 * - Preserves fine details, text on packaging, labels, and product specifications for Gemini vision.
 */
export async function optimizeImageForAi(
  file: File,
  maxDimension = 1280,
  quality = 0.82
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error(`Tipe file ${file.type} bukan gambar yang didukung.`));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Data gambar kosong.'));
        return;
      }

      // If file is already small (< 200 KB) and likely a web image, we can still use it directly
      if (file.size <= 200 * 1024 && !file.type.includes('heic')) {
        const base64Data = dataUrl.split(',')[1] || '';
        resolve({
          name: file.name,
          mimeType: file.type,
          base64Data,
          size: file.size,
          previewUrl: dataUrl,
        });
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to original data if Image decoding fails
        const base64Data = dataUrl.split(',')[1] || '';
        resolve({
          name: file.name,
          mimeType: file.type,
          base64Data,
          size: file.size,
          previewUrl: dataUrl,
        });
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate downscaled dimensions
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) {
            const base64Data = dataUrl.split(',')[1] || '';
            resolve({
              name: file.name,
              mimeType: file.type,
              base64Data,
              size: file.size,
              previewUrl: dataUrl,
            });
            return;
          }

          // Fill white background in case of transparent PNG being converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const targetMime = 'image/jpeg';
          const compressedDataUrl = canvas.toDataURL(targetMime, quality);
          const base64Data = compressedDataUrl.split(',')[1] || '';
          const approxBytes = Math.ceil((base64Data.length * 3) / 4);

          // Release memory immediately for mobile WebView performance
          canvas.width = 0;
          canvas.height = 0;
          img.src = '';

          resolve({
            name: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
            mimeType: targetMime,
            base64Data,
            size: approxBytes,
            previewUrl: compressedDataUrl,
          });
        } catch {
          // In case canvas fails, fallback gracefully
          img.src = '';
          const base64Data = dataUrl.split(',')[1] || '';
          resolve({
            name: file.name,
            mimeType: file.type,
            base64Data,
            size: file.size,
            previewUrl: dataUrl,
          });
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
