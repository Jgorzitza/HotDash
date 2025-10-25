/**
 * Customer Photos Upload API
 *
 * Handles image uploads from customers for visual search and support
 *
 * POST /api/customer-photos/upload
 *
 * Features:
 * - Multipart form data upload
 * - Image validation (type, size, dimensions)
 * - EXIF stripping for privacy
 * - Thumbnail generation
 * - Supabase Storage integration
 * - SHA-256 hash for deduplication
 * - Database record creation
 *
 * Security:
 * - File type validation (JPEG, PNG, WebP only)
 * - File size limit (10MB)
 * - EXIF data removal
 * - Secure file naming
 */
import type { ActionFunctionArgs } from "react-router";
/**
 * POST /api/customer-photos/upload
 *
 * Upload customer photo with metadata
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.customer-photos.upload.d.ts.map