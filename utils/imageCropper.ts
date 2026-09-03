/**
 * Helper utility to auto-crop any uploaded image (file, blob, or URL)
 * into a perfect 1:1 square centered at the middle of the image.
 * 
 * Solves the issue where user uploads portrait (9:16, 6:9) or landscape (16:9, 4:3)
 * images and needs them for circular visualizer discs, center rotating vinyl,
 * and circular avatar logos without any aspect ratio distortion.
 */

export interface CropResult {
  url: string;
  originalWidth: number;
  originalHeight: number;
  croppedSize: number;
  aspectRatio: string;
}

export async function cropImageToCenterSquare(
  imageSource: File | Blob | string,
  maxDimension: number = 1080
): Promise<CropResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrlToRevoke: string | null = null;
    if (imageSource instanceof File || imageSource instanceof Blob) {
      objectUrlToRevoke = URL.createObjectURL(imageSource);
      img.src = objectUrlToRevoke;
    } else {
      img.src = imageSource;
    }

    img.onload = () => {
      try {
        const iw = img.naturalWidth || img.width || 512;
        const ih = img.naturalHeight || img.height || 512;

        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(iw, ih);
        const aspectStr = `${Math.round(iw / divisor)}:${Math.round(ih / divisor)}`;

        // Calculate center square
        const minSide = Math.min(iw, ih);
        const sx = Math.max(0, (iw - minSide) / 2);
        const sy = Math.max(0, (ih - minSide) / 2);

        // Cap at maxDimension for memory efficiency while preserving high clarity
        const outputSize = Math.min(minSide, maxDimension);

        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
          const fallbackUrl = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
          resolve({
            url: fallbackUrl,
            originalWidth: iw,
            originalHeight: ih,
            croppedSize: minSide,
            aspectRatio: aspectStr
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped center square
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, outputSize, outputSize);

        canvas.toBlob(
          (blob) => {
            if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
            if (blob) {
              const finalUrl = URL.createObjectURL(blob);
              resolve({
                url: finalUrl,
                originalWidth: iw,
                originalHeight: ih,
                croppedSize: outputSize,
                aspectRatio: aspectStr
              });
            } else {
              // Fallback to dataURL
              resolve({
                url: canvas.toDataURL('image/png', 0.95),
                originalWidth: iw,
                originalHeight: ih,
                croppedSize: outputSize,
                aspectRatio: aspectStr
              });
            }
          },
          'image/png',
          0.95
        );
      } catch (err) {
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      reject(err || new Error('Failed to load image for square cropping'));
    };
  });
}
