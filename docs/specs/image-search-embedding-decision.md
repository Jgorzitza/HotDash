# Image Search Embedding Decision - Stack Recommendation

**Date**: 2025-10-24  
**Decision**: Embedding model for customer photo search  
**Status**: ✅ RECOMMENDATION READY

---

## TL;DR - Recommendation

**✅ RECOMMENDED: Transformers.js (CLIP in Node.js)**

**Why**: 
- ✅ Pure Node.js/TypeScript (matches our stack 100%)
- ✅ No Python runtime needed
- ✅ No external API costs
- ✅ Same OpenAI CLIP model (ViT-B/32)
- ✅ Runs in our existing infrastructure
- ✅ 512-dim embeddings (as specified in OAL)

**Confidence**: HIGH - Best fit for our stack

---

## Options Analyzed

### Option 1: OpenAI CLIP API ❌ NOT AVAILABLE

**Research Findings**:
- ❌ OpenAI does NOT offer a public CLIP embeddings API
- ❌ Only text embeddings available (`text-embedding-3-small`, `text-embedding-ada-002`)
- ❌ CLIP is a research model, not a production API
- ⚠️ Azure AI Foundry has CLIP API but requires Azure account + different pricing

**Evidence**:
- OpenAI Embeddings API: Only text models listed
- Community discussions confirm no image embeddings API
- Azure AI Foundry has it, but adds complexity

**Verdict**: NOT VIABLE for our use case

---

### Option 2: Python Worker + OpenCLIP ⚠️ VIABLE BUT COMPLEX

**How it works**:
```python
# Python worker
from open_clip import create_model_and_transforms
model, preprocess = create_model_and_transforms('ViT-B-32', pretrained='openai')
embedding = model.encode_image(image)  # 512-dim
```

**Pros**:
- ✅ Official OpenCLIP library (well-maintained)
- ✅ Full control over model
- ✅ Can use GPU if needed
- ✅ 512-dim embeddings (ViT-B/32)

**Cons**:
- ❌ Requires Python runtime (new dependency)
- ❌ Need to manage Python environment
- ❌ Cross-language communication (Node ↔ Python)
- ❌ More complex deployment (2 runtimes)
- ❌ Harder to debug (2 languages)

**Stack Impact**:
- Current: 100% Node.js/TypeScript
- With Python: Node.js + Python (split stack)

**Verdict**: VIABLE but adds complexity

---

### Option 3: Transformers.js (CLIP in Node.js) ✅ RECOMMENDED

**How it works**:
```typescript
// Pure Node.js/TypeScript
import { pipeline } from '@xenova/transformers';

const extractor = await pipeline(
  'feature-extraction',
  'Xenova/clip-vit-base-patch32'
);

const imageEmbedding = await extractor(imageUrl, {
  pooling: 'mean',
  normalize: true
});
// Returns 512-dim embedding
```

**Pros**:
- ✅ **Pure Node.js/TypeScript** (matches our stack 100%)
- ✅ **No Python runtime** needed
- ✅ **Same CLIP model** (ViT-B/32, 512-dim)
- ✅ **No external API costs** (runs locally)
- ✅ **ONNX Runtime** (optimized inference)
- ✅ **Hugging Face models** (same as OpenCLIP)
- ✅ **Active development** (v3 released 2024)
- ✅ **Works in our existing infrastructure**

**Cons**:
- ⚠️ Slightly slower than native Python (ONNX overhead)
- ⚠️ Model downloads on first run (~350MB)
- ⚠️ CPU-only (no GPU support yet)

**Stack Impact**:
- Current: 100% Node.js/TypeScript
- With Transformers.js: Still 100% Node.js/TypeScript ✅

**Performance**:
- Embedding generation: ~200-500ms per image (CPU)
- Acceptable for async worker (not blocking uploads)

**Verdict**: ✅ BEST FIT for our stack

---

## Detailed Comparison

