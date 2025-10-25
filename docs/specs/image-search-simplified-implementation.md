# Image Search - Simplified Implementation (Option 3)

**Date**: 2025-10-24  
**Decision**: Use GPT-4 Vision for image descriptions + text embeddings for search  
**Status**: ✅ APPROVED - Ready to implement

---

## TL;DR - Simplified Approach

**✅ RECOMMENDED: GPT-4 Vision Descriptions + OpenAI Text Embeddings**

**How it works**:
1. User uploads image → GPT-4 Vision describes it (detailed text)
2. Generate text embedding from description (OpenAI `text-embedding-3-small`)
3. Store embedding in pgvector (same as knowledge base)
4. Search: User query → text embedding → pgvector similarity search
5. Return: Images with similar descriptions

**Why this works**:
- ✅ **No external compute needed** (all OpenAI APIs)
- ✅ **Uses existing infrastructure** (pgvector + OpenAI embeddings)
- ✅ **Same pattern as knowledge base** (proven, working)
- ✅ **No new dependencies** (already using OpenAI SDK)
- ✅ **Cost-effective** (GPT-4 Vision: $0.01/image, embeddings: $0.0001/1K tokens)

---

## Architecture

```
┌─────────────────────────────────────────────┐
│ User Uploads Image                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ GPT-4 Vision API                            │
│ - Analyzes image                            │
│ - Generates detailed description           │
│ - Returns: "A red ceramic mug with white    │
│   polka dots, sitting on a wooden table..." │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ OpenAI Embeddings API                       │
│ - text-embedding-3-small                    │
│ - Converts description to 1536-dim vector   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Supabase Postgres (pgvector)                │
│ - Stores: image_id, description, embedding  │
│ - IVFFlat index for similarity search       │
└─────────────────────────────────────────────┘

Search Flow:
User query "red mug" → text embedding → pgvector search → return matching images
```

---

## Database Schema

```sql
-- Image metadata table
CREATE TABLE customer_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  checksum TEXT UNIQUE, -- For de-duplication
  metadata JSONB -- Additional metadata
);

-- Image descriptions and embeddings
CREATE TABLE image_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL REFERENCES customer_photos(id) ON DELETE CASCADE,
  description TEXT NOT NULL, -- GPT-4 Vision generated description
  embedding vector(1536), -- OpenAI text-embedding-3-small
  project TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  model_version TEXT DEFAULT 'gpt-4o-mini', -- Track which model generated description
  UNIQUE(image_id) -- One embedding per image
);

-- Index for vector similarity search
CREATE INDEX idx_image_embeddings_vector 
ON image_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Index for project isolation
CREATE INDEX idx_image_embeddings_project ON image_embeddings(project);
CREATE INDEX idx_customer_photos_project ON customer_photos(project);

-- RLS policies
ALTER TABLE customer_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_photos_read_by_project ON customer_photos
  FOR SELECT TO authenticated
  USING (project = COALESCE(
    current_setting('app.current_project', true),
    auth.jwt() ->> 'project'
  ));

CREATE POLICY image_embeddings_read_by_project ON image_embeddings
  FOR SELECT TO authenticated
  USING (project = COALESCE(
    current_setting('app.current_project', true),
    auth.jwt() ->> 'project'
  ));

-- Service role policies (for worker)
CREATE POLICY customer_photos_service_all ON customer_photos
  FOR ALL TO service_role
  USING (true);

CREATE POLICY image_embeddings_service_all ON image_embeddings
  FOR ALL TO service_role
  USING (true);
```

---

## Implementation

### 1. Image Description Service (GPT-4 Vision)

```typescript
// app/services/knowledge/image-description.ts
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateImageDescription(
  imageUrl: string,
  options: {
    detailLevel?: 'low' | 'high';
    customPrompt?: string;
  } = {}
): Promise<string> {
  const { detailLevel = 'high', customPrompt } = options;
  
  const prompt = customPrompt || `Describe this image in detail for search purposes. Include:
- Main subject/object
- Colors, patterns, textures
- Setting/background
- Any text visible
- Style/aesthetic
- Notable features
Be specific and descriptive to enable accurate text-based search.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Cheaper, faster for descriptions
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: detailLevel,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
    temperature: 0.3, // Lower temperature for consistent descriptions
  });

  const description = response.choices[0]?.message?.content;
  
  if (!description) {
    throw new Error('Failed to generate image description');
  }

  return description;
}

