# Image Search Infrastructure

**Task:** BLOCKER-003  
**Status:** Implemented  
**Last Updated:** 2025-01-24  
**Estimated Hours:** 8h

## Overview

Implemented complete image search infrastructure using GPT-4 Vision for image descriptions + OpenAI text embeddings for similarity search. Enables visual search for customer support use cases.

## Architecture

### Simplified Approach (Approved)

**Decision:** Use GPT-4 Vision descriptions + OpenAI text embeddings (not CLIP)

**Why:**
- ✅ No external compute needed (all OpenAI APIs)
- ✅ Uses existing infrastructure (pgvector + OpenAI embeddings)
- ✅ Same pattern as knowledge base (proven, working)
- ✅ No new dependencies (already using OpenAI SDK)
- ✅ Cost-effective (GPT-4 Vision: $0.01/image, embeddings: $0.0001/1K tokens)

### Flow

```
1. User uploads image → customer_photos table (status: pending)
2. Worker processes image:
   a. GPT-4 Vision generates detailed description
   b. OpenAI generates text embedding from description
   c. Store embedding in image_embeddings table
   d. Update customer_photos (status: completed)
3. Search:
   a. User query → text embedding
   b. pgvector similarity search
   c. Return matching images
```

## Components

### 1. Image Description Service

**File:** `app/services/image-search/image-description.ts`

**Purpose:** Generate detailed descriptions using GPT-4 Vision

**Features:**
- Detailed, searchable descriptions (2-3 sentences)
- Detected labels (keywords)
- Detected objects with confidence scores
- Issue category classification
- Batch processing support

**Example:**
```typescript
const result = await generateImageDescription(imageUrl, context);
// Returns:
// {
//   description: "A red ceramic mug with white polka dots...",
//   detectedLabels: ["mug", "ceramic", "red", "polka dots"],
//   detectedObjects: [{ label: "mug", confidence: 0.95 }],
//   issueCategory: "damage",
//   confidence: 0.9,
//   modelVersion: "gpt-4o-mini"
// }
```

### 2. Image Embedding Service

**File:** `app/services/image-search/image-embedding.ts`

**Purpose:** Generate text embeddings from descriptions

**Features:**
- Uses `text-embedding-3-small` (1536 dimensions)
- Same model as knowledge base
- Batch embedding support
- Cosine similarity calculation
- pgvector format conversion

**Example:**
```typescript
const result = await generateTextEmbedding(description);
// Returns:
// {
//   embedding: [0.123, -0.456, ...], // 1536 dimensions
//   dimensions: 1536,
//   model: "text-embedding-3-small",
//   tokensUsed: 42
// }
```

### 3. Image Processor Service

**File:** `app/services/image-search/image-processor.ts`

**Purpose:** Process uploaded images to generate embeddings

**Features:**
- Process single image
- Process pending images (batch)
- Reprocess failed images
- Status tracking (pending → processing → completed/failed)
- Decision logging

**Example:**
```typescript
const result = await processImage(photoId);
// Returns:
// {
//   photoId: "uuid",
//   embeddingId: "uuid",
//   description: "Detailed description...",
//   embedding: [0.123, ...],
//   processingTime: 2500 // ms
// }
```

### 4. Image Search API

**File:** `app/routes/api.search.images.ts`

**Endpoints:**

**GET /api/search/images?q={query}**
- Text-to-image search
- Find images similar to text query

**POST /api/search/images**
- Image-to-image search
- Find images similar to uploaded image

**Example:**
```typescript
// Text search
const response = await fetch('/api/search/images?q=red mug&limit=10');
const { results } = await response.json();

// Image search
const response = await fetch('/api/search/images', {
  method: 'POST',
  body: JSON.stringify({ imageUrl: 'https://...', limit: 10 })
});
const { results } = await response.json();
```

### 5. Image Processing Worker API

**File:** `app/routes/api.search.images.process.ts`

**Endpoint:** POST /api/search/images/process

**Purpose:** Process pending images (manual or cron)

**Example:**
```typescript
// Process all pending images
await fetch('/api/search/images/process', {
  method: 'POST',
  body: JSON.stringify({ limit: 10 })
});

// Process specific image
await fetch('/api/search/images/process', {
  method: 'POST',
  body: JSON.stringify({ photoId: 'uuid' })
});

// Reprocess failed image
await fetch('/api/search/images/process', {
  method: 'POST',
  body: JSON.stringify({ photoId: 'uuid', reprocess: true })
});
```

## Database Schema

### customer_photos Table

**Status:** Already exists (created by DATA-IMAGE-SEARCH-001)

**Key Fields:**
- `id` - UUID primary key
- `image_url` - Public URL to image
- `status` - pending | processing | completed | failed
- `description` - Customer's description (optional)
- `detected_labels` - AI-detected labels (array)
- `detected_objects` - AI-detected objects (JSONB)
- `issue_category` - damage | wrong_item | quality_issue | packaging | other

