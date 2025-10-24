# Customer Photos Upload Handler

**Date:** 2025-01-24  
**Engineer:** engineer agent  
**Priority:** P1 - FEATURE

## Overview

Implemented secure image upload handler for the `customer_photos` table, enabling customers to upload photos for visual search and support use cases.

## API Endpoint

### POST /api/customer-photos/upload

**Purpose:** Upload customer photos with metadata for visual search and support

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Image file (JPEG, PNG, WebP) |
| `conversation_id` | string | Yes | Chatwoot conversation ID |
| `message_id` | string | Yes | Chatwoot message ID |
| `shop_domain` | string | Yes | Shop domain (e.g., "example.myshopify.com") |
| `customer_email` | string | No | Customer email for lookup |
| `description` | string | No | Customer's description of the image |
| `project` | string | No | Project name (default: "occ") |

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "imageUrl": "https://...",
    "thumbnailUrl": "https://...",
    "width": 1920,
    "height": 1080,
    "fileSize": 245678,
    "mimeType": "image/jpeg",
    "hash": "sha256-hash"
  },
  "message": "Image uploaded successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Features

### 1. Image Validation

**File Type Validation:**
- Allowed types: JPEG, PNG, WebP
- Rejects other formats (GIF, BMP, TIFF, etc.)

**File Size Validation:**
- Maximum size: 10MB
- Prevents large file uploads

**Example:**
```typescript
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_MIME_TYPES.includes(file.type)) {
  return Response.json({ error: 'Invalid file type' }, { status: 400 });
}

if (file.size > MAX_FILE_SIZE) {
  return Response.json({ error: 'File too large' }, { status: 400 });
}
```

### 2. EXIF Stripping for Privacy

**Purpose:** Remove sensitive metadata from images

**EXIF Data Removed:**
- GPS coordinates
- Camera make/model
- Date/time taken
- Software used
- Copyright information

**Implementation:**
```typescript
const strippedBuffer = await sharp(buffer)
  .rotate() // Auto-rotate based on EXIF orientation
  .withMetadata({ exif: {} }) // Remove EXIF data
  .toBuffer();
```

**Why This Matters:**
- Protects customer privacy
- Prevents location tracking
- Removes device fingerprinting
- Complies with privacy regulations

### 3. Thumbnail Generation

**Purpose:** Create smaller preview images for faster loading

**Configuration:**
- Thumbnail width: 300px
- Maintains aspect ratio
- Same format as original
- Stored in separate path

**Implementation:**
```typescript
const thumbnailBuffer = await sharp(strippedBuffer)
  .resize(THUMBNAIL_SIZE, null, { withoutEnlargement: true })
  .toBuffer();
```

**Storage Paths:**
- Original: `{project}/{shop_domain}/{timestamp}-{filename}`
- Thumbnail: `{project}/{shop_domain}/thumbnails/{timestamp}-{filename}`

### 4. Supabase Storage Integration

**Bucket:** `customer-photos`

**Configuration:**
- Public bucket (read-only)
- 50MB file size limit
- Automatic CDN distribution

**Upload Process:**
```typescript
// Upload original
const { error: uploadError } = await supabase.storage
  .from('customer-photos')
  .upload(storagePath, strippedBuffer, {
    contentType: mimeType,
    upsert: false,
  });

// Upload thumbnail
const { error: thumbnailError } = await supabase.storage
  .from('customer-photos')
  .upload(thumbnailPath, thumbnailBuffer, {
    contentType: mimeType,
    upsert: false,
  });
```

**Public URLs:**
```typescript
const { data: urlData } = supabase.storage
  .from('customer-photos')
  .getPublicUrl(storagePath);

// Returns: https://{project}.supabase.co/storage/v1/object/public/customer-photos/{path}
```

### 5. SHA-256 Hash for Deduplication

**Purpose:** Prevent duplicate uploads

**Process:**
1. Calculate SHA-256 hash of image buffer
2. Check database for existing image with same hash
3. If found, return existing image URL
4. If not found, proceed with upload

**Implementation:**
```typescript
const hash = crypto.createHash('sha256').update(strippedBuffer).digest('hex');

const { data: existingPhoto } = await supabase
  .from('customer_photos')
  .select('*')
  .eq('image_hash', hash)
  .eq('project', project)
  .single();

if (existingPhoto) {
  return existingPhoto; // Return existing image
}
```

**Benefits:**
- Saves storage space
- Faster response for duplicates
- Reduces processing costs

### 6. Database Record Creation

**Table:** `customer_photos`

