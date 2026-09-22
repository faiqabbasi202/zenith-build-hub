/**
 * High-Fidelity Client-Side Image Optimizer
 * 
 * Provides top-notch image optimization preserving architectural detail,
 * stepped high-quality downsampling, format conversion to WebP with alpha support,
 * strict MIME and extension validation, and detailed optimization metrics.
 */

export interface OptimizeOptions {
  /** Max bounding box dimension in pixels. Default 3840px for pristine 4K architectural clarity. */
  maxDimension?: number;
  /** Compression quality from 0.0 to 1.0. Default 0.95 for top-notch, visually lossless quality. */
  quality?: number;
  /** Target output format. Default 'image/webp' with fallback to 'image/jpeg'. */
  format?: "image/webp" | "image/jpeg";
}

export interface OptimizationResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  savingsPercent: number;
  dimensions: { width: number; height: number };
  format: string;
  quality: number;
}

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/pjpeg",
  "image/jfif",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const ALLOWED_IMAGE_EXTS = [
  ".jpg",
  ".jpeg",
  ".jfif",
  ".jif",
  ".png",
  ".webp",
  ".avif",
] as const;

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Validates file type and size against strict security constraints
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  // 1. Size constraint
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 25 MB limit.`,
    };
  }

  const mime = file.type.toLowerCase();
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_IMAGE_EXTS.some((ext) => lowerName.endsWith(ext));

  // 2. MIME type constraint (allow image/* or empty/octet-stream when filename has valid extension)
  const isAllowedMime =
    ALLOWED_IMAGE_MIMES.includes(mime as any) ||
    mime.startsWith("image/") ||
    ((mime === "" || mime === "application/octet-stream") && hasValidExt);

  if (!isAllowedMime) {
    // Explicitly flag dangerous or unsupported types
    if (mime.includes("svg")) {
      return { valid: false, error: "SVG files are not supported for portfolio images due to security constraints." };
    }
    return {
      valid: false,
      error: `Unsupported image format (${mime || "unknown"}). Allowed formats: JPEG, JFIF, PNG, WebP, AVIF.`,
    };
  }

  // 3. File extension constraint
  if (!hasValidExt) {
    return {
      valid: false,
      error: `Invalid file extension. Please upload a file ending in .jpg, .jpeg, .jfif, .png, .webp, or .avif.`,
    };
  }

  return { valid: true };
}

/**
 * Optimizes an image with top-notch quality and dynamic resizing.
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {},
): Promise<OptimizationResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const maxDimension = options.maxDimension ?? 3840; // 3840px for top-notch 4K architectural details
  const quality = Math.min(Math.max(options.quality ?? 0.95, 0.8), 1.0); // 0.95 default (top-notch, visually lossless)

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image data."));
      img.onload = () => {
        try {
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          // Calculate aspect-ratio-preserving dimensions
          let targetWidth = originalWidth;
          let targetHeight = originalHeight;

          if (originalWidth > maxDimension || originalHeight > maxDimension) {
            if (originalWidth >= originalHeight) {
              targetWidth = maxDimension;
              targetHeight = Math.round((originalHeight * maxDimension) / originalWidth);
            } else {
              targetHeight = maxDimension;
              targetWidth = Math.round((originalWidth * maxDimension) / originalHeight);
            }
          }

          // Stepped downsampling for pristine edge clarity if downscaling by > 50%
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { alpha: true });

          if (!ctx) {
            throw new Error("Unable to create canvas rendering context.");
          }

          // If reduction is substantial, perform half-step downscale to preserve fine building textures
          if (originalWidth > targetWidth * 2) {
            const stepCanvas = document.createElement("canvas");
            stepCanvas.width = Math.floor(originalWidth * 0.5);
            stepCanvas.height = Math.floor(originalHeight * 0.5);
            const stepCtx = stepCanvas.getContext("2d", { alpha: true });
            if (stepCtx) {
              stepCtx.imageSmoothingEnabled = true;
              stepCtx.imageSmoothingQuality = "high";
              stepCtx.drawImage(img, 0, 0, stepCanvas.width, stepCanvas.height);

              canvas.width = targetWidth;
              canvas.height = targetHeight;
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(stepCanvas, 0, 0, targetWidth, targetHeight);
            } else {
              canvas.width = targetWidth;
              canvas.height = targetHeight;
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            }
          } else {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          }

          // Determine preferred output format
          let targetFormat = options.format || "image/webp";
          let dataUrl = canvas.toDataURL(targetFormat, quality);

          // If WebP is not supported by the environment, fall back to JPEG
          if (!dataUrl.startsWith("data:image/webp") && targetFormat === "image/webp") {
            targetFormat = "image/jpeg";
            dataUrl = canvas.toDataURL(targetFormat, quality);
          }

          // Compute compressed size from base64 representation
          const head = dataUrl.indexOf(",") + 1;
          const base64Length = dataUrl.length - head;
          const optimizedSize = Math.round((base64Length * 3) / 4);

          const originalSize = file.size;
          const savingsPercent = Math.max(
            0,
            Math.round(((originalSize - optimizedSize) / originalSize) * 100),
          );

          resolve({
            dataUrl,
            originalSize,
            optimizedSize,
            savingsPercent,
            dimensions: { width: targetWidth, height: targetHeight },
            format: targetFormat,
            quality,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable string (e.g. 1.4 MB, 240 KB)
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