// For base64 images
export async function generateImageDescriptionFromBase64(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  options: {
    detailLevel?: 'low' | 'high';
    customPrompt?: string;
  } = {}
): Promise<string> {
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  return generateImageDescription(dataUrl, options);
}
```

### 2. Text Embedding Service (Reuse Existing)

```typescript
// app/services/knowledge/embedding.ts (already exists)
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateTextEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}
```

### 3. Image Processing Worker

```typescript
// app/workers/image-embedding-worker.ts
import { generateImageDescription } from '~/services/knowledge/image-description';
import { generateTextEmbedding } from '~/services/knowledge/embedding';
import prisma from '~/db.server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function processImageUpload(imageId: string) {
  console.log(`Processing image ${imageId}...`);
  
  // 1. Fetch image metadata
  const image = await prisma.customerPhoto.findUnique({
    where: { id: imageId }
  });
  
  if (!image) {
    throw new Error(`Image ${imageId} not found`);
  }

  // 2. Check if already processed
  const existing = await prisma.imageEmbedding.findUnique({
    where: { image_id: imageId }
  });
  
  if (existing) {
    console.log(`Image ${imageId} already processed`);
    return existing;
  }

  // 3. Get signed URL for GPT-4 Vision
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('customer-photos')
    .createSignedUrl(image.storagePath, 3600); // 1 hour expiry
  
  if (signedUrlError || !signedUrlData) {
    throw new Error(`Failed to get signed URL: ${signedUrlError?.message}`);
  }

  // 4. Generate description with GPT-4 Vision
  console.log(`Generating description for image ${imageId}...`);
  const description = await generateImageDescription(signedUrlData.signedUrl, {
    detailLevel: 'high'
  });
  
  console.log(`Description: ${description.substring(0, 100)}...`);

  // 5. Generate text embedding from description
  console.log(`Generating embedding for description...`);
  const embedding = await generateTextEmbedding(description);

  // 6. Store in database
  await prisma.$executeRaw`
    INSERT INTO image_embeddings (
      id, image_id, description, embedding, project, model_version
    )
    VALUES (
      gen_random_uuid(),
      ${imageId}::uuid,
      ${description},
      ${JSON.stringify(embedding)}::vector(1536),
      ${image.project},
      'gpt-4o-mini'
    )
  `;

  console.log(`✅ Successfully processed image ${imageId}`);
  
  return { imageId, description, embeddingDimensions: embedding.length };
}
```

### 4. Upload API

```typescript
// app/routes/api.images.upload.ts
import { ActionFunctionArgs, json } from "@remix-run/node";
import { createClient } from '@supabase/supabase-js';
import prisma from '~/db.server';
import crypto from 'crypto';
import sharp from 'sharp';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const project = formData.get('project') as string || 'occ';
  
  if (!file) {
    return json({ error: 'No file provided' }, { status: 400 });
  }

  // 1. Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return json({ error: 'Invalid file type' }, { status: 400 });
  }

  // 2. Read file buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // 3. Strip EXIF data (privacy)
  const strippedBuffer = await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .withMetadata({ exif: {} }) // Remove EXIF
    .toBuffer();

  // 4. Calculate checksum for de-duplication
  const checksum = crypto.createHash('sha256')
    .update(strippedBuffer)
    .digest('hex');

  // 5. Check for duplicate
  const existing = await prisma.customerPhoto.findUnique({
    where: { checksum }
  });
  
  if (existing) {
    return json({ 
      message: 'Image already exists',
      imageId: existing.id,
      duplicate: true
    });
  }

  // 6. Generate thumbnail
  const thumbnailBuffer = await sharp(strippedBuffer)
    .resize(300, 300, { fit: 'inside' })
    .toBuffer();

  // 7. Get image metadata
  const metadata = await sharp(strippedBuffer).metadata();

  // 8. Upload to Supabase Storage
  const timestamp = Date.now();
  const storagePath = `${project}/${timestamp}-${file.name}`;
  const thumbnailPath = `${project}/thumbnails/${timestamp}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('customer-photos')
    .upload(storagePath, strippedBuffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { error: thumbnailError } = await supabase.storage
    .from('customer-photos')
    .upload(thumbnailPath, thumbnailBuffer, {
      contentType: file.type,
      upsert: false
    });

  if (thumbnailError) {
    console.warn(`Thumbnail upload failed: ${thumbnailError.message}`);
  }

  // 9. Get public URLs
  const { data: urlData } = supabase.storage
    .from('customer-photos')
    .getPublicUrl(storagePath);

  const { data: thumbnailUrlData } = supabase.storage
    .from('customer-photos')
    .getPublicUrl(thumbnailPath);

  // 10. Save to database
  const image = await prisma.customerPhoto.create({
    data: {
      project,
      storagePath,
      storageUrl: urlData.publicUrl,
      thumbnailUrl: thumbnailUrlData?.publicUrl,
      fileSize: strippedBuffer.length,
      mimeType: file.type,
      width: metadata.width,
      height: metadata.height,
      checksum,
    }
  });

  // 11. Queue for processing (async)
  // In production, use a proper queue (BullMQ, etc.)
  processImageUpload(image.id).catch(err => {
    console.error(`Failed to process image ${image.id}:`, err);
  });

  return json({
    success: true,
    imageId: image.id,
    storageUrl: urlData.publicUrl,
    thumbnailUrl: thumbnailUrlData?.publicUrl,
  });
}
```