| Criteria | OpenAI CLIP API | Python + OpenCLIP | Transformers.js |
|----------|----------------|-------------------|-----------------|
| **Availability** | ❌ Not available | ✅ Available | ✅ Available |
| **Stack Match** | N/A | ⚠️ Adds Python | ✅ Pure Node.js |
| **Complexity** | N/A | ⚠️ High (2 runtimes) | ✅ Low (1 runtime) |
| **Cost** | N/A | ✅ Free (self-hosted) | ✅ Free (self-hosted) |
| **Performance** | N/A | ✅ Fast (native) | ⚠️ Good (ONNX) |
| **Deployment** | N/A | ⚠️ Complex | ✅ Simple |
| **Maintenance** | N/A | ⚠️ 2 languages | ✅ 1 language |
| **GPU Support** | N/A | ✅ Yes | ❌ Not yet |
| **Model** | N/A | ViT-B/32 (512-dim) | ViT-B/32 (512-dim) |
| **Debugging** | N/A | ⚠️ Cross-language | ✅ Same language |

**Winner**: Transformers.js (6 ✅ vs 3 ✅ for Python)

---

## Current Stack Alignment

### What We Already Use

**OpenAI SDK** (for text embeddings):
```typescript
// From app/services/knowledge/embedding.ts
import { OpenAI } from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: text,
});
```

**Pattern**: OpenAI SDK for text, Transformers.js for images

**Why this works**:
- Text embeddings: OpenAI API (proven, fast, cheap)
- Image embeddings: Transformers.js (self-hosted, no API)
- Both integrate with pgvector seamlessly
- No Python dependency

---

## Implementation Plan (Transformers.js)

### 1. Install Dependencies

```bash
npm install @xenova/transformers
```

### 2. Create Image Embedding Service

```typescript
// app/services/knowledge/image-embedding.ts
import { pipeline } from '@xenova/transformers';

let imageExtractor: any = null;

async function initializeImageExtractor() {
  if (!imageExtractor) {
    imageExtractor = await pipeline(
      'feature-extraction',
      'Xenova/clip-vit-base-patch32',
      { quantized: false } // Use full precision for better quality
    );
  }
  return imageExtractor;
}

export async function generateImageEmbedding(
  imageUrl: string
): Promise<number[]> {
  const extractor = await initializeImageExtractor();
  
  const output = await extractor(imageUrl, {
    pooling: 'mean',
    normalize: true
  });
  
  // Convert to array and ensure 512 dimensions
  const embedding = Array.from(output.data);
  
  if (embedding.length !== 512) {
    throw new Error(`Expected 512-dim embedding, got ${embedding.length}`);
  }
  
  return embedding;
}

export async function generateTextEmbedding(
  text: string
): Promise<number[]> {
  const extractor = await initializeImageExtractor();
  
  const output = await extractor(text, {
    pooling: 'mean',
    normalize: true
  });
  
  return Array.from(output.data);
}
```

### 3. Image Processing Worker

```typescript
// app/workers/image-embedding-worker.ts
import { generateImageEmbedding } from '~/services/knowledge/image-embedding';
import prisma from '~/db.server';
import crypto from 'crypto';

export async function processImageUpload(imageId: string) {
  // 1. Fetch image from Supabase Storage
  const image = await prisma.customerPhoto.findUnique({
    where: { id: imageId }
  });
  
  if (!image) throw new Error('Image not found');
  
  // 2. Calculate checksum for de-duplication
  const checksum = crypto.createHash('sha256')
    .update(image.storageUrl)
    .digest('hex');
  
  // 3. Check if already processed
  const existing = await prisma.imageEmbedding.findUnique({
    where: { checksum }
  });
  
  if (existing) {
    console.log(`Image ${imageId} already processed (checksum: ${checksum})`);
    return existing;
  }
  
  // 4. Generate embedding
  const embedding = await generateImageEmbedding(image.storageUrl);
  
  // 5. Store in pgvector
  await prisma.$executeRaw`
    INSERT INTO image_embeddings (
      id, image_id, embedding, checksum, project, created_at
    )
    VALUES (
      gen_random_uuid(),
      ${imageId},
      ${JSON.stringify(embedding)}::vector(512),
      ${checksum},
      ${image.project},
      NOW()
    )
  `;
  
  console.log(`✅ Generated embedding for image ${imageId}`);
}
```

### 4. Search API

