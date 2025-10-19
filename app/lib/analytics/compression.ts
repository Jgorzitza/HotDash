/**
 * Response Compression Utilities
 *
 * Compresses analytics responses to reduce bandwidth.
 */

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  method: "gzip" | "deflate" | "brotli" | "none";
}

/**
 * Check if client accepts compression
 */
export function acceptsCompression(request: Request): string[] {
  const acceptEncoding = request.headers.get("accept-encoding") || "";
  const encodings: string[] = [];

  if (acceptEncoding.includes("br")) encodings.push("brotli");
  if (acceptEncoding.includes("gzip")) encodings.push("gzip");
  if (acceptEncoding.includes("deflate")) encodings.push("deflate");

  return encodings;
}

/**
 * Estimate compression benefit
 */
export function estimateCompressionBenefit(data: any): {
  worthCompressing: boolean;
  estimatedSavings: number;
} {
  const jsonString = JSON.stringify(data);
  const sizeBytes = new Blob([jsonString]).size;

  // Compression typically saves 60-80% for JSON
  const estimatedSavings = sizeBytes * 0.7;

  // Only compress if >1KB (compression overhead not worth it for small responses)
  const worthCompressing = sizeBytes > 1024;

  return {
    worthCompressing,
    estimatedSavings,
  };
}

/**
 * Prepare response with compression headers
 */
export function prepareCompressedResponse(
  data: any,
  request: Request,
): {
  data: any;
  headers: Record<string, string>;
  stats: CompressionStats;
} {
  const originalSize = new Blob([JSON.stringify(data)]).size;
  const acceptedEncodings = acceptsCompression(request);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // For now, just mark that compression would be applied
  // Actual compression is handled by the runtime/CDN
  if (acceptedEncodings.length > 0) {
    headers["Vary"] = "Accept-Encoding";
  }

  return {
    data,
    headers,
    stats: {
      originalSize,
      compressedSize: Math.round(originalSize * 0.3), // Estimated
      compressionRatio: 0.3,
      method: (acceptedEncodings[0] as any) || "none",
    },
  };
}