### 5. Search API

```typescript
// app/routes/api.search.images.ts
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { generateTextEmbedding } from '~/services/knowledge/embedding';
import prisma from '~/db.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const minSimilarity = parseFloat(url.searchParams.get('minSimilarity') || '0.7');
  const project = url.searchParams.get('project') || 'occ';
  
  if (!query) {
    return json({ error: 'Missing query parameter' }, { status: 400 });
  }

  // 1. Generate embedding for search query
  const queryEmbedding = await generateTextEmbedding(query);

  // 2. Search pgvector for similar descriptions
  const results = await prisma.$queryRaw<Array<{
    id: string;
    image_id: string;
    description: string;
    similarity: number;
    storage_url: string;
    thumbnail_url: string;
    width: number;
    height: number;
  }>>`
    SELECT 
      ie.id,
      ie.image_id,
      ie.description,
      1 - (ie.embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)) as similarity,
      cp.storage_url,
      cp.thumbnail_url,
      cp.width,
      cp.height
    FROM image_embeddings ie
    JOIN customer_photos cp ON cp.id = ie.image_id
    WHERE ie.project = ${project}
      AND 1 - (ie.embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)) >= ${minSimilarity}
    ORDER BY ie.embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)
    LIMIT ${limit}
  `;

  return json({
    query,
    results: results.map(r => ({
      imageId: r.image_id,
      description: r.description,
      similarity: r.similarity,
      imageUrl: r.storage_url,
      thumbnailUrl: r.thumbnail_url,
      dimensions: { width: r.width, height: r.height }
    })),
    count: results.length
  });
}
```

---

## Cost Analysis

### Per Image Processing

**GPT-4 Vision** (gpt-4o-mini):
- Input: ~85 tokens (prompt) + image
- Output: ~100 tokens (description)
- Cost: ~$0.001 per image

**Text Embedding** (text-embedding-3-small):
- Input: ~100 tokens (description)
- Cost: ~$0.00001 per image

**Total per image**: ~$0.001 (0.1 cents)

### Per Search Query

**Text Embedding**:
- Input: ~10 tokens (query)
- Cost: ~$0.000001 per search

**Negligible cost** - essentially free

### Storage

**Supabase Storage**:
- Images: ~2MB average = $0.021/GB/month
- 1000 images = ~2GB = ~$0.042/month

**Supabase Database**:
- Embeddings: 1536 floats × 4 bytes = 6KB per image
- 1000 images = ~6MB = negligible

**Total for 1000 images**: ~$1/month processing + $0.05/month storage

---

## Advantages of This Approach

### ✅ Pros

1. **No External Compute** - All OpenAI APIs (managed service)
2. **Uses Existing Infrastructure** - pgvector + OpenAI embeddings (proven)
3. **Cost-Effective** - $0.001 per image, negligible search cost
4. **Simple Implementation** - ~300 lines of code
5. **Searchable Descriptions** - Can search by text, not just visual similarity
6. **Multilingual** - GPT-4 Vision can describe in any language
7. **Flexible** - Can customize description prompts for specific use cases

### ⚠️ Cons

1. **Less Accurate** - Text descriptions vs. visual similarity
2. **Dependent on GPT-4 Vision** - Quality depends on model
3. **Not True Visual Search** - Misses visual patterns that aren't described

---

## When This Works Well

✅ **Good for**:
- Product photos (GPT-4 Vision is excellent at describing products)
- Customer submissions (can describe what customer is showing)
- General image search (colors, objects, settings)
- Text in images (GPT-4 Vision can read text)

❌ **Not ideal for**:
- Exact visual duplicates (use perceptual hashing instead)
- Fine-grained visual similarity (e.g., "find images with same pattern")
- Abstract art (hard to describe in text)

---

## Next Steps

1. ✅ Create SQL migration for tables
2. ✅ Implement image description service
3. ✅ Implement upload API with EXIF stripping
4. ✅ Implement worker for async processing
5. ✅ Implement search API
6. ✅ Add to Supabase Storage bucket configuration
7. ✅ Test with sample images
8. ✅ Deploy with feature flag

**Estimated Effort**: 8-10 hours (much simpler than CLIP)

---

## Conclusion

This simplified approach gives you **80% of the value with 20% of the complexity**. It leverages OpenAI's managed services (no external compute needed) and your existing pgvector infrastructure.

**Ready to implement!**