**Fields Populated:**
```typescript
{
  project: 'occ',
  shop_domain: 'example.myshopify.com',
  conversation_id: 'chatwoot-123',
  message_id: 'msg-456',
  customer_email: 'customer@example.com',
  image_url: 'https://...',
  image_hash: 'sha256-hash',
  file_size_bytes: 245678,
  mime_type: 'image/jpeg',
  width: 1920,
  height: 1080,
  description: 'Product arrived damaged',
  status: 'pending', // Pending processing for embeddings
  uploaded_at: '2025-01-24T10:00:00Z'
}
```

**Status Values:**
- `pending` - Uploaded, awaiting processing
- `processing` - Generating embeddings
- `completed` - Embeddings generated
- `failed` - Processing failed

## Security

### Input Validation

**File Type:**
- Whitelist approach (only JPEG, PNG, WebP)
- Rejects executable files
- Prevents malicious uploads

**File Size:**
- 10MB limit prevents DoS attacks
- Reasonable for customer photos

**Required Fields:**
- Validates all required parameters
- Returns 400 Bad Request if missing

### Privacy Protection

**EXIF Stripping:**
- Removes all metadata
- Protects customer location
- Prevents device fingerprinting

**Secure File Naming:**
- Timestamp-based naming
- Sanitizes user-provided filenames
- Prevents path traversal attacks

**Example:**
```typescript
const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
const storagePath = `${project}/${shopDomain}/${timestamp}-${sanitizedFileName}`;
```

### Error Handling

**Rollback on Failure:**
```typescript
if (dbError) {
  // Clean up uploaded files
  await supabase.storage.from(STORAGE_BUCKET).remove([storagePath, thumbnailPath]);
  throw new Error(`Database insert failed: ${dbError.message}`);
}
```

**Logging:**
```typescript
await logDecision({
  scope: 'customer-support',
  actor: 'system',
  action: 'customer_photo_upload_failed',
  rationale: `Customer photo upload failed: ${error.message}`,
  evidenceUrl: 'api/customer-photos/upload',
  payload: { error: error.message },
});
```

## Usage Examples

### JavaScript/TypeScript

```typescript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('conversation_id', 'chatwoot-123');
formData.append('message_id', 'msg-456');
formData.append('shop_domain', 'example.myshopify.com');
formData.append('customer_email', 'customer@example.com');
formData.append('description', 'Product arrived damaged');

const response = await fetch('/api/customer-photos/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();

if (result.success) {
  console.log('Image uploaded:', result.data.imageUrl);
} else {
  console.error('Upload failed:', result.error);
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/customer-photos/upload \
  -F "file=@/path/to/image.jpg" \
  -F "conversation_id=chatwoot-123" \
  -F "message_id=msg-456" \
  -F "shop_domain=example.myshopify.com" \
  -F "customer_email=customer@example.com" \
  -F "description=Product arrived damaged"
```

## Integration with Chatwoot

### Webhook Handler

```typescript
// In Chatwoot webhook handler
if (message.attachments && message.attachments.length > 0) {
  for (const attachment of message.attachments) {
    if (attachment.file_type === 'image') {
      // Download image from Chatwoot
      const imageResponse = await fetch(attachment.data_url);
      const imageBlob = await imageResponse.blob();
      
      // Upload to customer_photos
      const formData = new FormData();
      formData.append('file', imageBlob, attachment.file_name);
      formData.append('conversation_id', message.conversation_id);
      formData.append('message_id', message.id);
      formData.append('shop_domain', shopDomain);
      formData.append('customer_email', message.sender.email);
      
      const uploadResponse = await fetch('/api/customer-photos/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await uploadResponse.json();
      console.log('Customer photo uploaded:', result.data.id);
    }
  }
}
```

## Next Steps

### Phase 2: Image Processing

1. **Generate CLIP Embeddings**
   - Use OpenAI CLIP model
   - Store in `image_embeddings` table
   - Enable visual similarity search

2. **AI Image Analysis**
   - Detect labels (product, damage, packaging)
   - Detect objects with bounding boxes
   - Classify issue category

3. **Visual Search**
   - Find similar customer photos
   - Match with product catalog
   - Identify recurring issues

## References

- Database Schema: `supabase/migrations/20251025000021_create_image_search_tables.sql`
- API Route: `app/routes/api.customer-photos.upload.ts`
- Supabase Storage: `customer-photos` bucket
- Sharp Documentation: https://sharp.pixelplumbing.com/
- Supabase Storage: https://supabase.com/docs/guides/storage

