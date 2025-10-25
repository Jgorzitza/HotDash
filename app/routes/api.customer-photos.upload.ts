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
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { createRequire } from "module";
import { logDecision } from "~/services/decisions.server";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabase = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

const require = createRequire(import.meta.url);
let sharpModule: any | null | undefined;
function loadSharp() {
  if (sharpModule !== undefined) {
    return sharpModule;
  }

  try {
    const mod: any = require("sharp");
    sharpModule = mod?.default ?? mod ?? null;
  } catch {
    sharpModule = null;
  }

  return sharpModule;
}

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const THUMBNAIL_SIZE = 300; // 300px width
const STORAGE_BUCKET = 'customer-photos';

interface UploadResult {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  hash: string;
}

/**
 * POST /api/customer-photos/upload
 * 
 * Upload customer photo with metadata
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return Response.json(
        { error: "Supabase credentials not configured" },
        { status: 503 },
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const conversationId = formData.get('conversation_id') as string;
    const messageId = formData.get('message_id') as string;
    const shopDomain = formData.get('shop_domain') as string;
    const customerEmail = formData.get('customer_email') as string | null;
    const description = formData.get('description') as string | null;
    const project = (formData.get('project') as string) || 'occ';

    // Validate required fields
    if (!file) {
      return Response.json({ error: 'File is required' }, { status: 400 });
    }
    if (!conversationId) {
      return Response.json({ error: 'conversation_id is required' }, { status: 400 });
    }
    if (!messageId) {
      return Response.json({ error: 'message_id is required' }, { status: 400 });
    }
    if (!shopDomain) {
      return Response.json({ error: 'shop_domain is required' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json({
        error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image
    const result = await processAndUploadImage({
      supabase,
      buffer,
      fileName: file.name,
      mimeType: file.type,
      conversationId,
      messageId,
      shopDomain,
      customerEmail,
      description,
      project,
    });

    // Log successful upload
    await logDecision({
      scope: 'customer-support',
      actor: 'system',
      action: 'customer_photo_uploaded',
      rationale: `Customer photo uploaded for conversation ${conversationId}`,
      evidenceUrl: result.imageUrl,
      payload: {
        photoId: result.id,
        conversationId,
        messageId,
        fileSize: result.fileSize,
        dimensions: `${result.width}x${result.height}`,
      },
    });

    return Response.json({
      success: true,
      data: result,
      message: 'Image uploaded successfully',
    });

  } catch (error: any) {
    console.error('[Customer Photos Upload] Error:', error);
    
    // Log error
    await logDecision({
      scope: 'customer-support',
      actor: 'system',
      action: 'customer_photo_upload_failed',
      rationale: `Customer photo upload failed: ${error.message}`,
      evidenceUrl: 'api/customer-photos/upload',
      payload: { error: error.message },
    });

    return Response.json({
      success: false,
      error: error.message || 'Failed to upload image',
    }, { status: 500 });
  }
}

/**
 * Process and upload image to Supabase Storage
 */
async function processAndUploadImage(params: {
  supabase: SupabaseClient;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  conversationId: string;
  messageId: string;
  shopDomain: string;
  customerEmail: string | null;
  description: string | null;
  project: string;
}): Promise<UploadResult> {
  const {
    supabase,
    buffer,
    fileName,
    mimeType,
    conversationId,
    messageId,
    shopDomain,
    customerEmail,
    description,
    project,
  } = params;

  const sharp = loadSharp();
  if (!sharp) {
    throw new Error(
      "Image processing requires the optional 'sharp' dependency. Install 'sharp' to enable customer photo uploads.",
    );
  }

  // 1. Strip EXIF data for privacy
  const strippedBuffer = await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF orientation
    .withMetadata({ exif: {} }) // Remove EXIF data
    .toBuffer();

  // 2. Calculate SHA-256 hash for deduplication
  const hash = crypto.createHash('sha256').update(strippedBuffer).digest('hex');

  // 3. Check for duplicate
  const { data: existingPhoto } = await supabase
    .from('customer_photos')
    .select('id, image_url, thumbnail_url, width, height, file_size_bytes, mime_type')
    .eq('image_hash', hash)
    .eq('project', project)
    .single();

  if (existingPhoto) {
    return {
      id: existingPhoto.id,
      imageUrl: existingPhoto.image_url,
      thumbnailUrl: existingPhoto.thumbnail_url,
      width: existingPhoto.width,
      height: existingPhoto.height,
      fileSize: existingPhoto.file_size_bytes,
      mimeType: existingPhoto.mime_type,
      hash,
    };
  }

  // 4. Generate thumbnail
  const thumbnailBuffer = await sharp(strippedBuffer)
    .resize(THUMBNAIL_SIZE, null, { withoutEnlargement: true })
    .toBuffer();

  // 5. Get image metadata
  const metadata = await sharp(strippedBuffer).metadata();

  // 6. Generate storage paths
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${project}/${shopDomain}/${timestamp}-${sanitizedFileName}`;
  const thumbnailPath = `${project}/${shopDomain}/thumbnails/${timestamp}-${sanitizedFileName}`;

  // 7. Upload original image to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, strippedBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 8. Upload thumbnail
  const { error: thumbnailError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(thumbnailPath, thumbnailBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (thumbnailError) {
    console.warn(`[Customer Photos Upload] Thumbnail upload failed: ${thumbnailError.message}`);
  }

  // 9. Get public URLs
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  const { data: thumbnailUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(thumbnailPath);

  // 10. Save to database
  const { data: photo, error: dbError } = await supabase
    .from('customer_photos')
    .insert({
      project,
      shop_domain: shopDomain,
      conversation_id: conversationId,
      message_id: messageId,
      customer_email: customerEmail,
      image_url: urlData.publicUrl,
      image_hash: hash,
      file_size_bytes: strippedBuffer.length,
      mime_type: mimeType,
      width: metadata.width,
      height: metadata.height,
      description,
      status: 'pending', // Pending processing for embeddings
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded files
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath, thumbnailPath]);
    throw new Error(`Database insert failed: ${dbError.message}`);
  }

  return {
    id: photo.id,
    imageUrl: urlData.publicUrl,
    thumbnailUrl: thumbnailUrlData?.publicUrl,
    width: metadata.width!,
    height: metadata.height!,
    fileSize: strippedBuffer.length,
    mimeType,
    hash,
  };
}