```typescript
// app/routes/api.search.images.ts
import { generateTextEmbedding, generateImageEmbedding } from '~/services/knowledge/image-embedding';
import prisma from '~/db.server';

// Text → Image search
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  if (!query) {
    return Response.json({ error: 'Missing query' }, { status: 400 });
  }
  
  // Generate text embedding
  const embedding = await generateTextEmbedding(query);
  
  // Search pgvector
  const results = await prisma.$queryRaw`
    SELECT 
      ie.id,
      ie.image_id,
      cp.storage_url,
      cp.thumbnail_url,
      1 - (ie.embedding <=> ${JSON.stringify(embedding)}::vector(512)) as similarity
    FROM image_embeddings ie
    JOIN customer_photos cp ON cp.id = ie.image_id
    WHERE ie.project = 'occ'
      AND 1 - (ie.embedding <=> ${JSON.stringify(embedding)}::vector(512)) >= 0.7
    ORDER BY ie.embedding <=> ${JSON.stringify(embedding)}::vector(512)
    LIMIT ${limit}
  `;
  
  return Response.json({ results });
}

// Image → Image search
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const imageUrl = formData.get('imageUrl') as string;
  const limit = parseInt(formData.get('limit') as string || '10');
  
  // Generate image embedding
  const embedding = await generateImageEmbedding(imageUrl);
  
  // Search pgvector (same query as above)
  const results = await prisma.$queryRaw`...`;
  
  return Response.json({ results });
}
```

---

## Performance Considerations

### Model Loading (First Run)

- Model download: ~350MB (one-time)
- Initialization: ~2-3 seconds
- **Solution**: Pre-load model on worker startup

### Embedding Generation

- CPU: ~200-500ms per image
- **Acceptable** for async worker (not blocking uploads)
- **Optimization**: Batch processing (multiple images at once)

### Memory Usage

- Model in memory: ~400MB
- **Acceptable** for dedicated worker
- **Optimization**: Share model across worker instances

---

## Deployment Strategy

### 1. Feature Flag

```bash
FEATURE_IMAGE_SEARCH=true
VECTOR_BACKEND=pgvector
```

### 2. Worker Deployment

```typescript
// Separate worker process
// fly.toml: Add worker process
[processes]
  web = "npm run start"
  worker = "npm run worker:image-embeddings"
```

### 3. Gradual Rollout

1. Deploy worker (disabled)
2. Test with sample images
3. Enable for internal users
4. Monitor performance (p50/p95)
5. Enable for all users

---

## Cost Analysis

### Transformers.js (Recommended)

- **API Cost**: $0 (self-hosted)
- **Compute Cost**: Existing infrastructure
- **Storage Cost**: ~350MB model (one-time)
- **Total**: ~$0/month

### Python + OpenCLIP

- **API Cost**: $0 (self-hosted)
- **Compute Cost**: Existing infrastructure + Python runtime
- **Deployment Cost**: More complex (2 runtimes)
- **Total**: ~$0/month + complexity cost

### OpenAI CLIP API (if it existed)

- **API Cost**: Unknown (not available)
- **Compute Cost**: $0 (managed)
- **Total**: N/A

**Winner**: Transformers.js (lowest total cost)

---

## Risks & Mitigations

### Risk 1: Performance

**Risk**: Transformers.js slower than native Python

**Mitigation**:
- Async worker (not blocking uploads)
- Batch processing
- Pre-load model on startup
- Monitor p50/p95 latency

### Risk 2: Model Size

**Risk**: 350MB model download

**Mitigation**:
- Cache model in Docker image
- Pre-download during deployment
- Use CDN for model files

### Risk 3: CPU-Only

**Risk**: No GPU support yet

**Mitigation**:
- CPU performance acceptable for MVP
- Monitor performance
- Switch to Python + GPU if needed (future)

---

## Decision

**✅ APPROVED: Transformers.js (CLIP in Node.js)**

**Rationale**:
1. ✅ Pure Node.js/TypeScript (100% stack match)
2. ✅ No Python dependency
3. ✅ Same CLIP model (ViT-B/32, 512-dim)
4. ✅ No external API costs
5. ✅ Simple deployment
6. ✅ Easy to debug (same language)

**Next Steps**:
1. Install `@xenova/transformers`
2. Create image embedding service
3. Build image processing worker
4. Implement search API
5. Test with sample images
6. Deploy with feature flag

**Estimated Effort**: 12-14 hours (as per OAL review)

---

## Conclusion

Transformers.js is the clear winner for our stack. It provides the same CLIP model as OpenCLIP but in pure Node.js/TypeScript, eliminating the need for Python and simplifying our deployment.

**Confidence**: HIGH - This is the right choice for our use case.