### image_embeddings Table

**Status:** Already exists (created by DATA-IMAGE-SEARCH-001)

**Key Fields:**
- `id` - UUID primary key
- `photo_id` - Foreign key to customer_photos
- `embedding` - vector(1536) - Text embedding
- `model_name` - "text-embedding-3-small"
- `model_version` - "gpt-4o-mini"
- `embedding_quality_score` - Confidence (0.0-1.0)

## Usage

### 1. Upload Image

```typescript
// Use existing upload API
const formData = new FormData();
formData.append('file', imageFile);
formData.append('conversation_id', 'chatwoot-123');
formData.append('message_id', 'msg-456');
formData.append('shop_domain', 'example.myshopify.com');

const response = await fetch('/api/customer-photos/upload', {
  method: 'POST',
  body: formData,
});

const { data } = await response.json();
// Image is now in customer_photos with status: pending
```

### 2. Process Image (Worker)

```typescript
// Trigger processing (can be cron job)
await fetch('/api/search/images/process', {
  method: 'POST',
  body: JSON.stringify({ limit: 10 })
});

// Or process specific image immediately after upload
await fetch('/api/search/images/process', {
  method: 'POST',
  body: JSON.stringify({ photoId: data.id })
});
```

### 3. Search Images

```typescript
// Text search
const response = await fetch('/api/search/images?q=damaged product&limit=10&minSimilarity=0.7');
const { results } = await response.json();

results.forEach(result => {
  console.log(`Image: ${result.imageUrl}`);
  console.log(`Similarity: ${result.similarity}`);
  console.log(`Description: ${result.description}`);
});

// Image search
const response = await fetch('/api/search/images', {
  method: 'POST',
  body: JSON.stringify({
    imageUrl: 'https://example.com/image.jpg',
    limit: 10,
    minSimilarity: 0.7
  })
});
```

## Cron Job Setup

### Process Pending Images Every 5 Minutes

```typescript
// In cron job or scheduled task
import { processPendingImages } from '~/services/image-search/image-processor';

// Run every 5 minutes
setInterval(async () => {
  try {
    const results = await processPendingImages(10);
    console.log(`Processed ${results.length} images`);
  } catch (error) {
    console.error('Image processing failed:', error);
  }
}, 5 * 60 * 1000);
```

## Cost Estimation

### Per Image

- **GPT-4 Vision:** ~$0.01 per image (gpt-4o-mini)
- **Text Embedding:** ~$0.0001 per description
- **Total:** ~$0.0101 per image

### Monthly (1000 images)

- **Processing:** $10.10
- **Storage:** Minimal (Supabase included)
- **Search:** Free (pgvector queries)

## Performance

### Processing Time

- **GPT-4 Vision:** 1-3 seconds
- **Text Embedding:** 0.5-1 second
- **Database Insert:** < 0.1 second
- **Total:** 2-5 seconds per image

### Search Time

- **Text Embedding:** 0.5-1 second
- **pgvector Search:** < 0.1 second
- **Total:** < 2 seconds

## Monitoring

### Metrics to Track

- Images processed per day
- Processing success rate
- Average processing time
- Search queries per day
- Average search time
- Top search queries

### Logs

All operations logged to `DecisionLog` table:
- `image_processed` - Successful processing
- `image_processing_failed` - Failed processing
- `image_search_query` - Search queries

## Troubleshooting

### Image Processing Fails

**Check:**
- OpenAI API key valid
- Image URL accessible
- Image format supported (JPEG, PNG, WebP)
- Supabase connection working

**Fix:**
```typescript
// Reprocess failed image
await fetch('/api/image-search/process', {
  method: 'POST',
  body: JSON.stringify({ photoId: 'uuid', reprocess: true })
});
```

### Search Returns No Results

**Check:**
- Images have been processed (status: completed)
- Embeddings exist in image_embeddings table
- minSimilarity threshold not too high (try 0.5)
- Query is descriptive enough

## Next Steps

### Phase 2 (Future)

1. **Automatic Processing** - Process images immediately after upload
2. **Advanced Filters** - Filter by issue category, labels, date range
3. **Similar Image Recommendations** - Show similar images in Chatwoot
4. **Performance Optimization** - Cache frequent searches
5. **Analytics** - Track search patterns and improve descriptions

## References

- Image Description: `app/services/image-search/image-description.ts`
- Image Embedding: `app/services/image-search/image-embedding.ts`
- Image Processor: `app/services/image-search/image-processor.ts`
- Search API: `app/routes/api.search.images.ts`
- Processing Worker: `app/routes/api.search.images.process.ts`
- Database Schema: `supabase/migrations/20251025000021_create_image_search_tables.sql`
- Upload API: `app/routes/api.customer-photos.upload.ts`
- Tasks: BLOCKER-003, ENG-IMAGE-SEARCH-003 in TaskAssignment table

